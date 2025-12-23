#!/usr/bin/env tsx

/**
 * Refresh Materialized Views Script
 * Used by daily-update.ts to keep materialized views fresh
 */

import { query, pool } from '../src/lib/db';

interface RefreshResult {
  view_name: string;
  status: string;
  duration_ms: number;
}

async function refreshMaterializedViews() {
  console.log('🔄 Refreshing materialized views...\n');

  try {
    const startTime = Date.now();
    const results: RefreshResult[] = [];

    // List of views to refresh in order
    const views = [
      'all_domains_mv',
      'domain_aggregation_view',
      'publisher_list_view',
      'tld_aggregation_view',
    ];

    // Refresh each view sequentially
    for (const viewName of views) {
      const viewStart = Date.now();
      try {
        console.log(`  Refreshing ${viewName}...`);
        await query(`REFRESH MATERIALIZED VIEW CONCURRENTLY seller_adsense.${viewName}`);
        const duration = Date.now() - viewStart;
        console.log(`  ✅ ${viewName} (${duration}ms)`);
        results.push({
          view_name: viewName,
          status: 'SUCCESS',
          duration_ms: duration,
        });
      } catch (err: any) {
        const duration = Date.now() - viewStart;
        console.error(`  ❌ ${viewName}: ${err.message}`);
        results.push({
          view_name: viewName,
          status: 'FAILED',
          duration_ms: duration,
        });
      }
    }

    const totalDuration = Date.now() - startTime;

    console.log('\n📊 Refresh Results:');
    console.log('='.repeat(60));

    results.forEach(row => {
      const icon = row.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`${icon} ${row.view_name}: ${row.status} (${row.duration_ms}ms)`);
    });

    console.log('='.repeat(60));
    console.log(`⏱️  Total time: ${totalDuration}ms\n`);

    // Verify row counts
    console.log('🔍 Verifying row counts...\n');

    const viewCounts = await Promise.all([
      query('SELECT COUNT(*) as count FROM seller_adsense.publisher_list_view'),
      query('SELECT COUNT(*) as count FROM seller_adsense.domain_aggregation_view'),
      query('SELECT COUNT(*) as count FROM seller_adsense.tld_aggregation_view'),
    ]);

    console.log(`  publisher_list_view: ${viewCounts[0].rows[0].count} rows`);
    console.log(`  domain_aggregation_view: ${viewCounts[1].rows[0].count} rows`);
    console.log(`  tld_aggregation_view: ${viewCounts[2].rows[0].count} rows\n`);

    console.log('✅ Materialized views refreshed successfully!');

  } catch (error: any) {
    console.error('❌ Error refreshing materialized views:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  refreshMaterializedViews().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { refreshMaterializedViews };
