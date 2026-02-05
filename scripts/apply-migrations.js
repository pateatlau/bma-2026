#!/usr/bin/env node
/* eslint-disable no-console, no-undef */
/**
 * Apply Database Migrations to Supabase
 *
 * This script reads migration files and applies them to your Supabase database.
 * It uses the Supabase service role key to execute SQL directly.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/apply-migrations.js
 *
 * Get your service role key from:
 *   Supabase Dashboard > Project Settings > API > service_role (secret)
 *
 * Note: This is a Node.js script, not TypeScript, so undef warnings are expected.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://dxwwnvlgtymnaawgcofd.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('\n❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable not set\n');
  console.error('Please set it with your service role key from:');
  console.error('Supabase Dashboard > Project Settings > API > service_role\n');
  console.error('Example:');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...\n');
  process.exit(1);
}

// Extract project reference from URL
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runMigrations() {
  console.log('\n🚀 Starting database migrations for BMA 2026...\n');
  console.log(`📍 Project: ${projectRef}`);
  console.log(`🔗 URL: ${SUPABASE_URL}\n`);

  const migrationsDir = path.join(__dirname, '../supabase/migrations');

  // Read all .sql files and sort them
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migration files found\n');
    return;
  }

  console.log(`📁 Found ${files.length} migration file(s):\n`);
  files.forEach((file, idx) => {
    console.log(`   ${idx + 1}. ${file}`);
  });
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📝 Migration ${i + 1}/${files.length}: ${file}`);
    console.log('='.repeat(60));

    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    // Show first few lines of the migration
    const lines = sql
      .split('\n')
      .filter((l) => l.trim() && !l.trim().startsWith('--'))
      .slice(0, 3);
    console.log('📄 Preview:');
    lines.forEach((line) => console.log(`   ${line.substring(0, 70)}...`));
    console.log('');

    try {
      console.log('⏳ Executing...');
      await executeSql(sql);
      console.log('✅ Success!');
      successCount++;
    } catch (error) {
      console.error('❌ Failed:', error.message);
      errorCount++;

      // Continue with other migrations
      console.log('⚠️  Continuing with remaining migrations...');
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ Migration process completed!');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('');

  if (successCount > 0) {
    console.log('📋 Next steps:');
    console.log('   1. Verify tables: Supabase Dashboard > Table Editor');
    console.log('   2. Generate types: npm run supabase:types');
    console.log('   3. Check RLS policies: Supabase Dashboard > Authentication > Policies\n');
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// Run the migrations
runMigrations().catch((error) => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
