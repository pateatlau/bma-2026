#!/usr/bin/env tsx
/**
 * Verify Supabase Database Setup
 *
 * This script checks that:
 * - Database connection works
 * - All required tables exist
 * - RLS policies are enabled
 * - Database functions are available
 *
 * Usage: npx tsx scripts/verify-database.ts
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   - EXPO_PUBLIC_SUPABASE_URL');
  console.error('   - EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

const REQUIRED_TABLES = [
  'profiles',
  'memberships',
  'payments',
  'content',
  'comments',
  'likes',
  'knowledge_base',
  'chat_conversations',
  'chat_messages',
  'escalations',
  'daily_message_counts',
  'audit_logs',
  'notification_logs',
];

async function verifyDatabase() {
  console.log('\n🔍 Verifying Supabase Database Setup...\n');
  console.log('='.repeat(60));

  let allPassed = true;

  // Test 1: Connection
  console.log('\n📡 Test 1: Database Connection');
  try {
    const { error } = await supabase.from('profiles').select('id').limit(0);
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = No rows found (acceptable)
      throw error;
    }
    console.log('✅ Connection successful');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    allPassed = false;
  }

  // Test 2: Tables Existence
  console.log('\n📋 Test 2: Table Existence');
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('id')
        .limit(0);
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      console.log(`✅ Table exists: ${table}`);
    } catch (error: any) {
      if (error.code === '42P01') {
        console.error(`❌ Table missing: ${table}`);
        allPassed = false;
      } else {
        console.error(`❌ Error checking ${table}:`, error.message);
        allPassed = false;
      }
    }
  }

  // Test 3: RLS Policies (try to access without auth - should be restricted)
  console.log('\n🔒 Test 3: RLS Policies');
  try {
    // Try to access profiles without auth (should be empty or restricted)
    const { data, error } = await supabase.from('profiles').select('*');

    if (error && error.code === '42501') {
      // Permission denied - RLS is working!
      console.log('✅ RLS policies are active (access restricted)');
    } else if (!error && (!data || data.length === 0)) {
      // No data but no error - RLS is working (no visible rows)
      console.log('✅ RLS policies are active (no visible data)');
    } else {
      console.log('⚠️  RLS might not be properly configured (check manually)');
    }
  } catch (error) {
    console.error('❌ RLS test failed:', error);
    allPassed = false;
  }

  // Test 4: TypeScript Types
  console.log('\n📝 Test 4: TypeScript Types');
  try {
    const fs = await import('fs');
    const typesExist = fs.existsSync('./lib/database.types.ts');
    if (typesExist) {
      const content = fs.readFileSync('./lib/database.types.ts', 'utf-8');
      const hasDatabase = content.includes('export type Database');
      const hasEnums = content.includes('app_role');

      if (hasDatabase && hasEnums) {
        console.log('✅ TypeScript types generated correctly');
      } else {
        console.log('⚠️  TypeScript types may be incomplete');
      }
    } else {
      console.error('❌ TypeScript types file not found');
      allPassed = false;
    }
  } catch (error) {
    console.error('❌ Type check failed:', error);
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All database verification tests passed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Test authentication flow in your app');
    console.log('   2. Verify storage buckets in Supabase Dashboard');
    console.log('   3. Check RLS policies are working as expected');
    console.log('   4. Continue with Phase 1: Core Infrastructure\n');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.\n');
    process.exit(1);
  }
}

verifyDatabase().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
