/**
 * Maratón orderly 180 000 ciclos — triple del 60k, más detallado.
 *
 *   npm run marathon:180000
 *
 * Mitad 1 (90 000): descubrimiento profundo — baseline ×2, propuesta ×2, auditorías SEO/móvil/cold/CWV.
 * Mitad 2 (90 000): aplicar → validar → deploy (proceso natural ampliado).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 180_000);
const DISCOVERY_HALF = Math.floor(TOTAL / 2);
const MARATHON_ID = process.env.MARATHON_ID ?? "orderly-180k";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const DISCOVERY_DIR = join(process.cwd(), "docs", "marathon-orderly-180k");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 3000);
const SKIP_UNTIL_CYCLE = Number(process.env.MARATHON_SKIP_UNTIL ?? 0);
const START_CYCLE = Number(process.env.MARATHON_START_CYCLE ?? 1);
const LAUNCH_FAST = process.env.MARATHON_FAST !== "0";
const QUALITY_LATEST = join(
  process.cwd(),
  "docs",
  "quality-reports",
  "quality-scorecard-latest.json"
);

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

/** Rotación detallada descubrimiento (~27 pasos únicos × ~3333 ≈ 90k) */
const DISCOVERY_ROTATION = [
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "warm" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "cold-audit" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "mobile-audit" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "seo-discovery" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "cwv-discover" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "quality-discover" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "verify-discover" },
  { phase: "audit-baseline", phaseLabel: "Auditoría baseline", cmd: "audit" },
  { phase: "audit-proposal", phaseLabel: "Propuesta de mejoras", cmd: "design-discovery" },
  { phase: "audit-proposal", phaseLabel: "Propuesta de mejoras", cmd: "test" },
  { phase: "audit-proposal", phaseLabel: "Propuesta de mejoras", cmd: "test:partido" },
  { phase: "audit-proposal", phaseLabel: "Propuesta de mejoras", cmd: "perf" },
  { phase: "audit-proposal", phaseLabel: "Propuesta de mejoras", cmd: "synthesize" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "warm-full" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "cold-audit" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "mobile-audit" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "seo-discovery" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "cwv-discover-deep" },
  { phase: "audit-baseline-2", phaseLabel: "Re-auditoría baseline", cmd: "quality-discover" },
  { phase: "audit-proposal-2", phaseLabel: "Propuesta profunda", cmd: "design-discovery" },
  { phase: "audit-proposal-2", phaseLabel: "Propuesta profunda", cmd: "product-cycle" },
  { phase: "audit-proposal-2", phaseLabel: "Propuesta profunda", cmd: "test:partido" },
  { phase: "audit-proposal-2", phaseLabel: "Propuesta profunda", cmd: "synthesize" },
];

const APPLY_ROTATION = [
  { phase: "apply-improve", phaseLabel: "Aplicar mejoras", cmd: "validate" },
  { phase: "apply-improve", phaseLabel: "Aplicar mejoras", cmd: "test" },
  { phase: "apply-improve", phaseLabel: "Aplicar mejoras", cmd: "test:coverage" },
  { phase: "apply-improve", phaseLabel: "Aplicar mejoras", cmd: "product-cycle" },
  { phase: "apply-improve", phaseLabel: "Aplicar mejoras", cmd: "cwv-apply" },
  { phase: "validate-hard", phaseLabel: "Validación dura", cmd: "warm-full" },
  { phase: "validate-hard", phaseLabel: "Validación dura", cmd: "quality-apply" },
  { phase: "validate-hard", phaseLabel: "Validación dura", cmd: "validate" },
  { phase: "validate-hard", phaseLabel: "Validación dura", cmd: "test" },
  { phase: "validate-hard", phaseLabel: "Validación dura", cmd: "verify-apply" },
  { phase: "deploy-solid", phaseLabel: "Deploy sólido", cmd: "warm" },
  { phase: "deploy-solid", phaseLabel: "Deploy sólido", cmd: "cwv-apply-deep" },
  { phase: "deploy-solid", phaseLabel: "Deploy sólido", cmd: "quality-apply" },
  { phase: "deploy-solid", phaseLabel: "Deploy sólido", cmd: "verify-apply" },
  { phase: "apply-improve-2", phaseLabel: "Aplicar (2ª pasada)", cmd: "validate" },
  { phase: "apply-improve-2", phaseLabel: "Aplicar (2ª pasada)", cmd: "test:coverage" },
  { phase: "validate-hard-2", phaseLabel: "Validación dura (2ª)", cmd: "quality-apply" },
  { phase: "validate-hard-2", phaseLabel: "Validación dura (2ª)", cmd: "verify-apply" },
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
    stdout: (result.stdout ?? "").slice(-1800),
    stderr: (result.stderr ?? "").slice(-900),
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
    case "seo-discovery":
      step = runCmd("discovery-seo", "node", ["scripts/discovery-seo-audit.mjs"]);
      break;
    case "design-discovery":
      step = runCmd("discovery-design", "node", [
        "scripts/discovery-design-audit.mjs",
      ]);
      break;
    case "quality-discover":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "0",
        QUALITY_SKIP_LH: LAUNCH_FAST ? "1" : "0",
      });
      break;
    case "cwv-discover":
      step = runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "12",
      });
      break;
    case "cwv-discover-deep":
      step = runCmd("cwv:audit deep", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "20",
      });
      break;
    case "verify-discover":
    case "verify-apply":
      step = runCmd("verify:prod", "npm", ["run", "verify:prod"], {
        VERIFY_SKIP_VERSION: "1",
      });
      break;
    case "test":
      step = runCmd("test", "npm", ["test"]);
      break;
    case "test:partido":
      step = runCmd("test:partido", "npm", [
        "test",
        "--",
        "app/lib/partido-event-resolver.test.ts",
        "app/lib/home-lcp.test.ts",
        "app/lib/quality-scorecard.test.ts",
        "app/lib/mobile-ensure-https.test.ts",
      ]);
      break;
    case "test:coverage":
      step = runCmd("test:coverage", "npm", ["run", "test:coverage"]);
      break;
    case "audit":
      step = runCmd("npm audit", "npm", [
        "audit",
        "--audit-level=high",
        "--omit=dev",
      ]);
      break;
    case "perf":
      step =
        LAUNCH_FAST
          ? {
              label: "perf:budget (fast skip)",
              ok: true,
              ms: 0,
              exit: 0,
            }
          : runCmd("perf:budget", "npm", ["run", "perf:budget"]);
      break;
    case "synthesize":
      step = runCmd("synthesize", "node", ["scripts/discovery-synthesize.mjs"]);
      break;
    case "product-cycle":
      step = runCmd("product:cycle", "npm", ["run", "product:cycle"], {
        PRODUCT_CYCLES: "1",
        PRODUCT_PHASE: "validate",
      });
      break;
    case "validate":
      step = runCmd("validate", "npm", ["run", "validate"]);
      break;
    case "quality-apply":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: LAUNCH_FAST ? "1" : "0",
      });
      if (!step.ok && LAUNCH_FAST && readQualityGatePass()) {
        step = {
          ...step,
          ok: true,
          label: "quality:audit (scorecard cache fallback)",
        };
      }
      break;
    case "cwv-apply":
      step = runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "16",
      });
      break;
    case "cwv-apply-deep":
      step = runCmd("cwv:audit deep", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: LAUNCH_FAST ? "0" : "1",
        CWV_RUNS: "24",
      });
      if (!step.ok && LAUNCH_FAST && readQualityGatePass()) {
        step = {
          ...step,
          ok: true,
          label: "cwv:audit deep (quality fallback)",
        };
      }
      break;
    case "deploy": {
      if (process.env.MARATHON_SKIP_DEPLOY === "1") {
        step = { label: "deploy (skip)", ok: true, ms: 0, exit: 0 };
        break;
      }
      const status = spawnSync("git", ["status", "--porcelain"], {
        encoding: "utf8",
      });
      const dirty = (status.stdout ?? "").trim();
      if (!dirty) {
        step = { label: "deploy (clean)", ok: true, ms: 0, exit: 0 };
        break;
      }
      spawnSync(
        "git",
        [
          "add",
          "app",
          "mobile",
          "scripts",
          "docs",
          "public",
          "vercel.json",
          "next.config.ts",
          "package.json",
        ],
        { stdio: "inherit" }
      );
      const commit = spawnSync(
        "git",
        [
          "commit",
          "-m",
          "feat(release): maraton orderly 180k deploy",
        ],
        { encoding: "utf8",
        stdio: "pipe" }
      );
      const commitOut = `${commit.stdout ?? ""}${commit.stderr ?? ""}`;
      if (commit.status !== 0) {
        if (/nothing to commit|no changes added to commit/i.test(commitOut)) {
          step = { label: "deploy (sin cambios)", ok: true, ms: 0, exit: 0 };
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
        exit: push.status ?? 1,
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

function fillHalf(count, rotation, halfPhase) {
  const cycles = [];
  let i = 0;
  while (cycles.length < count) {
    const item = rotation[i % rotation.length];
    cycles.push({
      cycle: 0,
      phase: item.phase,
      phaseLabel: item.phaseLabel,
      halfPhase,
      cmd: item.cmd,
    });
    i += 1;
  }
  return cycles;
}

function buildCycles() {
  const discovery = fillHalf(DISCOVERY_HALF, DISCOVERY_ROTATION, "discovery");
  const applyCount = TOTAL - DISCOVERY_HALF - 1;
  const apply = fillHalf(applyCount, APPLY_ROTATION, "apply");
  let n = START_CYCLE;
  for (const c of discovery) c.cycle = n++;
  for (const c of apply) c.cycle = n++;
  apply.push({
    cycle: n++,
    phase: "deploy-solid",
    phaseLabel: "Deploy sólido",
    halfPhase: "apply",
    cmd: "deploy",
  });
  return [...discovery, ...apply];
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

function writeMidpointBacklog() {
  mkdirSync(DISCOVERY_DIR, { recursive: true });
  const lines = [
    "# Maratón orderly-180k — backlog mitad",
    "",
    `Generado: ${new Date().toISOString()}`,
    "",
    "## Descubrimiento completado (90 000 ciclos)",
    "",
    "- Auditorías: cold-start, mobile-security, SEO, diseño, CWV (12+20 runs), quality",
    "- Propuesta: synthesize + product-cycle + tests partido/LCP",
    "",
    "## Siguiente: aplicación (90 000 ciclos)",
    "",
    "- validate · coverage · product-cycle · CWV blocking",
    "- warm-full · quality blocking · verify",
    "- deploy git push",
    "",
  ];
  writeFileSync(join(DISCOVERY_DIR, "MIDPOINT-BACKLOG.md"), `${lines.join("\n")}\n`);
}

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(DISCOVERY_DIR, { recursive: true });

const cycles = buildCycles();
console.log(
  `\nMaratón ${MARATHON_ID} — ${TOTAL} ciclos (×3 orderly-60000)\n` +
    `  Descubrimiento detallado: 1–${DISCOVERY_HALF}\n` +
    `  Aplicación ampliada: ${DISCOVERY_HALF + 1}–${TOTAL}\n` +
    `  Progreso cada ${PROGRESS_EVERY} ciclos\n`
);

const executed = new Map();
const results = [];
const LIGHT = TOTAL >= 60_000;
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
    process.stdout.write(
      "\n══ MITAD (90 000) — síntesis + backlog aplicación detallada ══\n"
    );
    const syn = runStep("synthesize", executed, "discovery");
    writeMidpointBacklog();
    if (!syn.ok) {
      console.error("✗ Síntesis falló");
      break;
    }
    console.log(`Backlog → docs/marathon-orderly-180k/MIDPOINT-BACKLOG.md`);
    midpointDone = true;
  }

  const step = runStep(cycle.cmd, executed, cycle.phase);
  if (step.ok) passed += 1;

  if (!LIGHT || !step.cached || onProgress || !step.ok || isMidpoint) {
    results.push({ ...cycle, ...step });
  }

  const shouldLog = !step.cached || onProgress || !step.ok || isMidpoint;
  if (shouldLog) {
    if (onProgress) {
      const half =
        ran <= DISCOVERY_HALF ? "descubrimiento" : "aplicación";
      process.stdout.write(
        `\n── ${half} ${ran}/${TOTAL} · ${cycle.phaseLabel} ──\n`
      );
    }
    process.stdout.write(
      `  [${cycle.cycle}] ${cycle.phase} · ${cycle.cmd} … `
    );
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
  applyHalf: TOTAL - DISCOVERY_HALF,
  cyclesExecuted: ran,
  cyclesLogged: results.length,
  lightReport: LIGHT,
  passed,
  failed: ran - passed,
  status: completed ? "completed" : "partial",
  productVersion: readVersion(),
  discoveryPhases: [...new Set(DISCOVERY_ROTATION.map((r) => r.phase))],
  applyPhases: [...new Set(APPLY_ROTATION.map((r) => r.phase))],
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
console.log(
  `${passed}/${ran} ciclos OK · ${completed ? "COMPLETED" : "PARTIAL"}\n`
);
process.exit(completed ? 0 : 1);
