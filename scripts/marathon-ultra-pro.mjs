/**
 * Ultra-hiper maratón PRO — 100 tests + implementación hasta PASS total.
 *
 *   npm run marathon:ultra-pro
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 6_000);
const MARATHON_ID = process.env.MARATHON_ID ?? "ultra-pro-61";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 50);
const TESTS_JSON = join(OUT_DIR, "PRO-100-TESTS-latest.json");

const ROTATION = [
  { phase: "warm", cmd: "warm-full" },
  { phase: "quality", cmd: "quality-strict" },
  { phase: "cwv", cmd: "cwv-deep" },
  { phase: "cold", cmd: "cold-strict" },
  { phase: "content", cmd: "content-visual" },
  { phase: "mobile", cmd: "mobile-audit" },
  { phase: "build", cmd: "validate" },
  { phase: "tests", cmd: "test-all" },
  { phase: "verify", cmd: "verify-full" },
  { phase: "gate", cmd: "pro-100" },
];

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
    stderr: (result.stderr ?? "").slice(-400),
  };
}

function read100Tests() {
  try {
    return JSON.parse(readFileSync(TESTS_JSON, "utf8"));
  } catch {
    return null;
  }
}

function runStep(cmd) {
  switch (cmd) {
    case "warm-full":
      return runCmd("warm", "npm", ["run", "keep-warm:prod"], { KEEP_WARM_FULL: "1" });
    case "quality-strict":
      return runCmd("quality", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "0",
        QUALITY_SKIP_LH: "0",
      });
    case "cwv-deep":
      return runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "16",
      });
    case "cold-strict":
      return runCmd("cold", "node", ["scripts/cold-start-audit.mjs"], {
        COLD_AUDIT_STRICT: "1",
      });
    case "content-visual":
      return runCmd("content", "node", ["scripts/content-visual-audit.mjs"], {
        CONTENT_AUDIT_STRICT: "1",
      });
    case "mobile-audit":
      return runCmd("mobile", "node", ["scripts/mobile-security-audit.mjs"]);
    case "validate":
      return runCmd("validate", "npm", ["run", "validate"]);
    case "test-all":
      return runCmd("test", "npm", ["test"]);
    case "verify-full":
      return runCmd("verify", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
    case "pro-100":
      return runCmd("pro-100", "node", ["scripts/pro-100-tests.mjs"], {
        PRO_100_SKIP_VERSION: "1",
      });
    default:
      return { label: cmd, ok: true, ms: 0, exit: 0 };
  }
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n[${MARATHON_ID}] ULTRA PRO · ${TOTAL} ciclos · gate 100/100 tests\n`);

  for (let cycle = 1; cycle <= TOTAL; cycle += 1) {
    const rotation = ROTATION[(cycle - 1) % ROTATION.length];
    const step = { ...rotation, ...runStep(rotation.cmd) };
    const report = read100Tests();
    const passed = report?.passed ?? 0;
    const total = report?.total ?? 100;

    if (
      cycle % PROGRESS_EVERY === 0 ||
      cycle === 1 ||
      rotation.cmd === "pro-100" ||
      cycle === TOTAL
    ) {
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-progress.json`),
        `${JSON.stringify(
          {
            marathonId: MARATHON_ID,
            version: "6.1.0-pro",
            cycle,
            total: TOTAL,
            step,
            tests: { passed, total, failures: report?.failures?.slice(0, 12) ?? [] },
            at: new Date().toISOString(),
          },
          null,
          2
        )}\n`
      );
      console.log(
        `[${MARATHON_ID}] ${cycle}/${TOTAL} · ${rotation.cmd} · tests ${passed}/${total}`
      );
      if (report?.failures?.length) {
        console.log(
          `  fails → ${report.failures
            .slice(0, 6)
            .map((f) => f.id)
            .join(" ")}`
        );
      }
    }

    if (report?.pass === true) {
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-completed.json`),
        `${JSON.stringify(
          {
            marathonId: MARATHON_ID,
            status: "COMPLETED",
            version: "6.1.0-pro-definitive",
            cycles: cycle,
            tests: report,
            at: new Date().toISOString(),
          },
          null,
          2
        )}\n`
      );
      console.log(`\n[${MARATHON_ID}] COMPLETED — 100/100 tests PASS\n`);
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
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
  console.error(`\n[${MARATHON_ID}] EXHAUSTED — ${report?.passed ?? 0}/100\n`);
  process.exitCode = 1;
}

main();
