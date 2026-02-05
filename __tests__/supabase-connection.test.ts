/**
 * Supabase Configuration Tests
 *
 * These tests verify that the Supabase setup is correct.
 * Integration tests that query the database are in separate files.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Supabase Setup', () => {
  it('should have database types file generated', () => {
    const typesPath = path.join(__dirname, '../lib/database.types.ts');
    const exists = fs.existsSync(typesPath);
    expect(exists).toBe(true);

    if (exists) {
      const content = fs.readFileSync(typesPath, 'utf-8');
      expect(content).toContain('export type Database');
      expect(content).toContain('profiles');
      expect(content).toContain('app_role');
    }
  });

  it('should be able to import supabase client without errors', () => {
    expect(() => {
      require('../lib/supabase');
    }).not.toThrow();
  });

  it('should have correct table types in Database schema', () => {
    const typesPath = path.join(__dirname, '../lib/database.types.ts');
    const content = fs.readFileSync(typesPath, 'utf-8');

    // Check for all required tables
    const requiredTables = [
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
      'audit_logs',
      'notification_logs',
    ];

    requiredTables.forEach((table) => {
      expect(content).toContain(table);
    });
  });
});
