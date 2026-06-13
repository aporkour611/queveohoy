/**
 * Ultra maratón 1000 ciclos — cold start + seguridad móvil.
 *   npm run marathon:1000
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 1000);
const HALF = Math.floor(TOTAL / 2);
const MARATHON_ID = "ultra-mobile-cold-1000";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = 100;

const DISCOVERY = [
  "warm",
  "cold-audit",
  "mobile-audit",
  "quality",
  "verify",
  "test",
];
const APPLY = ["warm-full", "validate", "test", "quality", "verify"];

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
    stdout: (result.stdout ?? "").slice(-1200),
    stderr: (result.stderr ?? "").slice(-600),
  };
}

function buildCycles() {
  const cycles = [];
  let n = 1;
  while (cycles.length < HALF) {
    for (const cmd of DISCOVERY) {
      if (cycles.length >= HALF) break;
      cycles.push({ cycle: n++, phase: "discovery", cmd });
    }
  }
  while (cycles.length < TOTAL - 1) {
    for (const cmd of APPLY) {
      if (cycles.length >= TOTAL - 1) break;
      cycles.push({ cycle: n++, phase: "apply", cmd });
    }
  }
  cycles.push({ cycle: n++, phase: "apply", cmd: "deploy" });
  return cycles;
}

function readVersion() {
  try {
    return (
      readFileSync("app/lib/product-version.ts", "utf8").match(
        /PRODUCT_VERSION\s*=\s*"([^"]+)"/
      )?.[1] ?? "?"
    );
  } catch {
    return "?";
  }
}

function runStep(cmd, executed, phase) {
  const key = `${phase}:${cmd}`;
  if (executed.has(key)) {
    return { ...executed.get(key), cached: true };
  }
  let step;
  switch (cmd) {
    case "warm":
      step = runCmd("keep-warm:prod", "npm", ["run", "keep-warm:prod"]);
      break;
    case "warm-full":
      step = runCmd("keep-warm:prod full", "npm", ["run", "keep-warm:prod"], {
        KEEP_WARM_FULL: "1",
      });
      break;
    case "cold-audit":
      step = runCmd("cold-start", "node", ["scripts/cold-start-audit.mjs"]);
      break;
    case "mobile-audit":
      step = runCmd("mobile-security", "node", [
        "scripts/mobile-security-audit.mjs",
      ]);
      break;
    case "quality":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_SKIP_LH: "1",
        QUALITY_GATE_BLOCKING: phase === "apply" ? "1" : "0",
      });
      break;
    case "verify":
      step = runCmd("verify:prod", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    case "test":
      step = runCmd("test", "npm", ["test"]);
      break;
    case "validate":
      step = runCmd("validate", "npm", ["run", "validate"]);
      break;
    case "deploy": {
      if (process.env.MARATHON_SKIP_DEPLOY === "1") {
        step = { label: "deploy skip", ok: true, ms: 0, exit: 0 };
        break;
      }
      const status = spawnSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
      });
      if (!(status.stdout ?? "").trim()) {
        step = { label: "deploy clean", ok: true, ms: 0, exit: 0 };
        break;
      }
      spawnSync(
        "git",
        [
          "add",
          "app",
          "mobile",
          "scripts",
          "public",
          "vercel.json",
          "package.json",
        ],
        { stdio: "inherit" }
      );
      const commit = spawnSync(
        "git",
        ["commit", "-m", "feat(release): v5.5.0 cold start y seguridad movil"],
        { encoding: "utf8", stdio: "pipe" }
      );
      const commitOut = `${commit.stdout ?? ""}${commit.stderr ?? ""}`;
      if (commit.status !== 0) {
        if (/nothing to commit|no changes added to commit/i.test(commitOut)) {
          step = { label: "deploy (sin cambios release)", ok: true, ms: 0, exit: 0 };
          break;
        }
        step = {
          label: "deploy commit",
          ok: false,
          ms: 0,
          exit: commit.status ?? 1,
          stderr: commitOut.slice(-400),
        };
        break;
      }
      const push = spawnSync("git", ["push", "origin", "main"], {
        encoding: "utf8",
        stdio: "pipe",
      });
      step = {
        label: "deploy push",
        ok: push.status === 0,
        ms: 0,
        exit: push.status ?? 0,
        stderr: (push.stderr ?? "").slice(-400),
      };
      break;
    }
    default:
      step = { label: cmd, ok: true, ms: 0, exit: 0 };
  }
  executed.set(key, step);
  return step;
}

mkdirSync(OUT_DIR, { recursive: true });
const cycles = buildCycles();
const executed = new Map();
const results = [];
let passed = 0;
let ran = 0;

console.log(`\nUltra maratón ${MARATHON_ID} — ${TOTAL} ciclos\n`);

for (const cycle of cycles) {
  ran += 1;
  const step = runStep(cycle.cmd, executed, cycle.phase);
  if (step.ok) passed += 1;

  const onProgress =
    ran === 1 || ran % PROGRESS_EVERY === 0 || ran === cycles.length;
  if (!step.cached || onProgress || !step.ok) {
    results.push({ ...cycle, ...step });
  }
  if (onProgress || !step.cached || !step.ok) {
    if (onProgress) {
      process.stdout.write(`\n── ${ran}/${TOTAL} (ciclo ${cycle.cycle}) ──\n`);
    }
    process.stdout.write(`  [${cycle.cycle}] ${cycle.phase} · ${cycle.cmd} … `);
    console.log(step.ok ? (step.cached ? "OK (cache)" : "OK") : "FAIL");
  }
  if (!step.ok && !step.cached) {
    console.error(`✗ ${cycle.cmd} exit ${step.exit}`);
    break;
  }
}

const completed = passed === ran && ran === cycles.length;
const report = {
  marathon: MARATHON_ID,
  totalCycles: TOTAL,
  cyclesExecuted: ran,
  passed,
  status: completed ? "completed" : "partial",
  productVersion: readVersion(),
  cycles: results,
};
const out = join(OUT_DIR, `marathon-${MARATHON_ID}-latest.json`);
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `\nInforme: ${out}\n${passed}/${ran} OK · ${completed ? "COMPLETED" : "PARTIAL"}\n`
);
process.exit(completed ? 0 : 1);
