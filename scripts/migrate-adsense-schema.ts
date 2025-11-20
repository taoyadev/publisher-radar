import { query } from '../src/lib/db';

async function migrateSchema() {
  console.log('🚀 Starting AdSense API schema migration...\n');

  try {
    // 1. Check current seller_domains constraints
    console.log('📋 Step 1: Checking existing constraints...');
    const constraints = await query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'seller_adsense'
        AND table_name = 'seller_domains'
    `);

    console.log('Current constraints:', constraints.rows);

    // 2. Add unique constraint if not exists
    console.log('\n📋 Step 2: Adding unique constraint...');
    try {
      await query(`
        ALTER TABLE seller_adsense.seller_domains
        ADD CONSTRAINT unique_seller_domain
        UNIQUE (seller_id, domain)
      `);
      console.log('✅ Unique constraint added');
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        console.log('✅ Unique constraint already exists');
      } else {
        throw err;
      }
    }

    // 3. Add updated_at to seller_domains if not exists
    console.log('\n📋 Step 3: Adding updated_at to seller_domains...');
    await query(`
      ALTER TABLE seller_adsense.seller_domains
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    console.log('✅ updated_at column added/verified');

    // 4. Extend sellers table with AdSense API tracking fields
    console.log('\n📋 Step 4: Extending sellers table...');

    await query(`
      ALTER TABLE seller_adsense.sellers
      ADD COLUMN IF NOT EXISTS adsense_api_checked BOOLEAN DEFAULT FALSE
    `);
    console.log('✅ adsense_api_checked column added');

    await query(`
      ALTER TABLE seller_adsense.sellers
      ADD COLUMN IF NOT EXISTS adsense_api_last_check TIMESTAMP
    `);
    console.log('✅ adsense_api_last_check column added');

    await query(`
      ALTER TABLE seller_adsense.sellers
      ADD COLUMN IF NOT EXISTS adsense_api_status VARCHAR(50)
    `);
    console.log('✅ adsense_api_status column added');

    await query(`
      ALTER TABLE seller_adsense.sellers
      ADD COLUMN IF NOT EXISTS adsense_api_domain_count INTEGER DEFAULT 0
    `);
    console.log('✅ adsense_api_domain_count column added');

    await query(`
      ALTER TABLE seller_adsense.sellers
      ADD COLUMN IF NOT EXISTS adsense_api_error_message TEXT
    `);
    console.log('✅ adsense_api_error_message column added');

    // 5. Create indexes for performance
    console.log('\n📋 Step 5: Creating indexes...');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sellers_adsense_checked
        ON seller_adsense.sellers(adsense_api_checked)
    `);
    console.log('✅ idx_sellers_adsense_checked created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_sellers_adsense_status
        ON seller_adsense.sellers(adsense_api_status)
    `);
    console.log('✅ idx_sellers_adsense_status created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_seller_domains_source
        ON seller_adsense.seller_domains(detection_source)
    `);
    console.log('✅ idx_seller_domains_source created');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_seller_domains_confidence
        ON seller_adsense.seller_domains(confidence_score)
    `);
    console.log('✅ idx_seller_domains_confidence created');

    // 6. Create monitoring view
    console.log('\n📋 Step 6: Creating monitoring view...');
    await query(`
      CREATE OR REPLACE VIEW seller_adsense.domain_coverage_stats AS
      SELECT
        COUNT(DISTINCT s.seller_id) as total_sellers,
        COUNT(DISTINCT CASE WHEN sd.seller_id IS NOT NULL THEN s.seller_id END) as sellers_with_domains,
        COUNT(DISTINCT CASE WHEN sd.detection_source = 'sellers_json' THEN s.seller_id END) as from_sellers_json_only,
        COUNT(DISTINCT CASE WHEN sd.detection_source = 'adsense_api' THEN s.seller_id END) as from_adsense_api_only,
        COUNT(DISTINCT CASE WHEN sd.detection_source = 'both' THEN s.seller_id END) as from_both_sources,
        COUNT(CASE WHEN sd.detection_source = 'both' THEN 1 END) as total_verified_domains
      FROM seller_adsense.sellers s
      LEFT JOIN seller_adsense.seller_domains sd ON s.seller_id = sd.seller_id
    `);
    console.log('✅ domain_coverage_stats view created');

    await query(`
      CREATE OR REPLACE VIEW seller_adsense.adsense_api_progress AS
      SELECT
        adsense_api_status,
        COUNT(*) as count,
        ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM seller_adsense.sellers) * 100, 2) as percentage
      FROM seller_adsense.sellers
      GROUP BY adsense_api_status
      ORDER BY count DESC
    `);
    console.log('✅ adsense_api_progress view created');

    // 7. Verify migration
    console.log('\n📊 Step 7: Verifying migration...');
    const verification = await query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'seller_adsense'
        AND table_name = 'sellers'
        AND column_name LIKE 'adsense%'
      ORDER BY ordinal_position
    `);

    console.log('\nNew columns in sellers table:');
    verification.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 8. Show current statistics
    console.log('\n📈 Current statistics:');
    const stats = await query(`SELECT * FROM seller_adsense.domain_coverage_stats`);
    console.log('Domain Coverage:');
    console.log(`  - Total sellers: ${stats.rows[0].total_sellers}`);
    console.log(`  - Sellers with domains: ${stats.rows[0].sellers_with_domains}`);
    console.log(`  - From sellers.json only: ${stats.rows[0].from_sellers_json_only}`);
    console.log(`  - From AdSense API only: ${stats.rows[0].from_adsense_api_only}`);
    console.log(`  - From both sources: ${stats.rows[0].from_both_sources}`);
    console.log(`  - Total verified domains: ${stats.rows[0].total_verified_domains}`);

    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSchema();
