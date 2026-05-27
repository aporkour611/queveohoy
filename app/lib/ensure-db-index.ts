/** Índice date+time para consultas del feed semanal. Requiere SUPABASE_DB_URL. */
export async function ensureEventsDateIndex(): Promise<{
  ok: boolean;
  skipped?: boolean;
  error?: string;
}> {
  const url =
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim();

  if (!url) {
    return { ok: false, skipped: true, error: "SUPABASE_DB_URL missing" };
  }

  try {
    const pg = await import("pg");
    const client = new pg.default.Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    await client.query(
      "CREATE INDEX IF NOT EXISTS events_date_time_idx ON public.events (date ASC, time ASC)"
    );
    await client.end();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
