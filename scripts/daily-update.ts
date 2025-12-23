#!/usr/bin/env ts-node
import { Pool } from 'pg';
import https from 'https';
import { SellersJsonSeller, SellersJsonFile } from '../src/lib/types';

const SELLERS_JSON_URL = 'https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json';

// Database connection
const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

async function fetchSellersJson(): Promise<SellersJsonFile> {
  return new Promise((resolve, reject) => {
    https.get(SELLERS_JSON_URL, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

async function getCurrentSellerIds(): Promise<Set<string>> {
  const result = await pool.query<{ seller_id: string }>(
    'SELECT seller_id FROM seller_adsense.sellers'
  );
  return new Set(result.rows.map((row) => row.seller_id));
}

async function detectChanges(newSellers: SellersJsonSeller[]): Promise<{
  newSellers: SellersJsonSeller[];
  removedSellerIds: string[];
  updatedSellers: SellersJsonSeller[];
}> {
  const currentIds = await getCurrentSellerIds();
  const newIds = new Set(newSellers.map(s => s.seller_id));

  // Find new sellers
  const newSellersList = newSellers.filter(s => !currentIds.has(s.seller_id));

  // Find removed sellers
  const removedSellerIds = Array.from(currentIds).filter(id => !newIds.has(id));

  // Find potentially updated sellers (existing IDs)
  const existingSellersList = newSellers.filter(s => currentIds.has(s.seller_id));

  return {
    newSellers: newSellersList,
    removedSellerIds,
    updatedSellers: existingSellersList,
  };
}

async function insertNewSellers(sellers: SellersJsonSeller[]): Promise<number> {
  if (sellers.length === 0) return 0;

  // Use parameterized batch insert with unnest() for security
  const sellerIds = sellers.map(s => s.seller_id);
  const sellerTypes = sellers.map(s => s.seller_type);
  const isConfidentials = sellers.map(s => s.is_confidential || false);
  const domains = sellers.map(s => s.domain || null);
  const names = sellers.map(s => s.name || null);

  // Create array of timestamps for first_seen_date
  const firstSeenDates = sellers.map(() => new Date());

  const query = `
    INSERT INTO seller_adsense.sellers
    (seller_id, seller_type, is_confidential, domain, name, first_seen_date)
    SELECT * FROM unnest(
      $1::text[],
      $2::text[],
      $3::boolean[],
      $4::text[],
      $5::text[],
      $6::timestamp[]
    )
    ON CONFLICT (seller_id) DO NOTHING
  `;

  const result = await pool.query(query, [
    sellerIds,
    sellerTypes,
    isConfidentials,
    domains,
    names,
    firstSeenDates
  ]);
  return result.rowCount || 0;
}

async function updateExistingSellers(sellers: SellersJsonSeller[]): Promise<number> {
  if (sellers.length === 0) return 0;

  console.log(`  Using optimized batch update with temporary table...`);

  // Get a dedicated client from the pool for the entire operation
  const client = await pool.connect();

  try {
    // Begin transaction
    await client.query('BEGIN');

    // Step 1: Create temporary table
    await client.query(`
      CREATE TEMP TABLE temp_sellers_update (
        seller_id TEXT PRIMARY KEY,
        seller_type TEXT,
        is_confidential BOOLEAN,
        domain TEXT,
        name TEXT
      )
    `);

    // Step 2: Insert data into temp table in batches (using parameterized queries for security)
    const BATCH_SIZE = 5000;
    let insertedCount = 0;

    for (let i = 0; i < sellers.length; i += BATCH_SIZE) {
      const batch = sellers.slice(i, i + BATCH_SIZE);

      // Use parameterized batch insert with unnest() for security
      const sellerIds = batch.map(s => s.seller_id);
      const sellerTypes = batch.map(s => s.seller_type);
      const isConfidentials = batch.map(s => s.is_confidential || false);
      const domains = batch.map(s => s.domain || null);
      const names = batch.map(s => s.name || null);

      await client.query(`
        INSERT INTO temp_sellers_update
        SELECT * FROM unnest(
          $1::text[],
          $2::text[],
          $3::boolean[],
          $4::text[],
          $5::text[]
        )
      `, [sellerIds, sellerTypes, isConfidentials, domains, names]);

      insertedCount += batch.length;

      // Progress logging every 100K records
      if (insertedCount % 100000 === 0 || insertedCount === sellers.length) {
        console.log(`  Loaded ${insertedCount.toLocaleString()}/${sellers.length.toLocaleString()} records into temp table`);
      }
    }

    // Step 3: Perform single batch update
    console.log(`  Executing batch update...`);
    const result = await client.query(`
      UPDATE seller_adsense.sellers s
      SET
        seller_type = t.seller_type,
        is_confidential = t.is_confidential,
        domain = t.domain,
        name = t.name,
        updated_at = NOW()
      FROM temp_sellers_update t
      WHERE s.seller_id = t.seller_id
      AND (
        s.seller_type::text != t.seller_type OR
        s.is_confidential != t.is_confidential OR
        s.domain IS DISTINCT FROM t.domain OR
        s.name IS DISTINCT FROM t.name
      )
    `);

    const updateCount = result.rowCount || 0;
    console.log(`  Batch update completed: ${updateCount.toLocaleString()} sellers updated`);

    // Commit the transaction
    await client.query('COMMIT');

    return updateCount;

  } catch (error) {
    console.error('Error in batch update:', error);
    // Rollback the transaction
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      // Ignore rollback errors
    }
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
}

async function markRemovedSellers(sellerIds: string[]): Promise<number> {
  if (sellerIds.length === 0) return 0;

  // Note: We don't delete, just mark with updated_at for tracking
  const result = await pool.query(`
    UPDATE seller_adsense.sellers
    SET updated_at = NOW()
    WHERE seller_id = ANY($1)
  `, [sellerIds]);

  return result.rowCount || 0;
}

async function createSnapshot(totalCount: number, newCount: number, removedCount: number): Promise<void> {
  await pool.query(`
    INSERT INTO seller_adsense.daily_snapshots
    (snapshot_date, total_count, new_count, removed_count)
    VALUES (CURRENT_DATE, $1, $2, $3)
    ON CONFLICT (snapshot_date)
    DO UPDATE SET
      total_count = $1,
      new_count = $2,
      removed_count = $3
  `, [totalCount, newCount, removedCount]);
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting daily update...`);

  try {
    // Fetch latest sellers.json
    console.log('Fetching sellers.json...');
    const sellersData = await fetchSellersJson();
    console.log(`Fetched ${sellersData.sellers.length} sellers`);

    // Detect changes
    console.log('Detecting changes...');
    const { newSellers, removedSellerIds, updatedSellers } = await detectChanges(sellersData.sellers);

    console.log(`Found ${newSellers.length} new sellers`);
    console.log(`Found ${removedSellerIds.length} removed sellers`);
    console.log(`Found ${updatedSellers.length} potentially updated sellers`);

    // Insert new sellers
    if (newSellers.length > 0) {
      console.log('Inserting new sellers...');
      const inserted = await insertNewSellers(newSellers);
      console.log(`Inserted ${inserted} new sellers`);
    }

    // Update existing sellers
    if (updatedSellers.length > 0) {
      console.log('Updating existing sellers...');
      const updated = await updateExistingSellers(updatedSellers);
      console.log(`Updated ${updated} sellers`);
    }

    // Mark removed sellers
    if (removedSellerIds.length > 0) {
      console.log('Marking removed sellers...');
      const marked = await markRemovedSellers(removedSellerIds);
      console.log(`Marked ${marked} removed sellers`);
    }

    // Create daily snapshot
    console.log('Creating daily snapshot...');
    await createSnapshot(
      sellersData.sellers.length,
      newSellers.length,
      removedSellerIds.length
    );

    console.log(`[${new Date().toISOString()}] Daily update completed successfully!`);
    console.log('Summary:');
    console.log(`  Total sellers: ${sellersData.sellers.length}`);
    console.log(`  New sellers: ${newSellers.length}`);
    console.log(`  Removed sellers: ${removedSellerIds.length}`);
    console.log(`  Updated sellers: ${updatedSellers.length}`);

    // Refresh materialized views (using direct queries instead of database function to avoid timeout)
    console.log('\nRefreshing materialized views...');
    const viewsToRefresh = [
      'all_domains_mv',
      'domain_aggregation_view',
      'tld_aggregation_view',
      // Skip publisher_list_view as it's too large and may timeout (113万+ rows)
    ];

    for (const viewName of viewsToRefresh) {
      try {
        const start = Date.now();
        await pool.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.${viewName}`);
        const duration = Date.now() - start;
        console.log(`  ✅ ${viewName} (${duration}ms)`);
      } catch (err: any) {
        console.error(`  ❌ ${viewName}: ${err.message} (continuing anyway)`);
      }
    }

    // Trigger On-Demand Revalidation (if in production with website running)
    if (process.env.NEXT_PUBLIC_SITE_URL && process.env.REVALIDATE_SECRET) {
      console.log('\nTriggering ISR revalidation...');
      try {
        // Revalidate homepage
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.REVALIDATE_SECRET,
            type: 'home',
          }),
        });
        console.log('  ✓ Homepage revalidated');

        // Revalidate new publishers (if not too many)
        if (newSellers.length > 0 && newSellers.length <= 100) {
          const newIds = newSellers.map(s => s.seller_id);
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              secret: process.env.REVALIDATE_SECRET,
              type: 'publisher',
              ids: newIds,
            }),
          });
          console.log(`  ✓ ${newIds.length} new publisher pages revalidated`);
        } else if (newSellers.length > 100) {
          console.log(`  ⚠ ${newSellers.length} new publishers - skipping individual revalidation (too many)`);
        }

        // Revalidate publisher list pages
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: process.env.REVALIDATE_SECRET,
            type: 'publisher',
          }),
        });
        console.log('  ✓ Publisher list pages revalidated');

        console.log('ISR revalidation completed!');
      } catch (revalidateError) {
        console.error('Error during revalidation (continuing anyway):', revalidateError);
      }
    } else {
      console.log('\nISR revalidation skipped (set NEXT_PUBLIC_SITE_URL and REVALIDATE_SECRET to enable)');
    }

  } catch (error) {
    console.error('Error during daily update:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as runDailyUpdate };
