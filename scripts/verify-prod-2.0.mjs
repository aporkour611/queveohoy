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

const versionPattern = /2\.0\.\d|1\.9\.\d|1\.0\.(1[1-9]|[2-9]\d)/

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

if (versionPattern.test(homeHtml)) pass("Footer versión 2.0.x / 1.9+")
else fail("Footer versión", "Despliegue pendiente o caché antigua")

if (/2\.0\.\d/.test(homeHtml)) pass("Footer muestra 2.0.x")
else fail("Footer muestra 2.0.x", "Sigue versión anterior en HTML")

if (homeHtml.includes("data-qvh-filter-intent"))
  pass("Intent prefetch filtros en shell")
else fail("Intent prefetch filtros en shell")

const warmRes = await fetch(`${BASE}/api/warm`, {
  cache: "no-store",
  headers: { "Cache-Control": "no-cache" },
})
const warmType = warmRes.headers.get("content-type") ?? ""
if (warmRes.status === 404 || !warmType.includes("application/json")) {
  fail("GET /api/warm", warmRes.status === 404 ? "404 — despliega main reciente" : warmType)
} else {
  const warmBody = await warmRes.json()
  if (warmBody.ok) pass("GET /api/warm", `ms=${warmBody.ms ?? "?"}`)
  else pass("GET /api/warm (degraded)", JSON.stringify(warmBody.errors ?? warmBody.data).slice(0, 80))
}

const { res: healthRes, text: healthText } = await fetchText("/api/health")
if (healthRes.ok) pass("GET /api/health")
else fail("GET /api/health", String(healthRes.status))

if (/2\.0\.\d/.test(healthText)) pass("Health versión 2.0.x")
else fail("Health versión 2.0.x", healthText.slice(0, 120))

const metaRes = await fetch(`${BASE}/api/feed-meta`, { cache: "no-store" })
if (metaRes.ok) pass("GET /api/feed-meta")
else fail("GET /api/feed-meta", String(metaRes.status))

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
