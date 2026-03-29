-- Jas Volunteers: Основная схема базы данных (PostgreSQL)
-- Вставь весь этот код в SQL Editor в Supabase и нажми Run.
-- ЭТО НУЖНО СДЕЛАТЬ ПЕРЕД ТЕМ КАК ЗАПУСКАТЬ SEED_TEAMS.SQL!

-- 1. Создаем enum для ролей и статусов, если нужно (или используем текст)
-- Для простоты используем текстовые типы с проверками (CHECK)

-- 2. Таблица Команд (teams)
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    instagram TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    total_hours INTEGER DEFAULT 0,
    total_volunteers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Таблица Профилей (profiles)
-- Привязывается к auth.users (встроенной таблице Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    first_name_en TEXT, -- для английского портфолио
    last_name_en TEXT, -- для английского портфолио
    role TEXT DEFAULT 'volunteer' CHECK (role IN ('volunteer', 'manager', 'admin', 'developer')),
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    hours INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Новичок',
    impact_score JSONB DEFAULT '{"ecology": 0, "animals": 0, "education": 0, "charity": 0}'::jsonb, -- уровень влияния
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Заявки на создание команд (team_requests)
CREATE TABLE IF NOT EXISTS public.team_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_name TEXT NOT NULL,
    description TEXT,
    instagram TEXT,
    requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Мероприятия (events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    event_date DATE NOT NULL,
    event_time TEXT,
    max_participants INTEGER DEFAULT 30,
    tags TEXT[], -- массив тегов ['Экология', 'Животные']
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Участники мероприятий (event_participants)
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'absent')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- 7. Достижения (achievements_catalog)
-- Каталог всех возможных достижений (3 типа)
CREATE TABLE IF NOT EXISTS public.achievements_catalog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT CHECK (type IN ('classic', 'specific', 'event_based')), -- классические, особые, событийные
    icon TEXT, -- эмодзи или ссылка на иконку
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Полученные достижения пользователей (user_achievements)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements_catalog(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- кто выдал (для особых)
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 9. Отзывы / Благодарности (testimonials)
-- Рекомендации от лидеров команд/координаторов для портфолио
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- кому оставили отзыв
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- кто оставил
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Отключаем строгие политики RLS для начальной разработки, чтобы всё работало сразу.
-- (Позже включим их для безопасности как описано в security.md)

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Создаем базовые политики (разрешить всем чтение, вставку/обновление авторизованным)
DROP POLICY IF EXISTS "Allow public read access to teams" ON public.teams;
CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to testimonials" ON public.testimonials;
CREATE POLICY "Allow public read access to testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to achievements" ON public.achievements_catalog;
CREATE POLICY "Allow public read access to achievements" ON public.achievements_catalog FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to user_achievements" ON public.user_achievements;
CREATE POLICY "Allow public read access to user_achievements" ON public.user_achievements FOR SELECT USING (true);

-- (Разрешим авторизованным пользователям вставлять данные - НАСТРОЙКА ТОЛЬКО ДЛЯ РАЗРАБОТКИ)
DROP POLICY IF EXISTS "Allow all authenticated inserts" ON public.team_requests;
CREATE POLICY "Allow all authenticated inserts" ON public.team_requests FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all authenticated updates to profiles" ON public.profiles;
CREATE POLICY "Allow all authenticated updates to profiles" ON public.profiles FOR UPDATE TO authenticated USING (true);
-- И так далее. В продакшене политики будут строже!

-- Функция-триггер для автоматического создания профиля при регистрации через Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, first_name_en, last_name_en, role, team_id)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'first_name_en',
    new.raw_user_meta_data->>'last_name_en',
    COALESCE(new.raw_user_meta_data->>'role', 'volunteer'),
    (new.raw_user_meta_data->>'team_id')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер, который срабатывает при регистрации (auth.users)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
