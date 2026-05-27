-- Acelera el feed semanal (consultas por rango de date).
CREATE INDEX IF NOT EXISTS events_date_time_idx ON public.events (date ASC, time ASC);
