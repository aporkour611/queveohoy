/**
 * Crea el índice events_date_time_idx si SUPABASE_DB_URL está definida.
 * URI: Supabase → Project Settings → Database → Connection string (URI).
 */
const url =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    "Falta SUPABASE_DB_URL o DATABASE_URL.\n" +
      "Copia la URI en Supabase → Settings → Database → Connection string."
  );
  process.exit(1);
}

const { readFileSync } = await import("node:fs");
const pg = (await import("pg")).default;

const sql = readFileSync(
  "supabase/migrations/20260527120000_events_date_index.sql",
  "utf8"
);

const client = new pg.Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("OK: events_date_time_idx");
} catch (e) {
  console.error("Error aplicando índice:", e);
  process.exit(1);
} finally {
  await client.end();
}
