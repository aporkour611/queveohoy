/**
 * Auditoría local de crests (sin prod).
 *   npm run crests:audit:local
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const REGISTRY = join(process.cwd(), "app/lib/pinned-images.json");
const CRESTS_ROOT = join(process.cwd(), "public/crests");

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => /\.(png|webp|svg)$/i.test(f)).length;
}

function main() {
  const reg = JSON.parse(readFileSync(REGISTRY, "utf8"));
  const byKey = reg.byKey ?? {};
  const keys = Object.keys(byKey);
  const byKind = { esports: 0, football: 0, basket: 0, other: 0 };
  let missingFiles = 0;

  for (const key of keys) {
    const kind = key.split(":")[0] ?? "other";
    if (kind in byKind) byKind[kind] += 1;
    else byKind.other += 1;

    const local = byKey[key]?.local;
    if (local?.startsWith("/crests/")) {
      const disk = join(process.cwd(), "public", local.replace(/^\//, ""));
      if (!existsSync(disk)) missingFiles += 1;
    }
  }

  const onDisk = {
    esports: countFiles(join(CRESTS_ROOT, "esports")),
    football: countFiles(join(CRESTS_ROOT, "football")),
    basket: countFiles(join(CRESTS_ROOT, "basket")),
  };

  const unit = spawnSync("npm", ["test", "--", "--run", "app/lib/pinned-images.test.ts", "app/lib/match-card-crests.test.ts"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: "pipe",
  });

  console.log("\n[crests:audit:local]");
  console.log(`  registry entries: ${keys.length}`);
  console.log(`  esports ${byKind.esports} · football ${byKind.football} · basket ${byKind.basket}`);
  console.log(`  files on disk: esports ${onDisk.esports} · football ${onDisk.football} · basket ${onDisk.basket}`);
  console.log(`  missing local files: ${missingFiles}`);
  console.log(`  unit tests: ${unit.status === 0 ? "OK" : "FAIL"}`);

  const ok = missingFiles === 0 && unit.status === 0;
  if (!ok) process.exit(1);
  console.log("\n  ✓ crests local audit OK\n");
}

main();
