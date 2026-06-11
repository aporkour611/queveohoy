/**
 * Post-deploy local: verify + integraciones (+ IndexNow si hay CRON_SECRET).
 * Uso: npm run release:prod
 */
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"

const run = (label, args) => {
  console.log(`\n── ${label} ──\n`)
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  })
  return result.status ?? 1
}

const readVersion = () => {
  try {
    const src = readFileSync("app/lib/product-version.ts", "utf8")
    return src.match(/PRODUCT_VERSION\s*=\s*"([^"]+)"/)?.[1] ?? "?"
  } catch {
    return "?"
  }
}

console.log(`\nrelease:prod — queveohoy v${readVersion()}`)

if (run("verify:prod", ["scripts/verify-prod-current.mjs"]) !== 0) {
  process.exit(1)
}

const integrationsStatus = run("check:integrations", ["scripts/check-integrations.mjs"])
if (integrationsStatus !== 0 && !process.env.CRON_SECRET?.trim()) {
  console.log("\nℹ check:integrations requiere CRON_SECRET para el mapa completo\n")
}

if (process.env.CRON_SECRET?.trim()) {
  run("ping-search (IndexNow)", ["scripts/ping-indexnow.mjs"])
}

console.log("\n✓ release:prod completado\n")
