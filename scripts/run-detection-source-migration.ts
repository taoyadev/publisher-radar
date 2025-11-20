#!/usr/bin/env tsx
/**
 * Run detection_source migration
 * Updates constraint to support adsense_api and both
 * Adds index on first_detected for /domain/new performance
 */

import { query } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  console.log('Starting detection_source migration...\n');

  try {
    // Read migration SQL
    const migrationPath = path.join(__dirname, 'migrations', 'update-detection-source-and-index.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Remove comments and split by semicolons
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 80)}...`);
      await query(statement);
      console.log('✓ Done\n');
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nChanges applied:');
    console.log('  1. Updated detection_source CHECK constraint to include:');
    console.log('     - adsense_api (for AdSense API data)');
    console.log('     - both (for double-confirmed domains)');
    console.log('  2. Added index on first_detected for /domain/new performance');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
