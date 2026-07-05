/**
 * Auditoría escudos/portadas fijadas — prioridad maratón (sin cold start).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  countCrestImgsWithSrc,
  hasCrestSrcLocalOrCdn,
} from "./lib/crest-ssr-html.mjs";
import { isProdCurrentlyBlocked, probeProdHealth } from "./lib/prod-probe-guard.mjs";

const BASE = (process.env.DISCOVERY_URL ?? "https://queveohoy.es").replace(/\/$/, "");
const OUT = join(process.cwd(), "docs", "marathon-reports");
const STRICT = process.env.CRESTS_AUDIT_STRICT === "1";

function check(name, ok, detail = "") {
  return { name, ok, detail };
}

async function fetchJson(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) return { ok: false, status: res.status, data: null };
  try {
    return { ok: true, status: res.status, data: await res.json() };
  } catch {
    return { ok: false, status: res.status, data: null };
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const checks = [];

  const health = await probeProdHealth(BASE);
  if (isProdCurrentlyBlocked() || health.blocked) {
    checks.push(check("Prod accesible", false, `HTTP ${health.status} bloqueado`));
    const payload = {
      base: BASE,
      at: new Date().toISOString(),
      strict: STRICT,
      pass: 0,
      total: 1,
      ok: !STRICT,
      prodBlocked: true,
      checks,
    };
    writeFileSync(join(OUT, "crests-quality-audit-latest.json"), `${JSON.stringify(payload, null, 2)}\n`);
    console.log(`crests audit · omitido · prod HTTP ${health.status}`);
    return;
  }

  try {
    const reg = JSON.parse(readFileSync(join(process.cwd(), "app/lib/pinned-images.json"), "utf8"));
    checks.push(check("Registro pinned-images.json", reg.version >= 1, `v${reg.version}`));
    checks.push(
      check(
        "Registro accesible (byKey/byRemote)",
        typeof reg.byKey === "object" && typeof reg.byRemote === "object"
      )
    );
  } catch (e) {
    checks.push(check("Registro pinned-images.json", false, String(e)));
  }

  const unit = spawnSync(
    "npm",
    ["test", "--", "app/lib/pinned-images.test.ts"],
    { encoding: "utf8", shell: process.platform === "win32", stdio: "pipe" }
  );
  checks.push(check("Unit pinned-images", unit.status === 0, unit.status === 0 ? "" : "vitest fail"));

  const feed = await fetchJson("/api/home-feed");
  if (!feed.ok) {
    checks.push(check("API home-feed", false, String(feed.status)));
  } else {
    const events = feed.data?.events ?? feed.data?.today ?? [];
    const esports = events.filter((e) => /^(csgo|valorant|lol)$/.test(e.sport ?? ""));
    const missing = esports.filter(
      (e) => !e.source?.startsWith("pandascore-logos:") || !e.source.includes("::")
    );
    checks.push(
      check(
        "E-sports con logos en source",
        esports.length === 0 || missing.length === 0,
        esports.length ? `${esports.length - missing.length}/${esports.length}` : "sin e-sports hoy"
      )
    );
  }

  const homeRes = await fetch(`${BASE}/`, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(60_000),
  });
  const html = homeRes.ok ? await homeRes.text() : "";
  checks.push(check("Home HTML 200", homeRes.ok, String(homeRes.status)));

  const duel = /fh-media-spotlight-duel/i.test(html);
  const crestSrc = countCrestImgsWithSrc(html);
  checks.push(
    check(
      "Duelos con img src en escudos",
      !duel || crestSrc >= 2,
      duel ? `${crestSrc} imgs` : "sin duelo SSR"
    )
  );

  checks.push(
    check(
      "Rutas /crests/ o CDN en escudos SSR",
      !duel || hasCrestSrcLocalOrCdn(html),
      duel ? "origen local o PandaScore" : "n/a"
    )
  );

  const pass = checks.filter((c) => c.ok).length;
  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    strict: STRICT,
    pass,
    total: checks.length,
    ok: STRICT ? pass === checks.length : pass >= checks.length - 2,
    checks,
  };

  writeFileSync(join(OUT, "crests-quality-audit-latest.json"), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`crests audit · ${pass}/${checks.length} · ${payload.ok ? "PASS" : "FAIL"}`);

  if (STRICT && !payload.ok) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
