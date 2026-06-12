/**
 * Presupuesto Lighthouse mobile (home). Requiere Chrome + servidor local o URL.
 * Uso: npm run perf:budget
 *      PERF_URL=https://queveohoy.es PERF_BUDGET_LCP_MS=2000 npm run perf:budget
 *      PERF_RETRIES=2  — reintenta si Lighthouse falla (p. ej. NO_FCP)
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const url = process.env.PERF_URL ?? "http://127.0.0.1:3000"
const budgets = {
  performance: Number(process.env.PERF_BUDGET_MIN ?? 80),
  lcpMs: Number(process.env.PERF_BUDGET_LCP_MS ?? 4000),
  fidMs: Number(process.env.PERF_BUDGET_FID_MS ?? 100),
  cls: 0.08,
}
const defaultRetries = process.platform === "win32" ? 2 : 1
const maxAttempts = Math.max(1, Number(process.env.PERF_RETRIES ?? defaultRetries))
const outPath = join(process.cwd(), "lighthouse-v13-budget.json")
const lhTmp = join(process.cwd(), ".lighthouse-tmp")

const npx = process.platform === "win32" ? "npx.cmd" : "npx"

function readLighthouseReport(path) {
  if (!existsSync(path)) return null
  try {
    const json = JSON.parse(readFileSync(path, "utf8"))
    if (json.categories?.performance?.score != null) return json
  } catch {
    /* ignore */
  }
  return null
}

function runLighthouse() {
  mkdirSync(lhTmp, { recursive: true })
  return spawnSync(
    npx,
    [
      "lighthouse",
      url,
      "--quiet",
      "--chrome-flags=--headless=new",
      "--only-categories=performance",
      "--form-factor=mobile",
      "--output=json",
      `--output-path=${outPath}`,
    ],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, TEMP: lhTmp, TMP: lhTmp },
    }
  )
}

let report = null
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  if (attempt > 1) {
    console.log(`\nReintento Lighthouse ${attempt}/${maxAttempts}…`)
  }
  const result = runLighthouse()
  report = readLighthouseReport(outPath)
  if (report && (result.status === 0 || process.platform === "win32")) break
}

if (!report) {
  console.error("Lighthouse falló. ¿Está el servidor en marcha?")
  process.exit(1)
}

const perf = report.categories?.performance?.score ?? 0
const lcp = report.audits?.["largest-contentful-paint"]?.numericValue ?? 99999
const fid = report.audits?.["max-potential-fid"]?.numericValue ?? 99999
const cls = report.audits?.["cumulative-layout-shift"]?.numericValue ?? 1

const ok =
  perf * 100 >= budgets.performance &&
  lcp <= budgets.lcpMs &&
  fid <= budgets.fidMs &&
  cls <= budgets.cls

console.log(
  `\nPerformance: ${(perf * 100).toFixed(0)} (meta ≥${budgets.performance})`
)
console.log(`LCP: ${(lcp / 1000).toFixed(2)}s (meta ≤${budgets.lcpMs / 1000}s)`)
console.log(`FID: ${Math.round(fid)} ms (meta ≤${budgets.fidMs} ms)`)
console.log(`CLS: ${cls.toFixed(3)} (meta ≤${budgets.cls})`)
console.log(ok ? "\n✓ Presupuesto v13 OK" : "\n✗ Presupuesto v13 incumplido")

const blocking = process.env.PERF_GATE_BLOCKING === "1"
if (!ok && blocking) {
  console.error("PERF_GATE_BLOCKING=1 — el deploy debe fallar.")
}
process.exit(ok ? 0 : blocking ? 1 : 0)
