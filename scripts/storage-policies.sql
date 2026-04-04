-- ═══════════════════════════════════════════════════════════
-- STORAGE POLICIES — CRITICAL FIX
-- Bucket daily-menus: veřejné čtení, zápis POUZE service_role.
-- Spustit v Supabase SQL editoru.
-- ═══════════════════════════════════════════════════════════

-- 1. Smaž všechny existující policies na bucketu
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "public_read_daily_menus" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to daily-menus" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to daily-menus" ON storage.objects;
DROP POLICY IF EXISTS "allow public reads on daily-menus" ON storage.objects;
DROP POLICY IF EXISTS "allow public inserts on daily-menus" ON storage.objects;
DROP POLICY IF EXISTS "allow public updates on daily-menus" ON storage.objects;
DROP POLICY IF EXISTS "allow public deletes on daily-menus" ON storage.objects;

-- Smaž i generické policies pokud existují
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- 2. Veřejné ČTENÍ — kdokoliv může vidět menu obrázky
CREATE POLICY "anon_read_daily_menus"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'daily-menus');

-- 3. ŽÁDNÁ INSERT/UPDATE/DELETE policy pro anon/authenticated
-- Service_role bypasuje RLS automaticky → server může zapisovat.
-- Klient NEMŮŽE nahrávat ani mazat.

-- 4. Ověření
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- Očekávaný výstup:
-- anon_read_daily_menus | PERMISSIVE | {anon,authenticated} | SELECT
--
-- Žádný INSERT, UPDATE ani DELETE.
