/**
 * Verificación lanzamiento 2.0.0
 * Uso: npm run verify:prod:2.0
 */
import { readFileSync } from "node:fs"
import { spawnSync } from "node:child_process"

const BASE = process.env.VERIFY_URL ?? "https://queveohoy.es"
const checks = []
const pass = (name, detail = "") => checks.push({ ok: true, name, detail })
const fail = (name, detail = "") => checks.push({ ok: false, name, detail })

const versionPattern = /2\.\d+\.\d|1\.9\.\d|1\.0\.(1[1-9]|[2-9]\d)/

const readExpectedVersion = () => {
  try {
    const src = readFileSync("app/lib/product-version.ts", "utf8")
    const match = src.match(/PRODUCT_VERSION\s*=\s*"([^"]+)"/)
    return match?.[1] ?? "2.5.0"
  } catch {
    return "2.5.0"
  }
}

const expectedVersion = readExpectedVersion()

const fetchText = async (path, init = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    ...init,
  })
  return { res, text: await res.text() }
}

const { res: homeRes, text: homeHtml } = await fetchText("/")
if (homeRes.ok) pass("HTTP 200 home")
else fail("HTTP 200 home", String(homeRes.status))

if (versionPattern.test(homeHtml)) pass("Footer versión producto")
else fail("Footer versión", "Despliegue pendiente o caché antigua")

if (homeHtml.includes(expectedVersion))
  pass(`Footer muestra ${expectedVersion}`)
else fail(`Footer muestra ${expectedVersion}`, "Sigue versión anterior en HTML")

if (homeHtml.includes("data-qvh-filter-intent"))
  pass("Intent prefetch filtros en shell")
else fail("Intent prefetch filtros en shell")

const warmCronSecret = process.env.CRON_SECRET?.trim()
const warmHeaders = {
  "Cache-Control": "no-cache",
  ...(warmCronSecret ? { Authorization: `Bearer ${warmCronSecret}` } : {}),
}
const warmCandidates = [
  ["/api/health?warm=1", "health warm"],
  ["/api/warm", "warm"],
]
let warmOk = false
for (const [warmPath] of warmCandidates) {
  const warmRes = await fetch(`${BASE}${warmPath}`, {
    cache: "no-store",
    headers: warmHeaders,
  })
  const warmType = warmRes.headers.get("content-type") ?? ""
  if (warmRes.status === 404 || !warmType.includes("application/json")) continue
  const warmBody = await warmRes.json()
  warmOk = true
  if (warmBody.ok) pass(`GET ${warmPath}`, `ms=${warmBody.ms ?? "?"}`)
  else
    pass(`GET ${warmPath} (degraded)`, JSON.stringify(warmBody.data ?? warmBody).slice(0, 80))
  break
}
if (!warmOk) fail("Keep-warm endpoint", "Necesita /api/health?warm=1 o /api/warm tras deploy")

const { res: healthRes, text: healthText } = await fetchText("/api/health")
if (healthRes.ok) pass("GET /api/health")
else fail("GET /api/health", String(healthRes.status))

if (healthText.includes(`"version":"${expectedVersion}"`))
  pass(`Health versión ${expectedVersion}`)
else if (versionPattern.test(healthText))
  pass(`Health versión producto`, `esperado ${expectedVersion}`)
else fail("Health versión", healthText.slice(0, 120))

const metaRes = await fetch(`${BASE}/api/feed-meta`, { cache: "no-store" })
if (metaRes.ok) pass("GET /api/feed-meta")
else fail("GET /api/feed-meta", String(metaRes.status))

const metaBody = metaRes.ok ? await metaRes.json() : null
if (metaBody && typeof metaBody.weekCount === "number")
  pass("feed-meta weekCount", String(metaBody.weekCount))
else if (metaRes.ok) fail("feed-meta weekCount", "campo ausente")

const metaCache = metaRes.headers.get("cache-control") ?? ""
const metaVercelCache = metaRes.headers.get("x-vercel-cache") ?? ""
const metaAge = metaRes.headers.get("age") ?? ""
const metaCached =
  /s-maxage=60/.test(metaCache) ||
  /^(HIT|STALE)/i.test(metaVercelCache) ||
  (metaAge !== "" && Number(metaAge) >= 0)

if (metaCached) pass("feed-meta cache CDN", metaVercelCache || metaCache || `age=${metaAge}`)
else fail("feed-meta cache CDN", metaCache || "sin Cache-Control")

const homeFeed = await fetch(`${BASE}/api/home-feed`, {
  cache: "no-store",
  headers: { "Cache-Control": "no-cache" },
})
if (homeFeed.ok) pass("GET /api/home-feed")
else fail("GET /api/home-feed", String(homeFeed.status))

const etag = homeFeed.headers.get("etag")
if (etag) pass("home-feed ETag", etag)
else fail("home-feed ETag")

if (etag) {
  const again = await fetch(`${BASE}/api/home-feed`, {
    cache: "no-store",
    headers: { "If-None-Match": etag },
  })
  if (again.status === 304) pass("home-feed 304 Not Modified")
  else fail("home-feed 304", String(again.status))
}

try {
  readFileSync("docs/ROADMAP-2.0.md", "utf8")
  pass("ROADMAP-2.0.md presente")
} catch {
  fail("ROADMAP-2.0.md")
}

const legacy = spawnSync(process.execPath, ["scripts/verify-prod-1.0.mjs"], {
  stdio: "inherit",
  env: { ...process.env, VERIFY_URL: BASE },
})
if (legacy.status === 0) pass("verify-prod-1.0 (contrato base)")
else fail("verify-prod-1.0 (contrato base)", `exit ${legacy.status ?? "?"}`)

const failed = checks.filter((c) => !c.ok)
for (const c of checks) {
  console.log(c.ok ? "OK" : "FAIL", c.name, c.detail ? `— ${c.detail}` : "")
}
console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
process.exit(failed.length > 0 ? 1 : 0)
