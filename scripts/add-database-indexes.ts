#!/usr/bin/env ts-node
/**
 * Add Missing Database Indexes
 * Optimizes query performance for frequently accessed columns
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 54322,
  database: 'postgres',
  user: 'postgres',
  password: 'postgres',
  max: 10,
});

interface IndexDefinition {
  name: string;
  table: string;
  columns: string[];
  unique?: boolean;
  description: string;
}

// Define all indexes to be created
const indexes: IndexDefinition[] = [
  // ============================================================================
  // seller_adsense.sellers table indexes
  // ============================================================================
  {
    name: 'idx_sellers_domain',
    table: 'seller_adsense.sellers',
    columns: ['domain'],
    description: 'Index for domain lookups and searches',
  },
  {
    name: 'idx_sellers_seller_type',
    table: 'seller_adsense.sellers',
    columns: ['seller_type'],
    description: 'Index for filtering by seller type',
  },
  {
    name: 'idx_sellers_first_seen_date',
    table: 'seller_adsense.sellers',
    columns: ['first_seen_date'],
    description: 'Index for sorting by first seen date',
  },
  {
    name: 'idx_sellers_updated_at',
    table: 'seller_adsense.sellers',
    columns: ['updated_at'],
    description: 'Index for sorting by last update',
  },
  {
    name: 'idx_sellers_domain_count',
    table: 'seller_adsense.sellers',
    columns: ['(SELECT COUNT(*) FROM seller_adsense.seller_domains sd WHERE sd.seller_id = sellers.seller_id)'],
    description: 'Index for sorting by domain count (requires computed column)',
  },

  // ============================================================================
  // seller_adsense.seller_domains table indexes
  // ============================================================================
  {
    name: 'idx_seller_domains_seller_id',
    table: 'seller_adsense.seller_domains',
    columns: ['seller_id'],
    description: 'Index for JOIN operations with sellers table',
  },
  {
    name: 'idx_seller_domains_domain',
    table: 'seller_adsense.seller_domains',
    columns: ['domain'],
    description: 'Index for domain lookups',
  },
  {
    name: 'idx_seller_domains_detection_source',
    table: 'seller_adsense.seller_domains',
    columns: ['detection_source'],
    description: 'Index for filtering by detection source',
  },
  {
    name: 'idx_seller_domains_confidence_score',
    table: 'seller_adsense.seller_domains',
    columns: ['confidence_score'],
    description: 'Index for sorting by confidence score',
  },
  {
    name: 'idx_seller_domains_seller_domain_composite',
    table: 'seller_adsense.seller_domains',
    columns: ['seller_id', 'domain'],
    unique: true,
    description: 'Composite unique index for seller-domain relationships',
  },

  // ============================================================================
  // seller_adsense.daily_snapshots table indexes
  // ============================================================================
  {
    name: 'idx_daily_snapshots_snapshot_date',
    table: 'seller_adsense.daily_snapshots',
    columns: ['snapshot_date'],
    description: 'Index for filtering and sorting by snapshot date',
  },
];

async function checkIndexExists(indexName: string): Promise<boolean> {
  const result = await pool.query(
    `
    SELECT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE indexname = $1
    ) AS exists
    `,
    [indexName]
  );

  return result.rows[0].exists;
}

async function createIndex(index: IndexDefinition): Promise<void> {
  const exists = await checkIndexExists(index.name);

  if (exists) {
    console.log(`  ⏭️  Index ${index.name} already exists, skipping...`);
    return;
  }

  const uniqueClause = index.unique ? 'UNIQUE' : '';
  const columnsStr = index.columns.join(', ');

  const sql = `
    CREATE ${uniqueClause} INDEX CONCURRENTLY IF NOT EXISTS ${index.name}
    ON ${index.table} (${columnsStr})
  `.trim();

  console.log(`  🔨 Creating index: ${index.name}`);
  console.log(`     Description: ${index.description}`);
  console.log(`     SQL: ${sql.replace(/\s+/g, ' ')}`);

  try {
    await pool.query(sql);
    console.log(`  ✅ Successfully created index: ${index.name}\n`);
  } catch (error: any) {
    if (error.message.includes('already exists')) {
      console.log(`  ⏭️  Index ${index.name} already exists, skipping...\n`);
    } else {
      console.error(`  ❌ Error creating index ${index.name}:`, error.message);
      throw error;
    }
  }
}

async function getTableStats(): Promise<void> {
  console.log('\n📊 Database Statistics:');
  console.log('='.repeat(60));

  const tables = [
    'seller_adsense.sellers',
    'seller_adsense.seller_domains',
    'seller_adsense.daily_snapshots',
  ];

  for (const table of tables) {
    const result = await pool.query(`
      SELECT
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
        pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
      FROM pg_tables
      WHERE schemaname||'.'||tablename = $1
    `, [table]);

    if (result.rows.length > 0) {
      const stats = result.rows[0];
      console.log(`\n${stats.schemaname}.${stats.tablename}:`);
      console.log(`  Total Size:   ${stats.total_size}`);
      console.log(`  Table Size:   ${stats.table_size}`);
      console.log(`  Indexes Size: ${stats.indexes_size}`);
    }
  }

  console.log('\n' + '='.repeat(60));
}

async function listExistingIndexes(): Promise<void> {
  console.log('\n📝 Existing Indexes:');
  console.log('='.repeat(60));

  const result = await pool.query(`
    SELECT
      schemaname,
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'seller_adsense'
    ORDER BY tablename, indexname
  `);

  let currentTable = '';
  for (const row of result.rows) {
    if (row.tablename !== currentTable) {
      console.log(`\n${row.schemaname}.${row.tablename}:`);
      currentTable = row.tablename;
    }
    console.log(`  ${row.indexname}`);
  }

  console.log('\n' + '='.repeat(60));
}

async function main() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${new Date().toISOString()}] Database Index Optimization`);
  console.log('='.repeat(60));

  try {
    // Show current state
    await getTableStats();
    await listExistingIndexes();

    console.log(`\n🔧 Creating ${indexes.length} indexes...`);
    console.log('='.repeat(60));

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < indexes.length; i++) {
      const index = indexes[i];
      console.log(`\n[${i + 1}/${indexes.length}] Processing: ${index.name}`);

      try {
        const exists = await checkIndexExists(index.name);
        if (exists) {
          skipped++;
        } else {
          await createIndex(index);
          created++;
        }
      } catch (error) {
        console.error(`Failed to create index ${index.name}:`, error);
        failed++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Failed:  ${failed}`);
    console.log('='.repeat(60));

    // Show final state
    await getTableStats();

    console.log(`\n✅ Index optimization completed!`);

  } catch (error) {
    console.error('\n❌ Error during index optimization:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main as addDatabaseIndexes };
