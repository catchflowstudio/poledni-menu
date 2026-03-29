import { createClient } from "@supabase/supabase-js";

/** Supabase klient s anon key — pro veřejné čtení */
export function getSupabasePublic() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
