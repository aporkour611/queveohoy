/**
 * Auditoría cold start — TTFB en APIs y home (prod).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-reports");

const PATHS = [
  "/api/feed-meta",
  "/api/home-feed",
  "/api/v2/feed",
  "/api/v1/feed/week",
  "/",
];

async function probe(path, cold = false) {
  const url = `${BASE}${path}`;
  const started = Date.now();
  try {
    const res = await fetch(url, {
      headers: {
        Accept: path === "/" ? "text/html" : "application/json",
        "Cache-Control": cold ? "no-cache" : "no-store",
        ...(cold ? { "x-qvh-cold-probe": "1" } : {}),
      },
      signal: AbortSignal.timeout(path === "/" ? 90_000 : 45_000),
    });
    const ms = Date.now() - started;
    const cache = res.headers.get("x-vercel-cache") ?? res.headers.get("age") ?? "";
    return { path, ok: res.ok || res.status === 304, status: res.status, ms, cache };
  } catch (err) {
    return {
      path,
      ok: false,
      status: 0,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const warm = [];
  for (const path of PATHS) {
    warm.push(await probe(path, false));
  }
  const cold = [];
  for (const path of PATHS) {
    cold.push(await probe(`${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`, true));
  }

  const slow = [...warm, ...cold].filter((p) => p.ms > 3000 || !p.ok);
  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    warm,
    cold,
    slow,
    recommendations: [],
  };

  if (slow.some((p) => p.path === "/")) {
    payload.recommendations.push({
      priority: "P0",
      action: "Aumentar frecuencia /api/warm y precalentar home ISR",
    });
  }
  if (slow.some((p) => p.path.startsWith("/api/"))) {
    payload.recommendations.push({
      priority: "P1",
      action: "Keep-warm APIs cada 5 min + stale-while-revalidate",
    });
  }

  const out = join(OUT, "cold-start-audit-latest.json");
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  const maxMs = Math.max(...warm.map((p) => p.ms), 0);
  console.log(`Cold start audit → max warm ${maxMs}ms · ${slow.length} lentos`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
