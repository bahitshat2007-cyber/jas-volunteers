-- Добавление уникального индекса на название ачивки для корректной работы сидов (ON CONFLICT)
ALTER TABLE public.achievements_catalog ADD CONSTRAINT achievements_catalog_title_key UNIQUE (title);
