/**
 * Heartbeat visible — actualiza LIVE-DASHBOARD.json cada N segundos.
 *   npm run marathon:heartbeat
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const INTERVAL_MS = Number(process.env.MARATHON_HEARTBEAT_MS ?? 30_000);
const OUT = join(process.cwd(), "docs", "marathon-reports");
const ACTIVITY = join(OUT, "AGENT-ACTIVITY.log");

mkdirSync(OUT, { recursive: true });

function tick() {
  const at = new Date().toISOString();
  spawnSync("node", ["scripts/marathon-live-dashboard.mjs"], {
    cwd: process.cwd(),
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  appendFileSync(ACTIVITY, `${at} heartbeat · dashboard updated\n`);
  console.log(`[heartbeat] ${at}`);
}

console.log(`[heartbeat] cada ${INTERVAL_MS / 1000}s → LIVE-DASHBOARD.json + AGENT-ACTIVITY.log`);
tick();
setInterval(tick, INTERVAL_MS);
