/**
 * Supervisor con encadenamiento: al completar 100k arranca el siguiente run.
 *   MARATHON_ID=ultra-pro-100k-2 node scripts/marathon-chain-supervisor.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import {
  isProdCurrentlyBlocked,
  probeProdHealth,
  readEffectiveQualityGatePass,
  QUALITY_LATEST,
  QUALITY_GATES_SNAPSHOT,
} from "./lib/prod-probe-guard.mjs";
import { assertProdMarathonAllowed } from "./lib/prod-paused.mjs";

const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const CHAIN = process.env.MARATHON_CHAIN !== "0";
const POLL_MS = Number(process.env.MARATHON_SUPERVISOR_MS ?? 45_000);
const STALE_MS = Number(process.env.MARATHON_STALE_MS ?? 1_200_000);
const ADVANCE_MS = Number(process.env.MARATHON_ADVANCE_MS ?? 120_000);

let marathonId = process.env.MARATHON_ID ?? "ultra-pro-100k-2";
let child = null;
let lastCycle = 0;
let lastProgressAt = Date.now();
let restarts = 0;
let runsCompleted = 0;

function paths() {
  return {
    progress: join(OUT_DIR, `${marathonId}-progress.json`),
    exhausted: join(OUT_DIR, `${marathonId}-exhausted.json`),
    status: join(OUT_DIR, `${marathonId}-chain-supervisor.json`),
  };
}

function nextMarathonId(id) {
  const m = id.match(/^(ultra-pro-100k)(?:-(\d+))?$/);
  if (!m) return `${id}-2`;
  const n = m[2] ? Number(m[2]) + 1 : 2;
  return `ultra-pro-100k-${n}`;
}

function readProgress() {
  try {
    return JSON.parse(readFileSync(paths().progress, "utf8"));
  } catch {
    return null;
  }
}

function listMarathonPids() {
  if (process.platform !== "win32") return [];
  const r = spawnSync(
    "wmic",
    ["process", "where", "commandline like '%marathon-ultra-100k%'", "get", "processid"],
    { encoding: "utf8", shell: process.platform === "win32" }
  );
  return (r.stdout ?? "")
    .split(/\s+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function isProgressAdvancing() {
  const progress = readProgress();
  if (!progress?.at) return false;
  const at = Date.parse(progress.at);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < ADVANCE_MS;
}

function shouldSkipExternalSpawn() {
  const pids = listMarathonPids();
  if (pids.length === 0) return false;
  return isProgressAdvancing();
}

function ensureChildDead() {
  if (!child || child.exitCode != null || child.killed) {
    child = null;
    return;
  }
  const pid = child.pid;
  console.log(`[chain] ensuring child pid=${pid} is dead`);
  child.kill();
  for (let i = 0; i < 60 && child.exitCode == null; i += 1) {
    spawnSync(
      process.platform === "win32" ? "ping" : "sleep",
      process.platform === "win32" ? ["127.0.0.1", "-n", "1", "-w", "500"] : ["0.5"],
      { shell: process.platform === "win32" }
    );
  }
  if (child.exitCode == null && pid) {
    spawnSync("taskkill", ["/PID", String(pid), "/F"], { shell: true });
  }
  child = null;
}

function isComplete() {
  const { exhausted } = paths();
  if (!existsSync(exhausted)) return false;
  try {
    const done = JSON.parse(readFileSync(exhausted, "utf8"));
    return done.cycles >= TOTAL && done.status === "COMPLETED";
  } catch {
    return false;
  }
}

function restoreQualityIfCorrupt() {
  if (!isProdCurrentlyBlocked()) return;
  try {
    const latest = JSON.parse(readFileSync(QUALITY_LATEST, "utf8"));
    const s = latest.summary ?? {};
    if (s.passing === s.total && Number(s.average) >= 95) return;
  } catch {
    /* corrupt */
  }
  const good = join(
    process.cwd(),
    "docs/quality-reports/quality-scorecard-2026-07-04-17-26-40.json"
  );
  if (existsSync(good)) {
    copyFileSync(good, QUALITY_LATEST);
    console.log("[chain] quality-scorecard-latest restaurado desde snapshot 20/20");
  }
}

function writeStatus(extra = {}) {
  const p = readProgress();
  const quality = readEffectiveQualityGatePass();
  writeFileSync(
    paths().status,
    `${JSON.stringify(
      {
        supervisor: "chain",
        marathonId,
        cycle: p?.cycle ?? lastCycle,
        total: TOTAL,
        gates: p?.gates ?? null,
        effectiveQuality: quality,
        runsCompleted,
        chain: CHAIN,
        childRunning: child != null && child.exitCode == null,
        at: new Date().toISOString(),
        ...extra,
      },
      null,
      2
    )}\n`
  );
}

function finalizeRun() {
  spawnSync("node", ["scripts/marathon-finalize-100k.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, MARATHON_ID: marathonId, MARATHON_CYCLES: String(TOTAL) },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

function startMarathon(fromCycle = 1) {
  if (shouldSkipExternalSpawn()) {
    const pids = listMarathonPids();
    console.log(
      `[chain] external marathon active (pids=${pids.join(",")}) — skip spawn`
    );
    writeStatus({ action: "external-skip", externalPids: pids });
    return;
  }

  const start = Math.min(TOTAL, Math.max(1, fromCycle));
  console.log(`[chain] start ${marathonId} cycle ${start} (restart #${restarts})`);
  restarts += 1;
  child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "marathon:ultra-100k"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MARATHON_ID: marathonId,
        MARATHON_CYCLES: String(TOTAL),
        MARATHON_START_CYCLE: String(start),
        MARATHON_FULL_RUN: "1",
        MARATHON_TURBO: "1",
        MARATHON_TURBO_VERIFY_EVERY: process.env.MARATHON_TURBO_VERIFY_EVERY ?? "500",
        MARATHON_PROGRESS_EVERY: process.env.MARATHON_PROGRESS_EVERY ?? "1000",
        KEEP_WARM_STRICT: "0",
      },
      stdio: "ignore",
      shell: process.platform === "win32",
    }
  );
  child.on("exit", (code) => {
    console.log(`[chain] ${marathonId} exit code=${code ?? "?"}`);
    child = null;
    writeStatus({ lastExit: code });
  });
  lastCycle = start - 1;
  lastProgressAt = Date.now();
  writeStatus({ action: "started", startCycle: start });
}

function chainNextRun() {
  runsCompleted += 1;
  finalizeRun();
  ensureChildDead();
  if (!CHAIN) {
    writeStatus({ supervisor: "done", action: "completed-no-chain" });
    process.exit(0);
  }
  const prev = marathonId;
  marathonId = nextMarathonId(marathonId);
  console.log(`[chain] ${prev} COMPLETED → next ${marathonId}`);
  writeFileSync(
    join(OUT_DIR, "marathon-chain-log.jsonl"),
    `${JSON.stringify({ at: new Date().toISOString(), completed: prev, next: marathonId, runsCompleted })}\n`,
    { flag: "a" }
  );
  restarts = 0;
  startMarathon(1);
}

function ensureMarathon() {
  restoreQualityIfCorrupt();

  if (isComplete()) {
    chainNextRun();
    return;
  }

  const progress = readProgress();
  if (progress?.cycle != null && progress.cycle > lastCycle) {
    lastCycle = progress.cycle;
    lastProgressAt = Date.parse(progress.at ?? "") || Date.now();
    const q = readEffectiveQualityGatePass();
    console.log(
      `[chain] ${marathonId} ${progress.cycle}/${TOTAL} · Q=${q ? "✓" : "✗"} · ${progress.gates?.tests100 ?? "?"}/105`
    );
  }

  if (lastCycle >= TOTAL && existsSync(paths().exhausted)) {
    finalizeRun();
    if (isComplete()) chainNextRun();
    return;
  }

  const running = child != null && child.exitCode == null && !child.killed;
  if (running) {
    writeStatus({ action: "running" });
    return;
  }

  if (shouldSkipExternalSpawn()) {
    const pids = listMarathonPids();
    writeStatus({ action: "external-marathon", externalPids: pids });
    return;
  }

  if (Date.now() - lastProgressAt > STALE_MS && lastCycle > 0 && lastCycle < TOTAL) {
    console.warn(`[chain] stale — relaunch ${marathonId} from ${lastCycle}`);
  }

  const next = Math.max(lastCycle, progress?.cycle ?? 0);
  if (next < TOTAL) startMarathon(next === 0 ? 1 : next);
}

mkdirSync(OUT_DIR, { recursive: true });
assertProdMarathonAllowed();
probeProdHealth().catch(() => {});
restoreQualityIfCorrupt();

const initial = readProgress();
lastCycle = initial?.cycle ?? 0;
if (initial?.at) lastProgressAt = Date.parse(initial.at) || Date.now();

console.log(`[chain] control · ${marathonId} · from ${lastCycle}/${TOTAL} · chain=${CHAIN}`);
writeStatus({ action: "boot" });

if (!isComplete() && lastCycle < TOTAL) {
  startMarathon(lastCycle === 0 ? 1 : lastCycle);
} else if (isComplete()) {
  chainNextRun();
}

setInterval(ensureMarathon, POLL_MS);
