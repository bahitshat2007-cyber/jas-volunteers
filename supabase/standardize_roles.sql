-- ============================================================
-- 1. СТАНДАРТИЗАЦИЯ РОЛЕЙ И ОГРАНИЧЕНИЙ
-- ============================================================

-- Удаляем старое ограничение
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Миграция ролей
UPDATE public.profiles SET role = 'coordinator' WHERE role IN ('admin', 'manager');
UPDATE public.profiles SET role = 'sub_coordinator' WHERE role = 'deputy';

-- Новое ограничение
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('volunteer', 'sub_coordinator', 'coordinator', 'developer'));

-- Разрешаем всем видеть профили (нужно для отображения авторов новостей)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- ============================================================
-- 2. ТАБЛИЦА ОБЪЯВЛЕНИЙ (СТЕНА) С ИСПРАВЛЕНИЕМ 403
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;

-- Читать новости могут ВСЕ
DROP POLICY IF EXISTS "Anyone can read team announcements" ON public.team_announcements;
CREATE POLICY "Anyone can read team announcements" ON public.team_announcements FOR SELECT USING (true);

-- Создавать новости могут только Координаторы и Замы (Используем WITH CHECK)
DROP POLICY IF EXISTS "Team leadership can insert announcements" ON public.team_announcements;
CREATE POLICY "Team leadership can insert announcements" ON public.team_announcements 
FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND team_id = team_announcements.team_id 
      AND (role = 'coordinator' OR role = 'sub_coordinator')
    )
);

-- Удалять свои новости могут Координаторы и Замы
DROP POLICY IF EXISTS "Team leadership can delete announcements" ON public.team_announcements;
CREATE POLICY "Team leadership can delete announcements" ON public.team_announcements 
FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND team_id = team_announcements.team_id 
      AND (role = 'coordinator' OR role = 'sub_coordinator')
    )
);
