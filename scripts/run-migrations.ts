#!/usr/bin/env tsx
/**
 * Run Supabase Migrations Script
 *
 * This script applies database migrations to the Supabase project.
 * It reads migration files and executes them using the Supabase client.
 *
 * Usage: npx tsx scripts/run-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   - EXPO_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('💡 Get your service role key from:');
  console.error('   Supabase Dashboard > Project Settings > API > service_role (secret)');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');

  const migrationsDir = path.join(__dirname, '../supabase/migrations');

  // Read all migration files
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No migration files found in supabase/migrations/');
    return;
  }

  console.log(`📁 Found ${files.length} migration file(s):\n`);
  files.forEach((file) => console.log(`   - ${file}`));
  console.log('');

  // Run each migration
  for (const file of files) {
    console.log(`📝 Running migration: ${file}`);
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    try {
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Try direct query if RPC method doesn't exist
        console.log('   Attempting direct execution...');
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ sql_query: sql }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
      }

      console.log(`   ✅ Success\n`);
    } catch (err) {
      console.error(`   ❌ Failed: ${err}`);
      console.error(`   Continuing with next migration...\n`);
    }
  }

  console.log('✨ Migration process completed!\n');
  console.log('📋 Next steps:');
  console.log('   1. Verify tables created: Supabase Dashboard > Table Editor');
  console.log('   2. Generate TypeScript types: npm run supabase:types');
  console.log('   3. Test database connection in your app');
}

runMigrations().catch(console.error);
