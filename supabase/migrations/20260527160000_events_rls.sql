-- Lectura pública; escrituras solo vía service role (cron / API admin).
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events_public_read" ON public.events;

CREATE POLICY "events_public_read"
  ON public.events
  FOR SELECT
  TO anon, authenticated
  USING (true);
