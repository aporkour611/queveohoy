/**
 * Comprueba integraciones en producción vía GET /api/health
 * Uso: npm run check:integrations
 */
const BASE = process.env.CHECK_URL ?? "https://queveohoy.es"

const LABELS = {
  supabase: "Supabase (anon/publishable)",
  serviceRole: "Supabase service role",
  cronSecret: "CRON_SECRET",
  adminSecret: "ADMIN_SECRET",
  footballApi: "FOOTBALL_DATA_API_KEY",
  tmdbApi: "TMDB_API_KEY",
  pandascoreApi: "PANDASCORE_API_KEY (opcional)",
  balldontlieApi: "BALLDONTLIE_API_KEY (opcional)",
  indexNow: "INDEXNOW_KEY",
  upstashRateLimit: "Upstash rate limit (opcional)",
  openaiAssistant: "OPENAI_API_KEY (opcional)",
  pushVapid: "Web Push VAPID (opcional)",
  cronAlerts: "CRON_ALERT_WEBHOOK_URL (opcional)",
}

const res = await fetch(`${BASE}/api/health`, { cache: "no-store" })
if (!res.ok) {
  console.error(`Health HTTP ${res.status}`)
  process.exit(1)
}

const body = await res.json()
console.log(`\n${body.service} v${body.version} — ${BASE}/api/health\n`)

const integrations = body.integrations ?? {}
let missingRequired = 0

for (const [key, label] of Object.entries(LABELS)) {
  const ok = Boolean(integrations[key])
  const required = !label.includes("opcional")
  if (!ok && required) missingRequired++
  console.log(`${ok ? "✓" : "✗"} ${label}`)
}

const score = body.integrationScore
if (score) {
  console.log(
    `\nObligatorias: ${score.requiredOk}/${score.requiredTotal} · Opcionales: ${score.optionalOk}/${score.optionalTotal}`
  )
}

if (missingRequired > 0) {
  console.log("\n→ Configura las ✗ en Vercel (Production). Ver docs/SETUP-MANUAL-TU.md\n")
  process.exit(1)
}

console.log("\n✓ Integraciones obligatorias OK en producción\n")
