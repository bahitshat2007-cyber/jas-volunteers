-- 10. Таблица логов начисленных часов (volunteer_hours_log)
CREATE TABLE IF NOT EXISTS public.volunteer_hours_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    hours NUMERIC(5,1) NOT NULL CHECK (hours > 0),
    reason TEXT NOT NULL,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Политики
ALTER TABLE public.volunteer_hours_log ENABLE ROW LEVEL SECURITY;

-- Читать логи могут все
DROP POLICY IF EXISTS "Allow public read access to volunteer_hours_log" ON public.volunteer_hours_log;
CREATE POLICY "Allow public read access to volunteer_hours_log" ON public.volunteer_hours_log FOR SELECT USING (true);

-- Добавлять логи могут только координаторы/заместители своей команды
-- Для упрощения на этапе разработки разрешаем всем авторизованным. 
-- Позже нужно добавить `CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('coordinator', 'sub_coordinator') AND team_id = volunteer_hours_log.team_id))`
DROP POLICY IF EXISTS "Allow coordinators to insert hours" ON public.volunteer_hours_log;
CREATE POLICY "Allow coordinators to insert hours" ON public.volunteer_hours_log FOR INSERT TO authenticated WITH CHECK (true);
