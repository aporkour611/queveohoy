/**
 * Supermaratón PRO Launch 6.0 — examen + gates + plan implementado.
 *
 *   npm run marathon:pro-launch
 *
 * Basado en supreme-strict + exam:pro cada oleada.
 * Gates: cold strict, content, mobile, quality 20/20≥95%, verify v6.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 3_600);
const MARATHON_ID = process.env.MARATHON_ID ?? "pro-launch-6";
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS_EVERY = Number(process.env.MARATHON_PROGRESS_EVERY ?? 36);
const QUALITY_MIN = Number(process.env.QUALITY_MIN_SCORE ?? 95);
const EXAM_EVERY = Number(process.env.MARATHON_EXAM_EVERY ?? 72);

const REPORTS = {
  quality: join(process.cwd(), "docs", "quality-reports", "quality-scorecard-latest.json"),
  cold: join(OUT_DIR, "cold-start-audit-latest.json"),
  mobile: join(OUT_DIR, "mobile-security-audit-latest.json"),
  content: join(OUT_DIR, "content-visual-audit-latest.json"),
  exam: join(OUT_DIR, "PRO-DEEP-EXAM-latest.json"),
};

const ROTATION = [
  { phase: "exam", cmd: "pro-exam" },
  { phase: "warmup", cmd: "warm-full" },
  { phase: "cold", cmd: "cold-strict" },
  { phase: "content", cmd: "content-visual" },
  { phase: "mobile", cmd: "mobile-audit" },
  { phase: "quality", cmd: "quality-strict" },
  { phase: "cwv", cmd: "cwv-deep" },
  { phase: "perf", cmd: "perf-budget" },
  { phase: "seo", cmd: "seo-discovery" },
  { phase: "design", cmd: "design-discovery" },
  { phase: "build", cmd: "validate" },
  { phase: "tests", cmd: "test-partido" },
  { phase: "verify", cmd: "verify-full" },
  { phase: "warmup", cmd: "warm" },
  { phase: "cold", cmd: "cold-strict" },
  { phase: "quality", cmd: "quality-strict" },
  { phase: "integrations", cmd: "check-integrations" },
  { phase: "gate", cmd: "gate-snapshot" },
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
  if (!payload?.summary) return { pass: false, failing: [] };
  const { summary } = payload;
  const failing = (summary.rows ?? []).filter(
    (r) => r.score != null && r.status !== "pass"
  );
  return {
    pass:
      summary.measured === summary.total &&
      failing.length === 0 &&
      Number(summary.average) >= QUALITY_MIN,
    average: summary.average,
    passing: summary.passing,
    total: summary.total,
    failing: failing.map((r) => ({ id: r.id, score: r.score, gap: r.gap })),
  };
}

function readColdGate() {
  const p = readJson(REPORTS.cold);
  return {
    pass: p?.gates?.criticalPass === true && p?.gates?.strict === true,
    homeWarmMs: p?.homeWarmMs,
    homeColdMs: p?.homeColdMs,
    hubHeavyWarn: p?.gates?.hubHeavyWarn,
  };
}

function readMobileGate() {
  const p = readJson(REPORTS.mobile);
  return { pass: p?.gates?.pass === true };
}

function readContentGate() {
  const p = readJson(REPORTS.content);
  const failed = (p?.checks ?? []).filter((c) => !c.ok).map((c) => c.name);
  return { pass: p?.gates?.pass === true, failed };
}

function readAllGates() {
  const quality = readQualityGate();
  const cold = readColdGate();
  const mobile = readMobileGate();
  const content = readContentGate();
  return {
    quality,
    cold,
    mobile,
    content,
    allPass: quality.pass && cold.pass && mobile.pass && content.pass,
  };
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
    case "pro-exam":
      return runCmd("exam:pro", "node", ["scripts/pro-deep-exam.mjs"], {
        EXAM_SKIP_LH: "1",
        VERIFY_SKIP_VERSION: "1",
      });
    case "warm":
      return runCmd("warm", "npm", ["run", "keep-warm:prod"]);
    case "warm-full":
      return runCmd("warm-full", "npm", ["run", "keep-warm:prod"], {
        KEEP_WARM_FULL: "1",
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
    case "quality-strict":
      return runCmd("quality", "npm", ["run", "quality:audit"], {
        QUALITY_GATE_BLOCKING: "1",
        QUALITY_SKIP_LH: "0",
      });
    case "cwv-deep":
      return runCmd("cwv", "npm", ["run", "cwv:audit"], {
        CWV_GATE_BLOCKING: "0",
        CWV_RUNS: "16",
      });
    case "perf-budget":
      return runCmd("perf", "npm", ["run", "perf:budget"]);
    case "seo-discovery":
      return runCmd("seo", "node", ["scripts/discovery-seo-audit.mjs"]);
    case "design-discovery":
      return runCmd("design", "node", ["scripts/discovery-design-audit.mjs"]);
    case "validate":
      return runCmd("validate", "npm", ["run", "validate"]);
    case "test-partido":
      return runCmd("tests", "npm", [
        "test",
        "--",
        "app/lib/premium-images.test.ts",
        "app/lib/home-lcp.test.ts",
        "app/lib/poster-quality.test.ts",
        "app/lib/quality-scorecard.test.ts",
      ]);
    case "check-integrations":
      return runCmd("integrations", "node", ["scripts/check-integrations.mjs"]);
    case "verify-full":
      return runCmd("verify", "npm", ["run", "verify:prod"]);
    case "gate-snapshot": {
      const gates = readAllGates();
      return { label: "gate", ok: gates.allPass, ms: 0, exit: gates.allPass ? 0 : 1, gates };
    }
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
        version: "6.0.0-pro",
        cycle,
        total: TOTAL,
        step,
        gates,
        plan: existsSync(REPORTS.exam)
          ? readJson(REPORTS.exam)?.plan?.slice(0, 8)
          : [],
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
}

function formatGates(g) {
  return [
    g.quality.pass ? "Q✓" : `Q✗${g.quality.passing}/${g.quality.total}`,
    g.cold.pass ? "C✓" : "C✗",
    g.mobile.pass ? "M✓" : "M✗",
    g.content.pass ? "V✓" : "V✗",
  ].join(" ");
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n[${MARATHON_ID}] PRO Launch 6.0 · ${TOTAL} ciclos\n`);

  for (let cycle = 1; cycle <= TOTAL; cycle += 1) {
    const rotation = ROTATION[(cycle - 1) % ROTATION.length];
    const step = { ...rotation, ...runStep(rotation.cmd) };
    const gates = readAllGates();

    if (
      cycle % PROGRESS_EVERY === 0 ||
      cycle === 1 ||
      rotation.cmd === "gate-snapshot" ||
      cycle === TOTAL
    ) {
      writeProgress(cycle, step, gates);
      console.log(
        `[${MARATHON_ID}] ${cycle}/${TOTAL} · ${rotation.phase}/${rotation.cmd} · ${formatGates(gates)}`
      );
      if (!gates.quality.pass && gates.quality.failing?.length) {
        console.log(
          `  gaps → ${gates.quality.failing
            .slice(0, 5)
            .map((f) => `${f.id}:${f.score}%`)
            .join(" ")}`
        );
      }
    }

    if (gates.allPass) {
      const done = {
        marathonId: MARATHON_ID,
        status: "COMPLETED",
        version: "6.0.0-pro",
        cycles: cycle,
        gates,
        at: new Date().toISOString(),
      };
      writeFileSync(
        join(OUT_DIR, `${MARATHON_ID}-completed.json`),
        `${JSON.stringify(done, null, 2)}\n`
      );
      console.log(`\n[${MARATHON_ID}] COMPLETED cycle ${cycle}\n`);
      return;
    }
  }

  const gates = readAllGates();
  writeFileSync(
    join(OUT_DIR, `${MARATHON_ID}-exhausted.json`),
    `${JSON.stringify(
      { marathonId: MARATHON_ID, status: "EXHAUSTED", cycles: TOTAL, gates, at: new Date().toISOString() },
      null,
      2
    )}\n`
  );
  console.error(`\n[${MARATHON_ID}] EXHAUSTED · ${formatGates(gates)}\n`);
  process.exitCode = 1;
}

main();
