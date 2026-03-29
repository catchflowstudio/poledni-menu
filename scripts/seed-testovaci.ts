/**
 * Seed: Testovací restaurace
 * Spuštění: npx tsx scripts/seed-testovaci.ts
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
  const slug = "testovaci-restaurace";
  const name = "Testovací restaurace";
  const password = "test1234";
  const phone = "+420 777 000 111";

  console.log(`\n🍽️  Seeduji: ${name} (${slug})\n`);

  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await supabase
    .from("restaurants")
    .upsert(
      {
        slug,
        name,
        password_hash: passwordHash,
        phone,
        static_menu_url: null,
        weekend_fallback_title: "O víkendu nepodáváme polední menu.",
        weekend_fallback_text:
          "Navštivte nás v pracovní dny a vychutnejte si naši denní nabídku.",
        serves_weekend: false,
      },
      { onConflict: "slug" }
    )
    .select()
    .single();

  if (error) {
    console.error("❌ Chyba:", error.message);
    process.exit(1);
  }

  console.log(`✅ Hotovo (id: ${data.id})\n`);
  console.log(`📍 Web:    http://localhost:3000/${slug}`);
  console.log(`📍 Menu:   http://localhost:3000/${slug}/menu`);
  console.log(`📍 Admin:  http://localhost:3000/${slug}/admin`);
  console.log(`📍 Heslo:  ${password}\n`);
}

seed().catch(console.error);
