-- Jas Volunteers: Обновление схемы для Создания Мероприятий
-- Выполни этот код в Supabase SQL Editor.

-- 1. Добавляем новые колонки в таблицу events, если их еще нет
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📋';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS hours_multiplier INTEGER DEFAULT 1;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS whatsapp_link TEXT;

-- 2. Добавляем колонку для логотипа в таблицу teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. Настраиваем RLS для создания мероприятий (events)
-- Разрешаем создание только координаторам и замам
DROP POLICY IF EXISTS "Allow coordinators to insert events" ON public.events;
CREATE POLICY "Allow coordinators to insert events" 
ON public.events 
FOR INSERT TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role IN ('coordinator', 'sub_coordinator')
  )
);

-- Разрешаем координаторам обновлять свои мероприятия
DROP POLICY IF EXISTS "Allow coordinators to update events" ON public.events;
CREATE POLICY "Allow coordinators to update events" 
ON public.events 
FOR UPDATE TO authenticated 
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles 
    WHERE role IN ('coordinator', 'sub_coordinator')
  )
);
