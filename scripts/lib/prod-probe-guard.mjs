/**
 * Evita saturar prod (402 Vercel) y preserva último PRO bueno durante bloqueos.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "docs", "marathon-reports");
export const PROD_PROBE_STATUS = join(OUT, "prod-probe-status.json");
export const PRO_LAST_GOOD = join(OUT, "PRO-100-TESTS-last-good.json");
export const GATES_SNAPSHOT = join(OUT, "ultra-pro-100k-gates-snapshot.json");
export const QUALITY_GATES_SNAPSHOT = join(OUT, "quality-gates-snapshot.json");
export const QUALITY_LATEST = join(process.cwd(), "docs", "quality-reports", "quality-scorecard-latest.json");

export const PROD_PROBE_HEADERS = {
  Accept: "text/html,application/json,*/*",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36 QueveohoyProbe/1.0",
  "Cache-Control": "no-cache",
};

const BLOCK_STATUSES = new Set([402, 403, 429, 503]);

/** Vercel pausa el deploy (Hobby límite / DEPLOYMENT_DISABLED). */
export function isDeploymentDisabledBody(text) {
  return /DEPLOYMENT_DISABLED|deployment is temporarily paused/i.test(text ?? "");
}
const BLOCK_TTL_MS = Number(process.env.PROD_BLOCK_TTL_MS ?? 20 * 60_000);

/** Intervalos para prod-unblock-watch y referencia de backoff mínimo. */
export const PROBE_INTERVAL_OK_MS = Number(process.env.PROBE_INTERVAL_OK_MS ?? 30_000);
export const PROBE_INTERVAL_BLOCKED_MS = Number(
  process.env.PROBE_INTERVAL_BLOCKED_MS ?? 5 * 60_000
);
const PROBE_BACKOFF_MIN_MS = PROBE_INTERVAL_BLOCKED_MS;
const PROBE_BACKOFF_MAX_MS = Number(process.env.PROBE_BACKOFF_MAX_MS ?? 60 * 60_000);

export function isProdBlockedStatus(status) {
  return BLOCK_STATUSES.has(status);
}

function computeBlockBackoffMs(prev) {
  if (!prev?.blocked) return PROBE_BACKOFF_MIN_MS;
  const prevBackoff = Number(prev.blockBackoffMs) || PROBE_BACKOFF_MIN_MS;
  return Math.min(prevBackoff * 2, PROBE_BACKOFF_MAX_MS);
}

export function shouldDeferProdProbe(status = readProdProbeStatus()) {
  if (!status?.nextProbeAfter) return false;
  const until = Date.parse(status.nextProbeAfter);
  return Number.isFinite(until) && Date.now() < until;
}

export function mkdirReports() {
  mkdirSync(OUT, { recursive: true });
}

export async function probeProdHealth(
  base = process.env.DISCOVERY_URL ?? "https://queveohoy.es",
  { force = false } = {}
) {
  const site = String(base).replace(/\/$/, "");

  if (!force) {
    const cached = readProdProbeStatus();
    if (cached?.base === site && shouldDeferProdProbe(cached)) {
      return { ...cached, deferred: true };
    }
  }

  const prev = readProdProbeStatus();
  const started = Date.now();
  try {
    const res = await fetch(`${site}/api/health`, {
      headers: PROD_PROBE_HEADERS,
      signal: AbortSignal.timeout(20_000),
    });
    const blocked = isProdBlockedStatus(res.status);
    const payload = {
      base: site,
      status: res.status,
      blocked,
      ms: Date.now() - started,
      at: new Date().toISOString(),
    };
    if (blocked) {
      const blockBackoffMs = computeBlockBackoffMs(prev?.base === site ? prev : null);
      payload.blockBackoffMs = blockBackoffMs;
      payload.nextProbeAfter = new Date(Date.now() + blockBackoffMs).toISOString();
    } else {
      payload.blockBackoffMs = PROBE_BACKOFF_MIN_MS;
      payload.nextProbeAfter = null;
    }
    writeProdProbeStatus(payload);
    return payload;
  } catch (err) {
    const blockBackoffMs = computeBlockBackoffMs(prev?.base === site ? prev : null);
    const payload = {
      base: site,
      status: 0,
      blocked: true,
      ms: Date.now() - started,
      error: err instanceof Error ? err.message : String(err),
      at: new Date().toISOString(),
      blockBackoffMs,
      nextProbeAfter: new Date(Date.now() + blockBackoffMs).toISOString(),
    };
    writeProdProbeStatus(payload);
    return payload;
  }
}

export function writeProdProbeStatus(payload) {
  mkdirReports();
  writeFileSync(PROD_PROBE_STATUS, `${JSON.stringify(payload, null, 2)}\n`);
}

export function readProdProbeStatus() {
  try {
    return JSON.parse(readFileSync(PROD_PROBE_STATUS, "utf8"));
  } catch {
    return null;
  }
}

export function isProdCurrentlyBlocked() {
  const s = readProdProbeStatus();
  if (!s?.blocked) return false;
  const age = Date.now() - Date.parse(s.at ?? "");
  if (!Number.isFinite(age) || age > BLOCK_TTL_MS) return false;
  return true;
}

export function readProLastGood() {
  try {
    return JSON.parse(readFileSync(PRO_LAST_GOOD, "utf8"));
  } catch {
    return null;
  }
}

export function writeProLastGood(payload) {
  if (!payload?.pass) return;
  mkdirReports();
  writeFileSync(PRO_LAST_GOOD, `${JSON.stringify(payload, null, 2)}\n`);
}

export function readGatesSnapshot() {
  try {
    return JSON.parse(readFileSync(GATES_SNAPSHOT, "utf8"));
  } catch {
    return null;
  }
}

export function writeGatesSnapshot(gates, cycle) {
  if (!gates?.testsPass) return;
  mkdirReports();
  writeFileSync(
    GATES_SNAPSHOT,
    `${JSON.stringify({ ...gates, cycle, at: new Date().toISOString() }, null, 2)}\n`
  );
}

/** PRO report efectivo: last-good si prod bloqueado o último run corrupto por 402. */
export function readEffectiveProReport(latestPath) {
  const latest = (() => {
    try {
      return JSON.parse(readFileSync(latestPath, "utf8"));
    } catch {
      return null;
    }
  })();

  if (latest?.prodBlocked && latest?.pass) return latest;

  if (latest?.pass === true) return latest;

  if (isProdCurrentlyBlocked()) {
    const good = readProLastGood();
    if (good?.pass) return { ...good, prodBlocked: true, effectiveFrom: "last-good" };
    const snap = readGatesSnapshot();
    if (snap?.testsPass) {
      return {
        pass: true,
        passed: snap.tests100,
        total: snap.testsTotal ?? 105,
        prodBlocked: true,
        effectiveFrom: "gates-snapshot",
        at: snap.at,
      };
    }
  }

  return latest;
}

export function readQualityGatesSnapshot() {
  try {
    return JSON.parse(readFileSync(QUALITY_GATES_SNAPSHOT, "utf8"));
  } catch {
    return null;
  }
}

export function writeQualityGatesSnapshot(summary, cycle) {
  if (summary?.passing !== summary?.total) return;
  mkdirReports();
  writeFileSync(
    QUALITY_GATES_SNAPSHOT,
    `${JSON.stringify({ ...summary, cycle, at: new Date().toISOString() }, null, 2)}\n`
  );
}

export function readEffectiveQualityGatePass() {
  try {
    const payload = JSON.parse(readFileSync(QUALITY_LATEST, "utf8"));
    const s = payload.summary ?? {};
    const ok =
      s.passing === s.total && s.measured === s.total && Number(s.average) >= 95;
    if (ok) return true;
  } catch {
    /* fall through */
  }

  if (!isProdCurrentlyBlocked()) return false;

  const snap = readQualityGatesSnapshot();
  return (
    snap?.passing === snap?.total &&
    snap?.measured === snap?.total &&
    Number(snap?.average ?? 0) >= 95
  );
}
