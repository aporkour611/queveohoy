/**
 * Comprueba integraciones en producción vía GET /api/health (Bearer CRON_SECRET)
 * Uso: npm run check:integrations
 * Opcional: CRON_SECRET en entorno para mapa de integraciones
 */
const BASE = process.env.CHECK_URL ?? "https://queveohoy.es"
const CRON_SECRET = process.env.CRON_SECRET?.trim()

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

const headers = CRON_SECRET
  ? { Authorization: `Bearer ${CRON_SECRET}` }
  : undefined

const url = `${BASE}/api/health`

const res = await fetch(url, { cache: "no-store", headers })
if (!res.ok) {
  console.error(`Health HTTP ${res.status}`)
  process.exit(1)
}

const body = await res.json()
console.log(`\n${body.service} v${body.version} — ${BASE}/api/health\n`)

if (body.checks) {
  const { database, feed, feedEventCount } = body.checks
  console.log(`${database ? "✓" : "✗"} Probe base de datos`)
  console.log(`${feed ? "✓" : "✗"} Probe feed (${feedEventCount ?? 0} eventos)`)
  if (!body.ok) {
    console.log("\n→ Health no ready (503). Revisa Supabase y cron.\n")
    process.exit(1)
  }
}

const integrations = body.integrations ?? {}
let missingRequired = 0

if (!CRON_SECRET) {
  console.log(
    "ℹ Sin CRON_SECRET local: omitiendo mapa de integraciones (usa env para detalle completo)\n"
  )
} else {
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
}

console.log("\n✓ Health OK en producción\n")
