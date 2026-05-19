import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

let browserClient: SupabaseClient | null = null;

export const getSupabase = () => {
  browserClient ??= createClient();
  return browserClient;
};
