/**
 * Verificación v1.0 en producción (HTML + CSS + errores obvios).
 * Uso: node scripts/verify-prod-v1.mjs
 */
const BASE = "https://queveohoy.es";

const checks = [];
const pass = (n, d = "") => checks.push({ ok: true, name: n, detail: d });
const fail = (n, d = "") => checks.push({ ok: false, name: n, detail: d });

const res = await fetch(BASE, {
  cache: "no-store",
  headers: { "Cache-Control": "no-cache" },
});
const html = await res.text();

if (res.ok) pass("HTTP 200 home");
else fail("HTTP 200 home", String(res.status));

if (html.includes('id="home-feed-day-ssr"')) pass("Feed estático SSR (home-feed-day-ssr)");
else fail("Feed estático SSR");

if (html.includes('id="feed-controls-ssr"')) pass("Controles SSR placeholder");
else fail("Controles SSR placeholder");

if (html.includes('id="home-day-header-ssr"')) pass("Cabecera día SSR");
else fail("Cabecera día SSR");

if (html.includes("Esta semana")) pass("Bloque Esta semana en HTML");
else fail("Bloque Esta semana en HTML");

if (!html.includes("pickTodayDestacados") && !html.includes('id="destacados-hoy"'))
  pass("Sin módulo Destacados Hoy");
else fail("Sin módulo Destacados Hoy");

if (html.includes("image.tmdb.org")) pass("Pósters TMDB en HTML");
else fail("Pósters TMDB en HTML");

if (html.includes("--qvh-shell-max") || html.includes("fh-container"))
  pass("Shell layout presente");
else fail("Shell layout presente");

const cssHrefs = [...html.matchAll(/href="(\/_next\/static\/css\/[^"]+)"/g)].map(
  (m) => m[1]
);

let hasRg = false;
let hasCl = false;
for (const href of cssHrefs) {
  const cssRes = await fetch(`${BASE}${href}`, { cache: "no-store" });
  const css = await cssRes.text();
  if (css.includes("fh-rg-flag")) hasRg = true;
  if (css.includes("qvh-cl-week")) hasCl = true;
}

if (hasRg) pass("Estilos Roland Garros en prod");
else fail("Estilos Roland Garros en prod");

if (hasCl) pass("Estilos Champions CL en prod");
else fail("Estilos Champions CL en prod");

if (html.includes('lang="es"')) pass("lang=es");
else fail("lang=es");

if (html.includes('rel="canonical"')) pass("Canonical");
else fail("Canonical");

if (html.includes("application/ld+json")) pass("JSON-LD");
else fail("JSON-LD");

console.log(`Cache: ${res.headers.get("x-vercel-cache") ?? "?"}\n`);

for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

const failed = checks.filter((c) => !c.ok);
console.log(`\n${checks.length - failed.length}/${checks.length} OK`);
process.exit(failed.length ? 1 : 0);
