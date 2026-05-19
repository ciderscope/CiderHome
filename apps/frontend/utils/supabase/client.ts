import { createBrowserClient } from "@supabase/ssr";

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Configuration Supabase manquante. Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans les variables d'environnement Vercel du frontend."
    );
  }

  return { supabaseUrl, supabaseKey };
};

export const createClient = () => {
  const { supabaseUrl, supabaseKey } = getSupabaseConfig();
  return createBrowserClient(supabaseUrl, supabaseKey);
};
