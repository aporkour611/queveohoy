/**
 * Supervisor autónomo: un solo maratón turbo hasta 100k, relanza si cae.
 *   node scripts/marathon-supervisor.mjs
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { isProdCurrentlyBlocked, probeProdHealth } from "./lib/prod-probe-guard.mjs";

const MARATHON_ID = process.env.MARATHON_ID ?? "ultra-pro-100k";
const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS = join(OUT_DIR, `${MARATHON_ID}-progress.json`);
const EXHAUSTED = join(OUT_DIR, `${MARATHON_ID}-exhausted.json`);
const STATUS = join(OUT_DIR, `${MARATHON_ID}-supervisor.json`);
const POLL_MS = Number(process.env.MARATHON_SUPERVISOR_MS ?? 60_000);
const CRESTS_AUDIT_MS = Number(process.env.MARATHON_CRESTS_AUDIT_MS ?? 1_800_000);
const STALE_MS = Number(process.env.MARATHON_STALE_MS ?? 1_200_000);

let child = null;
let lastCycle = 0;
let lastProgressAt = Date.now();
let restarts = 0;

function readProgress() {
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return null;
  }
}

function writeStatus(extra = {}) {
  const p = readProgress();
  writeFileSync(
    STATUS,
    `${JSON.stringify(
      {
        supervisor: "active",
        marathonId: MARATHON_ID,
        cycle: p?.cycle ?? lastCycle,
        total: TOTAL,
        gates: p?.gates ?? null,
        progressAt: p?.at ?? null,
        restarts,
        childRunning: child != null && child.exitCode == null,
        at: new Date().toISOString(),
        ...extra,
      },
      null,
      2
    )}\n`
  );
}

function isComplete() {
  if (!existsSync(EXHAUSTED)) return false;
  try {
    const done = JSON.parse(readFileSync(EXHAUSTED, "utf8"));
    return done.cycles >= TOTAL && done.status === "COMPLETED";
  } catch {
    return false;
  }
}

function listMarathonPids() {
  if (process.platform !== "win32") return [];
  const r = spawnSync(
    "wmic",
    ["process", "where", "commandline like '%marathon-ultra-100k%'", "get", "processid"],
    { encoding: "utf8" }
  );
  return (r.stdout ?? "")
    .split(/\s+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function isChildRunning() {
  return child != null && child.exitCode == null && !child.killed;
}

function startMarathon(fromCycle) {
  const start = Math.min(TOTAL, Math.max(1, fromCycle));
  console.log(`[supervisor] start marathon cycle ${start} (restart #${restarts})`);
  restarts += 1;
  child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "marathon:ultra-100k"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MARATHON_START_CYCLE: String(start),
        MARATHON_FULL_RUN: "1",
        MARATHON_TURBO: "1",
        MARATHON_TURBO_VERIFY_EVERY: process.env.MARATHON_TURBO_VERIFY_EVERY ?? "500",
        MARATHON_PROGRESS_EVERY: process.env.MARATHON_PROGRESS_EVERY ?? "1000",
        KEEP_WARM_STRICT: "0",
      },
      stdio: "ignore",
      detached: false,
      shell: process.platform === "win32",
    }
  );
  child.on("exit", (code) => {
    console.log(`[supervisor] marathon exit code=${code ?? "?"}`);
    child = null;
    writeStatus({ lastExit: code });
  });
  writeStatus({ action: "started", startCycle: start });
}

function ensureMarathon() {
  if (isComplete()) return false;

  const progress = readProgress();
  if (progress?.cycle != null && progress.cycle > lastCycle) {
    lastCycle = progress.cycle;
    lastProgressAt = Date.parse(progress.at ?? "") || Date.now();
    console.log(
      `[supervisor] ${progress.cycle}/${TOTAL} · Q=${progress.gates?.quality ? "✓" : "✗"} · ${progress.gates?.tests100 ?? "?"}/${progress.gates?.testsTotal ?? 105}`
    );
  }

  if (lastCycle >= TOTAL) return false;

  const stale = Date.now() - lastProgressAt > STALE_MS;

  if (isChildRunning()) {
    if (stale) {
      console.warn(`[supervisor] stale ${Math.round((Date.now() - lastProgressAt) / 1000)}s — waiting (spot-check LH?)`);
    }
    writeStatus({ action: "running" });
    return true;
  }

  const external = listMarathonPids();
  if (external.length > 0 && !isChildRunning()) {
    lastProgressAt = Date.parse(progress?.at ?? "") || Date.now();
    writeStatus({ action: "external-marathon", externalPids: external });
    return true;
  }

  const next = Math.max(lastCycle, progress?.cycle ?? 0);
  const start = next >= TOTAL ? TOTAL : next === 0 ? 1 : next;
  startMarathon(start);
  return true;
}

mkdirSync(OUT_DIR, { recursive: true });
const initial = readProgress();
lastCycle = initial?.cycle ?? 0;
if (initial?.at) lastProgressAt = Date.parse(initial.at) || Date.now();

console.log(`[supervisor] autonomous control · from cycle ${lastCycle}/${TOTAL}`);
writeStatus({ action: "boot" });

if (isComplete()) {
  writeStatus({ supervisor: "done", action: "already-complete" });
  console.log("[supervisor] already COMPLETED");
  process.exit(0);
}

ensureMarathon();
setInterval(() => {
  if (isComplete()) {
    writeStatus({ supervisor: "done", action: "completed" });
    console.log("[supervisor] COMPLETED 100k");
    if (isChildRunning()) child.kill();
    process.exit(0);
  }
  ensureMarathon();
}, POLL_MS);

function runParallelCrestsAudit() {
  if (isComplete()) return;
  if (isProdCurrentlyBlocked()) {
    console.log("[supervisor] crests-audit omitido (prod bloqueado)");
    writeStatus({ action: "crests-audit-skipped-blocked" });
    return;
  }
  probeProdHealth().then((p) => {
    if (p.blocked) {
      console.log(`[supervisor] crests-audit omitido HTTP ${p.status}`);
      return;
    }
    console.log("[supervisor] crests-audit (parallel, no marathon stop)");
    spawnSync("node", ["scripts/crests-quality-audit.mjs"], {
      cwd: process.cwd(),
      env: { ...process.env, CRESTS_AUDIT_STRICT: "0" },
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    writeStatus({ action: "crests-audit-parallel" });
  });
}

setInterval(runParallelCrestsAudit, CRESTS_AUDIT_MS);
