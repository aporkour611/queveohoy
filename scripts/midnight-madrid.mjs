/**
 * Rollover diario (00:00 Europe/Madrid): cron en prod + portadas editoriales + tests.
 * Uso local: node scripts/midnight-madrid.mjs
 * CI: .github/workflows/midnight-rollover.yml
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SITE = process.env.SITE_URL?.trim() || "https://queveohoy.es";
const ROOT = process.cwd();

function madridHour(now = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "numeric",
      hour12: false,
    }).format(now)
  );
}

function run(cmd, args, env = process.env) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function loadEnvLocal() {
  const path = join(ROOT, ".env.local");
  if (!existsSync(path)) return {};
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1).trim()];
      })
  );
}

export function shouldRunMidnightRollover(now = new Date(), { force = false } = {}) {
  if (force || process.env.FORCE_MIDNIGHT === "1") return true;
  if (process.env.CI === "true") return madridHour(now) === 0;
  return true;
}

async function callMidnightRollover(secret) {
  const res = await fetch(`${SITE}/api/midnight-rollover?force=1`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("Midnight rollover failed:", res.status, body.slice(0, 400));
    process.exit(1);
  }
  try {
    const json = JSON.parse(body);
    console.log(
      "Rollover OK — día:",
      json.calendarDay,
      "| cron purged:",
      json.cron?.pastDayPurged,
      "| revalidate:",
      json.revalidate?.ok
    );
  } catch {
    console.log("Rollover OK:", body.slice(0, 200));
  }
}

async function main() {
  if (!shouldRunMidnightRollover()) {
    console.log("Skip: no es medianoche en Europe/Madrid");
    return;
  }

  const env = { ...process.env, ...loadEnvLocal() };
  const cronSecret = env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.error("Falta CRON_SECRET");
    process.exit(1);
  }

  console.log("=== Midnight rollover queveohoy ===");
  await callMidnightRollover(cronSecret);

  console.log("\n--- Portadas editoriales (TV + deportes flagship) ---");
  if (env.TMDB_API_KEY?.trim()) {
    run("node", ["scripts/sync-tv-tmdb-posters.mjs"], env);
  } else {
    console.warn("TMDB_API_KEY ausente: omitiendo sync TMDB (solo posters locales)");
  }
  run("npm", ["run", "posters"], env);

  console.log("\n--- Tests ---");
  run("npm", ["test"], env);
  run("npm", ["run", "verify:release"], env);

  console.log("\n=== Midnight rollover completado ===");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
