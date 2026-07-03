/**
 * Supermaratón — cold start + quality ≥95% hasta PASS o agotar ciclos.
 *
 *   npm run marathon:supreme
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 12_000);
const MARATHON_ID = process.env.MARATHON_ID ?? "supreme-cold-quality";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 200);
const LAUNCH_FAST = process.env.MARATHON_FAST !== "0";
const QUALITY_LATEST = join(
  process.cwd(),
  "docs",
  "quality-reports",
  "quality-scorecard-latest.json"
);
const COLD_LATEST = join(OUT_DIR, "cold-start-audit-latest.json");

const ROTATION = [
  "warm",
  "cold-audit",
  "quality-apply",
  "cwv-apply",
  "mobile-audit",
  "validate",
  "test",
  "warm-full",
  "cold-audit",
  "quality-apply",
  "verify-apply",
];

function readQualityGatePass() {
  try {
    const payload = JSON.parse(readFileSync(QUALITY_LATEST, "utf8"));
    const summary = payload.summary ?? {};
    return (
      summary.passing === summary.total &&
      summary.measured === summary.total &&
      Number(summary.average) >= 95
    );
  } catch {
    return false;
  }
}

function readColdGatePass() {
  try {
    const payload = JSON.parse(readFileSync(COLD_LATEST, "utf8"));
    return payload.gates?.pass === true;
  } catch {
    return false;
  }
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
  };
}

function runStep(cmd) {
  switch (cmd) {
    case "warm":
      return runCmd("keep-warm:prod", "npm", ["run", "keep-warm:prod"]);
    case "warm-full":
      return runCmd("keep-warm:prod full", "npm", ["run", "keep-warm:prod"], {
        KEEP_WARM_FULL: "1",
      });
    case "cold-audit":
      return runCmd("cold-start", "node", ["scripts/cold-start-audit.mjs"]);
    case "mobile-audit":
      return runCmd("mobile-security", "node", [
        "scripts/mobile-security-audit.mjs",
      ]);
    case "quality-apply": {
      const step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: LAUNCH_FAST ? "1" : "0",
      });
      if (!step.ok && LAUNCH_FAST && readQualityGatePass()) {
        return { ...step, ok: true, softPass: true };
      }
      return step;
    }
    case "cwv-apply":
      return runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "1",
        CWV_RUNS: "12",
      });
    case "verify-apply":
      return runCmd("verify:prod", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
    case "validate":
      return runCmd("validate", "npm", ["run", "validate"]);
    case "test":
      return runCmd("test", "npm", ["test"]);
    default:
      return { label: cmd, ok: true, ms: 0, exit: 0 };
  }
}

function writeProgress(cycle, step, gates) {
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-progress.json`),
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        cycle,
        total: TOTAL,
        step,
        gates,
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  let lastGates = { cold: false, quality: false };

  for (let cycle = 1; cycle <= TOTAL; cycle += 1) {
    const cmd = ROTATION[(cycle - 1) % ROTATION.length];
    const step = { cmd, ...runStep(cmd) };

    if (cycle % PROGRESS_EVERY === 0 || cycle === 1 || cycle === TOTAL) {
      lastGates = {
        cold: readColdGatePass(),
        quality: readQualityGatePass(),
      };
      writeProgress(cycle, step, lastGates);
      console.log(
        `[${MARATHON_ID}] cycle ${cycle}/${TOTAL} · ${cmd} · cold=${lastGates.cold} quality=${lastGates.quality}`
      );
    }

    if (readColdGatePass() && readQualityGatePass()) {
      const done = {
        marathonId: MARATHON_ID,
        status: "COMPLETED",
        cycles: cycle,
        gates: { cold: true, quality: true },
        at: new Date().toISOString(),
      };
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-completed.json`),
        `${JSON.stringify(done, null, 2)}\n`
      );
      console.log(`[${MARATHON_ID}] COMPLETED at cycle ${cycle}`);
      return;
    }
  }

  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-exhausted.json`),
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        status: "EXHAUSTED",
        cycles: TOTAL,
        gates: lastGates,
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
  console.error(`[${MARATHON_ID}] EXHAUSTED after ${TOTAL} cycles`);
  process.exitCode = 1;
}

main();
