/**
 * Verificación v10.0.0 en producción.
 * Uso: node scripts/verify-prod-v10.mjs
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

if (homeHtml.includes("v10.0.0") || homeHtml.includes("10.0.0"))
  pass("Footer versión v10.0.0");
else fail("Footer versión v10.0.0", "Aún no desplegado o caché antigua");

if (homeHtml.includes('href="/api/events?scope=week"'))
  pass("Prefetch feed semanal (v7+)");
else fail("Prefetch feed semanal");

const { text: novedadesHtml } = await fetchText("/novedades");
if (novedadesHtml.includes("10.0.0") && novedadesHtml.includes("Grupos neon"))
  pass("Release 10.0.0 en novedades");
else fail("Release 10.0.0 en novedades");

const searchRes = await fetch(`${BASE}/api/v1/search?q=real&limit=2`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
});
if (searchRes.ok) pass("API /api/v1/search");
else fail("API /api/v1/search", String(searchRes.status));

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
