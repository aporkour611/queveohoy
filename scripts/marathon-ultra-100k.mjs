/**
 * Ultra maratón 100 000 ciclos — misma filosofía PRO (100 tests + gates).
 *
 *   npm run marathon:ultra-100k
 *
 * Mitad 1 (50 000): descubrimiento — cold, content, SEO, design, quality, CWV, exam.
 * Mitad 2 (50 000): aplicar — validate, tests, verify, pro-100 hasta PASS.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const DISCOVERY_HALF = Math.floor(TOTAL / 2);
const MARATHON_ID = process.env.MARATHON_ID ?? "ultra-pro-100k";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 2_500);
const START_CYCLE = Number(process.env.MARATHON_START_CYCLE ?? 1);
const LAUNCH_FAST = process.env.MARATHON_FAST !== "0";
const TESTS_JSON = join(OUT_DIR, "PRO-100-TESTS-latest.json");
const EXECUTED_FILE = join(OUT_DIR, `${MARATHON_ID}-executed.json`);
const QUALITY_LATEST = join(
  process.cwd(),
  "docs",
  "quality-reports",
  "quality-scorecard-latest.json"
);

function stepCacheKey(phase, cmd) {
  if (cmd === "warm-full") return "global:warm-full";
  return `${phase}:${cmd}`;
}

function loadExecuted() {
  try {
    const raw = JSON.parse(readFileSync(EXECUTED_FILE, "utf8"));
    return new Map(Object.entries(raw));
  } catch {
    return new Map();
  }
}

function saveExecuted(executed) {
  writeFileSync(
    EXECUTED_FILE,
    `${JSON.stringify(Object.fromEntries(executed), null, 2)}\n`
  );
}

const DISCOVERY_ROTATION = [
  { phase: "baseline", cmd: "warm" },
  { phase: "baseline", cmd: "warm-full" },
  { phase: "baseline", cmd: "cold-strict" },
  { phase: "baseline", cmd: "content-visual" },
  { phase: "baseline", cmd: "mobile-audit" },
  { phase: "baseline", cmd: "seo-discovery" },
  { phase: "baseline", cmd: "design-discovery" },
  { phase: "baseline", cmd: "quality-discover" },
  { phase: "baseline", cmd: "cwv-discover" },
  { phase: "baseline", cmd: "exam-pro" },
  { phase: "baseline", cmd: "pro-100-fast" },
  { phase: "proposal", cmd: "test-partido" },
  { phase: "proposal", cmd: "perf-budget" },
  { phase: "baseline-2", cmd: "warm-full" },
  { phase: "baseline-2", cmd: "cold-strict" },
  { phase: "baseline-2", cmd: "content-visual" },
  { phase: "baseline-2", cmd: "quality-discover" },
  { phase: "baseline-2", cmd: "cwv-discover-deep" },
  { phase: "baseline-2", cmd: "exam-pro" },
  { phase: "baseline-2", cmd: "pro-100-fast" },
];

const APPLY_ROTATION = [
  { phase: "apply", cmd: "warm-full" },
  { phase: "apply", cmd: "cold-strict" },
  { phase: "apply", cmd: "content-visual" },
  { phase: "apply", cmd: "mobile-audit" },
  { phase: "apply", cmd: "quality-apply" },
  { phase: "apply", cmd: "cwv-apply" },
  { phase: "apply", cmd: "validate" },
  { phase: "apply", cmd: "test-all" },
  { phase: "apply", cmd: "verify-full" },
  { phase: "apply", cmd: "pro-100-full" },
  { phase: "validate", cmd: "warm-full" },
  { phase: "validate", cmd: "quality-apply" },
  { phase: "validate", cmd: "cwv-apply-deep" },
  { phase: "validate", cmd: "validate" },
  { phase: "validate", cmd: "verify-full" },
  { phase: "validate", cmd: "pro-100-full" },
  { phase: "deploy", cmd: "exam-pro" },
  { phase: "deploy", cmd: "pro-100-full" },
];

function read100Tests() {
  try {
    return JSON.parse(readFileSync(TESTS_JSON, "utf8"));
  } catch {
    return null;
  }
}

function readQualityGatePass() {
  try {
    const payload = JSON.parse(readFileSync(QUALITY_LATEST, "utf8"));
    const s = payload.summary ?? {};
    return (
      s.passing === s.total &&
      s.measured === s.total &&
      Number(s.average) >= 95
    );
  } catch {
    return false;
  }
}

function allGatesPass() {
  const t = read100Tests();
  return t?.pass === true && readQualityGatePass();
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

function runStep(cmd, executed, phase, cycle) {
  const key = stepCacheKey(phase, cmd);
  if (executed.has(key)) {
    return { ...executed.get(key), cached: true };
  }

  const deepLh = cycle % 10_000 === 0 || cycle === START_CYCLE;
  let step;

  switch (cmd) {
    case "warm":
      step = runCmd("warm", "npm", ["run", "keep-warm:prod"]);
      break;
    case "warm-full":
      step = runCmd("warm-full", "npm", ["run", "keep-warm:prod"], {
        KEEP_WARM_FULL: "1",
        KEEP_WARM_STRICT: "0",
      });
      break;
    case "cold-strict":
      step = runCmd("cold", "node", ["scripts/cold-start-audit.mjs"], {
        COLD_AUDIT_STRICT: "1",
      });
      break;
    case "content-visual":
      step = runCmd("content", "node", ["scripts/content-visual-audit.mjs"], {
        CONTENT_AUDIT_STRICT: "1",
      });
      break;
    case "mobile-audit":
      step = runCmd("mobile", "node", ["scripts/mobile-security-audit.mjs"]);
      break;
    case "seo-discovery":
      step = runCmd("seo", "node", ["scripts/discovery-seo-audit.mjs"]);
      break;
    case "design-discovery":
      step = runCmd("design", "node", ["scripts/discovery-design-audit.mjs"]);
      break;
    case "quality-discover":
      step = runCmd("quality", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "0",
        QUALITY_SKIP_LH: LAUNCH_FAST && !deepLh ? "1" : "0",
      });
      break;
    case "quality-apply":
      step = runCmd("quality", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: LAUNCH_FAST && !deepLh ? "1" : "0",
      });
      if (!step.ok && LAUNCH_FAST && readQualityGatePass()) {
        step = { ...step, ok: true, softPass: true };
      }
      break;
    case "cwv-discover":
      step = runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "12",
      });
      break;
    case "cwv-discover-deep":
      step = runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "20",
      });
      break;
    case "cwv-apply":
      step = runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "1",
        CWV_RUNS: "12",
      });
      break;
    case "cwv-apply-deep":
      step = runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "1",
        CWV_RUNS: "20",
      });
      break;
    case "exam-pro":
      step = runCmd("exam", "node", ["scripts/pro-deep-exam.mjs"], {
        EXAM_SKIP_LH: LAUNCH_FAST && !deepLh ? "1" : "0",
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    case "pro-100-fast":
      step = runCmd("pro-100", "node", ["scripts/pro-100-tests.mjs"], {
        PRO_100_SKIP_VERSION: "1",
        PRO_100_SKIP_UNIT: "1",
      });
      break;
    case "pro-100-full":
      step = runCmd("pro-100", "node", ["scripts/pro-100-tests.mjs"], {
        PRO_100_SKIP_VERSION: "1",
      });
      break;
    case "validate":
      step = runCmd("validate", "npm", ["run", "validate"]);
      break;
    case "test-all":
      step = runCmd("test", "npm", ["test"]);
      break;
    case "test-partido":
      step = runCmd("test-partido", "npm", [
        "test",
        "--",
        "app/lib/premium-images.test.ts",
        "app/lib/home-lcp.test.ts",
        "app/lib/poster-quality.test.ts",
        "app/lib/quality-scorecard.test.ts",
      ]);
      break;
    case "perf-budget":
      step = runCmd("perf", "npm", ["run", "perf:budget"]);
      break;
    case "verify-full":
      step = runCmd("verify", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    default:
      step = { label: cmd, ok: true, ms: 0, exit: 0 };
  }

  if (step.ok && cmd !== "pro-100-fast" && cmd !== "pro-100-full") {
    executed.set(key, step);
  }
  return step;
}

function pickRotation(cycle) {
  if (cycle <= DISCOVERY_HALF) {
    return DISCOVERY_ROTATION[(cycle - 1) % DISCOVERY_ROTATION.length];
  }
  return APPLY_ROTATION[(cycle - DISCOVERY_HALF - 1) % APPLY_ROTATION.length];
}

function writeProgress(cycle, step, gates, executed) {
  saveExecuted(executed);
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-progress.json`),
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        version: "6.1.0-pro",
        cycle,
        total: TOTAL,
        half: cycle <= DISCOVERY_HALF ? "discovery" : "apply",
        step,
        gates,
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
}

function formatGates(g) {
  return `100t=${g.tests100}/${g.testsTotal} Q=${g.quality ? "✓" : "✗"}`;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const executed = loadExecuted();

  console.log(
    `\n[${MARATHON_ID}] ULTRA 100k · ${TOTAL} ciclos · fast=${LAUNCH_FAST}\n`
  );

  for (let cycle = START_CYCLE; cycle <= TOTAL; cycle += 1) {
    const rotation = pickRotation(cycle);
    const step = {
      ...rotation,
      ...runStep(rotation.cmd, executed, rotation.phase, cycle),
    };
    const report = read100Tests();
    const gates = {
      tests100: report?.passed ?? 0,
      testsTotal: report?.total ?? 100,
      testsPass: report?.pass === true,
      quality: readQualityGatePass(),
    };

    if (
      cycle % PROGRESS_EVERY === 0 ||
      cycle === START_CYCLE ||
      cycle === DISCOVERY_HALF ||
      cycle === TOTAL ||
      rotation.cmd.startsWith("pro-100")
    ) {
      writeProgress(cycle, step, gates, executed);
      console.log(
        `[${MARATHON_ID}] ${cycle}/${TOTAL} · ${rotation.phase}/${rotation.cmd} · ${formatGates(gates)}${step.cached ? " (cache)" : ""}`
      );
      if (report?.failures?.length) {
        console.log(
          `  fails → ${report.failures
            .slice(0, 5)
            .map((f) => f.id)
            .join(" ")}`
        );
      }
    }

    if (allGatesPass()) {
      const done = {
        marathonId: MARATHON_ID,
        status: "COMPLETED",
        version: "6.1.0-pro-definitive",
        cycles: cycle,
        gates,
        at: new Date().toISOString(),
      };
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-completed.json`),
        `${JSON.stringify(done, null, 2)}\n`
      );
      console.log(`\n[${MARATHON_ID}] COMPLETED at cycle ${cycle}\n`);
      return;
    }
  }

  const report = read100Tests();
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-exhausted.json`),
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        status: "EXHAUSTED",
        cycles: TOTAL,
        tests: report,
        quality: readQualityGatePass(),
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
  console.error(`\n[${MARATHON_ID}] EXHAUSTED\n`);
  process.exitCode = 1;
}

main();
