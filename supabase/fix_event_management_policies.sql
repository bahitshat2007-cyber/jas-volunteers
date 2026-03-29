--Jas Volunteers: Политики для редактирования и отмены мероприятий
--Выполни этот код в Supabase SQL Editor.

--1. Разрешаем координаторам и замам ОБНОВЛЯТЬ мероприятия ТОЛЬКО своей команды
DROP POLICY IF EXISTS "Allow coordinators to update team events" ON public.events;
CREATE POLICY "Allow coordinators to update team events" 
ON public.events 
FOR UPDATE TO authenticated 
USING (
  team_id IN (
    SELECT team_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coordinator', 'sub_coordinator')
  )
);

--2. Разрешаем координаторам и замам УДАЛЯТЬ мероприятия ТОЛЬКО своей команды
DROP POLICY IF EXISTS "Allow coordinators to delete team events" ON public.events;
CREATE POLICY "Allow coordinators to delete team events" 
ON public.events 
FOR DELETE TO authenticated 
USING (
  team_id IN (
    SELECT team_id FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('coordinator', 'sub_coordinator')
  )
);
