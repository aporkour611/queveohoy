/**
 * Auditoría cold start — TTFB en APIs y home (prod).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const STRICT = process.env.COLD_AUDIT_STRICT === "1";
const HOME_WARM_MAX_MS = Number(
  process.env.COLD_HOME_WARM_MAX_MS ?? (STRICT ? 500 : 1_000)
);
const HOME_COLD_MAX_MS = Number(
  process.env.COLD_HOME_COLD_MAX_MS ?? (STRICT ? 800 : 1_500)
);
const API_SLOW_MAX_MS = Number(
  process.env.COLD_API_SLOW_MAX_MS ?? (STRICT ? 1_500 : 2_500)
);
const OPTIONAL_SLOW_MAX_MS = Number(
  process.env.COLD_OPTIONAL_SLOW_MAX_MS ?? (STRICT ? 2_500 : 4_000)
);
const OUT = join(process.cwd(), "docs", "marathon-reports");

const PATHS = [
  "/api/feed-meta",
  "/api/home-feed",
  "/",
];

const OPTIONAL_PATHS = ["/api/v2/feed", "/api/v1/feed/week"];

const HUB_PATHS = STRICT ? ["/explorar"] : [];

/** Hubs pesados — se auditan pero no bloquean el gate crítico. */
const HUB_HEAVY_PATHS = STRICT ? ["/futbol", "/laliga"] : [];

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

async function probeHomeTriple(cold = false) {
  const runs = [];
  for (let i = 0; i < (STRICT ? 3 : 1); i += 1) {
    const path = cold ? `/?cb=${Date.now()}-${i}` : "/";
    runs.push(await probe(path, cold));
  }
  const ms = Math.max(...runs.map((r) => r.ms));
  const ok = runs.every((r) => r.ok);
  const cache = runs[runs.length - 1]?.cache ?? "";
  return {
    path: "/",
    ok,
    status: runs[runs.length - 1]?.status ?? 0,
    ms,
    cache,
    samples: runs.length,
    runs,
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const warm = [];
  for (const path of PATHS) {
    if (path === "/") {
      warm.push(await probeHomeTriple(false));
      continue;
    }
    warm.push(await probe(path, false));
  }
  for (const path of [...OPTIONAL_PATHS, ...HUB_PATHS, ...HUB_HEAVY_PATHS]) {
    warm.push(await probe(path, false));
  }

  const cold = [];
  for (const path of PATHS) {
    if (path === "/") {
      cold.push(await probeHomeTriple(true));
      continue;
    }
    cold.push(
      await probe(`${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`, true)
    );
  }
  for (const path of [...OPTIONAL_PATHS, ...HUB_PATHS, ...HUB_HEAVY_PATHS]) {
    cold.push(
      await probe(`${path}${path.includes("?") ? "&" : "?"}cb=${Date.now()}`, true)
    );
  }

  const grade = (probeResult, maxMs) => ({
    path: probeResult.path,
    ms: probeResult.ms,
    ok: probeResult.ok,
    maxMs,
    pass: probeResult.ok && probeResult.ms <= maxMs,
  });

  const slow = cold.filter((p) => {
    const base = p.path.split("?")[0];
    if (base === "/") return false;
    const max =
      OPTIONAL_PATHS.includes(base) || HUB_PATHS.includes(base)
        ? OPTIONAL_SLOW_MAX_MS
        : API_SLOW_MAX_MS;
    return p.ms > max || !p.ok;
  });

  const homeWarm = warm.find((p) => p.path === "/");
  const homeCold = cold.find((p) => p.path === "/");
  const homeGateFail =
    !homeWarm?.ok ||
    !homeCold?.ok ||
    (homeWarm?.ms ?? 9_999) > HOME_WARM_MAX_MS ||
    (homeCold?.ms ?? 9_999) > HOME_COLD_MAX_MS;

  const hubFails = STRICT
    ? cold.filter((p) => {
        const base = p.path.split("?")[0];
        return HUB_PATHS.includes(base) && (p.ms > OPTIONAL_SLOW_MAX_MS || !p.ok);
      })
    : [];

  const hubHeavySlow = STRICT
    ? cold.filter((p) => {
        const base = p.path.split("?")[0];
        return (
          HUB_HEAVY_PATHS.includes(base) &&
          (p.ms > OPTIONAL_SLOW_MAX_MS * 2 || !p.ok)
        );
      })
    : [];

  const grades = [
    grade(homeWarm ?? { path: "/", ms: 9_999, ok: false }, HOME_WARM_MAX_MS),
    grade(homeCold ?? { path: "/", ms: 9_999, ok: false }, HOME_COLD_MAX_MS),
    ...cold
      .filter((p) => PATHS.includes(p.path.split("?")[0]) && p.path !== "/")
      .map((p) => grade(p, API_SLOW_MAX_MS)),
    ...cold
      .filter((p) =>
        [...OPTIONAL_PATHS, ...HUB_PATHS].includes(p.path.split("?")[0])
      )
      .map((p) => grade(p, OPTIONAL_SLOW_MAX_MS)),
  ];

  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    strict: STRICT,
    gates: {
      strict: STRICT,
      homeWarmMaxMs: HOME_WARM_MAX_MS,
      homeColdMaxMs: HOME_COLD_MAX_MS,
      apiSlowMaxMs: API_SLOW_MAX_MS,
      optionalSlowMaxMs: OPTIONAL_SLOW_MAX_MS,
      hubPaths: HUB_PATHS,
      hubHeavyPaths: HUB_HEAVY_PATHS,
      criticalPass: !homeGateFail && slow.length === 0,
      hubPass: hubFails.length === 0,
      hubHeavyWarn: hubHeavySlow.length > 0,
      pass: !homeGateFail && slow.length === 0 && hubFails.length === 0,
    },
    grades,
    warm,
    cold,
    slow,
    hubFails,
    hubHeavySlow,
    homeWarmMs: homeWarm?.ms ?? null,
    homeColdMs: homeCold?.ms ?? null,
    homeColdSamples: homeCold?.samples ?? 1,
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

  if (hubFails.length > 0) {
    payload.recommendations.push({
      priority: "P0",
      action: `Hubs lentos (${hubFails.map((h) => h.path).join(", ")}) — precalentar en keep-warm`,
    });
  }

  const out = join(OUT, "cold-start-audit-latest.json");
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  const maxMs = Math.max(...warm.map((p) => p.ms), 0);
  const mode = STRICT ? "STRICT" : "standard";
  console.log(
    `Cold start [${mode}] → home warm ${homeWarm?.ms ?? "?"}ms cold ${homeCold?.ms ?? "?"}ms (×${homeCold?.samples ?? 1}) · hubs fail ${hubFails.length} · gate ${payload.gates.pass ? "PASS" : "FAIL"}`
  );
  if (!payload.gates.pass) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
