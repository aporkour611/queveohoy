/**
 * Verificación v4.0.0 en producción.
 * Uso: node scripts/verify-prod-v4.mjs
 */
const BASE = "https://queveohoy.es"

const checks = []
const pass = (name, detail = "") => checks.push({ ok: true, name, detail })
const fail = (name, detail = "") => checks.push({ ok: false, name, detail })

const fetchText = async (path) => {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  })
  return { res, text: await res.text() }
}

const { res: homeRes, text: homeHtml } = await fetchText("/")
if (homeRes.ok) pass("HTTP 200 home")
else fail("HTTP 200 home", String(homeRes.status))

if (homeHtml.includes("v4.0.0") || homeHtml.includes("4.0.0"))
  pass("Footer versión v4.0.0")
else fail("Footer versión v4.0.0", "Aún no desplegado o caché antigua")

const { res: novedadesRes, text: novedadesHtml } = await fetchText("/novedades")
if (novedadesRes.ok) pass("HTTP 200 /novedades")
else fail("HTTP 200 /novedades", String(novedadesRes.status))

if (novedadesHtml.includes("4.0.0") && novedadesHtml.includes("Universo"))
  pass("Release 4.0.0 en novedades")
else fail("Release 4.0.0 en novedades")

const searchRes = await fetch(`${BASE}/api/v1/search?q=real&limit=2`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
})
if (searchRes.ok) {
  const body = await searchRes.json()
  if (body.version === "1" && Array.isArray(body.events)) pass("API /api/v1/search")
  else fail("API /api/v1/search", "Respuesta inesperada")
} else {
  fail("API /api/v1/search", String(searchRes.status))
}

const feedRes = await fetch(`${BASE}/api/v1/feed?limit=2`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
})
if (feedRes.ok) {
  const body = await feedRes.json()
  if ("nextCursor" in body) pass("API feed paginación (nextCursor)")
  else fail("API feed paginación (nextCursor)")
} else {
  fail("API feed paginación", String(feedRes.status))
}

const { text: devHtml } = await fetchText("/desarrolladores")
if (
  devHtml.includes("/api/v1/search") ||
  devHtml.includes("Plataforma v4.0.0") ||
  devHtml.includes("4.0.0")
)
  pass("Docs v4 en /desarrolladores")
else fail("Docs v4 en /desarrolladores")

const { res: cuentaRes } = await fetchText("/cuenta")
if (cuentaRes.status === 200 || cuentaRes.status === 307 || cuentaRes.redirected)
  pass("/cuenta accesible (login redirect OK)")
else fail("/cuenta accesible", String(cuentaRes.status))

if (homeHtml.includes("Esta semana")) pass("Champions / Esta semana en home")
else fail("Champions / Esta semana en home")

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`)

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`)
}

const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} OK`)
process.exit(failed.length ? 1 : 0)
