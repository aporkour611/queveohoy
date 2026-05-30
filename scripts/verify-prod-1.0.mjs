/**
 * Verificación lanzamiento 1.0.0 — consolidación v14→v20.
 * Uso: npm run verify:prod:1.0
 */
const BASE = "https://queveohoy.es";

const checks = [];
const pass = (name, detail = "") => checks.push({ ok: true, name, detail });
const fail = (name, detail = "") => checks.push({ ok: false, name, detail });

const fetchText = async (path, init = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    ...init,
  });
  return { res, text: await res.text() };
};

const { res: homeRes, text: homeHtml } = await fetchText("/");
if (homeRes.ok) pass("HTTP 200 home");
else fail("HTTP 200 home", String(homeRes.status));

if (homeHtml.includes("1.0.6") || homeHtml.includes("1.0.5") || homeHtml.includes("1.0.4") || homeHtml.includes("1.0.3") || homeHtml.includes("1.0.2") || homeHtml.includes("1.0.1") || homeHtml.includes("1.0.0"))
  pass("Footer versión 1.0.x");
else fail("Footer versión 1.0.x", "Aún no desplegado o caché antigua");

if (homeHtml.includes('id="main-content"')) pass("#main-content en home");
else fail("#main-content en home");

const { res: healthRes, text: healthText } = await fetchText("/api/health");
if (healthRes.ok) pass("GET /api/health");
else fail("GET /api/health", String(healthRes.status));

if (healthText.includes("1.0.6") || healthText.includes("1.0.5") || healthText.includes("1.0.4") || healthText.includes("1.0.3") || healthText.includes("1.0.2") || healthText.includes("1.0.1") || healthText.includes('"version"'))
  pass("Health incluye versión");
else fail("Health incluye versión");

if (!healthText.includes('"integrations"'))
  pass("Health público sin recon de integraciones");
else fail("Health público sin recon de integraciones", "Expone integrations sin auth");

const { res: v2Res, text: v2Text } = await fetchText("/api/v2/feed");
if (v2Res.ok) pass("GET /api/v2/feed");
else fail("GET /api/v2/feed", String(v2Res.status));

const etag = v2Res.headers.get("etag");
if (etag) pass("API v2 ETag header");
else fail("API v2 ETag header");

if (v2Text.includes('"version":"2"') || v2Text.includes('"version": "2"'))
  pass("API v2 version field");
else fail("API v2 version field");

if (etag) {
  const { res: notModRes } = await fetchText("/api/v2/feed", {
    headers: { "If-None-Match": etag },
  });
  if (notModRes.status === 304) pass("API v2 304 Not Modified");
  else fail("API v2 304 Not Modified", String(notModRes.status));
}

const { res: exploreRes } = await fetchText("/explorar");
if (exploreRes.ok) pass("HTTP 200 /explorar");
else fail("HTTP 200 /explorar", String(exploreRes.status));

const { res: nfRes, text: nfHtml } = await fetchText("/ruta-inexistente-1-0");
if (nfRes.status === 404) pass("HTTP 404 not-found");
else fail("HTTP 404 not-found", String(nfRes.status));

if (nfHtml.includes('id="main-content"')) pass("#main-content en 404");
else fail("#main-content en 404");

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
