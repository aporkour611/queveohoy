#!/usr/bin/env node
/**
 * Precalienta producción (Vercel + Supabase + ISR).
 * Uso: npm run keep-warm:prod
 * GitHub Actions: keep-warm.yml (cada 15 min, respaldo a crons Vercel).
 */
const SITE = (process.env.SITE_URL ?? "https://queveohoy.es").replace(/\/$/, "")
const CRON_SECRET = process.env.CRON_SECRET?.trim()

/** APIs ligeras + warm completo de páginas (KEEP_WARM_FULL=0 para omitir HTML). */
const PATHS = [
  "/api/feed-meta",
  "/api/home-feed",
  "/api/v1/feed/week",
  "/api/health",
  "/api/v2/feed",
]

const FULL_WARM_PATHS = [
  "/api/warm",
  "/api/feed-meta",
  "/",
  "/explorar",
  "/futbol",
  "/champions",
  "/laliga",
  "/serie-a",
  "/ligue-1",
  "/segunda-division",
  "/formula-1",
  "/premier-league",
]

const fullWarm = process.env.KEEP_WARM_FULL !== "0"

async function ping(path) {
  const url = `${SITE}${path}`
  const headers = { "User-Agent": "qvh-keep-warm-prod/1", Accept: "*/*" }
  if (
    CRON_SECRET &&
    (path === "/api/warm" || path.startsWith("/api/health?warm=1"))
  ) {
    headers.Authorization = `Bearer ${CRON_SECRET}`
  }

  const started = Date.now()
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(path === "/" ? 120_000 : 60_000),
    })
    const ms = Date.now() - started
    const ok =
      res.ok ||
      res.status === 304 ||
      (path.startsWith("/api/health?warm=1") &&
        res.status === 401 &&
        !CRON_SECRET)
    console.log(`${ok ? "OK" : "FAIL"} ${path} → ${res.status} (${ms}ms)`)
    if (
      (path === "/api/warm" || path.startsWith("/api/health?warm=1")) &&
      res.ok
    ) {
      const body = await res.json()
      console.log(JSON.stringify(body, null, 2).slice(0, 800))
    }
    return ok
  } catch (err) {
    const ms = Date.now() - started
    console.error(`FAIL ${path} (${ms}ms):`, err instanceof Error ? err.message : err)
    return false
  }
}

let failed = 0
for (const path of PATHS) {
  if (!(await ping(path))) failed += 1
}

if (fullWarm) {
  for (const path of FULL_WARM_PATHS) {
    if (!(await ping(path))) failed += 1
  }
}

if (failed > 0) {
  console.error(`\n${failed} rutas fallaron`)
  process.exit(1)
}

console.log("\nKeep-warm OK")
