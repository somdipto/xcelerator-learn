
// Supabase client configuration for production deployment
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with proper fallbacks for build process
const getSupabaseUrl = () => {
  // In production/build, use environment variables
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SUPABASE_URL || '';
  }
  // In browser, use environment variables or show error in console
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.warn('VITE_SUPABASE_URL not found. Please set up your environment variables.');
    return '';
  }
  return url;
};

const getSupabaseAnonKey = () => {
  // In production/build, use environment variables
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  }
  // In browser, use environment variables or show error in console
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!key) {
    console.warn('VITE_SUPABASE_ANON_KEY not found. Please set up your environment variables.');
    return '';
  }
  return key;
};

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_PUBLISHABLE_KEY = getSupabaseAnonKey();

// Create client with graceful fallback
export const supabase = SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY 
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

// Runtime validation helper
export const isSupabaseConfigured = () => {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
};
