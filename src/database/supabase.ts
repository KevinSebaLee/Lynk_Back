import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are not defined!');
  throw new Error('Supabase configuration is missing');
}

console.log('Initializing Supabase client with URL:', supabaseUrl.substring(0, 30) + '...');

// Create the Supabase client with explicit options
export const supabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});