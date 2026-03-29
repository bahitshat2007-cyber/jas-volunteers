-- Jas Volunteers: ИСПРАВЛЕНИЕ ОШИБКИ ПРАВ (Permission Denied)
-- Выполни этот код в Supabase SQL Editor.

-- 1. Даем базовые права на схему (если вдруг сбились)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 2. Даем полные права на таблицу логов ролям Supabase
GRANT ALL ON public.volunteer_hours_log TO authenticated;
GRANT ALL ON public.volunteer_hours_log TO service_role;
GRANT ALL ON public.volunteer_hours_log TO postgres;

-- 3. Даем права на последовательности (для ID если они не случайные UUID)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Проверяем и фиксим RLS на volunteer_hours_log
ALTER TABLE public.volunteer_hours_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to volunteer_hours_log" ON public.volunteer_hours_log;
CREATE POLICY "Allow public read access to volunteer_hours_log" 
ON public.volunteer_hours_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert hours" ON public.volunteer_hours_log;
CREATE POLICY "Allow authenticated insert hours" 
ON public.volunteer_hours_log FOR INSERT TO authenticated WITH CHECK (true);

-- 5. Также убедимся, что можно обновлять профили (для счетчика часов)
GRANT ALL ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Allow all authenticated updates to profiles" ON public.profiles;
CREATE POLICY "Allow all authenticated updates to profiles" 
ON public.profiles FOR UPDATE TO authenticated USING (true);

-- 6. Если ошибка остается, попробуй выполнить: 
-- ALTER TABLE public.volunteer_hours_log FORCE ROW LEVEL SECURITY; -- (иногда помогает)
