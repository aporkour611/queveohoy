#!/usr/bin/env node
/**
 * Precalienta producción (Vercel + Supabase + ISR).
 *
 * Uso:
 *   npm run keep-warm:prod          — solo APIs (~5 rutas)
 *   npm run keep-warm:prod:full     — APIs + hubs HTML (KEEP_WARM_FULL=1)
 *
 * GHA Hobby (ver docs/HOBBY-FAIR-USE.md):
 *   keep-warm.yml       — APIs cada 15 min
 *   keep-warm-full.yml  — full 4×/día
 */
import {
  isDeploymentDisabledBody,
  isProdBlockedStatus,
  probeProdHealth,
  writeProdProbeStatus,
} from "./lib/prod-probe-guard.mjs"
import { assertNotVercelPaused } from "./lib/prod-vercel-paused.mjs"

const SITE = (process.env.SITE_URL ?? "https://queveohoy.es").replace(/\/$/, "")
const CRON_SECRET = process.env.CRON_SECRET?.trim()

assertNotVercelPaused("keep-warm")

const fullWarm = process.env.KEEP_WARM_FULL === "1"
console.log(`[keep-warm] ${SITE} mode=${fullWarm ? "full" : "api-only"}`)

const health = await probeProdHealth(SITE)
if (health.deferred) {
  console.warn(`Keep-warm omitido: prod en backoff hasta ${health.nextProbeAfter ?? "?"}`)
  process.exit(0)
}
if (health.blocked || isProdBlockedStatus(health.status)) {
  console.warn(
    `Keep-warm omitido: prod HTTP ${health.status}${health.deploymentDisabled ? " (DEPLOYMENT_DISABLED)" : ""}`
  )
  process.exit(0)
}

/** APIs ligeras + warm completo de páginas (KEEP_WARM_FULL=0 para omitir HTML). */
const PATHS = [
  "/api/feed-meta",
  "/api/home-feed",
  "/api/v1/feed/week",
  "/api/health",
  "/api/v2/feed",
]

const FULL_WARM_PATHS = [
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

const fullWarm = process.env.KEEP_WARM_FULL === "1"

async function ping(path) {
  const url = `${SITE}${path}`
  const headers = { "User-Agent": "qvh-keep-warm-prod/2-hobby", Accept: "*/*" }
  if (
    CRON_SECRET &&
    (path === "/api/warm" || path.startsWith("/api/health?warm=1"))
  ) {
    headers.Authorization = `Bearer ${CRON_SECRET}`
  }

  const started = Date.now()
  const timeoutMs = path === "/" ? 90_000 : path.startsWith("/api/") ? 45_000 : 75_000
  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(timeoutMs),
    })
    const ms = Date.now() - started
    if (isProdBlockedStatus(res.status)) {
      const bodyText = await res.text().catch(() => "")
      if (isDeploymentDisabledBody(bodyText)) {
        writeProdProbeStatus({
          base: SITE,
          status: res.status,
          blocked: true,
          deploymentDisabled: true,
          ms,
          at: new Date().toISOString(),
          blockBackoffMs: 24 * 60 * 60_000,
          nextProbeAfter: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
        })
      }
      console.log(`FAIL ${path} → ${res.status} (${ms}ms)`)
      return false
    }
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
  let hubFailed = 0
  for (const path of FULL_WARM_PATHS) {
    if (!(await ping(path))) hubFailed += 1
  }
  if (hubFailed > 0) {
    console.warn(`\n${hubFailed} rutas HTML lentas (cold ISR — cron /api/warm las calienta)`)
    if (process.env.KEEP_WARM_STRICT === "1") {
      failed += hubFailed
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} rutas fallaron`)
  process.exit(1)
}

console.log("\nKeep-warm OK")
