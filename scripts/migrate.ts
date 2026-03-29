/**
 * One-time migration script — přidá serves_weekend do tabulky restaurants
 * Spuštění: npx tsx scripts/migrate.ts
 */
import { Client } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const dbPassword = process.env.DB_PASSWORD || serviceRoleKey;

// Zkus různé hosts v pořadí
const hosts = [
  { host: `aws-0-eu-central-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
  { host: `aws-0-eu-west-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
  { host: `aws-0-us-east-1.pooler.supabase.com`, port: 6543, user: `postgres.${projectRef}` },
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: "postgres" },
];

async function tryConnect(host: string, port: number, user: string) {
  const client = new Client({ host, port, database: "postgres", user, password: dbPassword, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  await client.connect();
  return client;
}

async function migrate() {
  let client: Client | null = null;
  for (const { host, port, user } of hosts) {
    try {
      console.log(`Zkouším ${host}:${port} jako ${user}...`);
      client = await tryConnect(host, port, user);
      console.log(`✓ Připojeno k ${host}`);
      break;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ✗ ${msg.substring(0, 80)}`);
    }
  }
  if (!client) {
    console.error("✗ Nepodařilo se připojit k žádnému hostu.");
    console.error("  → Spusť SQL ručně v Supabase dashboardu:");
    console.error("  ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS serves_weekend BOOLEAN DEFAULT false NOT NULL;");
    process.exit(1);
  }

  try {
    await client.connect();
    console.log("✓ Připojeno");

    await client.query(`
      ALTER TABLE restaurants
      ADD COLUMN IF NOT EXISTS serves_weekend BOOLEAN DEFAULT false NOT NULL;
    `);
    console.log("✓ Migrace proběhla úspěšně — sloupec serves_weekend přidán");
  } catch (err) {
    console.error("✗ Chyba:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
