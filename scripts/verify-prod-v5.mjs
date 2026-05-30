/**
 * Verificación v5.0.0 en producción.
 * Uso: node scripts/verify-prod-v5.mjs
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

if (homeHtml.includes("v5.0.0") || homeHtml.includes("5.0.0"))
  pass("Footer versión v5.0.0")
else fail("Footer versión v5.0.0", "Aún no desplegado o caché antigua")

if (homeHtml.includes("Esta noche") || homeHtml.includes("Para ti"))
  pass("Sección Para ti esta noche")
else fail("Sección Para ti esta noche")

if (homeHtml.includes("Solo mis plataformas") || homeHtml.includes("qvh-platform-filter"))
  pass("Filtro Solo mis plataformas (markup/CSS)")
else fail("Filtro Solo mis plataformas")

if (homeHtml.includes("fh-agenda-search") || homeHtml.includes("Buscar en la agenda"))
  pass("Búsqueda inteligente en home")
else fail("Búsqueda inteligente en home")

const { res: asistenteRes } = await fetchText("/asistente")
if (asistenteRes.status === 307 || asistenteRes.status === 308)
  pass("Redirect /asistente → home")
else fail("Redirect /asistente → home", String(asistenteRes.status))

const assistantRes = await fetch(`${BASE}/api/assistant`, {
  method: "POST",
  cache: "no-store",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify({ query: "champions hoy", platforms: [], primeTime: "18:00" }),
})
if (assistantRes.ok) {
  const body = await assistantRes.json()
  if (typeof body.message === "string" && Array.isArray(body.events))
    pass("API POST /api/assistant")
  else fail("API POST /api/assistant", "Respuesta inesperada")
} else {
  fail("API POST /api/assistant", String(assistantRes.status))
}

const { text: novedadesHtml } = await fetchText("/novedades")
if (novedadesHtml.includes("5.0.0") && novedadesHtml.includes("Personalización"))
  pass("Release 5.0.0 en novedades")
else fail("Release 5.0.0 en novedades")

const searchRes = await fetch(`${BASE}/api/v1/search?q=real&limit=2`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
})
if (searchRes.ok) pass("API /api/v1/search (regresión v4)")
else fail("API /api/v1/search", String(searchRes.status))

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`)

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`)
}

const failed = checks.filter((c) => !c.ok).length
console.log(`\n${checks.length - failed}/${checks.length} OK`)
process.exit(failed > 0 ? 1 : 0)
