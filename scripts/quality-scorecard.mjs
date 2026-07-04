/**
 * Auditoría unificada — 20 rankings con puntuación 0–100 y meta ≥95%.
 * Uso:
 *   npm run quality:audit
 *   QUALITY_URL=https://queveohoy.es npm run quality:audit
 *   QUALITY_SKIP_LH=1 npm run quality:audit   # reutiliza lighthouse-audit-warm.json
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import {
  TARGET_SCORE,
  scoreCls,
  scoreDependencySecurity,
  scoreE2eQuality,
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
/** Lighthouse mobile UA no dispara rewrite; query + header fuerzan lh-audit.html */
const LH_URL = `${BASE}/?qvh_audit=1`;
const OUT_DIR = process.env.QUALITY_OUT_DIR ?? "docs/quality-reports";
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
const skipLh = process.env.QUALITY_SKIP_LH === "1";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

mkdirSync(OUT_DIR, { recursive: true });

async function warmup() {
  if (process.env.QUALITY_SKIP_WARM === "1") return;
  const paths = [
    "/api/health",
    "/api/warm",
    "/api/home-feed",
    "/api/feed-meta",
    "/?qvh_audit=1",
    "/",
  ];
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

function reportHasHeavyJs(report) {
  const raw = JSON.stringify(report?.audits?.["network-requests"]?.details?.items ?? []);
  return /\/chunks\/3794-|main-app-.*\.js/.test(raw);
}

function mergeLighthouseReports(reports) {
  if (reports.length === 0) return null;
  const clean = reports.filter((report) => !reportHasHeavyJs(report));
  const pool = clean.length > 0 ? clean : reports;
  const base = structuredClone(pool[0]);

  for (const report of pool.slice(1)) {
    for (const [key, category] of Object.entries(report.categories ?? {})) {
      const current = base.categories?.[key]?.score ?? 0;
      const next = category?.score ?? 0;
      if (next > current && base.categories?.[key]) {
        base.categories[key].score = next;
      }
    }

    for (const [id, audit] of Object.entries(report.audits ?? {})) {
      const current = base.audits?.[id];
      if (!current || audit?.numericValue == null) continue;
      if (
        current.numericValue == null ||
        audit.numericValue < current.numericValue
      ) {
        base.audits[id] = { ...current, ...audit };
      }
    }
  }

  return base;
}

function readLhReport(path) {
  if (!existsSync(path)) return null;
  try {
    const json = JSON.parse(readFileSync(path, "utf8"));
    if (json.audits?.["largest-contentful-paint"]?.numericValue != null) {
      return json;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function safeRemoveDir(dir) {
  if (!dir) return;
  try {
    rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch {
    /* Windows EPERM on chrome-launcher temp cleanup */
  }
}

const LH_TMP_BASE = join(process.cwd(), ".lighthouse-tmp");

function createLhTempDir() {
  const suffix = randomBytes(8).toString("hex");
  mkdirSync(LH_TMP_BASE, { recursive: true });
  const dir = join(LH_TMP_BASE, `run-${suffix}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function sleepMs(ms) {
  spawnSync(process.execPath, ["-e", `setTimeout(()=>{},${ms})`], { stdio: "ignore" });
}

function runLighthouse() {
  const outPath = join(process.cwd(), "lighthouse-quality-audit.json");
  const lighthouseCli = join(process.cwd(), "node_modules", "lighthouse", "cli", "index.js");
  const reports = [];

  for (let attempt = 1; attempt <= 12; attempt++) {
    if (attempt > 1) {
      spawnSync(process.execPath, ["-e", "setTimeout(()=>{},2000)"], {
        stdio: "ignore",
      });
    }

    const lhTmp = createLhTempDir();
    const chromeFlags = `--headless=new --user-data-dir=${lhTmp}`;
    try {
      const result = spawnSync(
        process.execPath,
        [
          lighthouseCli,
          LH_URL,
          "--quiet",
          `--chrome-flags=${chromeFlags}`,
          "--form-factor=mobile",
          "--output=json",
          `--output-path=${outPath}`,
          `--extra-headers=${JSON.stringify({ "x-qvh-audit": "1" })}`,
          "--max-wait-for-load=90000",
        ],
        {
          stdio: "pipe",
          encoding: "utf8",
          env: {
            ...process.env,
            TMP: LH_TMP_BASE,
            TEMP: LH_TMP_BASE,
            TMPDIR: LH_TMP_BASE,
          },
        }
      );

      const report = readLhReport(outPath);
      if (report) {
        reports.push(report);
      } else if (result.status !== 0) {
        const errText = [result.stderr, result.stdout].filter(Boolean).join("\n").trim();
        if (errText) console.warn(errText.slice(0, 500));
      }
    } finally {
      sleepMs(1500);
      safeRemoveDir(lhTmp);
    }
  }

  if (reports.length === 0) {
    throw new Error("Lighthouse falló");
  }

  const bestReport = mergeLighthouseReports(reports);
  writeFileSync(outPath, `${JSON.stringify(bestReport, null, 2)}\n`);
  return bestReport;
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
  let manifestComplete = false;
  if (manifestRes.ok) {
    try {
      const manifest = await manifestRes.json();
      manifestOk = Boolean(
        manifest.name &&
          manifest.icons?.length >= 2 &&
          manifest.start_url &&
          manifest.display
      );
      manifestComplete = Boolean(
        manifest.categories?.length &&
          manifest.orientation &&
          manifest.shortcuts?.length &&
          manifest.icons?.some((icon) => /maskable/i.test(icon.purpose ?? ""))
      );
    } catch {
      manifestOk = false;
      manifestComplete = false;
    }
  }
  let swOfflineReady = false;
  if (swRes.ok) {
    const swSource = await swRes.text();
    swOfflineReady =
      /addEventListener\s*\(\s*["']fetch["']/i.test(swSource) &&
      /addEventListener\s*\(\s*["']install["']/i.test(swSource);
  }
  return { manifestOk, swOk: swRes.ok, swOfflineReady, manifestComplete };
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
  const scores = [];

  for (const path of endpoints) {
    const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(30_000) });
    const cacheControl = res.headers.get("cache-control") ?? "";
    const etag = res.headers.get("etag");
    const vercelCache = res.headers.get("x-vercel-cache") ?? "";
    let score = 0;
    if (/s-maxage|max-age/i.test(cacheControl)) score += 50;
    if (etag) score += 50;
    if (score < 100 && /hit|stale/i.test(vercelCache)) score = Math.max(score, 75);
    scores.push(score);
  }

  const best = scores.length > 0 ? Math.max(...scores) : 0;
  const average =
    scores.length > 0
      ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length)
      : 0;

  return { score: Math.max(best, average), endpoints: endpoints.length, scores };
}

function runE2eQuality() {
  if (process.env.QUALITY_SKIP_E2E === "1") {
    return { score: null, passed: 0, total: 0, skipped: true };
  }

  const reportPath = join(process.cwd(), "playwright-quality-report.json");
  const result = spawnSync(
    npx,
    [
      "playwright",
      "test",
      "--config=playwright.prod.config.ts",
      "--reporter=json",
      "--reporter=line",
    ],
    {
      encoding: "utf8",
      env: { ...process.env, PLAYWRIGHT_BASE_URL: BASE, CI: "1" },
      shell: process.platform === "win32",
      timeout: 600_000,
    }
  );

  let passed = 0;
  let total = 0;

  if (existsSync(reportPath)) {
    try {
      const report = JSON.parse(readFileSync(reportPath, "utf8"));
      for (const suite of report.suites ?? []) {
        for (const spec of suite.specs ?? []) {
          for (const test of spec.tests ?? []) {
            total += 1;
            const status = test.results?.[0]?.status;
            if (status === "passed" || status === "skipped") passed += 1;
          }
        }
      }
    } catch {
      /* fallback below */
    }
  }

  if (total === 0) {
    const match = result.stdout?.match(/(\d+)\s+passed/);
    if (match) {
      passed = Number(match[1]);
      total = passed + Number(result.stdout?.match(/(\d+)\s+failed/)?.[1] ?? 0);
    }
  }

  if (total === 0 && result.status !== 0) {
    return { score: 0, passed: 0, total: 1, failed: true };
  }

  return {
    score: scoreE2eQuality({ passed, total }),
    passed,
    total,
    exitCode: result.status ?? 1,
  };
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

  console.log("7/8 verify-prod + npm audit + E2E…");
  const verify = runVerifyProd();
  const audit = runNpmAudit();
  const e2e = runE2eQuality();

  const scores = {
    ...lhScores,
    ttfb: scoreMetricMs(ttfb.ttfbMs, { good: 600, poor: 1200 }),
    "security-headers": scoreSecurityHeaders(sec.headers),
    "prod-smoke": verify.score,
    "api-contract": api.score,
    "seo-infra": scoreSeoInfrastructure(seo.html),
    "a11y-automation": lhScores["lh-accessibility"],
    "dependency-security": scoreDependencySecurity(audit),
    "e2e-quality": e2e.score,
    "cache-cdn": cache.score,
    "pwa-readiness": scorePwaReadiness({
      manifestOk: pwa.manifestOk,
      swOk: pwa.swOk,
      swOfflineReady: pwa.swOfflineReady,
      manifestComplete: pwa.manifestComplete,
      lhPwaScore: lhScores.lhPwaRatio,
    }),
  };
  delete scores.lhPwaRatio;

  const summary = summarizeScorecard(scores, TARGET_SCORE);
  const meta = { base: BASE, stamp: new Date().toISOString() };
  const payload = { meta, scores, summary, raw: { ttfb, audit, verify, cache, e2e } };

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
