/**
 * Verificación v7.0.0 en producción.
 * Uso: node scripts/verify-prod-v7.mjs
 */
const BASE = "https://queveohoy.es";

const checks = [];
const pass = (name, detail = "") => checks.push({ ok: true, name, detail });
const fail = (name, detail = "") => checks.push({ ok: false, name, detail });

const fetchText = async (path) => {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  return { res, text: await res.text() };
};

const { res: homeRes, text: homeHtml } = await fetchText("/");
if (homeRes.ok) pass("HTTP 200 home");
else fail("HTTP 200 home", String(homeRes.status));

if (homeHtml.includes("v7.0.0") || homeHtml.includes("7.0.0"))
  pass("Footer versión v7.0.0");
else fail("Footer versión v7.0.0", "Aún no desplegado o caché antigua");

if (
  homeHtml.includes('rel="preload"') &&
  (homeHtml.includes("image.tmdb.org") || homeHtml.includes("/_next/image"))
)
  pass("Preload LCP poster");
else fail("Preload LCP poster");

if (homeHtml.includes('href="/api/events?scope=week"'))
  pass("Prefetch feed semanal");
else fail("Prefetch feed semanal");

if (homeHtml.includes("preconnect") && homeHtml.includes("image.tmdb.org"))
  pass("Preconnect TMDB");
else fail("Preconnect TMDB");

if (homeHtml.includes("data-qvh-week-view"))
  pass("Shell SSR semana completa interactivo");
else fail("Shell SSR semana completa interactivo");

const weekRes = await fetch(`${BASE}/api/events?scope=week`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
});
if (weekRes.ok) {
  const body = await weekRes.json();
  if (Array.isArray(body.events) && body.scope === "week")
    pass("API /api/events?scope=week");
  else fail("API /api/events?scope=week", "Respuesta inesperada");
} else {
  fail("API /api/events?scope=week", String(weekRes.status));
}

const cacheHeader = weekRes.headers.get("cache-control") ?? "";
if (cacheHeader.includes("s-maxage"))
  pass("Cache-Control CDN en feed semanal");
else fail("Cache-Control CDN en feed semanal");

const { text: novedadesHtml } = await fetchText("/novedades");
if (novedadesHtml.includes("7.0.0") && novedadesHtml.includes("Premium"))
  pass("Release 7.0.0 en novedades");
else fail("Release 7.0.0 en novedades");

const searchRes = await fetch(`${BASE}/api/v1/search?q=real&limit=2`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
});
if (searchRes.ok) pass("API /api/v1/search (regresión)");
else fail("API /api/v1/search", String(searchRes.status));

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
