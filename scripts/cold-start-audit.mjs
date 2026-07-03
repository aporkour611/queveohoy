/**
 * Auditoría cold start — TTFB en APIs y home (prod).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const HOME_WARM_MAX_MS = Number(process.env.COLD_HOME_WARM_MAX_MS ?? 1_000);
const HOME_COLD_MAX_MS = Number(process.env.COLD_HOME_COLD_MAX_MS ?? 1_500);
const API_SLOW_MAX_MS = Number(process.env.COLD_API_SLOW_MAX_MS ?? 2_500);
const OUT = join(process.cwd(), "docs", "marathon-reports");

const PATHS = [
  "/api/feed-meta",
  "/api/home-feed",
  "/",
];

const OPTIONAL_PATHS = ["/api/v2/feed", "/api/v1/feed/week"];

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
  for (const path of [...PATHS, ...OPTIONAL_PATHS]) {
    warm.push(await probe(path, false));
  }
  const cold = [];
  for (const path of [...PATHS, ...OPTIONAL_PATHS]) {
    cold.push(await probe(`${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`, true));
  }

  const slow = cold.filter((p) => {
    const base = p.path.split("?")[0];
    if (!PATHS.includes(base)) return false;
    if (base === "/") return false;
    return p.ms > API_SLOW_MAX_MS || !p.ok;
  });
  const homeWarm = warm.find((p) => p.path === "/");
  const homeCold = cold.find((p) => p.path.startsWith("/") && !p.path.startsWith("/api"));
  const homeGateFail =
    !homeWarm?.ok ||
    !homeCold?.ok ||
    (homeWarm?.ms ?? 9_999) > HOME_WARM_MAX_MS ||
    (homeCold?.ms ?? 9_999) > HOME_COLD_MAX_MS;

  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    gates: {
      homeWarmMaxMs: HOME_WARM_MAX_MS,
      homeColdMaxMs: HOME_COLD_MAX_MS,
      apiSlowMaxMs: API_SLOW_MAX_MS,
      pass: !homeGateFail && slow.length === 0,
    },
    warm,
    cold,
    slow,
    homeWarmMs: homeWarm?.ms ?? null,
    homeColdMs: homeCold?.ms ?? null,
    recommendations: [],
  };

  if (homeGateFail) {
    payload.recommendations.push({
      priority: "P0",
      action: `Home TTFB warm≤${HOME_WARM_MAX_MS}ms cold≤${HOME_COLD_MAX_MS}ms — subir keep-warm y cache ISR`,
    });
  }
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
  console.log(
    `Cold start audit → home warm ${homeWarm?.ms ?? "?"}ms cold ${homeCold?.ms ?? "?"}ms · max warm ${maxMs}ms · gate ${payload.gates.pass ? "PASS" : "FAIL"}`
  );
  if (!payload.gates.pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
