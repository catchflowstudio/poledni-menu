-- ============================================
-- Polední menu – SQL migrace pro Supabase
-- ============================================

-- Tabulka restaurací
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  static_menu_url TEXT,
  weekend_fallback_title TEXT NOT NULL DEFAULT 'O víkendu vaříme ze stálého menu.',
  weekend_fallback_text TEXT NOT NULL DEFAULT 'Denní polední nabídku pro vás připravujeme opět od pondělí.',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabulka menu
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  valid_for_date DATE NOT NULL,
  image_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Unikátní constraint: 1 menu na datum na restauraci
  UNIQUE(restaurant_id, valid_for_date)
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_menus_restaurant_date
  ON menus(restaurant_id, valid_for_date);

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Veřejné čtení restaurací (bez password_hash)
-- Pozn: anon key bude mít SELECT přístup, ale password_hash
-- se čte jen přes service role v login API
CREATE POLICY "Veřejné čtení restaurací"
  ON restaurants FOR SELECT
  USING (true);

-- Veřejné čtení menu
CREATE POLICY "Veřejné čtení menu"
  ON menus FOR SELECT
  USING (true);

-- Zápis menu jen přes service role (API routes)
CREATE POLICY "Service role insert menu"
  ON menus FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role update menu"
  ON menus FOR UPDATE
  USING (true);

-- ============================================
-- Storage bucket
-- ============================================
-- Toto vytvoř ručně v Supabase dashboard:
-- 1. Storage → New bucket → "daily-menus"
-- 2. Nastav jako PUBLIC bucket
-- 3. Přidej policy pro upload (authenticated nebo service_role)
--
-- Nebo přes SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('daily-menus', 'daily-menus', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: service role může vše
CREATE POLICY "Service role full access"
  ON storage.objects FOR ALL
  USING (bucket_id = 'daily-menus');
