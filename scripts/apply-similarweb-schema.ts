#!/usr/bin/env tsx
/**
 * Apply SimilarWeb analytics schema to the database
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

async function applySchema() {
  console.log('🔧 Applying SimilarWeb analytics schema...\n');

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'seller_adsense' }
  });

  try {
    // Read the SQL file
    const sqlPath = join(__dirname, 'create-similarweb-schema.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');

    console.log('📄 SQL Schema:');
    console.log('─'.repeat(80));
    console.log(sqlContent);
    console.log('─'.repeat(80));
    console.log('');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });

    if (error) {
      // Try alternative approach: split by semicolon and execute one by one
      console.log('⚠️  RPC approach failed, trying direct approach...\n');

      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.rpc('exec_sql', { sql: statement });
        if (execError) {
          console.error(`❌ Error executing statement: ${statement.substring(0, 100)}...`);
          console.error(execError);
        } else {
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
        }
      }
    } else {
      console.log('✅ Schema applied successfully!');
    }

    // Verify table creation
    console.log('\n🔍 Verifying table creation...');

    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'seller_adsense')
      .eq('table_name', 'similarweb_analytics');

    if (verifyError) {
      console.error('❌ Verification error:', verifyError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Table "similarweb_analytics" exists!');

      // Get column info
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'seller_adsense')
        .eq('table_name', 'similarweb_analytics')
        .order('ordinal_position');

      if (columns) {
        console.log('\n📋 Table columns:');
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type}`);
        });
      }
    } else {
      console.warn('⚠️  Table not found, may need manual creation');
    }

  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }

  console.log('\n✨ Schema application complete!');
}

applySchema().catch(console.error);
