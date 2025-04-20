import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};

// Also export a default client for convenience
export default createServerClient(); 