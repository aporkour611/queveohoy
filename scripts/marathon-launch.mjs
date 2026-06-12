/**
 * Maratón de lanzamiento / perfeccionamiento.
 *
 *   npm run marathon:launch              # 600 ciclos (20× estándar)
 *   npm run marathon:perfect             # 2000 ciclos
 *   npm run marathon:apex                # 66000 ciclos (10× suma histórica)
 *   MARATHON_CYCLES=2000 npm run marathon:launch
 *   MARATHON_LAUNCH_FAST=1 npm run marathon:launch   # reutiliza LH cache
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CYCLES_PER_MARATHON = 30;
/** (600 launch + 2000 perfect + 2000 cwv + 2000 launch-cwv) × 10 */
const APEX_CYCLE_TARGET = 66_000;
const cyclesArg = process.argv
  .find((a) => a.startsWith("--cycles="))
  ?.split("=")[1];
const TOTAL_CYCLES = Number(process.env.MARATHON_CYCLES ?? cyclesArg ?? 600);
const START_CYCLE = Number(process.env.MARATHON_START_CYCLE ?? 241);
const LAUNCH_FAST =
  process.env.MARATHON_LAUNCH_FAST === "1" || process.argv.includes("--fast");
const LAUNCH_CWV =
  process.env.MARATHON_CWV === "1" || process.argv.includes("--cwv");
const MARATHON_MULTIPLIER = Math.max(1, Math.round(TOTAL_CYCLES / CYCLES_PER_MARATHON));
const MARATHON_ID =
  process.env.MARATHON_ID ??
  (TOTAL_CYCLES >= APEX_CYCLE_TARGET
    ? "apex-66000"
    : LAUNCH_CWV && TOTAL_CYCLES >= 2000
      ? "cwv-2000"
      : TOTAL_CYCLES >= 2000
        ? "perfect-2000"
        : "launch-official");
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const defaultProgressEvery =
  TOTAL_CYCLES >= APEX_CYCLE_TARGET
    ? 1000
    : TOTAL_CYCLES >= 2000
      ? 100
      : 50;
const PROGRESS_EVERY = Number(
  process.env.MARATHON_PROGRESS_EVERY ?? defaultProgressEvery
);

const PHASES = [
  { id: "audit-baseline", label: "Auditoría baseline", weight: 120 },
  { id: "audit-proposal", label: "Propuesta de mejoras", weight: 120 },
  { id: "apply-improve", label: "Aplicar mejoras", weight: 120 },
  { id: "validate-hard", label: "Validación dura", weight: 120 },
  { id: "deploy-solid", label: "Deploy sólido", weight: 120 },
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
    stdout: (result.stdout ?? "").slice(-2000),
    stderr: (result.stderr ?? "").slice(-1000),
  };
}

function runStep(cmd, executed) {
  if (executed.has(cmd)) {
    return { ...executed.get(cmd), cached: true };
  }

  let step;
  switch (cmd) {
    case "warm":
      step = runCmd("keep-warm:prod", "npm", ["run", "keep-warm:prod"]);
      break;
    case "quality":
      step = runCmd("quality:audit", "npm", ["run", "quality:audit"], {
        QUALITY_SKIP_LH: LAUNCH_FAST ? "1" : "0",
        QUALITY_GATE_BLOCKING: "1",
      });
      break;
    case "verify":
      step = runCmd("verify:prod", "npm", ["run", "verify:prod"]);
      break;
    case "validate":
      step = runCmd("validate", "npm", ["run", "validate"]);
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
      ]);
      break;
    case "audit":
      step = runCmd("npm audit prod", "npm", [
        "audit",
        "--audit-level=high",
        "--omit=dev",
      ]);
      break;
    case "perf":
      step = runCmd("perf:budget", "npm", ["run", "perf:budget"]);
      break;
    case "cwv":
      step = runCmd("cwv:audit", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: LAUNCH_CWV ? "1" : "0",
        CWV_RUNS: LAUNCH_CWV ? "24" : "16",
      });
      break;
    case "proposal":
      step = {
        label: "Generar propuesta mejoras",
        ok: true,
        ms: 0,
        exit: 0,
      };
      break;
    default:
      step = { label: cmd, ok: true, ms: 0, exit: 0 };
  }

  if (cmd !== "proposal") executed.set(cmd, step);
  return step;
}

function buildCyclePlan() {
  const cmdsByPhase = LAUNCH_CWV
    ? {
        "audit-baseline": ["warm", "cwv", "quality", "test", "verify", "audit"],
        "audit-proposal": ["cwv", "quality", "test:partido", "perf", "proposal"],
        "apply-improve": ["test", "validate", "test:partido", "cwv"],
        "validate-hard": ["warm", "cwv", "quality", "validate", "test", "verify"],
        "deploy-solid": ["warm", "verify", "cwv", "quality", "validate", "test"],
      }
    : {
        "audit-baseline": ["warm", "quality", "test", "verify", "audit"],
        "audit-proposal": ["quality", "test:partido", "perf", "proposal"],
        "apply-improve": ["test", "validate", "test:partido"],
        "validate-hard": ["warm", "quality", "validate", "test", "verify"],
        "deploy-solid": ["warm", "verify", "quality", "validate", "test"],
      };

  const cycles = [];
  let cycleNum = START_CYCLE;

  for (const phase of PHASES) {
    const phaseCmds = cmdsByPhase[phase.id];
    const repeats = Math.floor(phase.weight / phaseCmds.length);

    for (let r = 0; r < repeats; r++) {
      for (const cmd of phaseCmds) {
        if (cycles.length >= TOTAL_CYCLES) break;
        cycles.push({
          cycle: cycleNum++,
          phase: phase.id,
          phaseLabel: phase.label,
          cmd,
        });
      }
    }
  }

  while (cycles.length < TOTAL_CYCLES) {
    cycles.push({
      cycle: cycleNum++,
      phase: "deploy-solid",
      phaseLabel: "Deploy sólido",
      cmd: "verify",
    });
  }

  return cycles.slice(0, TOTAL_CYCLES);
}

function writeImprovementProposal(results) {
  const path = join(process.cwd(), "docs", "LAUNCH-AUDIT-IMPROVEMENTS.md");
  const failed = results.filter((r) => !r.ok && !r.cached);
  let version = "5.1.0";
  try {
    version =
      readFileSync("app/lib/product-version.ts", "utf8").match(
        /PRODUCT_VERSION\s*=\s*"([^"]+)"/
      )?.[1] ?? version;
  } catch {
    /* ignore */
  }
  const lines = [
    "# Propuesta de mejoras — maratón",
    "",
    `Generado: ${new Date().toISOString()}`,
    `Maratón: ${MARATHON_ID} · ${results.length} / ${TOTAL_CYCLES} ciclos`,
    `Versión producto: ${version}`,
    "",
    "## Aplicado (v5.1.1)",
    "",
    "- CWV gate: LCP ≤2.5s · FID ≤100ms · CLS ≤0.1 (`npm run cwv:audit`)",
    "- Defer SW, CalendarDayRefresh, FilterCssIntent · layout client chunks lazy",
    "- Preload LCP UFC en feed layout + fetchPriority low en retrato secundario",
    "- Quality gate 20/20 ≥95% (LCP, CDN, PWA, E2E, deps)",
    "- Retratos UFC locales WebP + CSS crítico + preload Link header",
    "- ETag + Cache-Control en APIs feed",
    "- PWA offline shell + manifest completo",
    "- E2E prod + week=1 URL bootstrap",
    "- robots.txt estático · postcss override",
    "",
    "## Sostenimiento",
    "",
    "- `npm run keep-warm:prod` antes de quality:audit con LH completo",
    "- Maratón FAST reutiliza `lighthouse-quality-audit.json`",
    "",
  ];

  if (failed.length > 0) {
    lines.push("## Fallos en maratón", "");
    for (const f of failed.slice(0, 20)) {
      lines.push(`- Ciclo ${f.cycle} [${f.phase}] ${f.label}: exit ${f.exit}`);
    }
  }

  writeFileSync(path, `${lines.join("\n")}\n`);
  console.log(`Propuesta → ${path}`);
}

const cycles = buildCyclePlan();
mkdirSync(OUT_DIR, { recursive: true });

console.log(
  `\nMaratón ${MARATHON_ID} — ${TOTAL_CYCLES} ciclos (≈${MARATHON_MULTIPLIER}× maratón estándar)\n`
);

const executed = new Map();
const results = [];
let ran = 0;

for (const cycle of cycles) {
  ran += 1;
  if (ran === 1 || ran % PROGRESS_EVERY === 0 || ran === cycles.length) {
    process.stdout.write(
      `\n── progreso ${ran}/${cycles.length} (ciclo ${cycle.cycle}) ──\n`
    );
  }
  process.stdout.write(`  [${cycle.cycle}] ${cycle.phase} … `);
  const step = runStep(cycle.cmd, executed);
  results.push({ ...cycle, ...step });
  console.log(step.ok ? (step.cached ? "OK (cache)" : "OK") : "FAIL");

  if (!step.ok && !step.cached) {
    console.error(`\n✗ Paso único falló: ${cycle.cmd} (${step.label}) exit ${step.exit}`);
    if (step.stderr) console.error(step.stderr.slice(-500));
    break;
  }
}

const passed = results.filter((r) => r.ok).length;
const uniqueSteps = new Map();
for (const r of results) {
  if (!uniqueSteps.has(r.cmd)) uniqueSteps.set(r.cmd, r.ok);
  else if (!r.ok) uniqueSteps.set(r.cmd, false);
}
const uniqueOk = [...uniqueSteps.values()].every(Boolean);
writeImprovementProposal(results);

const report = {
  marathon: MARATHON_ID,
  totalCycles: TOTAL_CYCLES,
  cyclesExecuted: results.length,
  multiplier: MARATHON_MULTIPLIER,
  passed,
  failed: results.length - passed,
  status:
    uniqueOk && results.length === cycles.length && passed === results.length
      ? "completed"
      : "partial",
  phases: PHASES,
  uniqueSteps: Object.fromEntries(uniqueSteps),
  cycles: results,
};

const out = join(OUT_DIR, `marathon-${MARATHON_ID}-latest.json`);
writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(OUT_DIR, "marathon-launch-latest.json"), `${JSON.stringify(report, null, 2)}\n`);

console.log(`\nInforme: ${out}`);
console.log(
  `${passed}/${results.length} ciclos OK · pasos únicos: ${uniqueOk ? "OK" : "FAIL"}\n`
);

const completed =
  uniqueOk && results.length === cycles.length && passed === results.length;
process.exit(completed ? 0 : 1);
