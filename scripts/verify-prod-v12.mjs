/**
 * Verificación v12.0.0 en producción.
 * Uso: node scripts/verify-prod-v12.mjs
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

if (homeHtml.includes("v12.0.0") || homeHtml.includes("12.0.0"))
  pass("Footer versión v12.0.0");
else fail("Footer versión v12.0.0", "Aún no desplegado o caché antigua");

const healthRes = await fetch(`${BASE}/api/health`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
});
if (healthRes.ok) {
  const body = await healthRes.json();
  if (body.ok === true && body.version) pass("GET /api/health");
  else fail("GET /api/health", "Payload inesperado");
} else fail("GET /api/health", String(healthRes.status));

const metaRes = await fetch(`${BASE}/api/feed-meta`, {
  cache: "no-store",
  headers: { Accept: "application/json" },
});
if (metaRes.ok) {
  const body = await metaRes.json();
  if (body.generatedAt && typeof body.eventCount === "number")
    pass("GET /api/feed-meta");
  else fail("GET /api/feed-meta", "Payload inesperado");
} else fail("GET /api/feed-meta", String(metaRes.status));

const { res: embedRes, text: embedHtml } = await fetchText("/embed/categorias");
if (embedRes.ok) pass("HTTP 200 /embed/categorias");
else fail("HTTP 200 /embed/categorias", String(embedRes.status));

if (embedHtml.includes("qvh-embed-cat-list") || embedHtml.includes("Explorar"))
  pass("Widget categorías embed");
else fail("Widget categorías embed");

const manifestRes = await fetch(`${BASE}/manifest.webmanifest`, {
  cache: "no-store",
});
if (manifestRes.ok) {
  const manifest = await manifestRes.json();
  if (Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 2)
    pass("PWA shortcuts en manifest");
  else fail("PWA shortcuts en manifest");
} else fail("PWA manifest", String(manifestRes.status));

const { text: devHtml } = await fetchText("/desarrolladores");
if (devHtml.includes("Design system") && devHtml.includes("/api/health"))
  pass("/desarrolladores design system + health");
else fail("/desarrolladores design system + health");

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
