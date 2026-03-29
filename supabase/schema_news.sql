-- migration: 20260328_add_news_table.sql

-- 1. Ensure role constraint is up to date
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('volunteer', 'sub_coordinator', 'coordinator', 'manager', 'admin', 'developer'));

-- 2. Create news table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('team', 'org', 'epic')),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- NULL means Org-wide
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access to news" ON public.news;
CREATE POLICY "Public read access to news" ON public.news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Coordinators can post news" ON public.news;
CREATE POLICY "Coordinators can post news" ON public.news 
FOR INSERT TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('coordinator', 'sub_coordinator', 'manager', 'admin', 'developer')
    )
);

DROP POLICY IF EXISTS "Authors can update their news" ON public.news;
CREATE POLICY "Authors can update their news" ON public.news 
FOR UPDATE TO authenticated 
USING (
    author_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
)
WITH CHECK (
    author_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
);

DROP POLICY IF EXISTS "Authors can delete their news" ON public.news;
CREATE POLICY "Authors can delete their news" ON public.news 
FOR DELETE TO authenticated 
USING (
    author_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
);

-- 4. Grants (Essential for PostgREST / Supabase API)
GRANT ALL ON public.news TO authenticated;
GRANT ALL ON public.news TO anon;
GRANT ALL ON public.news TO service_role;
