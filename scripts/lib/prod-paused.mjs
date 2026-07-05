/**
 * Prod pausado por Vercel — no iniciar maratón ni probes hasta quitar flag.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { isProdCurrentlyBlocked, readProdProbeStatus } from "./prod-probe-guard.mjs";
import { isVercelPausedInRepo } from "./prod-vercel-paused.mjs";

const FLAG = join(process.cwd(), "docs", "marathon-reports", "PROD-PAUSED.flag");

export function isProdPausedByPolicy() {
  if (process.env.MARATHON_ALLOW_PROD === "1") return false;
  if (process.env.MARATHON_PAUSED === "1") return true;
  if (isVercelPausedInRepo()) return true;
  if (existsSync(FLAG)) return true;
  return false;
}

export function assertProdMarathonAllowed() {
  if (isProdPausedByPolicy()) {
    console.error(
      "\n[marathon] PROD PAUSADO. Quita docs/PROD_VERCEL_PAUSED o PROD-PAUSED.flag, o usa MARATHON_ALLOW_PROD=1.\n"
    );
    process.exit(1);
  }
  if (isProdCurrentlyBlocked()) {
    const s = readProdProbeStatus();
    console.error(
      `\n[marathon] prod bloqueado HTTP ${s?.status ?? "?"}. Espera desbloqueo (npm run prod:unblock-watch).\n`
    );
    process.exit(1);
  }
}
