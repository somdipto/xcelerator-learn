// Supabase client configuration for production deployment
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for production, fallback to hardcoded values for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://tjgyskkfhmcabtscsbvh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZ3lza2tmaG1jYWJ0c2NzYnZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzMxNTIsImV4cCI6MjA2NDgwOTE1Mn0.aw-Rmpl0VMw2_iU8baNKMW1HmQfIdMbY3H7xzJF8mZU";

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);