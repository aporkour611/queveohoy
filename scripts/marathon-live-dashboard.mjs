/**
 * Dashboard en vivo — imprime resumen acumulado de la cadena.
 *   node scripts/marathon-live-dashboard.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  isProdCurrentlyBlocked,
  readProdProbeStatus,
  readEffectiveQualityGatePass,
  readEffectiveProReport,
} from "./lib/prod-probe-guard.mjs";

const OUT = join(process.cwd(), "docs", "marathon-reports");
const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const CHAIN_LOG = join(OUT, "marathon-chain-log.jsonl");

function latestProgress() {
  const files = readdirSync(OUT)
    .filter((f) => /^ultra-pro-100k-\d+-progress\.json$/.test(f))
    .map((f) => ({ f, m: statSync(join(OUT, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (!files.length) return null;
  try {
    return JSON.parse(readFileSync(join(OUT, files[0].f), "utf8"));
  } catch {
    return null;
  }
}

function countCompletedRuns() {
  let n = existsSync(join(OUT, "ultra-pro-100k-exhausted.json")) ? 1 : 0;
  for (const f of readdirSync(OUT)) {
    if (/^ultra-pro-100k-\d+-exhausted\.json$/.test(f)) {
      try {
        const d = JSON.parse(readFileSync(join(OUT, f), "utf8"));
        if (d.status === "COMPLETED") n += 1;
      } catch {
        /* */
      }
    }
  }
  if (existsSync(CHAIN_LOG)) {
    const lines = readFileSync(CHAIN_LOG, "utf8").trim().split("\n").filter(Boolean);
    if (lines.length) {
      try {
        const last = JSON.parse(lines[lines.length - 1]);
        return last.runsCompleted ?? n;
      } catch {
        /* */
      }
    }
  }
  return n;
}

function crestStats() {
  try {
    const reg = JSON.parse(readFileSync(join(process.cwd(), "app/lib/pinned-images.json"), "utf8"));
    const keys = Object.keys(reg.byKey ?? {});
    const esports = keys.filter((k) => k.startsWith("esports:")).length;
    const football = keys.filter((k) => k.startsWith("football:")).length;
    const basket = keys.filter((k) => k.startsWith("basket:")).length;
    return { esports, football, basket, total: keys.length };
  } catch {
    return { esports: 0, football: 0, basket: 0, total: 0 };
  }
}

const progress = latestProgress();
const runsDone = countCompletedRuns();
const cyclesDone = runsDone * TOTAL + (progress?.cycle ?? 0);
const probe = readProdProbeStatus();
const pro = readEffectiveProReport(join(OUT, "PRO-100-TESTS-latest.json"));
const crests = crestStats();

const dash = {
  at: new Date().toISOString(),
  activeRun: progress?.marathonId ?? "—",
  cycle: progress?.cycle ?? 0,
  total: TOTAL,
  pct: progress ? Math.round((progress.cycle / TOTAL) * 1000) / 10 : 0,
  runsCompleted: runsDone,
  cumulativeCycles: cyclesDone,
  gates: {
    pro: pro?.pass ? `${pro.passed}/${pro.total}` : "—",
    quality: readEffectiveQualityGatePass(),
  },
  prod: {
    blocked: isProdCurrentlyBlocked(),
    status: probe?.status ?? null,
    nextProbeAfter: probe?.nextProbeAfter ?? null,
  },
  crests,
};

writeFileSync(join(OUT, "LIVE-DASHBOARD.json"), `${JSON.stringify(dash, null, 2)}\n`);

console.log(`
╔══════════════════════════════════════════════════╗
║  QUEVEOHOY · MARATÓN LIVE                        ║
╠══════════════════════════════════════════════════╣
║  Run activo:  ${String(dash.activeRun).padEnd(32)}║
║  Ciclo:       ${String(`${dash.cycle.toLocaleString("es-ES")} / ${dash.total.toLocaleString("es-ES")} (${dash.pct}%)`).padEnd(32)}║
║  Runs OK:     ${String(dash.runsCompleted).padEnd(32)}║
║  Acumulado:   ${String(`${dash.cumulativeCycles.toLocaleString("es-ES")} ciclos`).padEnd(32)}║
║  PRO:         ${String(dash.gates.pro).padEnd(32)}║
║  Quality:     ${String(dash.gates.quality ? "✓ 20/20" : "✗").padEnd(32)}║
║  Prod:        ${String(dash.prod.blocked ? `bloqueado HTTP ${dash.prod.status}` : `OK ${dash.prod.status}`).padEnd(32)}║
║  Crests pin:  ${String(`${crests.total} (e:${crests.esports} f:${crests.football} b:${crests.basket})`).padEnd(32)}║
╚══════════════════════════════════════════════════╝
`);
