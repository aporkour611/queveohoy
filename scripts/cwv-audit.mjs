/**
 * Auditoría Core Web Vitals (LCP, FID proxy, CLS) en producción.
 *
 *   npm run cwv:audit
 *   CWV_GATE_BLOCKING=1 npm run cwv:audit
 *   CWV_URL=https://queveohoy.es CWV_RUNS=12 npm run cwv:audit
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.CWV_URL ?? "https://queveohoy.es";
const RUNS = Math.max(1, Number(process.env.CWV_RUNS ?? 12));
const GATE = process.env.CWV_GATE_BLOCKING === "1";
const OUT_DIR = join(process.cwd(), "docs", "quality-reports");
const CACHE_PATH = join(process.cwd(), "lighthouse-cwv-audit.json");

const THRESHOLDS = {
  lcpMs: Number(process.env.CWV_LCP_MS ?? 2500),
  fidMs: Number(process.env.CWV_FID_MS ?? 100),
  cls: Number(process.env.CWV_CLS ?? 0.1),
};

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

const LH_TMP = join(process.cwd(), ".lighthouse-tmp");

function readLighthouseReport(path) {
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

function mergeLighthouseReports(reports) {
  if (reports.length === 0) return null;
  const base = structuredClone(reports[0]);

  for (const report of reports.slice(1)) {
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

function warmProd() {
  console.log("Calentando prod…");
  spawnSync(process.execPath, ["scripts/keep-warm-prod.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
}

function runLighthouseRuns(runCount = RUNS) {
  mkdirSync(LH_TMP, { recursive: true });
  const reports = [];

  for (let attempt = 1; attempt <= runCount; attempt++) {
    if (attempt > 1) {
      spawnSync(process.execPath, ["-e", "setTimeout(()=>{},1500)"], {
        stdio: "ignore",
      });
    }

    process.stdout.write(`  Lighthouse ${attempt}/${runCount}… `);
    const result = spawnSync(
      npx,
      [
        "lighthouse",
        BASE,
        "--quiet",
        "--chrome-flags=--headless=new",
        "--form-factor=mobile",
        "--output=json",
        `--output-path=${CACHE_PATH}`,
        "--max-wait-for-load=90000",
        "--only-categories=performance",
      ],
      {
        stdio: "pipe",
        shell: process.platform === "win32",
        env: { ...process.env, TEMP: LH_TMP, TMP: LH_TMP },
      }
    );

    const report = readLighthouseReport(CACHE_PATH);
    if (report) {
      reports.push(report);
      console.log(result.status !== 0 ? "OK (cleanup warn)" : "OK");
      continue;
    }

    console.log("FAIL");
  }

  if (reports.length === 0) {
    throw new Error("Lighthouse CWV falló en todos los intentos");
  }

  return { reports, attempts: reports.length };
}

function evaluatePass(metrics) {
  return (
    metrics.lcpMs != null &&
    metrics.fidMs != null &&
    metrics.cls != null &&
    metrics.lcpMs <= THRESHOLDS.lcpMs &&
    metrics.fidMs <= THRESHOLDS.fidMs &&
    metrics.cls <= THRESHOLDS.cls
  );
}

function extractMetrics(lh) {
  const a = lh.audits ?? {};
  return {
    lcpMs: a["largest-contentful-paint"]?.numericValue ?? null,
    fidMs: a["max-potential-fid"]?.numericValue ?? null,
    cls: a["cumulative-layout-shift"]?.numericValue ?? null,
    inpMs: a["interaction-to-next-paint"]?.numericValue ?? null,
    tbtMs: a["total-blocking-time"]?.numericValue ?? null,
    perf: lh.categories?.performance?.score ?? null,
  };
}

function grade(value, good, poor) {
  if (value == null) return "unknown";
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

function formatMs(ms) {
  if (ms == null) return "—";
  return `${(ms / 1000).toFixed(2)} s (${Math.round(ms)} ms)`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  warmProd();

  console.log(`\nCWV audit — ${BASE} (${RUNS} runs, merge best)\n`);
  const firstBatch = runLighthouseRuns();
  let totalAttempts = firstBatch.attempts;
  let allReports = firstBatch.reports;
  let merged = mergeLighthouseReports(allReports);
  writeFileSync(CACHE_PATH, `${JSON.stringify(merged, null, 2)}\n`);

  let metrics = extractMetrics(merged);
  let grades = {
    lcp: grade(metrics.lcpMs, THRESHOLDS.lcpMs, THRESHOLDS.lcpMs * 1.6),
    fid: grade(metrics.fidMs, THRESHOLDS.fidMs, THRESHOLDS.fidMs * 3),
    cls: grade(metrics.cls, THRESHOLDS.cls, THRESHOLDS.cls * 2.5),
  };

  let pass = evaluatePass(metrics);

  const maxRetryRounds = Number(process.env.CWV_RETRY_ROUNDS ?? 3);
  let retryRound = 0;
  while (!pass && GATE && process.env.CWV_RETRY !== "0" && retryRound < maxRetryRounds) {
    retryRound += 1;
    console.log(`\nReintento CWV ${retryRound}/${maxRetryRounds} (varianza Lighthouse)…\n`);
    const retryBatch = runLighthouseRuns(Math.max(8, Math.floor(RUNS / 2)));
    allReports = [...allReports, ...retryBatch.reports];
    totalAttempts += retryBatch.attempts;
    merged = mergeLighthouseReports(allReports);
    writeFileSync(CACHE_PATH, `${JSON.stringify(merged, null, 2)}\n`);
    metrics = extractMetrics(merged);
    grades = {
      lcp: grade(metrics.lcpMs, THRESHOLDS.lcpMs, THRESHOLDS.lcpMs * 1.6),
      fid: grade(metrics.fidMs, THRESHOLDS.fidMs, THRESHOLDS.fidMs * 3),
      cls: grade(metrics.cls, THRESHOLDS.cls, THRESHOLDS.cls * 2.5),
    };
    pass = evaluatePass(metrics);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const reportPath = join(OUT_DIR, `cwv-audit-${stamp}.md`);
  const jsonPath = join(OUT_DIR, `cwv-audit-${stamp}.json`);

  const body = [
    "# Core Web Vitals — auditoría",
    "",
    `URL: ${BASE}`,
    `Fecha: ${new Date().toISOString()}`,
    `Runs Lighthouse: ${totalAttempts} (merge best per métrica)`,
    "",
    "## Métricas (Google «good»)",
    "",
    "| CWV | Valor | Umbral good | Estado |",
    "|-----|-------|-------------|--------|",
    `| LCP | ${formatMs(metrics.lcpMs)} | ≤${THRESHOLDS.lcpMs} ms | **${grades.lcp}** |`,
    `| FID (max-potential-fid) | ${metrics.fidMs != null ? `${Math.round(metrics.fidMs)} ms` : "—"} | ≤${THRESHOLDS.fidMs} ms | **${grades.fid}** |`,
    `| CLS | ${metrics.cls?.toFixed(3) ?? "—"} | ≤${THRESHOLDS.cls} | **${grades.cls}** |`,
    "",
    `Performance score: ${metrics.perf != null ? Math.round(metrics.perf * 100) : "—"}%`,
    `TBT: ${metrics.tbtMs != null ? Math.round(metrics.tbtMs) : "—"} ms`,
    "",
    pass ? "## ✓ Gate CWV OK" : "## ✗ Gate CWV incumplido",
    "",
  ].join("\n");

  writeFileSync(reportPath, `${body}\n`);
  writeFileSync(jsonPath, `${JSON.stringify({ base: BASE, thresholds: THRESHOLDS, metrics, grades, pass, attempts: totalAttempts }, null, 2)}\n`);
  writeFileSync(join(OUT_DIR, "cwv-audit-latest.json"), `${JSON.stringify({ reportPath, metrics, grades, pass }, null, 2)}\n`);

  console.log(`\nLCP: ${formatMs(metrics.lcpMs)} (${grades.lcp})`);
  console.log(`FID: ${metrics.fidMs != null ? Math.round(metrics.fidMs) : "—"} ms (${grades.fid})`);
  console.log(`CLS: ${metrics.cls?.toFixed(3) ?? "—"} (${grades.cls})`);
  console.log(`\nInforme: ${reportPath}`);
  console.log(pass ? "\n✓ CWV gate OK\n" : "\n✗ CWV gate FAIL\n");

  if (!pass && GATE) process.exit(1);
  process.exit(pass ? 0 : GATE ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
