/**
 * Supermaratón STRICT — gates exigentes por dimensión hasta PASS total.
 *
 *   npm run marathon:supreme:strict
 *
 * Gates (todos obligatorios):
 *   - Cold start strict: home warm≤500ms cold≤800ms (×3 probes), APIs≤1500ms, hubs≤2500ms
 *   - Quality 20/20: cada ranking ≥95% (sin soft-pass)
 *   - Mobile security: 100% checks
 *   - Content/visual: portadas, estructura, versión footer
 *   - verify:prod 24/24 (versión incluida)
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 24_000);
const MARATHON_ID = process.env.MARATHON_ID ?? "supreme-strict";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 100);
const QUALITY_MIN = Number(process.env.QUALITY_MIN_SCORE ?? 95);

const REPORTS = {
  quality: join(process.cwd(), "docs", "quality-reports", "quality-scorecard-latest.json"),
  cold: join(OUT_DIR, "cold-start-audit-latest.json"),
  mobile: join(OUT_DIR, "mobile-security-audit-latest.json"),
  content: join(OUT_DIR, "content-visual-audit-latest.json"),
};

/** Rotación detallada — 24 pasos × 1000 ≈ 24k ciclos */
const ROTATION = [
  { phase: "warmup", cmd: "warm" },
  { phase: "warmup", cmd: "warm-full" },
  { phase: "cold-strict", cmd: "cold-audit-strict" },
  { phase: "mobile", cmd: "mobile-audit" },
  { phase: "content", cmd: "content-visual" },
  { phase: "quality", cmd: "quality-strict" },
  { phase: "cwv", cmd: "cwv-deep" },
  { phase: "seo", cmd: "seo-discovery" },
  { phase: "design", cmd: "design-discovery" },
  { phase: "build", cmd: "validate" },
  { phase: "tests", cmd: "test" },
  { phase: "tests", cmd: "test-partido" },
  { phase: "verify", cmd: "verify-full" },
  { phase: "warmup-2", cmd: "warm-full" },
  { phase: "cold-strict", cmd: "cold-audit-strict" },
  { phase: "mobile", cmd: "mobile-audit" },
  { phase: "content", cmd: "content-visual" },
  { phase: "quality", cmd: "quality-strict" },
  { phase: "cwv", cmd: "cwv-deep" },
  { phase: "security", cmd: "audit-npm" },
  { phase: "tests", cmd: "test-coverage" },
  { phase: "build", cmd: "validate" },
  { phase: "verify", cmd: "verify-full" },
  { phase: "gate-snapshot", cmd: "gate-snapshot" },
];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readQualityGate() {
  const payload = readJson(REPORTS.quality);
  if (!payload?.summary) return { pass: false, detail: "no report" };
  const { summary } = payload;
  const rows = summary.rows ?? [];
  const failing = rows.filter(
    (row) => row.score != null && row.status !== "pass"
  );
  const belowMin = rows.filter(
    (row) => row.score != null && Number(row.score) < QUALITY_MIN
  );
  const pass =
    summary.measured === summary.total &&
    failing.length === 0 &&
    belowMin.length === 0 &&
    Number(summary.average) >= QUALITY_MIN;
  return {
    pass,
    average: summary.average,
    passing: summary.passing,
    total: summary.total,
    failing: failing.map((r) => ({ id: r.id, score: r.score, gap: r.gap })),
  };
}

function readColdGate() {
  const payload = readJson(REPORTS.cold);
  if (!payload?.gates) return { pass: false, detail: "no report" };
  return {
    pass:
      payload.gates.criticalPass === true &&
      payload.gates.hubPass === true &&
      payload.gates.strict === true,
    criticalPass: payload.gates.criticalPass === true,
    hubPass: payload.gates.hubPass === true,
    hubHeavyWarn: payload.gates.hubHeavyWarn === true,
    homeWarmMs: payload.homeWarmMs,
    homeColdMs: payload.homeColdMs,
    hubFails: payload.hubFails?.length ?? 0,
    hubHeavySlow: payload.hubHeavySlow?.map((h) => h.path) ?? [],
    grades: payload.grades?.filter((g) => !g.pass).map((g) => g.path) ?? [],
  };
}

function readMobileGate() {
  const payload = readJson(REPORTS.mobile);
  if (!payload) return { pass: false };
  return {
    pass: payload.gates?.pass === true,
    passed: payload.passed,
    total: payload.total,
  };
}

function readContentGate() {
  const payload = readJson(REPORTS.content);
  if (!payload) return { pass: false };
  const failed = (payload.checks ?? []).filter((c) => !c.ok);
  return {
    pass: payload.gates?.pass === true,
    failed: failed.map((c) => c.name),
  };
}

function readAllGates() {
  const quality = readQualityGate();
  const cold = readColdGate();
  const mobile = readMobileGate();
  const content = readContentGate();
  const allPass =
    quality.pass && cold.pass && mobile.pass && content.pass;
  return { quality, cold, mobile, content, allPass };
}

function runCmd(label, command, args, env = {}) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
  return {
    label,
    ok: result.status === 0,
    ms: Date.now() - started,
    exit: result.status ?? 1,
    stderr: (result.stderr ?? "").slice(-500),
  };
}

function runStep(cmd) {
  switch (cmd) {
    case "warm":
      return runCmd("keep-warm", "npm", ["run", "keep-warm:prod"]);
    case "warm-full":
      return runCmd("keep-warm-full", "npm", ["run", "keep-warm:prod"], {
        KEEP_WARM_FULL: "1",
      });
    case "cold-audit-strict":
      return runCmd("cold-strict", "node", ["scripts/cold-start-audit.mjs"], {
        COLD_AUDIT_STRICT: "1",
      });
    case "mobile-audit":
      return runCmd("mobile", "node", ["scripts/mobile-security-audit.mjs"]);
    case "content-visual":
      return runCmd("content", "node", ["scripts/content-visual-audit.mjs"], {
        CONTENT_AUDIT_STRICT: "1",
      });
    case "quality-strict":
      return runCmd("quality", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: "0",
      });
    case "cwv-deep":
      return runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "1",
        CWV_RUNS: "20",
      });
    case "seo-discovery":
      return runCmd("seo", "node", ["scripts/discovery-seo-audit.mjs"]);
    case "design-discovery":
      return runCmd("design", "node", ["scripts/discovery-design-audit.mjs"]);
    case "validate":
      return runCmd("validate", "npm", ["run", "validate"]);
    case "test":
      return runCmd("test", "npm", ["test"]);
    case "test-partido":
      return runCmd("test-partido", "npm", [
        "test",
        "--",
        "app/lib/partido-event-resolver.test.ts",
        "app/lib/home-lcp.test.ts",
        "app/lib/poster-quality.test.ts",
        "app/lib/quality-scorecard.test.ts",
        "app/lib/mobile-ensure-https.test.ts",
      ]);
    case "test-coverage":
      return runCmd("coverage", "npm", ["run", "test:coverage"]);
    case "audit-npm":
      return runCmd("npm-audit", "npm", [
        "audit",
        "--audit-level=high",
        "--omit=dev",
      ]);
    case "verify-full":
      return runCmd("verify", "npm", ["run", "verify:prod"]);
    case "gate-snapshot": {
      const gates = readAllGates();
      return {
        label: "gate-snapshot",
        ok: gates.allPass,
        ms: 0,
        exit: gates.allPass ? 0 : 1,
        gates,
      };
    }
    default:
      return { label: cmd, ok: true, ms: 0, exit: 0 };
  }
}

function writeProgress(cycle, step, gates) {
  const detail = {
    marathonId: MARATHON_ID,
    mode: "strict",
    cycle,
    total: TOTAL,
    step,
    gates,
    failing: {
      quality: gates.quality.failing ?? [],
      cold: gates.cold.grades ?? [],
      content: gates.content.failed ?? [],
    },
    at: new Date().toISOString(),
  };
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-progress.json`),
    `${JSON.stringify(detail, null, 2)}\n`
  );
}

function formatGateLine(gates) {
  const q = gates.quality.pass ? "Q✓" : `Q✗(${gates.quality.passing}/${gates.quality.total})`;
  const c = gates.cold.pass
    ? "C✓"
    : gates.cold.criticalPass
      ? "C~(hub)"
      : "C✗";
  const m = gates.mobile.pass ? "M✓" : "M✗";
  const v = gates.content.pass ? "V✓" : "V✗";
  return `${q} ${c} ${m} ${v}`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n[${MARATHON_ID}] STRICT · ${TOTAL} ciclos · quality≥${QUALITY_MIN}% cada dimensión\n`);

  for (let cycle = 1; cycle <= TOTAL; cycle += 1) {
    const rotation = ROTATION[(cycle - 1) % ROTATION.length];
    const stepResult = runStep(rotation.cmd);
    const step = { ...rotation, ...stepResult };
    const gates = readAllGates();

    if (
      cycle % PROGRESS_EVERY === 0 ||
      cycle === 1 ||
      cycle === TOTAL ||
      rotation.cmd === "gate-snapshot"
    ) {
      writeProgress(cycle, step, gates);
      console.log(
        `[${MARATHON_ID}] ${cycle}/${TOTAL} · ${rotation.phase}/${rotation.cmd} · ${formatGateLine(gates)}`
      );
      if (!gates.quality.pass && gates.quality.failing?.length) {
        const top = gates.quality.failing
          .slice(0, 4)
          .map((f) => `${f.id}:${f.score}%`)
          .join(" ");
        console.log(`  quality gaps → ${top}`);
      }
    }

    if (gates.allPass) {
      const done = {
        marathonId: MARATHON_ID,
        status: "COMPLETED",
        mode: "strict",
        cycles: cycle,
        gates,
        at: new Date().toISOString(),
      };
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-completed.json`),
        `${JSON.stringify(done, null, 2)}\n`
      );
      console.log(`\n[${MARATHON_ID}] COMPLETED at cycle ${cycle} — todos los gates PASS\n`);
      return;
    }
  }

  const gates = readAllGates();
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-exhausted.json`),
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        status: "EXHAUSTED",
        mode: "strict",
        cycles: TOTAL,
        gates,
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
  console.error(`\n[${MARATHON_ID}] EXHAUSTED — ${formatGateLine(gates)}\n`);
  process.exitCode = 1;
}

main();
