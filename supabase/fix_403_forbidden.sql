-- 1. ГАРАНТИРУЕМ ЧТО ТАБЛИЦА ЕСТЬ
CREATE TABLE IF NOT EXISTS public.team_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. ДАЕМ ПРАВА ДОСТУПА НА УРОВНЕ СИСТЕМЫ (GRANT)
GRANT ALL ON public.team_announcements TO authenticated;
GRANT ALL ON public.team_announcements TO anon;
GRANT ALL ON public.team_announcements TO service_role;

GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;

-- 3. ВКЛЮЧАЕМ RLS И СТАВИМ МАКСИМАЛЬНО ПРОСТЫЕ ПРАВИЛА (ДЛЯ ТЕСТА)
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ПОЛИТИКИ ДЛЯ НОВОСТЕЙ
DROP POLICY IF EXISTS "Public read news" ON public.team_announcements;
CREATE POLICY "Public read news" ON public.team_announcements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated post news" ON public.team_announcements;
CREATE POLICY "Authenticated post news" ON public.team_announcements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authors can delete news" ON public.team_announcements;
CREATE POLICY "Authors can delete news" ON public.team_announcements FOR DELETE USING (auth.uid() = author_id);

-- ПОЛИТИКИ ДЛЯ ПРОФИЛЕЙ (ВАЖНО ДЛЯ JOIN)
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);

-- 4. ПРОВЕРКА РОЛЕЙ (СНОВА НА ВСЯКИЙ СЛУЧАЙ)
UPDATE public.profiles SET role = 'coordinator' WHERE role IN ('admin', 'manager');
UPDATE public.profiles SET role = 'sub_coordinator' WHERE role = 'deputy';
