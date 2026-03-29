-- Jas Volunteers: Миграция схемы (исправление расхождений фронтенд ↔ БД)
-- Вставьте этот код в Supabase SQL Editor и нажмите Run.
-- Выполнять ПОСЛЕ schema.sql и seed_teams.sql

-- ============================================================
-- 1. PROFILES: добавляем total_hours и total_events
-- (фронтенд читает эти поля, а в schema.sql есть только hours)
-- ============================================================

-- Переименовываем hours → total_hours (если hours существует)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'hours'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN hours TO total_hours;
  END IF;
END $$;

-- Добавляем total_hours если не существует (на случай если hours уже был переименован или отсутствует)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0;

-- Добавляем total_events
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_events INTEGER DEFAULT 0;


-- ============================================================
-- 2. EVENTS: добавляем start_time, end_time, emoji
-- (фронтенд использует эти поля для карточек мероприятий)
-- ============================================================. 

ALTER TABLE public.events ADD COLUMN IF NOT EXISTS start_time TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_time TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '📋';


-- ============================================================
-- 3. RLS: политики для INSERT (без них запись на мероприятия не работает)
-- ============================================================

-- Разрешаем авторизованным пользователям записываться на мероприятия
DROP POLICY IF EXISTS "Allow authenticated insert to event_participants" ON public.event_participants;
CREATE POLICY "Allow authenticated insert to event_participants" 
  ON public.event_participants 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Разрешаем авторизованным читать event_participants
DROP POLICY IF EXISTS "Allow public read access to event_participants" ON public.event_participants;
CREATE POLICY "Allow public read access to event_participants" 
  ON public.event_participants 
  FOR SELECT USING (true);

-- Разрешаем триггеру создавать профили (INSERT для profiles)
DROP POLICY IF EXISTS "Allow insert for new profiles" ON public.profiles;
CREATE POLICY "Allow insert for new profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

-- Разрешаем авторизованным вставлять в team_requests (уже есть, но на всякий случай)
DROP POLICY IF EXISTS "Allow public read access to team_requests" ON public.team_requests;
CREATE POLICY "Allow public read access to team_requests" 
  ON public.team_requests 
  FOR SELECT USING (true);


-- ============================================================
-- 4. Обновляем триггер handle_new_user (чтобы писал в total_hours)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, first_name_en, last_name_en, role, team_id, total_hours, total_events)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'first_name_en',
    new.raw_user_meta_data->>'last_name_en',
    COALESCE(new.raw_user_meta_data->>'role', 'volunteer'),
    (new.raw_user_meta_data->>'team_id')::uuid,
    0,
    0
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
