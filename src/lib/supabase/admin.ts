import { createClient } from "@supabase/supabase-js";

/** Supabase klient se service role key — pro admin operace */
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
