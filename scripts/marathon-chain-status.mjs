/**
 * Estado rápido del encadenamiento de maratones.
 *   node scripts/marathon-chain-status.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  isProdCurrentlyBlocked,
  readProdProbeStatus,
} from "./lib/prod-probe-guard.mjs";

const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const CHAIN_LOG = join(OUT_DIR, "marathon-chain-log.jsonl");
const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);

function readChainLog() {
  if (!existsSync(CHAIN_LOG)) return { runsCompleted: 0, last: null };
  const lines = readFileSync(CHAIN_LOG, "utf8").trim().split("\n").filter(Boolean);
  let last = null;
  for (const line of lines) {
    try {
      last = JSON.parse(line);
    } catch {
      /* skip */
    }
  }
  return { runsCompleted: last?.runsCompleted ?? lines.length, last };
}

function findLatestProgress() {
  const files = readdirSync(OUT_DIR)
    .filter((f) => /^ultra-pro-100k-\d+-progress\.json$/.test(f))
    .map((f) => ({ f, m: statSync(join(OUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (files.length === 0) return { marathonId: resolveMarathonId(null), progress: null };
  const id = files[0].f.replace("-progress.json", "");
  try {
    return { marathonId: id, progress: JSON.parse(readFileSync(join(OUT_DIR, files[0].f), "utf8")) };
  } catch {
    return { marathonId: id, progress: null };
  }
}

function resolveMarathonId(chainLast) {
  if (process.env.MARATHON_ID) return process.env.MARATHON_ID;
  if (chainLast?.next) return chainLast.next;
  for (const name of readdirSync(OUT_DIR).filter((f) => f.endsWith("-chain-supervisor.json"))) {
    try {
      const s = JSON.parse(readFileSync(join(OUT_DIR, name), "utf8"));
      if (s.marathonId) return s.marathonId;
    } catch {
      /* */
    }
  }
  return "ultra-pro-100k-2";
}

function readProgress(marathonId) {
  try {
    return JSON.parse(readFileSync(join(OUT_DIR, `${marathonId}-progress.json`), "utf8"));
  } catch {
    return null;
  }
}

const { runsCompleted, last: chainLast } = readChainLog();
const latest = findLatestProgress();
const marathonId = latest.marathonId ?? resolveMarathonId(chainLast);
const progress = latest.progress ?? readProgress(marathonId);
const probe = readProdProbeStatus();
const prodBlocked = isProdCurrentlyBlocked();

const cycle = progress?.cycle ?? 0;
const total = progress?.total ?? TOTAL;
const gates = progress?.gates ?? null;

console.log(`marathonId:     ${marathonId}`);
console.log(`cycle/total:    ${cycle}/${total}`);
console.log(
  `gates:          ${gates ? `100t=${gates.tests100 ?? "?"}/${gates.testsTotal ?? "?"} Q=${gates.quality ? "✓" : "✗"}` : "—"}`
);
console.log(`runsCompleted:  ${runsCompleted}`);
console.log(
  `prod blocked:   ${prodBlocked ? `yes (HTTP ${probe?.status ?? "?"})` : "no"}`
);
if (progress?.at) console.log(`progress at:    ${progress.at}`);
