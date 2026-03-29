-- SQL Patch: Add DELETE policy for event_participants
-- Users should be able to delete their own participation record.

DROP POLICY IF EXISTS "Allow user to leave event" ON public.event_participants;
CREATE POLICY "Allow user to leave event" ON public.event_participants 
FOR DELETE TO authenticated USING (auth.uid() = user_id);
