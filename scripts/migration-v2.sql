-- Migration v2: Restaurant settings + menu date ranges
-- Spustit v Supabase SQL editoru: https://supabase.com/dashboard/project/jvncrodxthqqzbeywfzr/sql

-- 1. Nové sloupce v restaurants pro konfigurovatelné fallbacky
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS fallback_type TEXT DEFAULT 'text' NOT NULL,
  ADD COLUMN IF NOT EXISTS fallback_title TEXT DEFAULT 'Dnešní menu právě připravujeme' NOT NULL,
  ADD COLUMN IF NOT EXISTS fallback_text TEXT DEFAULT 'Zkuste to prosím později nebo nám zavolejte.' NOT NULL,
  ADD COLUMN IF NOT EXISTS opening_days INTEGER[] DEFAULT '{1,2,3,4,5}' NOT NULL,
  ADD COLUMN IF NOT EXISTS menu_active_from TEXT DEFAULT '00:00' NOT NULL;

-- 2. Date range na menus (volitelné "platí do")
ALTER TABLE menus
  ADD COLUMN IF NOT EXISTS valid_to_date DATE;

-- 3. Index pro date range dotazy
CREATE INDEX IF NOT EXISTS idx_menus_date_range
  ON menus (restaurant_id, valid_for_date, valid_to_date);

-- 4. Aktualizuj constraint CHECK na fallback_type
ALTER TABLE restaurants
  ADD CONSTRAINT chk_fallback_type
  CHECK (fallback_type IN ('text', 'static_menu', 'phone'));

-- Hotovo!
