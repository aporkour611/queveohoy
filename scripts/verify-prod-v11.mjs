/**
 * Verificación v11.0.0 en producción.
 * Uso: node scripts/verify-prod-v11.mjs
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

if (homeHtml.includes("v11.0.0") || homeHtml.includes("11.0.0"))
  pass("Footer versión v11.0.0");
else fail("Footer versión v11.0.0", "Aún no desplegado o caché antigua");

const { res: explorarRes, text: explorarHtml } = await fetchText("/explorar");
if (explorarRes.ok) pass("HTTP 200 /explorar");
else fail("HTTP 200 /explorar", String(explorarRes.status));

if (explorarHtml.includes("Grupos principales") || explorarHtml.includes("qvh-cat-groups"))
  pass("/explorar panel categorías");
else fail("/explorar panel categorías");

const feedCatRes = await fetch(
  `${BASE}/api/v1/feed?categories=futbol&limit=3`,
  { cache: "no-store", headers: { Accept: "application/json" } }
);
if (feedCatRes.ok) {
  const body = await feedCatRes.json();
  if (body.apiMinorVersion === "1.1" && Array.isArray(body.categoriesApplied))
    pass("API v1.1 categories filter");
  else fail("API v1.1 categories filter", "Respuesta sin apiMinorVersion");
} else fail("API v1.1 categories filter", String(feedCatRes.status));

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
