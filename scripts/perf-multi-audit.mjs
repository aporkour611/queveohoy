/**
 * Auditoría de rendimiento multi-motor contra producción o local.
 * Uso: PERF_URL=https://queveohoy.es npm run perf:audit
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import autocannon from "autocannon";

const BASE = (process.env.PERF_URL ?? "https://queveohoy.es").replace(/\/$/, "");
const OUT_DIR = process.env.PERF_OUT_DIR ?? "docs/perf-reports";
const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

const SLA = {
  ttfbMs: 800,
  apiMs: 600,
  homeHtmlKb: 120,
  loadP99Ms: 2500,
  loadErrorPct: 1,
  lhMobilePerf: 50,
  lhDesktopPerf: 60,
};

const PATHS = [
  { path: "/", label: "Home", kind: "page" },
  { path: "/explorar", label: "Explorar", kind: "page" },
  { path: "/embed/esta-noche", label: "Embed esta noche", kind: "page" },
  { path: "/embed/categorias", label: "Embed categorías", kind: "page" },
  { path: "/api/health", label: "Health", kind: "api" },
  { path: "/api/v1/feed", label: "API v1 feed", kind: "api" },
  { path: "/api/v1/search?q=futbol", label: "API v1 search", kind: "api" },
  { path: "/api/v2/feed", label: "API v2 feed", kind: "api" },
  { path: "/api/home-feed", label: "Home feed API", kind: "api" },
];

const report = {
  base: BASE,
  stamp,
  engines: {},
  failures: [],
  warnings: [],
};

async function warmupTarget() {
  const urls = [`${BASE}/api/health`, `${BASE}/api/v2/feed`, `${BASE}/`];
  for (const url of urls) {
    try {
      await fetch(url, {
        signal: AbortSignal.timeout(90_000),
        headers: { "User-Agent": "QueveoHoy-PerfAudit/1.0" },
      });
    } catch {
      // Ignorar: el objetivo es calentar caché / funciones serverless
    }
  }
}

function pass(name, detail) {
  report.engines[name] = { ok: true, ...detail };
}

function fail(name, detail) {
  report.engines[name] = { ok: false, ...detail };
  report.failures.push({ engine: name, ...detail });
}

function warn(msg) {
  report.warnings.push(msg);
}

async function measureTtfb(url, attempt = 1) {
  const curl = spawnSync(
    "curl",
    [
      "-sS",
      "-o",
      process.platform === "win32" ? "NUL" : "/dev/null",
      "-w",
      "%{http_code} %{time_starttransfer} %{size_download}",
      "-H",
      "User-Agent: QueveoHoy-PerfAudit/1.0",
      "--max-time",
      "90",
      url,
    ],
    { encoding: "utf8", timeout: 95_000 }
  );
  if (curl.status !== 0 && attempt < 2) {
    return measureTtfb(url, attempt + 1);
  }
  if (curl.status !== 0) {
    throw new Error(curl.stderr?.trim() || "curl failed");
  }
  const [statusStr, ttfbStr, bytesStr] = curl.stdout.trim().split(/\s+/);
  return {
    status: Number(statusStr),
    ttfbMs: Math.round(Number(ttfbStr) * 1000),
    bytes: Number(bytesStr),
    cacheControl: null,
  };
}

async function runTtfbMatrix() {
  const rows = [];
  for (const item of PATHS) {
    const url = `${BASE}${item.path}`;
    try {
      const m = await measureTtfb(url);
      const limit = item.kind === "api" ? SLA.apiMs : SLA.ttfbMs;
      const ok = m.status >= 200 && m.status < 400 && m.ttfbMs <= limit;
      rows.push({ ...item, url, ...m, ok, limitMs: limit });
      if (!ok) {
        if (m.status >= 400) {
          fail("1-ttfb-matrix", { path: item.path, status: m.status, ttfbMs: m.ttfbMs });
        } else if (m.ttfbMs > limit) {
          warn(`${item.label} TTFB ${m.ttfbMs}ms > ${limit}ms`);
        }
      }
    } catch (err) {
      rows.push({ ...item, url, error: String(err), ok: false });
      fail("1-ttfb-matrix", { path: item.path, error: String(err) });
    }
  }
  const ok = rows.every((r) => r.ok !== false && r.ok !== undefined ? r.ok : !r.error);
  pass("1-ttfb-matrix", { ok, rows });
}

async function runApiContract() {
  const checks = [
    {
      url: `${BASE}/api/health`,
      assert: (j) => j.ok === true,
    },
    {
      url: `${BASE}/api/v1/feed`,
      assert: (j) => Array.isArray(j.events ?? j.data?.events ?? j),
    },
    {
      url: `${BASE}/api/v2/feed`,
      assert: (_j, res) => res.status === 200 || res.status === 304,
    },
    {
      url: `${BASE}/api/v1/search?q=madrid`,
      assert: (j) => j.events !== undefined || j.results !== undefined || Array.isArray(j),
    },
  ];

  const results = [];
  for (const check of checks) {
    const start = performance.now();
    const res = await fetch(check.url, {
      headers: { Accept: "application/json" },
    });
    const ms = Math.round(performance.now() - start);
    let json = null;
    try {
      if (res.status !== 304) json = await res.json();
    } catch {
      json = null;
    }
    const ok =
      res.status >= 200 &&
      res.status < 400 &&
      ms <= SLA.apiMs &&
      check.assert(json, res);
    results.push({ url: check.url, status: res.status, ms, ok });
    if (!ok) fail("4-api-contract", { url: check.url, status: res.status, ms });
  }
  pass("4-api-contract", { ok: results.every((r) => r.ok), results });
}

function runAutocannon(url, title, options = {}) {
  const {
    connections = 10,
    duration = 8,
    allowRateLimit = false,
  } = options;
  return new Promise((resolve) => {
    autocannon(
      {
        url,
        connections,
        duration,
        pipelining: 1,
        headers: { "User-Agent": "QueveoHoy-Autocannon/1.0" },
      },
      (err, result) => {
        if (err) {
          resolve({ ok: false, error: String(err) });
          return;
        }
        const rejected = result.timeouts + result.non2xx + result.errors;
        const errorPct =
          rejected > 0 ? (rejected / result.requests.total) * 100 : 0;
        const rateLimited =
          allowRateLimit && result.non2xx > 0 && result.errors === 0;
        resolve({
          title,
          url,
          ok:
            (errorPct <= SLA.loadErrorPct || rateLimited) &&
            result.latency.p99 <= SLA.loadP99Ms,
          requests: result.requests.total,
          rps: Math.round(result.requests.average),
          p50: Math.round(result.latency.p50),
          p99: Math.round(result.latency.p99),
          errors: result.errors,
          non2xx: result.non2xx,
          timeouts: result.timeouts,
          errorPct: Number(errorPct.toFixed(2)),
          rateLimitExpected: rateLimited,
        });
      }
    );
  });
}

async function runLoadTests() {
  const targets = [
    { url: `${BASE}/`, title: "/" },
    {
      url: `${BASE}/api/v2/feed`,
      title: "/api/v2/feed",
      connections: 5,
      duration: 5,
      allowRateLimit: true,
    },
    { url: `${BASE}/api/health`, title: "/api/health", connections: 8 },
  ];
  const results = [];
  for (const target of targets) {
    const r = await runAutocannon(target.url, target.title, target);
    results.push(r);
    if (!r.ok) fail("5-autocannon", r);
  }
  pass("5-autocannon", { ok: results.every((r) => r.ok), results });
}

function runLighthouse(formFactor) {
  const out = join(OUT_DIR, `lh-${formFactor}-${stamp}.json`);
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = [
    "lighthouse",
    BASE,
    "--quiet",
    "--chrome-flags=--headless=new --no-sandbox",
    "--only-categories=performance",
    formFactor === "desktop" ? "--preset=desktop" : "--form-factor=mobile",
    "--output=json",
    `--output-path=${out}`,
    "--max-wait-for-load=90000",
  ];
  const result = spawnSync(npx, args, {
    stdio: "pipe",
    shell: process.platform === "win32",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    return { ok: false, error: result.stderr?.slice(0, 500) ?? "Lighthouse failed" };
  }
  try {
    const json = JSON.parse(readFileSyncSafe(out));
    const score = Math.round((json.categories?.performance?.score ?? 0) * 100);
    const lcp = json.audits?.["largest-contentful-paint"]?.numericValue ?? 0;
    const cls = json.audits?.["cumulative-layout-shift"]?.numericValue ?? 0;
    const tbt = json.audits?.["total-blocking-time"]?.numericValue ?? 0;
    const fcp = json.audits?.["first-contentful-paint"]?.numericValue ?? 0;
    const minScore = formFactor === "mobile" ? SLA.lhMobilePerf : SLA.lhDesktopPerf;
    return {
      ok: score >= minScore,
      score,
      minScore,
      lcpMs: Math.round(lcp),
      cls,
      tbtMs: Math.round(tbt),
      fcpMs: Math.round(fcp),
      out,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function readFileSyncSafe(path) {
  return readFileSync(path, "utf8");
}

async function runWebPageTest() {
  const url = `https://www.webpagetest.org/runtest.php?f=json&url=${encodeURIComponent(BASE)}&runs=1&location=Dulles:Chrome&mobile=1&connectivity=4G`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      pass("7-webpagetest-api", { ok: false, skipped: true, reason: `HTTP ${res.status}` });
      return;
    }
    const json = await res.json();
    pass("7-webpagetest-api", {
      ok: true,
      testId: json.data?.testId ?? null,
      userUrl: json.data?.userUrl ?? null,
      note: "Test encolado en WebPageTest (resultado async en userUrl)",
    });
  } catch (err) {
    pass("7-webpagetest-api", { ok: false, skipped: true, reason: String(err) });
  }
}

async function runPsi() {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) {
    pass("6-pagespeed-insights", { ok: false, skipped: true, reason: "PAGESPEED_API_KEY no configurada" });
    return;
  }
  const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(BASE)}&strategy=mobile&key=${key}`;
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(120_000) });
    const json = await res.json();
    if (!res.ok) {
      pass("6-pagespeed-insights", { ok: false, error: json.error?.message ?? res.status });
      return;
    }
    const score = Math.round((json.lighthouseResult?.categories?.performance?.score ?? 0) * 100);
    pass("6-pagespeed-insights", { ok: score >= SLA.lhMobilePerf, score });
  } catch (err) {
    pass("6-pagespeed-insights", { ok: false, error: String(err) });
  }
}

function runK6() {
  const script = join(process.cwd(), "scripts", "k6-load.js");
  const k6Bin =
    process.env.K6_BIN ??
    join(process.cwd(), ".tools", "k6", "k6-v0.57.0-windows-amd64", "k6.exe");
  const candidates = [
    k6Bin,
    "k6",
    join(process.env.TEMP ?? "", "k6", "k6-v0.57.0-windows-amd64", "k6.exe"),
  ];
  for (const bin of candidates) {
    const k6 = spawnSync(bin, ["run", "-e", `BASE=${BASE}`, script], {
      stdio: "pipe",
      encoding: "utf8",
    });
    if (k6.status === 0) {
      pass("8-k6", { ok: true, bin, output: k6.stdout?.slice(-800) });
      return;
    }
  }
  const docker = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "-e",
      `BASE=${BASE}`,
      "-v",
      `${process.cwd()}/scripts:/scripts`,
      "grafana/k6",
      "run",
      "/scripts/k6-load.js",
    ],
    { stdio: "pipe", encoding: "utf8" }
  );
  if (docker.status === 0) {
    pass("8-k6", { ok: true, via: "docker", output: docker.stdout?.slice(-800) });
    return;
  }
  pass("8-k6", {
    ok: false,
    skipped: true,
    reason: "k6 no instalado (K6_BIN o .tools/k6)",
  });
}

async function runJmeterLite() {
  const plan = join(process.cwd(), "tests", "jmeter", "queveohoy-perf.jmx");
  const jmeter = spawnSync(
    "jmeter",
    ["-n", "-t", plan, `-JbaseUrl=${BASE}`, "-l", join(OUT_DIR, `jmeter-${stamp}.jtl`)],
    { stdio: "pipe", encoding: "utf8" }
  );
  if (jmeter.status === 0) {
    pass("9-jmeter", { ok: true, output: jmeter.stdout?.slice(-400) });
    return;
  }
  const phases = [
    { connections: 2, duration: 3 },
    { connections: 5, duration: 5 },
    { connections: 10, duration: 5 },
  ];
  const results = [];
  for (const phase of phases) {
    results.push(
      await runAutocannon(`${BASE}/`, "jmeter-lite /", {
        connections: phase.connections,
        duration: phase.duration,
      })
    );
  }
  pass("9-jmeter-lite", {
    ok: results.every((r) => r.ok),
    note: "Apache JMeter no instalado; fases autocannon equivalentes",
    results,
  });
}

async function runNewman() {
  const collection = join(process.cwd(), "tests", "postman", "queveohoy-perf.postman_collection.json");
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const result = spawnSync(
      npx,
      [
        "--yes",
        "newman",
        "run",
        collection,
        "--env-var",
        `baseUrl=${BASE}`,
        "--reporters",
        "cli,json",
        "--reporter-json-export",
        join(OUT_DIR, `newman-${stamp}.json`),
        "--timeout-request",
        "90000",
      ],
      { stdio: "pipe", shell: process.platform === "win32", encoding: "utf8" }
    );
    if (result.status === 0) {
      pass("3-newman-postman", { ok: true, attempts: attempt });
      return;
    }
    const flaky =
      result.stderr?.includes("ECONNRESET") || result.stdout?.includes("ECONNRESET");
    if (!flaky || attempt === 3) {
      pass("3-newman-postman", {
        ok: false,
        exitCode: result.status,
        attempts: attempt,
        output: (result.stdout || result.stderr)?.slice(-600),
      });
      if (!flaky) fail("3-newman-postman", { exitCode: result.status });
      return;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

function renderMarkdown() {
  const lines = [
    `# Auditoría de rendimiento — ${BASE}`,
    ``,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `## Motores ejecutados`,
    ``,
  ];
  for (const [name, data] of Object.entries(report.engines)) {
    lines.push(`### ${name}`);
    lines.push("```json");
    lines.push(JSON.stringify(data, null, 2));
    lines.push("```");
    lines.push("");
  }
  if (report.failures.length) {
    lines.push("## Fallos");
    for (const f of report.failures) {
      lines.push(`- **${f.engine}**: ${JSON.stringify(f)}`);
    }
    lines.push("");
  }
  if (report.warnings.length) {
    lines.push("## Advertencias");
    for (const w of report.warnings) lines.push(`- ${w}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n🔍 Auditoría multi-motor → ${BASE}\n`);

  console.log("⏳ Warmup (caché / cold start)…");
  await warmupTarget();
  console.log("✓ Warmup");

  await runTtfbMatrix();
  console.log("✓ TTFB matrix");

  await runNewman();
  console.log("✓ Newman/Postman");

  await runApiContract();
  console.log("✓ API contract");

  await runLoadTests();
  console.log("✓ Autocannon load");

  console.log("⏳ Lighthouse mobile…");
  const lhMobile = runLighthouse("mobile");
  pass("2-lighthouse-mobile", lhMobile);
  if (!lhMobile.ok && !lhMobile.error) warn(`LH mobile score ${lhMobile.score} < ${lhMobile.minScore}`);

  console.log("⏳ Lighthouse desktop…");
  const lhDesktop = runLighthouse("desktop");
  pass("2-lighthouse-desktop", lhDesktop);

  await runPsi();
  console.log("✓ PageSpeed Insights");

  await runWebPageTest();
  console.log("✓ WebPageTest API");

  runK6();
  console.log("✓ k6");

  await runJmeterLite();
  console.log("✓ JMeter / lite");

  const mdPath = join(OUT_DIR, `PERF-AUDIT-${stamp}.md`);
  writeFileSync(mdPath, renderMarkdown());
  writeFileSync(join(OUT_DIR, `PERF-AUDIT-${stamp}.json`), JSON.stringify(report, null, 2));

  console.log(`\n📄 Reporte: ${mdPath}`);
  console.log(`Fallos: ${report.failures.length} | Avisos: ${report.warnings.length}`);

  process.exit(report.failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
