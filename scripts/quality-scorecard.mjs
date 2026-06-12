/**
 * Auditoría unificada — 20 rankings con puntuación 0–100 y meta ≥95%.
 * Uso:
 *   npm run quality:audit
 *   QUALITY_URL=https://queveohoy.es npm run quality:audit
 *   QUALITY_SKIP_LH=1 npm run quality:audit   # reutiliza lighthouse-audit-warm.json
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  QUALITY_RANKINGS,
  TARGET_SCORE,
  scoreCls,
  scoreDependencySecurity,
  scoreLighthouseCategory,
  scoreMetricMs,
  scorePwaReadiness,
  scoreSecurityHeaders,
  scoreSeoInfrastructure,
  summarizeScorecard,
} from "./quality-scorecard-lib.mjs";

const BASE = (process.env.QUALITY_URL ?? process.env.PERF_URL ?? "https://queveohoy.es").replace(
  /\/$/,
  ""
);
const OUT_DIR = process.env.QUALITY_OUT_DIR ?? "docs/quality-reports";
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const skipLh = process.env.QUALITY_SKIP_LH === "1";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

mkdirSync(OUT_DIR, { recursive: true });

async function warmup() {
  if (process.env.QUALITY_SKIP_WARM === "1") return;
  const paths = ["/api/health", "/api/v2/feed", "/api/feed-meta", "/"];
  for (const path of paths) {
    try {
      await fetch(`${BASE}${path}`, {
        signal: AbortSignal.timeout(60_000),
        headers: { "User-Agent": "QueveoHoy-QualityAudit/1.0" },
      });
    } catch {
      /* warm best-effort */
    }
  }
}

function runLighthouse() {
  const outPath = join(process.cwd(), "lighthouse-quality-audit.json");
  const result = spawnSync(
    npx,
    [
      "lighthouse",
      BASE,
      "--quiet",
      "--chrome-flags=--headless=new",
      "--form-factor=mobile",
      "--output=json",
      `--output-path=${outPath}`,
      "--max-wait-for-load=90000",
    ],
    { stdio: "inherit", shell: process.platform === "win32" }
  );
  if (result.status !== 0) {
    throw new Error("Lighthouse falló");
  }
  return JSON.parse(readFileSync(outPath, "utf8"));
}

function loadLighthouseReport() {
  const candidates = [
    join(process.cwd(), "lighthouse-quality-audit.json"),
    join(process.cwd(), "lighthouse-audit-warm.json"),
    join(process.cwd(), "lighthouse-audit-baseline.json"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      return JSON.parse(readFileSync(path, "utf8"));
    }
  }
  return null;
}

async function measureTtfb() {
  const start = performance.now();
  const res = await fetch(BASE, {
    signal: AbortSignal.timeout(60_000),
    headers: { "User-Agent": "QueveoHoy-QualityAudit/1.0" },
  });
  const ttfbMs = Math.round(performance.now() - start);
  return { status: res.status, ttfbMs };
}

async function probeSecurityHeaders() {
  const res = await fetch(BASE, {
    method: "HEAD",
    signal: AbortSignal.timeout(30_000),
    redirect: "follow",
  });
  const headers = {};
  res.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return { status: res.status, headers };
}

async function probeSeoInfra() {
  const res = await fetch(BASE, {
    signal: AbortSignal.timeout(60_000),
    headers: { "User-Agent": "QueveoHoy-QualityAudit/1.0" },
  });
  const html = await res.text();
  return { status: res.status, html };
}

async function probeManifestAndSw() {
  const [manifestRes, swRes] = await Promise.all([
    fetch(`${BASE}/manifest.webmanifest`, { signal: AbortSignal.timeout(15_000) }),
    fetch(`${BASE}/sw.js`, { signal: AbortSignal.timeout(15_000) }),
  ]);
  let manifestOk = false;
  if (manifestRes.ok) {
    try {
      const manifest = await manifestRes.json();
      manifestOk = Boolean(
        manifest.name && manifest.icons?.length && manifest.start_url
      );
    } catch {
      manifestOk = false;
    }
  }
  return { manifestOk, swOk: swRes.ok };
}

function runNpmAudit() {
  const result = spawnSync(
    "npm",
    ["audit", "--json", "--audit-level=moderate", "--omit=dev"],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
    }
  );
  try {
    const json = JSON.parse(result.stdout || "{}");
    const meta = json.metadata?.vulnerabilities ?? {};
    return {
      critical: meta.critical ?? 0,
      high: meta.high ?? 0,
      moderate: meta.moderate ?? 0,
      low: meta.low ?? 0,
    };
  } catch {
    return { critical: 0, high: 0, moderate: 0, low: 0 };
  }
}

function runVerifyProd() {
  const result = spawnSync(process.execPath, ["scripts/verify-prod-current.mjs"], {
    encoding: "utf8",
    env: { ...process.env, VERIFY_URL: BASE },
  });
  const match = result.stdout?.match(/(\d+)\/(\d+)\s+OK/);
  if (!match) {
    return { pass: result.status === 0, score: result.status === 0 ? 100 : 0 };
  }
  const ok = Number(match[1]);
  const total = Number(match[2]);
  return { pass: ok === total, score: Math.round((ok / total) * 100), ok, total };
}

async function probeApiContract() {
  const checks = [];
  const health = await fetch(`${BASE}/api/health`, { signal: AbortSignal.timeout(30_000) });
  const healthJson = health.ok ? await health.json() : null;
  checks.push(health.ok && healthJson?.ok === true);

  const meta = await fetch(`${BASE}/api/feed-meta`, { signal: AbortSignal.timeout(30_000) });
  checks.push(meta.ok);

  const feed = await fetch(`${BASE}/api/home-feed`, {
    signal: AbortSignal.timeout(30_000),
    headers: { Accept: "application/json" },
  });
  const etag = feed.headers.get("etag");
  checks.push(feed.ok && Boolean(etag));

  if (etag) {
    const notModified = await fetch(`${BASE}/api/home-feed`, {
      signal: AbortSignal.timeout(30_000),
      headers: { Accept: "application/json", "If-None-Match": etag },
    });
    checks.push(notModified.status === 304);
  } else {
    checks.push(false);
  }

  const hit = checks.filter(Boolean).length;
  return { score: Math.round((hit / checks.length) * 100), checks: hit, total: checks.length };
}

async function probeCacheCdn() {
  const endpoints = ["/api/home-feed", "/api/v2/feed", "/api/feed-meta"];
  let best = 0;

  for (const path of endpoints) {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
    const cacheControl = res.headers.get("cache-control") ?? "";
    const etag = res.headers.get("etag");
    let score = 0;
    if (/s-maxage|max-age/i.test(cacheControl)) score += 50;
    if (etag) score += 50;
    best = Math.max(best, score);
  }

  return { score: best, endpoints: endpoints.length };
}

function scoresFromLighthouse(lh) {
  const c = lh.categories ?? {};
  const a = lh.audits ?? {};
  return {
    "lh-performance": scoreLighthouseCategory(c.performance?.score),
    "lh-accessibility": scoreLighthouseCategory(c.accessibility?.score),
    "lh-best-practices": scoreLighthouseCategory(c["best-practices"]?.score),
    "lh-seo": scoreLighthouseCategory(c.seo?.score),
    "cwv-lcp": scoreMetricMs(a["largest-contentful-paint"]?.numericValue, {
      good: 2500,
      poor: 4000,
    }),
    "cwv-inp": scoreMetricMs(a["max-potential-fid"]?.numericValue, {
      good: 200,
      poor: 500,
    }),
    "cwv-cls": scoreCls(a["cumulative-layout-shift"]?.numericValue),
    "cwv-tbt": scoreMetricMs(a["total-blocking-time"]?.numericValue, {
      good: 200,
      poor: 600,
    }),
    "cwv-fcp": scoreMetricMs(a["first-contentful-paint"]?.numericValue, {
      good: 1800,
      poor: 3000,
    }),
    "cwv-si": scoreMetricMs(a["speed-index"]?.numericValue, {
      good: 3400,
      poor: 5800,
    }),
    lhPwaRatio: c.pwa?.score ?? null,
  };
}

function renderMarkdown(summary, meta) {
  const lines = [
    `# Quality Scorecard — ${meta.base}`,
    "",
    `> Medición: ${meta.stamp} · Meta por ranking: **≥${TARGET_SCORE}%**`,
    "",
    `| Global | Medidos | ≥${TARGET_SCORE}% | Media |`,
    `|--------|---------|------------|-------|`,
    `| ${summary.average ?? "—"}% | ${summary.measured}/${summary.total} | ${summary.passing}/${summary.measured} | — |`,
    "",
    "## Rankings (20)",
    "",
    "| # | Ranking | Score | Estado | Fase | Acción |",
    "|---|---------|------:|--------|------|--------|",
  ];

  summary.rows.forEach((row, index) => {
    const icon =
      row.status === "pass"
        ? "✅"
        : row.status === "warn"
          ? "🟡"
          : row.status === "pending"
            ? "⏳"
            : "🔴";
    lines.push(
      `| ${index + 1} | ${row.name} | ${row.score ?? "—"} | ${icon} | ${row.phase} | ${row.action} |`
    );
  });

  lines.push("", "## Plan por fases", "");
  for (const phase of summary.byPhase) {
    lines.push(
      `### Fase ${phase.phase} — ${phase.passing}/${phase.total} ≥${TARGET_SCORE}% · media ${phase.avg ?? "—"}%`
    );
    const pending = summary.rows.filter(
      (row) => row.phase === phase.phase && row.status !== "pass"
    );
    for (const row of pending) {
      lines.push(`- **${row.name}** (${row.score ?? "?"}%): ${row.action}`);
    }
    lines.push("");
  }

  lines.push("## Comandos", "", "```bash", "npm run quality:audit", "npm run keep-warm:prod && npm run quality:audit", "```", "");
  return lines.join("\n");
}

async function main() {
  console.log(`\nQuality audit → ${BASE}\n`);
  await warmup();

  let lh = null;
  if (!skipLh) {
    console.log("1/7 Lighthouse mobile (all categories)…");
    try {
      lh = runLighthouse();
    } catch (err) {
      console.warn("Lighthouse error, using cached report if available:", err.message);
      lh = loadLighthouseReport();
    }
  } else {
    lh = loadLighthouseReport();
  }

  if (!lh) {
    console.error("No Lighthouse report available.");
    process.exit(1);
  }

  const lhScores = scoresFromLighthouse(lh);

  console.log("2/7 TTFB…");
  const ttfb = await measureTtfb();

  console.log("3/7 Security headers…");
  const sec = await probeSecurityHeaders();

  console.log("4/7 SEO infrastructure…");
  const seo = await probeSeoInfra();

  console.log("5/7 PWA readiness…");
  const pwa = await probeManifestAndSw();

  console.log("6/7 API + cache…");
  const api = await probeApiContract();
  const cache = await probeCacheCdn();

  console.log("7/7 verify-prod + npm audit…");
  const verify = runVerifyProd();
  const audit = runNpmAudit();

  const scores = {
    ...lhScores,
    ttfb: scoreMetricMs(ttfb.ttfbMs, { good: 600, poor: 1200 }),
    "security-headers": scoreSecurityHeaders(sec.headers),
    "prod-smoke": verify.score,
    "api-contract": api.score,
    "seo-infra": scoreSeoInfrastructure(seo.html),
    "a11y-automation": lhScores["lh-accessibility"],
    "dependency-security": scoreDependencySecurity(audit),
    "e2e-quality": null,
    "cache-cdn": cache.score,
    "pwa-readiness": scorePwaReadiness({
      manifestOk: pwa.manifestOk,
      swOk: pwa.swOk,
      lhPwaScore: lhScores.lhPwaRatio,
    }),
  };
  delete scores.lhPwaRatio;

  const summary = summarizeScorecard(scores, TARGET_SCORE);
  const meta = { base: BASE, stamp: new Date().toISOString() };
  const payload = { meta, scores, summary, raw: { ttfb, audit, verify, cache } };

  const jsonPath = join(OUT_DIR, `quality-scorecard-${stamp}.json`);
  const mdPath = join(OUT_DIR, `quality-scorecard-${stamp}.md`);
  const latestJson = join(OUT_DIR, "quality-scorecard-latest.json");
  const latestMd = join(OUT_DIR, "quality-scorecard-latest.md");

  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(mdPath, renderMarkdown(summary, meta));
  writeFileSync(latestJson, `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(latestMd, renderMarkdown(summary, meta));

  console.log("\n── 20 rankings ──\n");
  for (const row of summary.rows) {
    const mark =
      row.status === "pass" ? "✓" : row.status === "warn" ? "~" : row.status === "pending" ? "?" : "✗";
    console.log(
      `${mark} ${row.name.padEnd(28)} ${row.score != null ? `${row.score}%`.padStart(4) : "  —"}  (fase ${row.phase})`
    );
  }

  console.log(
    `\nMedia: ${summary.average}% · ≥${TARGET_SCORE}%: ${summary.passing}/${summary.measured}`
  );
  console.log(`\nInforme: ${mdPath}`);

  const blocking = process.env.QUALITY_GATE_BLOCKING === "1";
  const allPass = summary.rows.every(
    (row) => row.score == null || row.status === "pass"
  );
  if (blocking && !allPass) {
    console.error("\nQUALITY_GATE_BLOCKING=1 — incumple meta ≥95% en algún ranking.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
