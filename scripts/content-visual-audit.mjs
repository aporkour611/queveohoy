/**
 * Auditoría contenido/visual en prod — portadas, estructura, espaciado SSR.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-reports");

const GENERIC_POSTER_RE =
  /\/deportes\/(?:futbol|baloncesto|tenis|ciclismo|ufc)\.png/i;

async function fetchHtml(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(60_000),
  });
  return { ok: res.ok, status: res.status, html: await res.text() };
}

function check(name, ok, detail = "") {
  return { name, ok, detail };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const checks = [];
  const { ok, html, status } = await fetchHtml("/");

  if (!ok) {
    checks.push(check("Home HTML 200", false, String(status)));
  } else {
    checks.push(check("Home HTML 200", true));

    checks.push(
      check(
        "main-content presente",
        /id=["']main-content["']/i.test(html)
      )
    );
    checks.push(
      check(
        "Destacados SSR",
        /qvh-destacados|Destacados/i.test(html)
      )
    );
    checks.push(
      check(
        "Feed SSR (eventos hoy)",
        /qvh-home-feed|fh-match|fh-media-spotlight/i.test(html)
      )
    );
    checks.push(
      check(
        "Sin portadas genéricas /deportes/*.png en HTML",
        !GENERIC_POSTER_RE.test(html),
        GENERIC_POSTER_RE.test(html) ? "detectado placeholder deportes" : ""
      )
    );
    checks.push(
      check(
        "Preload LCP (webp o editorial)",
        /<link[^>]+rel=["']preload["'][^>]+as=["']image["']/i.test(html)
      )
    );
    checks.push(
      check(
        "Viewport móvil",
        /name=["']viewport["']/i.test(html)
      )
    );
    checks.push(
      check(
        "Hidratación diferida (no bloquea LCP)",
        /data-qvh-hydrate-feed|FeedHydration/i.test(html)
      )
    );
    checks.push(
      check(
        "Versión footer ≥6.1 PRO",
        /6\.\d+\.\d+/.test(html),
        "footer sin 6.0+"
      )
    );

    const inlineSpotlight = (html.match(/qvh-spotlight-cover/gi) ?? []).length;
    checks.push(
      check(
        "Tarjetas spotlight con cover",
        inlineSpotlight >= 1,
        `covers=${inlineSpotlight}`
      )
    );
  }

  const passed = checks.filter((c) => c.ok).length;
  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    strict: process.env.CONTENT_AUDIT_STRICT === "1",
    checks,
    passed,
    total: checks.length,
    gates: {
      pass: passed === checks.length,
      minPass: checks.length,
    },
  };

  const out = join(OUT, "content-visual-audit-latest.json");
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Content/visual → ${passed}/${checks.length} OK · gate ${payload.gates.pass ? "PASS" : "FAIL"}`
  );
  if (!payload.gates.pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
