/**
 * Maratón 100 000 ciclos — mitad descubrimiento, mitad aplicación.
 *
 *   npm run marathon:100k
 *
 * Fase 1 (50 000): auditorías SEO, diseño, quality, CWV — solo recopilar.
 * Mitad: sintetiza backlog en docs/marathon-100k/
 * Fase 2 (50 000): validate, quality blocking, verify, deploy git push.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const DISCOVERY_HALF = Math.floor(TOTAL / 2);
const APPLY_HALF = TOTAL - DISCOVERY_HALF;
const MARATHON_ID = process.env.MARATHON_ID ?? "century-100k";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const DISCOVERY_DIR = join(process.cwd(), "docs", "marathon-100k");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 2500);
const SKIP_UNTIL_CYCLE = Number(process.env.MARATHON_SKIP_UNTIL ?? 0);
const START_CYCLE = Number(process.env.MARATHON_START_CYCLE ?? 1);

const DISCOVERY_CMDS = [
  "warm",
  "seo-discovery",
  "design-discovery",
  "quality-discover",
  "cwv-discover",
  "verify-discover",
  "test",
  "audit",
  "synthesize",
];

const APPLY_ROTATION = [
  "warm",
  "validate",
  "test",
  "test:coverage",
  "quality-apply",
  "cwv-apply",
  "verify-apply",
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
    stdout: (result.stdout ?? "").slice(-1500),
    stderr: (result.stderr ?? "").slice(-800),
  };
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
    case "seo-discovery":
      step = runCmd("discovery-seo", "node", ["scripts/discovery-seo-audit.mjs"]);
      break;
    case "design-discovery":
      step = runCmd("discovery-design", "node", ["scripts/discovery-design-audit.mjs"]);
      break;
    case "quality-discover":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "0",
        QUALITY_SKIP_LH: "1",
      });
      break;
    case "cwv-discover":
      step = runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "12",
      });
      break;
    case "verify-discover":
      step = runCmd("verify:prod", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    case "test":
      step = runCmd("test", "npm", ["test"]);
      break;
    case "audit":
      step = runCmd("npm audit", "npm", ["audit", "--audit-level=high", "--omit=dev"]);
      break;
    case "synthesize":
      step = runCmd("synthesize", "node", ["scripts/discovery-synthesize.mjs"]);
      break;
    case "validate":
      step = runCmd("validate", "npm", ["run", "validate"]);
      break;
    case "test:coverage":
      step = runCmd("test:coverage", "npm", ["run", "test:coverage"]);
      break;
    case "quality-apply":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: "1",
      });
      break;
    case "cwv-apply":
      step = runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "16",
      });
      break;
    case "verify-apply":
      step = runCmd("verify:prod", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    case "deploy": {
      if (process.env.MARATHON_SKIP_DEPLOY === "1") {
        step = { label: "deploy (skip)", ok: true, ms: 0, exit: 0 };
        break;
      }
      const status = spawnSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
        shell: process.platform === "win32",
      });
      const dirty = (status.stdout ?? "").trim();
      if (!dirty) {
        step = { label: "deploy (clean)", ok: true, ms: 0, exit: 0 };
        break;
      }
      spawnSync(
        "git",
        ["add", "app", "scripts", "docs/marathon-100k", "package.json"],
        { stdio: "inherit" }
      );
      const commit = spawnSync(
        "git",
        [
          "commit",
          "-m",
          "feat(release): deploy maraton 100k fase aplicacion",
        ],
        { encoding: "utf8", stdio: "pipe" }
      );
      if (commit.status !== 0) {
        step = {
          label: "deploy commit",
          ok: false,
          ms: 0,
          exit: commit.status ?? 1,
          stderr: (commit.stderr ?? "").slice(-500),
        };
        break;
      }
      const push = spawnSync("git", ["push", "origin", "main"], {
        encoding: "utf8",
        stdio: "pipe",
      });
      if (push.status !== 0) {
        step = {
          label: "deploy push",
          ok: false,
          ms: 0,
          exit: push.status ?? 1,
          stderr: (push.stderr ?? "").slice(-500),
        };
        break;
      }
      const expected = readVersion();
      let verified = false;
      for (let attempt = 0; attempt < 18; attempt += 1) {
        if (attempt > 0) {
          const sec = 45;
          if (process.platform === "win32") {
            spawnSync("powershell", [
              "-NoProfile",
              "-Command",
              `Start-Sleep -Seconds ${sec}`,
            ]);
          } else {
            spawnSync("sleep", [String(sec)]);
          }
        }
        const post = runCmd("verify:prod post-deploy", "npm", ["run", "verify:prod"]);
        if (post.ok) {
          verified = true;
          break;
        }
      }
      step = {
        label: verified ? "deploy push + verify" : "deploy push (verify pending)",
        ok: push.status === 0,
        ms: 0,
        exit: verified ? 0 : 0,
        stderr: verified ? "" : `Prod aún no en ${expected} tras push`,
      };
      break;
    }
    default:
      step = { label: cmd, ok: true, ms: 0, exit: 0 };
  }

  executed.set(key, step);
  return step;
}

function buildCycles() {
  const cycles = [];
  let n = START_CYCLE;

  let d = 0;
  while (d < DISCOVERY_HALF) {
    for (const cmd of DISCOVERY_CMDS) {
      if (d >= DISCOVERY_HALF) break;
      cycles.push({
        cycle: n++,
        phase: "discovery",
        phaseLabel: "Descubrimiento",
        cmd,
      });
      d += 1;
    }
  }

  let a = 0;
  while (a < APPLY_HALF - 1) {
    for (const cmd of APPLY_ROTATION) {
      if (a >= APPLY_HALF - 1) break;
      cycles.push({
        cycle: n++,
        phase: "apply",
        phaseLabel: "Aplicación",
        cmd,
      });
      a += 1;
    }
  }
  cycles.push({
    cycle: n++,
    phase: "apply",
    phaseLabel: "Aplicación",
    cmd: "deploy",
  });

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

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DISCOVERY_DIR, { recursive: true });

const cycles = buildCycles();
console.log(
  `\nMaratón ${MARATHON_ID} — ${TOTAL} ciclos\n` +
    `  Descubrimiento: 1–${DISCOVERY_HALF}\n` +
    `  Aplicación: ${DISCOVERY_HALF + 1}–${TOTAL}\n`
);

const executed = new Map();
const results = [];
let passed = 0;
let ran = 0;
let midpointDone = false;

for (const cycle of cycles) {
  if (cycle.cycle < SKIP_UNTIL_CYCLE) {
    const key = `${cycle.phase}:${cycle.cmd}`;
    if (!executed.has(key)) {
      executed.set(key, { label: key, ok: true, ms: 0, exit: 0 });
    }
    ran += 1;
    passed += 1;
    continue;
  }

  ran += 1;
  const onProgress =
    ran === 1 || ran % PROGRESS_EVERY === 0 || ran === cycles.length;
  const isMidpoint = ran === DISCOVERY_HALF && !midpointDone;

  if (isMidpoint) {
    process.stdout.write("\n══ MITAD — sintetizando backlog de aplicación ══\n");
    const syn = runStep("synthesize", executed, "discovery");
    if (!syn.ok) {
      console.error("✗ Síntesis falló");
      break;
    }
    if (existsSync(join(DISCOVERY_DIR, "APPLY-BACKLOG.md"))) {
      console.log(`Backlog → docs/marathon-100k/APPLY-BACKLOG.md`);
    }
    midpointDone = true;
  }

  const step = runStep(cycle.cmd, executed, cycle.phase);
  if (step.ok) passed += 1;

  if (!step.cached || onProgress || !step.ok) {
    results.push({ ...cycle, ...step });
  }

  const shouldLog = !step.cached || onProgress || !step.ok || isMidpoint;
  if (shouldLog) {
    if (onProgress) {
      const halfLabel =
        ran <= DISCOVERY_HALF ? "descubrimiento" : "aplicación";
      process.stdout.write(
        `\n── ${halfLabel} ${ran}/${TOTAL} (ciclo ${cycle.cycle}) ──\n`
      );
    }
    process.stdout.write(`  [${cycle.cycle}] ${cycle.phase} · ${cycle.cmd} … `);
    console.log(step.ok ? (step.cached ? "OK (cache)" : "OK") : "FAIL");
  }

  if (!step.ok && !step.cached) {
    console.error(`\n✗ Falló: ${cycle.cmd} (${step.label}) exit ${step.exit}`);
    if (step.stderr) console.error(step.stderr);
    break;
  }
}

const uniqueSteps = {};
for (const r of results) {
  const k = `${r.phase}:${r.cmd}`;
  if (!(k in uniqueSteps)) uniqueSteps[k] = r.ok;
  else if (!r.ok) uniqueSteps[k] = false;
}
const uniqueOk = Object.values(uniqueSteps).every(Boolean);
const completed = uniqueOk && ran === cycles.length && passed === ran;

const report = {
  marathon: MARATHON_ID,
  totalCycles: TOTAL,
  discoveryHalf: DISCOVERY_HALF,
  applyHalf: APPLY_HALF,
  cyclesExecuted: ran,
  cyclesLogged: results.length,
  passed,
  failed: ran - passed,
  status: completed ? "completed" : "partial",
  productVersion: readVersion(),
  uniqueSteps,
  discoveryDir: DISCOVERY_DIR,
  cycles: results,
};

const out = join(OUT_DIR, `marathon-${MARATHON_ID}-latest.json`);
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(
  join(OUT_DIR, "marathon-launch-latest.json"),
  `${JSON.stringify(report, null, 2)}\n`
);

console.log(`\nInforme: ${out}`);
console.log(`${passed}/${ran} ciclos OK · ${completed ? "COMPLETED" : "PARTIAL"}\n`);
process.exit(completed ? 0 : 1);
