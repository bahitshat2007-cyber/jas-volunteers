-- ============================================================
-- 5. TEAM ANNOUNCEMENTS: Стена объявлений для команд
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;

-- Политика: читать могут все (публичный доступ или авторизованные)
DROP POLICY IF EXISTS "Anyone can read team announcements" ON public.team_announcements;
CREATE POLICY "Anyone can read team announcements" 
  ON public.team_announcements FOR SELECT USING (true);

-- Политика: Координаторы и Замы могут управлять записями своего клана
DROP POLICY IF EXISTS "Team leadership can manage announcements" ON public.team_announcements;
CREATE POLICY "Team leadership can manage announcements" 
  ON public.team_announcements FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND team_id = team_announcements.team_id 
      AND (role ILIKE 'coordinator' OR role ILIKE 'sub-coordinator' OR role ILIKE 'координатор' OR role ILIKE 'замкоординатор')
    )
  );
