/**
 * Vigila ultra-pro-100k y lo relanza si muere antes del ciclo 100000.
 * Uso: node scripts/marathon-watchdog.mjs
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MARATHON_ID = process.env.MARATHON_ID ?? "ultra-pro-100k";
const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const OUT_DIR = join(process.cwd(), "docs", "marathon-reports");
const PROGRESS = join(OUT_DIR, `${MARATHON_ID}-progress.json`);
const POLL_MS = Number(process.env.MARATHON_WATCHDOG_MS ?? 120_000);
const STALE_MS = Number(process.env.MARATHON_STALE_MS ?? 900_000);

let child = null;
let lastCycle = 0;
let lastProgressAt = Date.now();

function readProgress() {
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return null;
  }
}

function isMarathonRunning() {
  return child != null && child.exitCode == null && !child.killed;
}

function startMarathon(fromCycle) {
  const start = Math.min(TOTAL, Math.max(1, fromCycle));
  console.log(`[watchdog] launch marathon from cycle ${start}`);
  child = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "marathon:ultra-100k"],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        MARATHON_START_CYCLE: String(start),
        MARATHON_FULL_RUN: "1",
        MARATHON_TURBO: process.env.MARATHON_TURBO ?? "1",
        MARATHON_TURBO_VERIFY_EVERY: process.env.MARATHON_TURBO_VERIFY_EVERY ?? "500",
        MARATHON_PROGRESS_EVERY: process.env.MARATHON_PROGRESS_EVERY ?? "1000",
        KEEP_WARM_STRICT: "0",
      },
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );
  child.on("exit", (code) => {
    console.log(`[watchdog] marathon exited code=${code ?? "?"}`);
    child = null;
  });
}

function isFullyComplete() {
  const exhausted = join(OUT_DIR, `${MARATHON_ID}-exhausted.json`);
  if (!existsSync(exhausted)) return false;
  try {
    const done = JSON.parse(readFileSync(exhausted, "utf8"));
    return done.cycles >= TOTAL && done.status === "COMPLETED";
  } catch {
    return false;
  }
}

function externalMarathonLikely() {
  const p = readProgress();
  if (!p?.at) return false;
  return Date.now() - Date.parse(p.at) < STALE_MS;
}

function tick() {
  if (isFullyComplete()) {
    console.log("[watchdog] full 100k COMPLETED");
    process.exit(0);
  }

  const progress = readProgress();
  if (progress?.cycle != null && progress.cycle > lastCycle) {
    lastCycle = progress.cycle;
    lastProgressAt = Date.parse(progress.at ?? "") || Date.now();
    console.log(
      `[watchdog] cycle ${progress.cycle}/${TOTAL} · ${progress.gates?.tests100 ?? "?"}/100 Q=${progress.gates?.quality ? "✓" : "✗"}`
    );
  }

  if (lastCycle >= TOTAL) {
    console.log(`[watchdog] progress at ${lastCycle}`);
    process.exit(0);
  }

  if (!isMarathonRunning()) {
    if (externalMarathonLikely()) return;
    const next = (progress?.cycle ?? lastCycle) + 1;
    if (next <= TOTAL) startMarathon(next);
    return;
  }

  if (Date.now() - lastProgressAt > STALE_MS) {
    console.warn(
      `[watchdog] sin avance ${Math.round((Date.now() - lastProgressAt) / 1000)}s (paso largo en curso)`
    );
  }
}

const initial = readProgress();
lastCycle = initial?.cycle ?? 0;
if (initial?.at) lastProgressAt = Date.parse(initial.at) || Date.now();

if (!isFullyComplete() && lastCycle < TOTAL) {
  console.log(`[watchdog] monitoring from cycle ${lastCycle}/${TOTAL}`);
}

setInterval(tick, POLL_MS);
