#!/usr/bin/env node
/**
 * Vigila prod cada 5 min; avisa cuando HTTP 200 sea estable (3 lecturas).
 * No quita PROD_VERCEL_PAUSED solo — imprime pasos.
 *   npm run prod:recover-watch
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { isDeploymentDisabledBody } from "./lib/prod-probe-guard.mjs";

const SITE = (process.env.SITE_URL ?? "https://queveohoy.es").replace(/\/$/, "");
const INTERVAL_MS = Number(process.env.PROD_RECOVER_INTERVAL_MS ?? 5 * 60_000);
const STABLE_READS = 3;
const PAUSED = join(process.cwd(), "docs", "PROD_VERCEL_PAUSED");

let stable = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

console.log(`[prod:recover-watch] ${SITE} cada ${INTERVAL_MS / 1000}s\n`);

while (true) {
  try {
    const res = await fetch(`${SITE}/api/health`, {
      headers: { Accept: "application/json", "User-Agent": "qvh-recover-watch/1" },
      signal: AbortSignal.timeout(20_000),
    });
    const body = await res.text();

    if (res.ok && !isDeploymentDisabledBody(body)) {
      stable += 1;
      let version = "?";
      try {
        version = JSON.parse(body).version ?? "?";
      } catch {
        /* ignore */
      }
      console.log(`[${new Date().toISOString()}] OK HTTP ${res.status} v${version} (${stable}/${STABLE_READS})`);

      if (stable >= STABLE_READS) {
        console.log("\n✓ Prod estable. Pasos manuales:\n");
        if (existsSync(PAUSED)) {
          console.log("  del docs\\PROD_VERCEL_PAUSED");
          console.log('  git add -u docs/PROD_VERCEL_PAUSED');
          console.log('  git commit -m "chore: reactivar prod estable"');
          console.log("  git push origin main");
          console.log("\n  (solo GitHub Actions deploy — NO vercel deploy --prod en paralelo)\n");
        } else {
          console.log("  PROD_VERCEL_PAUSED ya no existe — GHA debería desplegar solo.\n");
        }
        process.exit(0);
      }
    } else {
      stable = 0;
      console.warn(
        `[${new Date().toISOString()}] bloqueado HTTP ${res.status}${isDeploymentDisabledBody(body) ? " DEPLOYMENT_DISABLED" : ""}`
      );
    }
  } catch (err) {
    stable = 0;
    console.warn(`[${new Date().toISOString()}] error:`, err instanceof Error ? err.message : err);
  }

  await sleep(INTERVAL_MS);
}
