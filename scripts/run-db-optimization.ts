#!/usr/bin/env tsx

/**
 * Database Optimization Script
 * Runs the optimize-database.sql script through the PostgreSQL connection
 */

import { promises as fs } from 'fs';
import path from 'path';
import { query, pool } from '../src/lib/db';

const SQL_FILE = path.join(__dirname, 'optimize-database.sql');

async function runOptimization() {
  console.log('🚀 Starting database optimization for pSEO...\n');

  try {
    // Read SQL file
    console.log(`📖 Reading SQL file: ${SQL_FILE}`);
    const sqlContent = await fs.readFile(SQL_FILE, 'utf-8');

    // Split SQL file into individual statements
    // Remove comments and split by semicolon
    const statements = sqlContent
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];

      // Skip verification queries (EXPLAIN, SELECT for display)
      if (
        stmt.includes('EXPLAIN ANALYZE') ||
        stmt.includes('pg_size_pretty') ||
        stmt.includes('pg_indexes') ||
        stmt.includes('pg_matviews')
      ) {
        skipCount++;
        continue;
      }

      // Extract statement type for logging
      const stmtType = stmt.split(/\s+/)[0].toUpperCase();

      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${stmtType}...`);

        const startTime = Date.now();
        await query(stmt);
        const duration = Date.now() - startTime;

        console.log(`  ✅ Success (${duration}ms)\n`);
        successCount++;

      } catch (error: any) {
        // Some statements might fail if already exist (e.g., indexes)
        // We'll log but continue
        if (error.message.includes('already exists')) {
          console.log(`  ⚠️  Already exists, skipping\n`);
          skipCount++;
        } else {
          console.error(`  ❌ Error: ${error.message}\n`);
          errorCount++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Optimization Summary');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${statements.length}`);
    console.log('='.repeat(60) + '\n');

    // Run verification queries
    console.log('🔍 Running verification queries...\n');

    // Check materialized view status
    const views = await query(`
      SELECT
        schemaname,
        matviewname,
        pg_size_pretty(pg_relation_size(schemaname||'.'||matviewname::regclass)) as view_size
      FROM pg_matviews
      WHERE schemaname = 'seller_adsense'
      ORDER BY matviewname;
    `);

    if (views.rows.length > 0) {
      console.log('📋 Materialized Views:');
      views.rows.forEach(view => {
        console.log(`  - ${view.matviewname}: ${view.view_size}`);
      });
      console.log();
    }

    // Check index status
    const indexes = await query(`
      SELECT
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size
      FROM pg_indexes
      JOIN pg_class ON pg_class.relname = indexname
      WHERE schemaname = 'seller_adsense'
        AND indexname LIKE 'idx_%'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10;
    `);

    if (indexes.rows.length > 0) {
      console.log('📊 Top 10 Indexes by Size:');
      indexes.rows.forEach(idx => {
        console.log(`  - ${idx.indexname}: ${idx.index_size}`);
      });
      console.log();
    }

    // Test publisher_list_view query performance
    console.log('⚡ Testing publisher_list_view performance...');
    const perfStart = Date.now();
    const testQuery = await query(`
      SELECT COUNT(*) as total_publishers
      FROM seller_adsense.publisher_list_view;
    `);
    const perfDuration = Date.now() - perfStart;

    console.log(`  Total publishers in view: ${testQuery.rows[0].total_publishers}`);
    console.log(`  Query time: ${perfDuration}ms\n`);

    console.log('✨ Database optimization complete!\n');

    console.log('💡 Next steps:');
    console.log('  1. Add materialized view refresh to daily-update.ts');
    console.log('  2. Monitor query performance with EXPLAIN ANALYZE');
    console.log('  3. Run: SELECT * FROM seller_adsense.refresh_all_materialized_views();');
    console.log();

  } catch (error: any) {
    console.error('❌ Fatal error during optimization:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
runOptimization().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});
