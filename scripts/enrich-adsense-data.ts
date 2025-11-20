import { query } from '../src/lib/db';
import { adsenseApiClient } from '../src/lib/adsense-api';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const BATCH_SIZE = 100; // Process 100 sellers at a time
const LOG_INTERVAL = 1000; // Log progress every 1000 sellers
const CHECKPOINT_INTERVAL = 5000; // Save checkpoint every 5000 sellers

interface EnrichmentStats {
  total: number;
  processed: number;
  successful: number;
  notFound: number;
  errors: number;
  newDomains: number;
  verifiedDomains: number; // domains that match sellers.json
  startTime: number;
  lastCheckpoint?: number;
}

interface EnrichmentOptions {
  mode: 'fill-missing' | 'verify-existing' | 'all';
  limit?: number;
  resume?: boolean;
  dryRun?: boolean;
}

async function enrichAdSenseData(options: EnrichmentOptions) {
  const { mode, limit, resume, dryRun } = options;

  console.log('🚀 Starting AdSense Data Enrichment');
  console.log('===================================');
  console.log(`Mode: ${mode}`);
  console.log(`Limit: ${limit || 'unlimited'}`);
  console.log(`Resume: ${resume ? 'yes' : 'no'}`);
  console.log(`Dry Run: ${dryRun ? 'yes' : 'no'}`);
  console.log('');

  const stats: EnrichmentStats = {
    total: 0,
    processed: 0,
    successful: 0,
    notFound: 0,
    errors: 0,
    newDomains: 0,
    verifiedDomains: 0,
    startTime: Date.now(),
  };

  try {
    // 1. Get sellers to process based on mode
    console.log('📊 Fetching sellers to process...');
    const sellersQuery = buildSellersQuery(mode, resume, limit);
    const sellersResult = await query(sellersQuery);
    const sellers = sellersResult.rows.map(row => row.seller_id);

    stats.total = sellers.length;
    console.log(`Found ${stats.total} sellers to process\n`);

    if (stats.total === 0) {
      console.log('✅ No sellers to process. All done!');
      return;
    }

    // 2. Process sellers in batches
    for (let i = 0; i < sellers.length; i += BATCH_SIZE) {
      const batch = sellers.slice(i, Math.min(i + BATCH_SIZE, sellers.length));

      // Process each seller in the batch
      for (const sellerId of batch) {
        try {
          await processSeller(sellerId, stats, dryRun || false);
        } catch (error: any) {
          console.error(`❌ Error processing ${sellerId}:`, error.message);
          stats.errors++;
        }

        stats.processed++;

        // Log progress
        if (stats.processed % LOG_INTERVAL === 0) {
          logProgress(stats);
        }

        // Save checkpoint
        if (stats.processed % CHECKPOINT_INTERVAL === 0) {
          await saveCheckpoint(stats);
        }
      }
    }

    // 3. Final summary
    console.log('\n✨ Enrichment completed!');
    console.log('========================');
    logFinalSummary(stats);

    // 4. Show updated statistics
    await showDatabaseStats();

    // 5. Refresh materialized views
    if (!dryRun) {
      await refreshMaterializedViews();
    }

  } catch (error) {
    console.error('\n❌ Enrichment failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

function buildSellersQuery(mode: string, resume: boolean, limit?: number): string {
  let whereClause = '';

  if (mode === 'fill-missing') {
    // Only sellers without domains
    whereClause = resume
      ? `WHERE adsense_api_status IS NULL OR adsense_api_status = 'pending'`
      : `WHERE seller_id NOT IN (SELECT DISTINCT seller_id FROM seller_adsense.seller_domains)`;
  } else if (mode === 'verify-existing') {
    // Only sellers with domains from sellers.json
    whereClause = resume
      ? `WHERE adsense_api_status = 'pending_verify'`
      : `WHERE seller_id IN (SELECT DISTINCT seller_id FROM seller_adsense.seller_domains WHERE detection_source = 'sellers_json')`;
  } else {
    // All sellers
    whereClause = resume
      ? `WHERE adsense_api_status IS NULL OR adsense_api_status IN ('pending', 'pending_verify')`
      : '';
  }

  const limitClause = limit ? `LIMIT ${limit}` : '';

  return `
    SELECT seller_id
    FROM seller_adsense.sellers
    ${whereClause}
    ORDER BY seller_id
    ${limitClause}
  `;
}

async function processSeller(
  sellerId: string,
  stats: EnrichmentStats,
  dryRun: boolean
): Promise<void> {
  // 1. Fetch domains from AdSense API
  const apiResult = await adsenseApiClient.getDomains(sellerId);

  if (!apiResult.success) {
    // Handle errors
    if (apiResult.statusCode === 404) {
      stats.notFound++;
      if (!dryRun) {
        await updateSellerStatus(sellerId, 'not_found', apiResult.error);
      }
    } else {
      stats.errors++;
      if (!dryRun) {
        await updateSellerStatus(sellerId, 'error', apiResult.error);
      }
    }
    return;
  }

  const domains = apiResult.domains || [];

  // 2. If no domains found, mark as not_found
  if (domains.length === 0) {
    stats.notFound++;
    if (!dryRun) {
      await updateSellerStatus(sellerId, 'not_found', 'No domains returned');
    }
    return;
  }

  // 3. Insert/update domains with UPSERT logic
  if (!dryRun) {
    for (const domain of domains) {
      try {
        const result = await query(
          `
          INSERT INTO seller_adsense.seller_domains
            (seller_id, domain, detection_source, confidence_score, first_detected)
          VALUES ($1, $2, 'adsense_api', 0.95, CURRENT_DATE)
          ON CONFLICT (seller_id, domain)
          DO UPDATE SET
            detection_source = CASE
              WHEN seller_adsense.seller_domains.detection_source = 'sellers_json'
              THEN 'both'
              ELSE seller_adsense.seller_domains.detection_source
            END,
            confidence_score = CASE
              WHEN seller_adsense.seller_domains.detection_source = 'sellers_json'
              THEN 1.0
              ELSE seller_adsense.seller_domains.confidence_score
            END,
            updated_at = NOW()
          RETURNING
            (xmax = 0) AS inserted
          `,
          [sellerId, domain]
        );

        // Check if it was an insert (new domain) or update (verified domain)
        if (result.rows[0]?.inserted) {
          stats.newDomains++;
        } else {
          stats.verifiedDomains++;
        }
      } catch (error: any) {
        console.error(`Error inserting domain ${domain} for ${sellerId}:`, error.message);
      }
    }

    // 4. Update seller status
    await updateSellerStatus(sellerId, 'success', null, domains.length);
  }

  stats.successful++;
}

async function updateSellerStatus(
  sellerId: string,
  status: string,
  errorMessage: string | null | undefined,
  domainCount?: number
): Promise<void> {
  await query(
    `
    UPDATE seller_adsense.sellers
    SET
      adsense_api_checked = TRUE,
      adsense_api_last_check = NOW(),
      adsense_api_status = $2,
      adsense_api_domain_count = $3,
      adsense_api_error_message = $4
    WHERE seller_id = $1
    `,
    [sellerId, status, domainCount || 0, errorMessage || null]
  );
}

function logProgress(stats: EnrichmentStats) {
  const elapsed = Date.now() - stats.startTime;
  const rate = (stats.processed / elapsed) * 1000; // per second
  const remaining = stats.total - stats.processed;
  const eta = remaining / rate; // seconds

  console.log(`⏱️  Progress: ${stats.processed}/${stats.total} (${((stats.processed / stats.total) * 100).toFixed(2)}%)`);
  console.log(`   Success: ${stats.successful} | Not Found: ${stats.notFound} | Errors: ${stats.errors}`);
  console.log(`   New Domains: ${stats.newDomains} | Verified: ${stats.verifiedDomains}`);
  console.log(`   Rate: ${rate.toFixed(2)}/s | ETA: ${formatDuration(eta * 1000)}\n`);
}

function logFinalSummary(stats: EnrichmentStats) {
  const elapsed = Date.now() - stats.startTime;

  console.log(`Total Processed: ${stats.processed}`);
  console.log(`Successful: ${stats.successful} (${((stats.successful / stats.processed) * 100).toFixed(2)}%)`);
  console.log(`Not Found: ${stats.notFound} (${((stats.notFound / stats.processed) * 100).toFixed(2)}%)`);
  console.log(`Errors: ${stats.errors} (${((stats.errors / stats.processed) * 100).toFixed(2)}%)`);
  console.log(`New Domains Added: ${stats.newDomains}`);
  console.log(`Domains Verified: ${stats.verifiedDomains}`);
  console.log(`Total Time: ${formatDuration(elapsed)}`);
  console.log(`Average Rate: ${((stats.processed / elapsed) * 1000).toFixed(2)} sellers/s\n`);
}

async function saveCheckpoint(stats: EnrichmentStats) {
  const checkpoint = {
    ...stats,
    timestamp: new Date().toISOString(),
  };

  const checkpointPath = path.join(__dirname, '../logs/adsense-checkpoint.json');
  fs.mkdirSync(path.dirname(checkpointPath), { recursive: true });
  fs.writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

  console.log(`💾 Checkpoint saved: ${stats.processed}/${stats.total}`);
}

async function showDatabaseStats() {
  console.log('\n📊 Updated Database Statistics:');
  console.log('================================');

  const coverage = await query(`SELECT * FROM seller_adsense.domain_coverage_stats`);
  const row = coverage.rows[0];

  console.log(`Total Sellers: ${row.total_sellers}`);
  console.log(`Sellers with Domains: ${row.sellers_with_domains} (${((row.sellers_with_domains / row.total_sellers) * 100).toFixed(2)}%)`);
  console.log(`  - From sellers.json only: ${row.from_sellers_json_only}`);
  console.log(`  - From AdSense API only: ${row.from_adsense_api_only}`);
  console.log(`  - From both sources (verified): ${row.from_both_sources}`);
  console.log(`Total Verified Domains: ${row.total_verified_domains}\n`);
}

async function refreshMaterializedViews() {
  console.log('\n🔄 Refreshing Materialized Views');
  console.log('=================================');

  const views = [
    'seller_adsense.publisher_list_view',
    'seller_adsense.domain_aggregation_view',
    'seller_adsense.tld_aggregation_view',
  ];

  for (const viewName of views) {
    const startTime = Date.now();
    console.log(`Refreshing ${viewName.split('.')[1]}...`);

    try {
      await query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName};`);
      const duration = Date.now() - startTime;
      console.log(`✅ ${viewName.split('.')[1]} refreshed in ${duration}ms`);
    } catch (error: any) {
      console.error(`❌ Error refreshing ${viewName}:`, error.message);
    }
  }

  console.log('✅ All materialized views refreshed\n');
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Parse command-line arguments
const args = process.argv.slice(2);
const options: EnrichmentOptions = {
  mode: 'fill-missing',
  resume: false,
  dryRun: false,
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  if (arg === '--mode' && args[i + 1]) {
    options.mode = args[i + 1] as any;
    i++;
  } else if (arg === '--limit' && args[i + 1]) {
    options.limit = parseInt(args[i + 1]);
    i++;
  } else if (arg === '--resume') {
    options.resume = true;
  } else if (arg === '--dry-run') {
    options.dryRun = true;
  }
}

// Run enrichment
enrichAdSenseData(options);
