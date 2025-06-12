
// Supabase client configuration with enhanced security
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with secure fallbacks
const getSupabaseUrl = () => {
  const url = 'https://tjgyskkfhmcabtscsbvh.supabase.co';
  if (!url) {
    console.warn('SUPABASE_URL not configured');
    return '';
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ3lza2tmaG1jYWJ0c2NzYnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNTIsImV4cCI6MjA2NDgwOTE1Mn0.aw-Rmpl0VMw2_iU8baNKMW1HmQfIdMbY3H7xzJF8mZU';
  if (!key) {
    console.warn('SUPABASE_ANON_KEY not configured');
    return '';
  }
  return key;
};

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = getSupabaseAnonKey();

// Create client with enhanced security configuration
export const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce' // Use PKCE for enhanced security
      },
      global: {
        headers: {
          'X-Client-Info': 'secure-app'
        }
      }
    })
  : null;

// Runtime validation helper
export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
};

// Security helper to validate database responses
export const validateDatabaseResponse = (data: any, expectedFields: string[] = []) => {
  if (!data) return false;
  
  // Check if all expected fields are present
  for (const field of expectedFields) {
    if (!(field in data)) {
      console.warn(`Expected field '${field}' missing from database response`);
      return false;
    }
  }
  
  return true;
};
