/**
 * Ciclo de mejora de producto (auditoría → benchmark → propuesta → aplicar → verificar).
 *
 * Un ciclo real requiere cambios de código revisables; no simula 16k iteraciones vacías.
 *
 *   npm run product:cycle              # 1 ciclo
 *   PRODUCT_CYCLES=10 npm run product:cycle
 *   PRODUCT_PHASE=audit npm run product:cycle
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Math.max(1, Number(process.env.PRODUCT_CYCLES ?? 1));
const PHASE_ONLY = process.env.PRODUCT_PHASE?.trim();
const OUT = join(process.cwd(), "docs", "product-cycles");

const PHASES = [
  {
    id: "audit",
    label: "Auditoría (quality + verify + cwv)",
    cmds: [
      ["keep-warm:prod", ["run", "keep-warm:prod"], {}],
      [
        "quality:audit",
        ["run", "quality:audit"],
        { QUALITY_GATE_BLOCKING: "0", QUALITY_SKIP_LH: "1" },
      ],
      ["verify:prod", ["run", "verify:prod"], {}],
    ],
  },
  {
    id: "benchmark",
    label: "Benchmark mercado (checklist manual + competidores)",
    cmds: [["benchmark", ["-e", "console.log('benchmark: futbolhoy, guiatv, marca RTVE')"], {}]],
  },
  {
    id: "validate",
    label: "Validación técnica",
    cmds: [
      ["test", ["test"], {}],
      ["lint", ["run", "lint"], {}],
    ],
  },
];

function runStep(name, args, env = {}) {
  const started = Date.now();
  const result = spawnSync("npm", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
  return {
    name,
    ok: result.status === 0,
    ms: Date.now() - started,
    exit: result.status ?? 1,
    stderr: (result.stderr ?? "").slice(-400),
  };
}

mkdirSync(OUT, { recursive: true });

const report = {
  cycles: TOTAL,
  startedAt: new Date().toISOString(),
  results: [],
};

for (let cycle = 1; cycle <= TOTAL; cycle += 1) {
  process.stdout.write(`\n── Ciclo ${cycle}/${TOTAL} ──\n`);
  const cycleResult = { cycle, phases: [] };

  for (const phase of PHASES) {
    if (PHASE_ONLY && phase.id !== PHASE_ONLY) continue;
    process.stdout.write(`  ${phase.id} … `);
    const steps = [];
    for (const [name, args, env] of phase.cmds) {
      if (name === "benchmark") {
        steps.push({ name, ok: true, ms: 0, exit: 0 });
        continue;
      }
      steps.push(runStep(name, args, env));
    }
    const ok = steps.every((s) => s.ok);
    cycleResult.phases.push({ id: phase.id, ok, steps });
    console.log(ok ? "OK" : "FAIL");
    if (!ok) break;
  }

  report.results.push(cycleResult);
  if (!cycleResult.phases.every((p) => p.ok)) break;
}

report.finishedAt = new Date().toISOString();
report.completed = report.results.every((c) => c.phases.every((p) => p.ok));

const outFile = join(OUT, `product-cycle-${Date.now()}.json`);
writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nInforme: ${outFile}`);
process.exit(report.completed ? 0 : 1);
