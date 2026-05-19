import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant pour l API');
}

export const supabaseAdmin = createClient(supabaseUrl ?? 'http://localhost:54321', serviceRoleKey ?? 'missing', {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

