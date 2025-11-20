#!/usr/bin/env ts-node
/**
 * Daily Automation Script
 *
 * This script runs daily to:
 * 1. Download latest sellers.json from Google
 * 2. Update database with new/changed sellers
 * 3. Clean up downloaded files (local + VPS)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { runDailyUpdate } from './daily-update';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

const CLEANUP_LOCAL_FILES = process.env.CLEANUP_LOCAL_FILES !== 'false'; // Default: enabled
const CLEANUP_VPS_FILES = process.env.CLEANUP_VPS_FILES !== 'false'; // Default: enabled

/**
 * Clean up downloaded sellers.json files
 */
async function cleanupFiles() {
  console.log('\n[Cleanup] Starting file cleanup...');

  try {
    // Clean up VPS files
    if (CLEANUP_VPS_FILES) {
      console.log('[Cleanup] Removing sellers.json from VPS...');
      const { stdout: vpsStdout, stderr: vpsStderr } = await execAsync(
        'ssh vps-supabase "rm -f /tmp/sellers.json && echo \\"VPS cleanup done\\""'
      );
      console.log('[Cleanup VPS]', vpsStdout.trim());
      if (vpsStderr) console.error('[Cleanup VPS Error]', vpsStderr);
    }

    // Clean up local files (if any were downloaded)
    if (CLEANUP_LOCAL_FILES) {
      const localPaths = [
        path.join(process.cwd(), 'sellers.json'),
        '/tmp/sellers.json'
      ];

      for (const filePath of localPaths) {
        try {
          await fs.unlink(filePath);
          console.log(`[Cleanup] Removed local file: ${filePath}`);
        } catch (err: any) {
          if (err.code !== 'ENOENT') {
            console.error(`[Cleanup] Could not remove ${filePath}:`, err.message);
          }
        }
      }
    }

    console.log('[Cleanup] ✅ File cleanup completed');
  } catch (error: any) {
    console.error('[Cleanup] ❌ Error during cleanup:', error.message);
    // Don't fail the entire process if cleanup fails
  }
}

/**
 * Main automation function
 */
async function runDailyAutomation() {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${startTime.toISOString()}] Starting Daily Automation`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Step 1: Run daily update (downloads sellers.json and updates database)
    console.log('📥 Step 1/2: Running daily update...');
    await runDailyUpdate();
    console.log('✅ Daily update completed\n');

    // Step 2: Clean up downloaded files
    console.log('🧹 Step 2/2: Cleaning up downloaded files...');
    await cleanupFiles();
    console.log('✅ Cleanup completed\n');

    const endTime = new Date();
    const duration = (endTime.getTime() - startTime.getTime()) / 1000;

    console.log(`${'='.repeat(60)}`);
    console.log(`[${endTime.toISOString()}] Daily Automation Completed`);
    console.log(`Total duration: ${duration.toFixed(2)} seconds`);
    console.log(`${'='.repeat(60)}\n`);

  } catch (error: any) {
    console.error('\n❌ Daily automation failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDailyAutomation();
}

export { runDailyAutomation };
