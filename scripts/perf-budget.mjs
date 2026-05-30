/**
 * Presupuesto Lighthouse mobile (home). Requiere Chrome + servidor local o URL.
 * Uso: npm run perf:budget
 *      PERF_URL=https://queveohoy.es npm run perf:budget
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const url = process.env.PERF_URL ?? "http://127.0.0.1:3000";
const budgets = {
  performance: 90,
  lcpMs: 2500,
  cls: 0.1,
};

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  npx,
  [
    "lighthouse",
    url,
    "--quiet",
    "--chrome-flags=--headless=new",
    "--only-categories=performance",
    "--form-factor=mobile",
    "--output=json",
    "--output-path=./lighthouse-v7-budget.json",
  ],
  { stdio: "inherit", shell: process.platform === "win32" }
);

if (result.status !== 0) {
  console.error("Lighthouse falló. ¿Está el servidor en marcha?");
  process.exit(result.status ?? 1);
}

const report = JSON.parse(readFileSync("./lighthouse-v7-budget.json", "utf8"));

const perf = report.categories?.performance?.score ?? 0;
const lcp = report.audits?.["largest-contentful-paint"]?.numericValue ?? 99999;
const cls = report.audits?.["cumulative-layout-shift"]?.numericValue ?? 1;

const ok =
  perf * 100 >= budgets.performance &&
  lcp <= budgets.lcpMs &&
  cls <= budgets.cls;

console.log(
  `\nPerformance: ${(perf * 100).toFixed(0)} (meta ≥${budgets.performance})`
);
console.log(`LCP: ${(lcp / 1000).toFixed(2)}s (meta ≤${budgets.lcpMs / 1000}s)`);
console.log(`CLS: ${cls.toFixed(3)} (meta ≤${budgets.cls})`);
console.log(ok ? "\n✓ Presupuesto v7 OK" : "\n✗ Presupuesto v7 incumplido");
process.exit(ok ? 0 : 1);
