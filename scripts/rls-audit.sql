-- ═══════════════════════════════════════════════════════════
-- RLS AUDIT & HARDENING
-- Spustit v Supabase SQL editoru.
-- Zajistí, že anon klient (veřejný) nikdy nezapisuje napřímo.
-- ═══════════════════════════════════════════════════════════

-- 1. Ověř, že RLS je zapnuté na obou tabulkách
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- 2. Smaž případné staré příliš volné policies
DROP POLICY IF EXISTS "Allow public read restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow public read menus" ON menus;
DROP POLICY IF EXISTS "Allow all" ON restaurants;
DROP POLICY IF EXISTS "Allow all" ON menus;
DROP POLICY IF EXISTS "public_read_restaurants" ON restaurants;
DROP POLICY IF EXISTS "public_read_menus" ON menus;

-- 3. Restaurace — veřejné čtení BEZ password_hash
-- (Supabase RLS nemůže filtrovat sloupce — to řeší SELECT v kódu.
--  Ale můžeme omezit čtení jen na potřebné sloupce přes view.)
CREATE POLICY "anon_read_restaurants"
  ON restaurants
  FOR SELECT
  TO anon
  USING (true);

-- 4. Restaurace — zápis POUZE pro service_role (nikdy klient)
-- (Žádná INSERT/UPDATE/DELETE policy pro anon = anon nemůže zapisovat)

-- 5. Menu — veřejné čtení
CREATE POLICY "anon_read_menus"
  ON menus
  FOR SELECT
  TO anon
  USING (true);

-- 6. Menu — zápis POUZE pro service_role
-- (Žádná INSERT/UPDATE/DELETE policy pro anon = anon nemůže zapisovat)

-- 7. Ověření — spusť a zkontroluj výstup:
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('restaurants', 'menus')
ORDER BY tablename, policyname;

-- Očekávaný výstup:
-- restaurants | anon_read_restaurants | PERMISSIVE | {anon} | SELECT
-- menus       | anon_read_menus       | PERMISSIVE | {anon} | SELECT
--
-- Žádný INSERT, UPDATE ani DELETE pro anon.
-- Service_role bypasuje RLS automaticky.
