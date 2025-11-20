import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { SellersJsonFile } from '../src/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: 'seller_adsense' }
});

async function importSellers() {
  console.log('🚀 Starting sellers.json import...');

  // 1. Download sellers.json
  console.log('📥 Downloading sellers.json...');
  const response = await fetch(
    'https://storage.googleapis.com/adx-rtb-dictionaries/sellers.json'
  );

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }

  const data: SellersJsonFile = await response.json();
  console.log(`✅ Downloaded ${data.sellers.length.toLocaleString()} sellers`);

  // 2. Transform data
  const today = new Date().toISOString().split('T')[0];
  const sellers = data.sellers.map(s => ({
    seller_id: s.seller_id,
    first_seen_date: today,
    seller_type: s.seller_type || 'PUBLISHER',
    is_confidential: s.is_confidential === 1,
    name: s.name || null,
    domain: s.domain || null,
  }));

  console.log(`🔄 Transformed ${sellers.length.toLocaleString()} records`);

  // 3. Batch insert (1000 at a time)
  const BATCH_SIZE = 1000;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < sellers.length; i += BATCH_SIZE) {
    const batch = sellers.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('sellers')
      .upsert(batch, {
        onConflict: 'seller_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`❌ Error inserting batch ${Math.floor(i / BATCH_SIZE) + 1}:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      const progress = ((i + batch.length) / sellers.length * 100).toFixed(1);
      console.log(`📊 Progress: ${progress}% (${(i + batch.length).toLocaleString()}/${sellers.length.toLocaleString()})`);
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   Inserted: ${inserted.toLocaleString()}`);
  console.log(`   Errors: ${errors.toLocaleString()}`);

  // 4. Create initial snapshot
  console.log('\n📸 Creating initial snapshot...');
  const { error: snapshotError } = await supabase
    .from('daily_snapshots')
    .upsert({
      snapshot_date: today,
      total_count: sellers.length,
      new_count: sellers.length,
      removed_count: 0,
      new_sellers: sellers.slice(0, 100) // Store first 100 as sample
    }, {
      onConflict: 'snapshot_date'
    });

  if (snapshotError) {
    console.error('❌ Error creating snapshot:', snapshotError.message);
  } else {
    console.log('✅ Snapshot created');
  }

  // 5. Insert domains from sellers.json
  console.log('\n🔗 Processing domains from sellers.json...');
  const sellersWithDomains = sellers.filter(s => s.domain);
  console.log(`Found ${sellersWithDomains.length.toLocaleString()} sellers with domains`);

  const domains = sellersWithDomains.map(s => ({
    seller_id: s.seller_id,
    domain: s.domain!,
    first_detected: today,
    detection_source: 'sellers_json' as const,
    confidence_score: 1.0
  }));

  for (let i = 0; i < domains.length; i += BATCH_SIZE) {
    const batch = domains.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('seller_domains')
      .upsert(batch, {
        onConflict: 'seller_id,domain',
        ignoreDuplicates: true
      });

    if (error) {
      console.error(`❌ Error inserting domain batch:`, error.message);
    } else {
      const progress = ((i + batch.length) / domains.length * 100).toFixed(1);
      console.log(`📊 Domains progress: ${progress}% (${(i + batch.length).toLocaleString()}/${domains.length.toLocaleString()})`);
    }
  }

  console.log('\n🎉 All done!');
}

// Run import
importSellers().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
