/**
 * Examen profundo PRO — 12 dimensiones valorables en producción.
 *
 *   npm run exam:pro
 *
 * Genera docs/marathon-reports/PRO-DEEP-EXAM-latest.json
 * y docs/marathon-reports/PRO-DEEP-EXAM-PLAN.md (backlog maratón).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-reports");
const QUALITY = join(process.cwd(), "docs", "quality-reports", "quality-scorecard-latest.json");
const TARGET = Number(process.env.QUALITY_MIN_SCORE ?? 95);

const DIMENSIONS = [
  { id: "cold", label: "Cold start / TTFB", script: "cold-start-audit.mjs", env: { COLD_AUDIT_STRICT: "1" } },
  { id: "content", label: "Contenido y portadas", script: "content-visual-audit.mjs", env: { CONTENT_AUDIT_STRICT: "1" } },
  { id: "mobile", label: "Seguridad móvil", script: "mobile-security-audit.mjs", env: {} },
  { id: "seo", label: "SEO infra", script: "discovery-seo-audit.mjs", env: {} },
  { id: "design", label: "Diseño / UX SSR", script: "discovery-design-audit.mjs", env: {} },
];

function runNode(script, env = {}) {
  const started = Date.now();
  const result = spawnSync("node", [`scripts/${script}`], {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
  return {
    ok: result.status === 0,
    ms: Date.now() - started,
    exit: result.status ?? 1,
    stderr: (result.stderr ?? "").slice(-400),
  };
}

function runNpm(script, env = {}) {
  const started = Date.now();
  const result = spawnSync("npm", ["run", script], {
    encoding: "utf8",
    shell: process.platform === "win32",
    env: { ...process.env, ...env },
    stdio: "pipe",
  });
  return {
    ok: result.status === 0,
    ms: Date.now() - started,
    exit: result.status ?? 1,
  };
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function qualityFindings() {
  const q = readJson(QUALITY);
  if (!q?.summary?.rows) return [];
  return q.summary.rows
    .filter((r) => r.score != null && r.status !== "pass")
    .map((r) => ({
      priority: r.gap >= 50 ? "P0" : r.gap >= 25 ? "P1" : "P2",
      dimension: r.id,
      name: r.name,
      score: r.score,
      gap: r.gap,
      action: r.action ?? "",
    }))
    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));
}

function buildPlan(findings, dimensions) {
  const items = [...findings];
  for (const dim of dimensions) {
    if (!dim.pass) {
      items.push({
        priority: "P0",
        dimension: dim.id,
        name: dim.label,
        score: null,
        gap: null,
        action: dim.detail ?? `Corregir ${dim.label}`,
      });
    }
  }
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.dimension}:${item.action}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderPlanMd(exam, plan) {
  const lines = [
    `# Plan supermaratón PRO — ${exam.at.slice(0, 10)}`,
    "",
    `Base: ${exam.base} · Versión objetivo: **6.0.0 PRO**`,
    "",
    "## Resumen examen",
    "",
    `| Dimensión | PASS |`,
    `|-----------|------|`,
  ];
  for (const d of exam.dimensions) {
    lines.push(`| ${d.label} | ${d.pass ? "✓" : "✗"} |`);
  }
  lines.push(
    "",
    `Quality media: **${exam.quality?.average ?? "—"}%** · ${exam.quality?.passing ?? "—"}/${exam.quality?.total ?? 20} ≥${TARGET}%`,
    "",
    "## Backlog priorizado (maratón PRO)",
    ""
  );
  for (const item of plan) {
    lines.push(
      `### ${item.priority} — ${item.name}`,
      `- Dimensión: \`${item.dimension}\``,
      item.score != null ? `- Score actual: **${item.score}%** (gap ${item.gap})` : "",
      `- Acción: ${item.action}`,
      ""
    );
  }
  lines.push(
    "## Fases maratón",
    "",
    "1. **Warm + cold strict** — mantener home <500 ms",
    "2. **LCP** — preload dinámico, img directo local webp, sin Link header estático",
    "3. **TBT/INP** — defer prefetch 12s, optimizePackageImports, sin JS en auditoría",
    "4. **Quality 20/20** — LH completo post warm-full",
    "5. **Verify + deploy** — push y poll 24/24",
    ""
  );
  return lines.filter(Boolean).join("\n");
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  console.log("\n═══ Examen profundo PRO ═══\n");

  const dimensions = [];

  for (const dim of DIMENSIONS) {
    process.stdout.write(`  ${dim.label} … `);
    const step = runNode(dim.script, dim.env);
    let pass = step.ok;
    let detail = step.ok ? "OK" : step.stderr || "FAIL";

    if (dim.id === "cold") {
      const cold = readJson(join(OUT, "cold-start-audit-latest.json"));
      pass = cold?.gates?.criticalPass === true;
      detail = `home ${cold?.homeWarmMs}ms / ${cold?.homeColdMs}ms`;
    }
    if (dim.id === "content") {
      const c = readJson(join(OUT, "content-visual-audit-latest.json"));
      pass = c?.gates?.pass === true;
      detail = `${c?.passed}/${c?.total}`;
    }
    if (dim.id === "mobile") {
      const m = readJson(join(OUT, "mobile-security-audit-latest.json"));
      pass = m?.gates?.pass === true;
      detail = `${m?.passed}/${m?.total}`;
    }

    dimensions.push({ ...dim, pass, detail, ms: step.ms });
    console.log(pass ? `PASS (${detail})` : `FAIL`);
  }

  process.stdout.write("  Quality scorecard … ");
  const qStep = runNpm("quality:audit", {
    QUALITY_GATE_BLOCKING: "0",
    QUALITY_SKIP_LH: process.env.EXAM_SKIP_LH === "1" ? "1" : "0",
  });
  const quality = readJson(QUALITY)?.summary ?? null;
  const qualityPass =
    quality?.passing === quality?.total &&
    Number(quality?.average) >= TARGET;
  console.log(qualityPass ? `PASS ${quality?.average}%` : `FAIL ${quality?.average}%`);

  process.stdout.write("  Verify prod … ");
  const vStep = runNpm("verify:prod", { VERIFY_SKIP_VERSION: "1" });
  console.log(vStep.ok ? "PASS" : "FAIL");

  process.stdout.write("  Integraciones … ");
  const iStep = runNode("check-integrations.mjs");
  console.log(iStep.ok ? "PASS" : "WARN");

  const findings = qualityFindings();
  const plan = buildPlan(findings, dimensions);
  const exam = {
    base: BASE,
    at: new Date().toISOString(),
    version: "6.0.0-pro",
    dimensions,
    quality: quality
      ? {
          average: quality.average,
          passing: quality.passing,
          total: quality.total,
          pass: qualityPass,
          failing: findings,
        }
      : null,
    verify: { pass: vStep.ok },
    integrations: { pass: iStep.ok },
    overallPass:
      dimensions.every((d) => d.pass) && qualityPass && vStep.ok,
    planItemCount: plan.length,
  };

  const jsonPath = join(OUT, "PRO-DEEP-EXAM-latest.json");
  const planPath = join(OUT, "PRO-DEEP-EXAM-PLAN.md");
  writeFileSync(jsonPath, `${JSON.stringify({ ...exam, plan }, null, 2)}\n`);
  writeFileSync(planPath, renderPlanMd(exam, plan));

  console.log(`\nInforme: ${jsonPath}`);
  console.log(`Plan: ${planPath}`);
  console.log(`\nOverall: ${exam.overallPass ? "PASS" : "FAIL"} · ${plan.length} acciones en backlog\n`);

  if (!exam.overallPass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
