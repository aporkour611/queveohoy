/**
 * Fase descubrimiento — diseño / UX / móvil (HTML prod).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-100k");

async function fetchHome() {
  const res = await fetch(`${BASE}/`, {
    headers: { "Cache-Control": "no-cache" },
  });
  return { status: res.status, html: await res.text(), ok: res.ok };
}

function analyzeDesign(html) {
  return {
    hasViewport: /name=["']viewport["']/i.test(html),
    hasMainContent: /id=["']main-content["']/i.test(html),
    hasSpotlightCards: /qvh-spotlight|fh-match|fh-media-spotlight/i.test(html),
    hasCriticalInlineCss: /qvh-destacados-page-static|fh-body/i.test(html),
    hasDeferredHydration: /FeedHydration|data-qvh-hydrate/i.test(html),
    hasUfcHero: /qvh-ufc-week|UFC/i.test(html),
    hasAdSlotReady: /qvh-ad-slot|monetization/i.test(html),
    prefetchInHead: /<link[^>]+rel=["']prefetch["']/i.test(html),
    cardLeagueClasses: (html.match(/fh-match_[a-z0-9_-]+/gi) ?? []).slice(0, 20),
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const home = await fetchHome();
  const signals = analyzeDesign(home.html);
  const recommendations = [];

  if (signals.prefetchInHead) {
    recommendations.push({
      priority: "P1",
      area: "perf",
      action: "Diferir prefetch semanal tras LCP (HomeWeekPrefetchDeferred en todos los layouts)",
    });
  }
  if (!signals.hasAdSlotReady) {
    recommendations.push({
      priority: "P2",
      area: "monetization",
      action: "Activar AdSlot con NEXT_PUBLIC_ADS_PREVIEW en staging",
    });
  }
  recommendations.push({
    priority: "P1",
    area: "design",
    action: "Tarjetas fh-match: sombra, radius 12px, touch targets móvil (ya en CSS local si pendiente deploy)",
  });
  recommendations.push({
    priority: "P1",
    area: "design",
    action: "Filtros por liga (LaLiga, Champions) además de deporte",
  });

  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    homeStatus: home.status,
    signals,
    recommendations,
  };

  writeFileSync(join(OUT, "discovery-design.json"), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`Design discovery → ${recommendations.length} recomendaciones`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
