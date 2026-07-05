#!/usr/bin/env node
/**
 * Estado rápido de queveohoy.es — ¿por qué no carga?
 *   node scripts/check-prod-status.mjs
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { isDeploymentDisabledBody } from "./lib/prod-probe-guard.mjs";

const SITE = (process.env.SITE_URL ?? "https://queveohoy.es").replace(/\/$/, "");
const PAUSED_FILE = join(process.cwd(), "docs", "PROD_VERCEL_PAUSED");

console.log(`\n[check-prod] ${SITE}\n`);

try {
  const res = await fetch(`${SITE}/api/health`, {
    headers: { Accept: "*/*", "User-Agent": "qvh-check-prod/1" },
    signal: AbortSignal.timeout(20_000),
  });
  const body = await res.text();
  const disabled = isDeploymentDisabledBody(body);

  console.log(`HTTP ${res.status}`);
  if (res.ok) {
    console.log("✓ Producción OK — la web debería cargar.");
    try {
      const json = JSON.parse(body);
      console.log(`  versión: ${json.version ?? "?"}`);
    } catch {
      /* ignore */
    }
    process.exit(0);
  }

  if (disabled || res.status === 402) {
    console.log("\n✗ CUENTA VERCEL BLOQUEADA (DEPLOYMENT_DISABLED)");
    console.log("  No es un fallo del código. Vercel pausó el equipo por fair-use.");
    console.log("  El último deploy puede estar 'Ready' pero el edge devuelve 402.\n");
    console.log("Qué hacer (gratis, plan Hobby):");
    console.log("  1. https://vercel.com/help → nuevo ticket");
    console.log("  2. Pide unpause del team alvaro-s-projects20 / proyecto queveohoy");
    console.log("  3. Texto listo en docs/VERCEL-UNPAUSE.md\n");
    if (existsSync(PAUSED_FILE)) {
      console.log("Repo: docs/PROD_VERCEL_PAUSED activo (GHA no martilla prod — correcto).");
    }
    console.log("Mientras tanto: npm run dev → http://localhost:3000\n");
    process.exit(1);
  }

  console.log(`\n✗ Respuesta inesperada:\n${body.slice(0, 200)}\n`);
  process.exit(1);
} catch (err) {
  console.error("✗ No se pudo contactar prod:", err instanceof Error ? err.message : err);
  process.exit(1);
}
