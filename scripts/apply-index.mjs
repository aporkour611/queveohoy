/**
 * Crea el índice events_date_time_idx si SUPABASE_DB_URL está definida.
 * URI: Supabase → Project Settings → Database → Connection string (URI).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvLocal();

const url =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!url) {
  console.error(
    "Falta SUPABASE_DB_URL o DATABASE_URL.\n" +
      "Añádela en .env.local (Supabase → Settings → Database → Connection string → URI)."
  );
  process.exit(1);
}

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
