/**
 * Re-evalúa gates efectivos y actualiza exhausted.json tras 100k.
 *   node scripts/marathon-finalize-100k.mjs
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  readEffectiveProReport,
  readEffectiveQualityGatePass,
  isProdCurrentlyBlocked,
  probeProdHealth,
} from "./lib/prod-probe-guard.mjs";

const MARATHON_ID = process.env.MARATHON_ID ?? "ultra-pro-100k";
const TOTAL = Number(process.env.MARATHON_CYCLES ?? 100_000);
const OUT = join(process.cwd(), "docs", "marathon-reports");
const TESTS_JSON = join(OUT, "PRO-100-TESTS-latest.json");
const EXHAUSTED = join(OUT, `${MARATHON_ID}-exhausted.json`);
const COMPLETED = join(OUT, `${MARATHON_ID}-completed.json`);
const PROGRESS = join(OUT, `${MARATHON_ID}-progress.json`);

mkdirSync(OUT, { recursive: true });

await probeProdHealth();

const tests = readEffectiveProReport(TESTS_JSON);
const quality = readEffectiveQualityGatePass();
const gatesPass = tests?.pass === true && quality;

const payload = {
  marathonId: MARATHON_ID,
  status: gatesPass ? "COMPLETED" : "EXHAUSTED",
  cycles: TOTAL,
  tests,
  quality,
  prodBlocked: isProdCurrentlyBlocked(),
  at: new Date().toISOString(),
};

writeFileSync(EXHAUSTED, `${JSON.stringify(payload, null, 2)}\n`);

if (gatesPass) {
  writeFileSync(
    COMPLETED,
    `${JSON.stringify(
      {
        marathonId: MARATHON_ID,
        status: "COMPLETED",
        version: "6.1.0-pro-definitive",
        cycles: TOTAL,
        gates: {
          tests100: tests?.passed ?? 0,
          testsTotal: tests?.total ?? 105,
          testsPass: true,
          quality: true,
        },
        at: new Date().toISOString(),
      },
      null,
      2
    )}\n`
  );
}

if (existsSync(PROGRESS)) {
  try {
    const p = JSON.parse(readFileSync(PROGRESS, "utf8"));
    p.gates = {
      tests100: tests?.passed ?? 0,
      testsTotal: tests?.total ?? 105,
      testsPass: tests?.pass === true,
      quality,
    };
    p.at = new Date().toISOString();
    writeFileSync(PROGRESS, `${JSON.stringify(p, null, 2)}\n`);
  } catch {
    /* */
  }
}

console.log(
  `finalize · ${payload.status} · PRO ${tests?.passed}/${tests?.total} · Q=${quality ? "OK" : "FAIL"} · prodBlocked=${payload.prodBlocked}`
);
process.exitCode = gatesPass ? 0 : 1;
