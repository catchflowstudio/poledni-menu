/**
 * Seed script pro vytvoření testovací restaurace.
 *
 * Použití:
 *   npx tsx scripts/seed.ts
 *
 * Vyžaduje .env soubor s proměnnými:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Chybí env proměnné. Zkopíruj .env.example do .env a vyplň.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  // ============================================
  // Uprav si tyto hodnoty:
  // ============================================
  const slug = "bistro-na-poli";
  const name = "Bistro na poli";
  const password = "heslo123"; // <-- Změň na silnější heslo!
  const phone = "+420 777 123 456";
  const staticMenuUrl = null; // URL na stálé menu (PDF apod.)
  // ============================================

  console.log(`\n🍽️  Polední menu – Seed script\n`);
  console.log(`Restaurace: ${name}`);
  console.log(`Slug:       ${slug}`);
  console.log(`Heslo:      ${password}\n`);

  // Hash hesla
  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert restaurace
  const { data, error } = await supabase
    .from("restaurants")
    .upsert(
      {
        slug,
        name,
        password_hash: passwordHash,
        phone,
        static_menu_url: staticMenuUrl,
        weekend_fallback_title: "O víkendu vaříme ze stálého menu.",
        weekend_fallback_text:
          "Denní polední nabídku pro vás připravujeme opět od pondělí.",
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) {
    console.error("❌ Chyba:", error.message);
    process.exit(1);
  }

  console.log(`✅ Restaurace vytvořena (id: ${data.id})\n`);
  console.log(`📍 Veřejné URL:   http://localhost:3000/${slug}`);
  console.log(`📍 Menu stránka:  http://localhost:3000/${slug}/menu`);
  console.log(`📍 Admin:         http://localhost:3000/${slug}/admin`);
  console.log(`📍 Heslo:         ${password}\n`);
}

seed().catch(console.error);
