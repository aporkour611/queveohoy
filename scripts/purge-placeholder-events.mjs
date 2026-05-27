import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const PLACEHOLDER_TEAM =
  /^(tbd|tbc|tba|t\.?\s*b\.?\s*d\.?|to be determined|to be confirmed|to be announced|por determinar|por confirmar|a determinar|a confirmar|unknown|n\/a|\?+|[-—]+)$/i;
const PLACEHOLDER_PREFIX =
  /^(winner|loser|winners|losers|ganador|perdedor|equipo\s+\d+|team\s+\d+|match\s+\d+\s+winner|match\s+\d+\s+loser)\b/i;

function isPlaceholderTeamName(name) {
  const trimmed = name?.trim();
  if (!trimmed) return true;
  if (PLACEHOLDER_TEAM.test(trimmed)) return true;
  if (PLACEHOLDER_PREFIX.test(trimmed)) return true;
  return false;
}

function eventHasPlaceholderTeams(event) {
  const home = event.home_team?.trim();
  const away = event.away_team?.trim();
  if (home || away) {
    return isPlaceholderTeamName(home) || isPlaceholderTeamName(away);
  }
  const match = event.title?.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (!match) return false;
  return isPlaceholderTeamName(match[1]) || isPlaceholderTeamName(match[2]);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SECRET_KEY?.trim();

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("events")
  .select("id, title, home_team, away_team, date, sport");

if (error) {
  console.error("Error leyendo eventos:", error.message);
  process.exit(1);
}

const invalid = (data ?? []).filter(eventHasPlaceholderTeams);
if (!invalid.length) {
  console.log("No hay eventos TBD/placeholder en BD.");
  process.exit(0);
}

console.log(`Encontrados ${invalid.length} eventos placeholder:`);
for (const row of invalid) {
  console.log(
    `  - [${row.date}] ${row.sport ?? "?"} | ${row.home_team ?? "?"} vs ${row.away_team ?? row.title}`
  );
}

const ids = invalid.map((row) => row.id);
const { error: delError } = await supabase.from("events").delete().in("id", ids);

if (delError) {
  console.error("Error borrando:", delError.message);
  process.exit(1);
}

console.log(`Eliminados ${ids.length} eventos.`);
