/** Marcador en repo: prod pausado por Vercel — GHA y scripts lo respetan. */
import { existsSync } from "node:fs";
import { join } from "node:path";

export const PROD_VERCEL_PAUSED_FILE = join(process.cwd(), "docs", "PROD_VERCEL_PAUSED");

export function isVercelPausedInRepo() {
  return existsSync(PROD_VERCEL_PAUSED_FILE);
}

export function assertNotVercelPaused(label = "script") {
  if (!isVercelPausedInRepo()) return;
  console.warn(`[${label}] omitido: docs/PROD_VERCEL_PAUSED (Vercel bloqueado)`);
  process.exit(0);
}
