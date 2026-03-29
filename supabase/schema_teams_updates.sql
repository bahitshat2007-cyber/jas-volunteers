-- Добавляем колонки для кастомизации команд (Clash of Clans style)
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS color_primary TEXT DEFAULT '#1B4332'; -- базовый зеленый Jas
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS slogan TEXT;
