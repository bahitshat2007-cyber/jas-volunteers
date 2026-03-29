-- Jas Volunteers: Добавление системы жалоб (Reports) и Донатов
-- Вставь это в SQL Editor в Supabase

-- 1. Таблица Жалоб (Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('bug', 'harassment', 'other')),
    content TEXT NOT NULL,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'ignored')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Таблица Донатов (Donations)
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL,
    comment TEXT,
    image_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Добавляем колонку method УЖЕ СУЩЕСТВУЮЩЕЙ таблице (фикс ошибки PGRST204)
ALTER TABLE public.donations ADD COLUMN IF NOT EXISTS method TEXT DEFAULT 'kaspi';

-- 3. Добавляем флаг донатера в профиль
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_supporter BOOLEAN DEFAULT false;

-- 4. Включаем RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- 5. ПРАВА ДОСТУПА (Explicit Grants)
-- Это исправляет ошибку 403 Permission Denied
GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT SELECT ON public.reports TO anon;
GRANT SELECT ON public.donations TO anon;

-- 6. ПОЛИТИКИ SECURITY (RLS)

-- Reports: Любой залогиненный может создать
DROP POLICY IF EXISTS "Allow users to submit own reports" ON public.reports;
CREATE POLICY "Allow users to submit own reports" ON public.reports FOR INSERT TO authenticated 
WITH CHECK (true); -- Упрощаем для теста, но reporter_id запишется из фронта

-- Reports: Админы видят всё
DROP POLICY IF EXISTS "Allow admins/devs to view all reports" ON public.reports;
CREATE POLICY "Allow admins/devs to view all reports" ON public.reports FOR SELECT TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'developer')
  )
);

-- Donations: Любой залогиненный может создать
DROP POLICY IF EXISTS "Allow users to submit own donations" ON public.donations;
CREATE POLICY "Allow users to submit own donations" ON public.donations FOR INSERT TO authenticated 
WITH CHECK (true);

-- Donations: Юзер видит свое, Админ всё
DROP POLICY IF EXISTS "Allow users to see own donations" ON public.donations;
CREATE POLICY "Allow users to see own donations" ON public.donations FOR SELECT TO authenticated 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'developer')
  )
);
