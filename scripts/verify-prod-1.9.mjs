/**
 * Verificación release candidate 1.9.x
 * Uso: npm run verify:prod:1.9
 */
import { readFileSync } from "node:fs"

const BASE = process.env.VERIFY_URL ?? "https://queveohoy.es"
const checks = []
const pass = (name, detail = "") => checks.push({ ok: true, name, detail })
const fail = (name, detail = "") => checks.push({ ok: false, name, detail })

const versionPattern =
  /1\.9\.\d|1\.[3-8]\.\d|1\.0\.(1[1-9]|[2-9]\d)/

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

if (versionPattern.test(homeHtml)) pass("Footer versión 1.9.x / 1.0.11+")
else fail("Footer versión", "Despliegue pendiente o caché antigua")

if (homeHtml.includes('data-qvh-filter-intent')) pass("Intent prefetch filtros en shell")
else fail("Intent prefetch filtros en shell")

const { res: healthRes, text: healthText } = await fetchText("/api/health")
if (healthRes.ok) pass("GET /api/health")
else fail("GET /api/health", String(healthRes.status))

if (versionPattern.test(healthText) || healthText.includes('"version"'))
  pass("Health incluye versión")
else fail("Health incluye versión")

const { res: metaRes, headers: metaHeaders } = await fetch(`${BASE}/api/feed-meta`, {
  cache: "no-store",
})
if (metaRes.ok) pass("GET /api/feed-meta")
else fail("GET /api/feed-meta", String(metaRes.status))

const metaCache = metaRes.headers.get("cache-control") ?? ""
if (/s-maxage=60/.test(metaCache)) pass("feed-meta cache 60s")
else fail("feed-meta cache 60s", metaCache || "sin Cache-Control")

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
  const roadmap = readFileSync("docs/ROADMAP-1.9.9.md", "utf8")
  if (roadmap.includes("1.9.9")) pass("ROADMAP-1.9.9 presente")
  else fail("ROADMAP-1.9.9")
} catch {
  fail("ROADMAP-1.9.9", "archivo no encontrado")
}

const failed = checks.filter((c) => !c.ok)
for (const c of checks) {
  console.log(c.ok ? "OK" : "FAIL", c.name, c.detail ? `— ${c.detail}` : "")
}
console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
process.exit(failed.length > 0 ? 1 : 0)
