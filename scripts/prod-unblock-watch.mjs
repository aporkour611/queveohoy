#!/usr/bin/env node
/**
 * Vigila /api/health hasta que prod deje de devolver 402/429.
 * Intervalos largos cuando bloqueado (5 min) para no empeorar rate-limit.
 *
 *   node scripts/prod-unblock-watch.mjs
 */
import { spawnSync } from "node:child_process";
import {
  PROBE_INTERVAL_BLOCKED_MS,
  PROBE_INTERVAL_OK_MS,
  probeProdHealth,
} from "./lib/prod-probe-guard.mjs";

const SITE = (process.env.DISCOVERY_URL ?? "https://queveohoy.es").replace(/\/$/, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let wasBlocked = false;
let testsRanAfterUnblock = false;

console.log(`[unblock-watch] ${SITE} — blocked=${PROBE_INTERVAL_BLOCKED_MS / 1000}s ok=${PROBE_INTERVAL_OK_MS / 1000}s`);

while (true) {
  const health = await probeProdHealth(SITE, { force: true });

  if (health.blocked) {
    console.warn(
      `[unblock-watch] blocked HTTP ${health.status}${health.nextProbeAfter ? ` — next probe after ${health.nextProbeAfter}` : ""}`
    );
    wasBlocked = true;
    await sleep(PROBE_INTERVAL_BLOCKED_MS);
    continue;
  }

  console.log(`[unblock-watch] OK HTTP ${health.status} (${health.ms}ms)`);

  if (wasBlocked && !testsRanAfterUnblock) {
    console.log("[unblock-watch] prod unblocked — running PRO-100 tests once");
    testsRanAfterUnblock = true;
    const result = spawnSync("node", ["scripts/pro-100-tests.mjs"], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      console.warn(`[unblock-watch] PRO-100 exit ${result.status ?? "signal"}`);
    }
    wasBlocked = false;
  }

  await sleep(PROBE_INTERVAL_OK_MS);
}
