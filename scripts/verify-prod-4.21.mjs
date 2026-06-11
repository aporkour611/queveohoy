/**
 * Alias histórico 4.21.0 — delega en verify-prod-current.mjs
 * Uso: npm run verify:prod:4.21
 */
import { spawnSync } from "node:child_process"

const result = spawnSync(process.execPath, ["scripts/verify-prod-current.mjs"], {
  stdio: "inherit",
  env: process.env,
})
process.exit(result.status ?? 1)
