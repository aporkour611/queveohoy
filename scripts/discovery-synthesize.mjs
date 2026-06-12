/**
 * Consolida descubrimiento → backlog de aplicación (fase 2).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "docs", "marathon-100k");
const QUALITY = join(process.cwd(), "docs/quality-reports/quality-scorecard-latest.json");

function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function main() {
  mkdirSync(OUT, { recursive: true });
  const seo = readJson(join(OUT, "discovery-seo.json"));
  const design = readJson(join(OUT, "discovery-design.json"));
  const quality = readJson(QUALITY);

  const recommendations = [
    ...(seo?.recommendations ?? []),
    ...(design?.recommendations ?? []),
  ];

  if (quality?.summary) {
    const weak = Object.entries(quality.scores ?? {})
      .filter(([, v]) => Number(v) < 98)
      .map(([k, v]) => ({ id: k, score: v }));
    for (const w of weak) {
      recommendations.push({
        priority: "P0",
        area: "quality",
        action: `Subir ranking ${w.id} (actual ${w.score}%)`,
      });
    }
  }

  const applyPlan = [
    {
      id: "hub-jsonld-footer",
      priority: "P1",
      files: ["app/components/SeoHubPage.tsx"],
      action: "Mover HubJsonLd al footer (no competir con LCP)",
    },
    {
      id: "prefetch-deferred",
      priority: "P1",
      files: [
        "app/agenda/[hub]/page.tsx",
        "app/(site)/explorar/page.tsx",
      ],
      action: "HomeWeekPrefetchDeferred en hubs y explorar",
    },
    {
      id: "warm-new-hubs",
      priority: "P2",
      files: ["app/lib/seo-hub-warm-paths.ts"],
      action: "Keep-warm /serie-a /ligue-1 /segunda-division",
    },
    {
      id: "deploy-5-4",
      priority: "P0",
      files: ["app/lib/product-version.ts"],
      action: "Bump 5.4.0 + validate + push producción",
    },
  ];

  const payload = {
    synthesizedAt: new Date().toISOString(),
    discoveryRecommendations: recommendations,
    applyPlan,
    qualitySummary: quality?.summary ?? null,
  };

  const md = [
    "# Maratón 100k — backlog de aplicación",
    "",
    `Generado: ${payload.synthesizedAt}`,
    "",
    "## Descubrimiento",
    "",
    ...recommendations.map(
      (r) => `- **[${r.priority}]** (${r.area}) ${r.action}`
    ),
    "",
    "## Plan de aplicación (fase 2)",
    "",
    ...applyPlan.map(
      (p) => `- **${p.id}** [${p.priority}]: ${p.action}`
    ),
    "",
  ].join("\n");

  writeFileSync(join(OUT, "discovery-backlog.json"), `${JSON.stringify(payload, null, 2)}\n`);
  writeFileSync(join(OUT, "APPLY-BACKLOG.md"), md);
  console.log(`Backlog → ${applyPlan.length} ítems de aplicación`);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
}
