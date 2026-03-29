-- Migration v2: přidat serves_weekend do tabulky restaurants
-- Spusť v Supabase SQL editoru

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS serves_weekend BOOLEAN DEFAULT false NOT NULL;
