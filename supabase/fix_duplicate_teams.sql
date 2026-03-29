-- 1. Удаляем дубликаты, используя системные идентификаторы ctid (самый надежный способ в Postgres)
DELETE FROM public.teams 
WHERE ctid NOT IN (
    SELECT MIN(ctid) 
    FROM public.teams 
    GROUP BY name
);

-- 2. Теперь, когда дубликатов НЕТ, добавляем ограничение на уникальность ИМЕНИ.
-- Если эта команда выдаст ошибку, значит дубликаты всё еще есть (например, в именах разные пробелы).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_team_name') THEN
        ALTER TABLE public.teams ADD CONSTRAINT unique_team_name UNIQUE (name);
    END IF;
END $$;
