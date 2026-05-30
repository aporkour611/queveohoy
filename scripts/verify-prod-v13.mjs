/**
 * Verificación v13.0.0 — performance release.
 * Uso: node scripts/verify-prod-v13.mjs
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

if (homeHtml.includes("v13.0.0") || homeHtml.includes("13.0.0"))
  pass("Footer versión v13.0.0");
else fail("Footer versión v13.0.0", "Aún no desplegado o caché antigua");

if (homeHtml.includes("qvh-tonight-ssr") || homeHtml.includes("Esta noche"))
  pass("Tonight SSR en HTML");
else fail("Tonight SSR en HTML");

if (homeHtml.includes('rel="prefetch"') && homeHtml.includes("scope=week"))
  pass("Prefetch semanal único en HTML");
else fail("Prefetch semanal en HTML");

const { res: legalRes } = await fetchText("/privacidad");
if (legalRes.ok) pass("HTTP 200 /privacidad (site-shell)");
else fail("HTTP 200 /privacidad", String(legalRes.status));

const { text: legalHtml } = await fetchText("/privacidad");
if (!legalHtml.includes("qvh-cat-groups"))
  pass("Legal sin CSS categorías pesado");
else fail("Legal sin CSS categorías", "feed-bundle filtrando mal");

console.log(`Cache home: ${homeRes.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok).length;
console.log(`\n${checks.length - failed}/${checks.length} OK`);
process.exit(failed > 0 ? 1 : 0);
