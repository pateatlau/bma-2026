import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Check if we're in a browser environment (not SSR)
const isBrowser = typeof window !== 'undefined';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Use AsyncStorage for React Native, use default (localStorage) for web
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Only detect session from URL on web in browser environment
    // This prevents SSR crashes when processing confirmation links
    detectSessionInUrl: Platform.OS === 'web' && isBrowser,
    // Use PKCE flow for web (better security), implicit for mobile
    // PKCE requires the same browser session, which doesn't work for mobile deep links
    flowType: Platform.OS === 'web' ? 'pkce' : 'implicit',
  },
});
