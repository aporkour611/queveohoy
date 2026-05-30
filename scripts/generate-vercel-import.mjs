/**
 * Genera .env.production.import para importar en Vercel de una vez.
 * Uso: node scripts/generate-vercel-import.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const localPath = resolve(root, ".env.local")
const outPath = resolve(root, ".env.production.import")

const INDEXNOW = local.get("INDEXNOW_KEY") ?? ""

function parseEnv(text) {
  const map = new Map()
  for (const line of text.split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1))
  }
  return map
}

const local = existsSync(localPath)
  ? parseEnv(readFileSync(localPath, "utf8"))
  : new Map()

const url =
  local.get("NEXT_PUBLIC_SUPABASE_URL")?.replace(/\/$/, "") ??
  local.get("SUPABASE_URL")?.replace(/\/$/, "") ??
  ""
const anon =
  local.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ??
  local.get("SUPABASE_ANON_KEY") ??
  ""

const lines = [
  "# Importar en Vercel → Settings → Environment Variables → Import .env → Production",
  `NEXT_PUBLIC_SITE_URL=https://queveohoy.es`,
  `NEXT_PUBLIC_SUPABASE_URL=${url}`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=${anon}`,
  `SUPABASE_URL=${url}`,
  `SUPABASE_ANON_KEY=${anon}`,
  `SUPABASE_SERVICE_ROLE_KEY=${local.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""}`,
  `ADMIN_SECRET=${local.get("ADMIN_SECRET") ?? ""}`,
  `CRON_SECRET=${local.get("CRON_SECRET") ?? ""}`,
  `FOOTBALL_DATA_API_KEY=${local.get("FOOTBALL_DATA_API_KEY") ?? ""}`,
  `TMDB_API_KEY=${local.get("TMDB_API_KEY") ?? ""}`,
  `PANDASCORE_API_KEY=${local.get("PANDASCORE_API_KEY") ?? ""}`,
  `BALLDONTLIE_API_KEY=${local.get("BALLDONTLIE_API_KEY") ?? ""}`,
  `INDEXNOW_KEY=${INDEXNOW}`,
]

writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8")
console.log(`✓ Creado: ${outPath}`)
console.log("  Vercel → Settings → Environment Variables → Import .env")
console.log("  Selecciona ese archivo → Environment: Production → Save → Redeploy")
