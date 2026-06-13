/**
 * Auditoría seguridad móvil — HTTPS, mixed content, headers.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-reports");

async function fetchText(url, init = {}) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(45_000) });
  return { res, text: await res.text() };
}

function findInsecureUrls(html) {
  const matches = [];
  const re = /(?:src|href|action)=["'](http:\/\/[^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    matches.push(m[1]);
  }
  return [...new Set(matches)].slice(0, 30);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const checks = [];
  const pass = (name, detail = "") => checks.push({ ok: true, name, detail });
  const fail = (name, detail = "") => checks.push({ ok: false, name, detail });

  const httpRes = await fetch(`http://queveohoy.es/`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  if ([301, 302, 307, 308].includes(httpRes.status)) {
    pass("HTTP→HTTPS redirect", String(httpRes.status));
  } else {
    fail("HTTP→HTTPS redirect", String(httpRes.status));
  }

  const { res: homeRes, text: homeHtml } = await fetchText(`${BASE}/`);
  if (homeRes.ok) pass("HTTPS home 200");
  else fail("HTTPS home", String(homeRes.status));

  const hsts = homeRes.headers.get("strict-transport-security");
  if (hsts?.includes("max-age")) pass("HSTS");
  else fail("HSTS");

  const csp = homeRes.headers.get("content-security-policy") ?? "";
  if (csp.includes("upgrade-insecure-requests")) pass("CSP upgrade-insecure-requests");
  else fail("CSP upgrade-insecure-requests");

  const insecure = findInsecureUrls(homeHtml);
  if (insecure.length === 0) pass("Sin mixed content http:// en HTML");
  else fail("Mixed content http://", insecure.slice(0, 5).join(", "));

  let manifestOk = false;
  try {
    const man = await fetchText(`${BASE}/manifest.webmanifest`);
    const start = man.text.match(/"start_url"\s*:\s*"([^"]+)"/)?.[1] ?? "";
    if (!start.startsWith("http://")) {
      pass("Manifest start_url seguro", start || "/");
      manifestOk = true;
    } else {
      fail("Manifest start_url http", start);
    }
  } catch {
    fail("Manifest fetch");
  }

  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    checks,
    insecureUrls: insecure,
    manifestOk,
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
  };

  const out = join(OUT, "mobile-security-audit-latest.json");
  writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(
    `Mobile security → ${payload.passed}/${payload.total} OK · ${insecure.length} http refs`
  );
  if (payload.passed < payload.total) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
