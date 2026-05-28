import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, raw] = match;
      process.env[key] = raw.trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* optional */
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

/** Filas obsoletas: fecha US (domingo) o episodio en día incorrecto. */
const STALE_EXTERNAL_IDS = [
  "tmdb_tv_124364_2026-05-31_s4e6",
  "tmdb_tv_85552_2026-05-31_s3e8",
  "tmdb_tv_reality_95676_2026-06-01_s10e25",
];

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin
  .from("events")
  .delete()
  .in("external_id", STALE_EXTERNAL_IDS)
  .select("id, external_id, title, date");

if (error) {
  console.error("Delete error:", error.message);
  process.exit(1);
}

console.log(`Purged ${data?.length ?? 0} stale media rows:`);
for (const row of data ?? []) {
  console.log(`  - ${row.date} ${row.external_id} ${row.title}`);
}
