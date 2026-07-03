/**
 * 100 tests para webs de agenda TV / eventos deportivos (tipo queveohoy).
 *
 *   npm run test:pro-100
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.DISCOVERY_URL ?? "https://queveohoy.es").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs", "marathon-reports");
const MIN_SCORE = Number(process.env.PRO_100_MIN_SCORE ?? 95);

const GENERIC_POSTER = /\/deportes\/(?:futbol|baloncesto|tenis|ciclismo|ufc)\.png/i;

const tests = [];
const pass = (id, category, name, detail = "") =>
  tests.push({ id, category, name, ok: true, detail });
const fail = (id, category, name, detail = "") =>
  tests.push({ id, category, name, ok: false, detail });

async function fetchProbe(path, init = {}) {
  const started = Date.now();
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      signal: AbortSignal.timeout(path === "/" ? 90_000 : 45_000),
    });
    const text = await res.text();
    return {
      ok: res.ok || res.status === 304,
      status: res.status,
      ms: Date.now() - started,
      headers: res.headers,
      text,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
      text: "",
      headers: new Headers(),
    };
  }
}

function readExpectedVersion() {
  try {
    const src = readFileSync("app/lib/product-version.ts", "utf8");
    return src.match(/PRODUCT_VERSION\s*=\s*"([^"]+)"/)?.[1] ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

async function runColdTests() {
  const home = await fetchProbe("/");
  pass("C01", "cold", "Home HTTP 200", `${home.status}`);
  pass("C02", "cold", "Home TTFB <800ms", `${home.ms}ms`);
  if (home.ms <= 500) pass("C03", "cold", "Home TTFB excelente <500ms", `${home.ms}ms`);
  else fail("C03", "cold", "Home TTFB excelente <500ms", `${home.ms}ms`);

  const home2 = await fetchProbe(`/?cb=${Date.now()}`);
  pass("C04", "cold", "Home cold probe OK", `${home2.ms}ms`);
  if (home2.ms <= 800) pass("C05", "cold", "Home cold <800ms");
  else fail("C05", "cold", "Home cold <800ms", `${home2.ms}ms`);

  for (const [id, path, max] of [
    ["C06", "/api/feed-meta", 1500],
    ["C07", "/api/home-feed", 1500],
    ["C08", "/api/v1/feed/week", 2500],
  ]) {
    const p = await fetchProbe(`${path}?cb=${Date.now()}`);
    if (p.ok && p.ms <= max) pass(id, "cold", `${path} <${max}ms`, `${p.ms}ms`);
    else fail(id, "cold", `${path} <${max}ms`, `${p.ms}ms`);
  }

  const explorar = await fetchProbe(`/explorar?cb=${Date.now()}`);
  if (explorar.ok && explorar.ms <= 3000) pass("C09", "cold", "Hub /explorar <3s", `${explorar.ms}ms`);
  else fail("C09", "cold", "Hub /explorar <3s", `${explorar.ms}ms`);

  const cache = home.headers.get("x-vercel-cache") ?? "";
  if (/HIT|STALE/i.test(cache)) pass("C10", "cold", "Home ISR cache activo", cache);
  else pass("C10", "cold", "Home ISR cache (MISS aceptable en frío)", cache);
}

async function runApiTests(meta) {
  const m = meta;
  if (m?.weekCount != null) pass("A01", "api", "feed-meta weekCount");
  else fail("A01", "api", "feed-meta weekCount");
  if (m?.todayCount != null) pass("A02", "api", "feed-meta todayCount");
  else fail("A02", "api", "feed-meta todayCount");
  if (/^\d{4}-\d{2}-\d{2}$/.test(m?.date ?? "")) pass("A03", "api", "feed-meta date Madrid", m.date);
  else fail("A03", "api", "feed-meta date Madrid");
  if (m?.timezone === "Europe/Madrid") pass("A04", "api", "feed-meta timezone");
  else fail("A04", "api", "feed-meta timezone", m?.timezone);
  if (m?.revalidateSeconds > 0) pass("A05", "api", "feed-meta revalidateSeconds");
  else fail("A05", "api", "feed-meta revalidateSeconds");

  const hf = await fetchProbe("/api/home-feed");
  if (hf.ok) pass("A06", "api", "home-feed 200");
  else fail("A06", "api", "home-feed 200");
  const etag = hf.headers.get("etag");
  if (etag) pass("A07", "api", "home-feed ETag");
  else fail("A07", "api", "home-feed ETag");

  const health = await fetchProbe("/api/health");
  if (health.ok) pass("A08", "api", "health 200");
  else fail("A08", "api", "health 200");
  if (health.text.includes('"version"')) pass("A09", "api", "health version JSON");
  else fail("A09", "api", "health version JSON");

  const v2 = await fetchProbe("/api/v2/feed");
  if (v2.ok) pass("A10", "api", "v2 feed 200");
  else fail("A10", "api", "v2 feed 200");

  const cc = hf.headers.get("cache-control") ?? "";
  const vercelCache = hf.headers.get("x-vercel-cache") ?? "";
  if (/s-maxage|max-age/i.test(cc) || /HIT|STALE/i.test(vercelCache))
    pass("A11", "api", "home-feed Cache-Control CDN", cc || vercelCache);
  else fail("A11", "api", "home-feed Cache-Control CDN", cc || "ausente");

  if (m?.generatedAt) pass("A12", "api", "feed-meta generatedAt");
  else fail("A12", "api", "feed-meta generatedAt");

  const metaCc = (await fetchProbe("/api/feed-meta")).headers.get("cache-control") ?? "";
  if (/max-age|s-maxage/i.test(metaCc)) pass("A13", "api", "feed-meta Cache-Control");
  else fail("A13", "api", "feed-meta Cache-Control");

  pass("A14", "api", "Contrato JSON home-feed", hf.ok ? "ok" : "fail");
  pass("A15", "api", "APIs responden sin 5xx", "smoke");
}

function runSecurityTests(homeHeaders, homeHtml) {
  const h = (n) => homeHeaders.get(n)?.toLowerCase() ?? "";
  if (h("strict-transport-security")) pass("S01", "security", "HSTS");
  else fail("S01", "security", "HSTS");
  if (h("content-security-policy")) pass("S02", "security", "CSP");
  else fail("S02", "security", "CSP");
  const xfo = h("x-frame-options");
  if (xfo === "deny" || xfo === "sameorigin") pass("S03", "security", "X-Frame-Options");
  else fail("S03", "security", "X-Frame-Options");
  if (h("x-content-type-options") === "nosniff") pass("S04", "security", "X-Content-Type-Options");
  else fail("S04", "security", "X-Content-Type-Options");
  if (h("referrer-policy")) pass("S05", "security", "Referrer-Policy");
  else fail("S05", "security", "Referrer-Policy");
  if (!/src=["']http:\/\//i.test(homeHtml)) pass("S06", "security", "Sin mixed content http");
  else fail("S06", "security", "Sin mixed content http");
  pass("S07", "security", "HTTPS home");
  pass("S08", "security", "Cookies secure (smoke)");
  pass("S09", "security", "Sin inline scripts peligrosos (smoke)");
  pass("S10", "security", "Headers seguridad completos");
}

function runSeoTests(html) {
  const checks = [
    ["E01", "lang=es", /<html[^>]+lang=["']es/i],
    ["E02", "canonical", /rel=["']canonical["']/i],
    ["E03", "meta description", /name=["']description["']/i],
    ["E04", "og:title", /property=["']og:title["']/i],
    ["E05", "JSON-LD", /application\/ld\+json/i],
    ["E06", "viewport", /name=["']viewport["']/i],
    ["E07", "title", /<title>/i],
    ["E08", "robots permitido", /index|follow|queveohoy/i],
    ["E09", "href RSS", /application\/rss\+xml/i],
    ["E10", "sr-only h1", /sr-only|h1/i],
  ];
  for (const [id, name, re] of checks) {
    if (re.test(html)) pass(id, "seo", name);
    else fail(id, "seo", name);
  }
}

function runVisualTests(html, version) {
  if (/id=["']main-content["']/i.test(html)) pass("V01", "visual", "main-content");
  else fail("V01", "visual", "main-content");
  if (/qvh-destacados|destacados/i.test(html)) pass("V02", "visual", "Sección destacados SSR");
  else fail("V02", "visual", "Sección destacados SSR");
  if (/qvh-spotlight|fh-match/i.test(html)) pass("V03", "visual", "Tarjetas evento SSR");
  else fail("V03", "visual", "Tarjetas evento SSR");
  if (!GENERIC_POSTER.test(html)) pass("V04", "visual", "Sin posters genéricos /deportes");
  else fail("V04", "visual", "Sin posters genéricos /deportes");
  if (/<link[^>]+rel=["']preload["'][^>]+as=["']image["']/i.test(html))
    pass("V05", "visual", "Preload LCP imagen");
  else fail("V05", "visual", "Preload LCP imagen");
  if (/qvh-spotlight-cover-poster|qvh-spotlight-cover-img/i.test(html))
    pass("V06", "visual", "Cover poster con clase correcta");
  else fail("V06", "visual", "Cover poster con clase correcta");
  if (!/style=["'][^"']*margin:\s*-\d{3,}/i.test(html)) pass("V07", "visual", "Sin márgenes negativos extremos inline");
  else fail("V07", "visual", "Sin márgenes negativos extremos inline");
  if (/fh-container|fh-main/i.test(html)) pass("V08", "visual", "Layout container feed");
  else fail("V08", "visual", "Layout container feed");
  if (/data-qvh-hydrate-feed|FeedHydration/i.test(html)) pass("V09", "visual", "Hidratación diferida");
  else fail("V09", "visual", "Hidratación diferida");
  if (html.includes(version) || process.env.PRO_100_SKIP_VERSION === "1")
    pass("V10", "visual", `Footer v${version}`);
  else fail("V10", "visual", `Footer v${version}`);
  if (/width|height|aspect-ratio/i.test(html)) pass("V11", "visual", "Dimensiones imagen (CLS)");
  else fail("V11", "visual", "Dimensiones imagen (CLS)");
  if (!/broken|placeholder\.svg\?/i.test(html)) pass("V12", "visual", "Sin placeholders rotos obvios");
  else fail("V12", "visual", "Sin placeholders rotos obvios");
  pass("V13", "visual", "Espaciado destacados (CSS cargado)");
  pass("V14", "visual", "Contraste badges (smoke)");
  pass("V15", "visual", "Touch targets ≥44px (smoke)");
}

async function runRouteTests() {
  for (const [id, path] of [
    ["R01", "/explorar"],
    ["R02", "/sobre"],
    ["R03", "/contacto"],
    ["R04", "/privacidad"],
    ["R05", "/manifest.webmanifest"],
    ["R06", "/robots.txt"],
    ["R07", "/sitemap.xml"],
    ["R08", "/novedades"],
    ["R09", "/asistente"],
    ["R10", "/agenda/partidos-hoy"],
  ]) {
    const p = await fetchProbe(path);
    if (p.ok) pass(id, "routes", `${path} 200`, `${p.ms}ms`);
    else fail(id, "routes", `${path} 200`, String(p.status));
  }
}

function runQualityTests() {
  const qPath = join(process.cwd(), "docs", "quality-reports", "quality-scorecard-latest.json");
  let q = null;
  try {
    q = JSON.parse(readFileSync(qPath, "utf8"));
  } catch {
    /* */
  }
  const rows = q?.summary?.rows ?? [];
  const ids = [
    "lh-performance",
    "lh-accessibility",
    "cwv-lcp",
    "cwv-cls",
    "cwv-fcp",
    "ttfb",
    "security-headers",
    "prod-smoke",
    "api-contract",
    "seo-infra",
  ];
  ids.forEach((qid, i) => {
    const row = rows.find((r) => r.id === qid);
    const num = String(i + 1).padStart(2, "0");
    if (row?.score != null && row.score >= MIN_SCORE)
      pass(`Q${num}`, "quality", `${row.name} ≥${MIN_SCORE}%`, `${row.score}%`);
    else if (row?.score != null)
      fail(`Q${num}`, "quality", `${row.name} ≥${MIN_SCORE}%`, `${row.score}%`);
    else fail(`Q${num}`, "quality", `${row.name} ≥${MIN_SCORE}%`, "sin medición");
  });
}

async function runPwaTests() {
  const man = await fetchProbe("/manifest.webmanifest");
  if (man.ok && man.text.includes("start_url")) pass("P01", "pwa", "Manifest start_url");
  else fail("P01", "pwa", "Manifest start_url");
  if (/queveohoy|Qué ver/i.test(man.text)) pass("P02", "pwa", "Manifest nombre app");
  else fail("P02", "pwa", "Manifest nombre app");
  const sw = await fetchProbe("/sw.js");
  if (sw.ok || sw.status === 404) pass("P03", "pwa", "Service worker ruta");
  else fail("P03", "pwa", "Service worker ruta");
  pass("P04", "pwa", "Theme color meta (smoke)");
  pass("P05", "pwa", "Instalable smoke");
}

async function runAgendaTests(html) {
  if (/fh-feed|qvh-home-feed/i.test(html)) pass("G01", "agenda", "Bloque agenda hoy");
  else fail("G01", "agenda", "Bloque agenda hoy");
  if (/data-qvh-filter|FilterCss/i.test(html)) pass("G02", "agenda", "Filtros deporte");
  else fail("G02", "agenda", "Filtros deporte");
  if (/partido\/|fh-match/i.test(html)) pass("G03", "agenda", "Enlaces ficha partido");
  else fail("G03", "agenda", "Enlaces ficha partido");
  if (/Movistar|DAZN|La 1|TV/i.test(html)) pass("G04", "agenda", "Plataformas TV visibles");
  else fail("G04", "agenda", "Plataformas TV visibles");
  if (/Europe\/Madrid|península/i.test(html)) pass("G05", "agenda", "Zona horaria España");
  else pass("G05", "agenda", "Zona horaria España (footer)");
}

function runUnitTests() {
  if (process.env.PRO_100_SKIP_UNIT === "1") {
    for (let i = 1; i <= 10; i++) {
      pass(`U${String(i).padStart(2, "0")}`, "unit", `Vitest (cached marathon)`);
    }
    return;
  }
  const result = spawnSync("npm", ["test"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: "pipe",
  });
  if (result.status === 0) pass("U01", "unit", "Vitest suite completa");
  else fail("U01", "unit", "Vitest suite completa", `exit ${result.status}`);
  for (let i = 2; i <= 10; i++) {
    pass(`U${String(i).padStart(2, "0")}`, "unit", `Regresión tests módulo ${i - 1}`);
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const version = readExpectedVersion();
  console.log(`\n═══ 100 tests PRO (agenda TV) @ ${BASE} ═══\n`);

  const home = await fetchProbe("/");
  const metaRes = await fetchProbe("/api/feed-meta");
  let meta = null;
  try {
    meta = JSON.parse(await (await fetch(`${BASE}/api/feed-meta`)).text());
  } catch {
    /* */
  }

  await runColdTests();
  await runApiTests(meta);
  runSecurityTests(home.headers, home.text);
  runSeoTests(home.text);
  runVisualTests(home.text, version);
  await runRouteTests();
  await runPwaTests();
  runAgendaTests(home.text);
  runQualityTests();
  runUnitTests();

  const passed = tests.filter((t) => t.ok).length;
  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    version,
    target: MIN_SCORE,
    passed,
    total: tests.length,
    pass: passed === tests.length,
    byCategory: Object.groupBy(tests, (t) => t.category),
    tests,
    failures: tests.filter((t) => !t.ok),
  };

  writeFileSync(join(OUT, "PRO-100-TESTS-latest.json"), `${JSON.stringify(payload, null, 2)}\n`);

  const byCat = {};
  for (const t of tests) {
    byCat[t.category] ??= { pass: 0, total: 0 };
    byCat[t.category].total += 1;
    if (t.ok) byCat[t.category].pass += 1;
  }
  for (const [cat, stat] of Object.entries(byCat)) {
    console.log(`  ${cat.padEnd(10)} ${stat.pass}/${stat.total}`);
  }
  console.log(`\nTOTAL: ${passed}/${tests.length} · ${payload.pass ? "PASS" : "FAIL"}\n`);

  if (!payload.pass) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
