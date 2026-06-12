/**
 * Metodología de puntuación unificada (0–100) para los 20 rankings de calidad web.
 * Referencias: Lighthouse, Web Vitals (Google), OWASP headers, CI gates.
 */

export const TARGET_SCORE = 95;

/** @typedef {{ id: string; name: string; method: string; phase: number; action: string }} RankingMeta */

/** @type {RankingMeta[]} */
export const QUALITY_RANKINGS = [
  {
    id: "lh-performance",
    name: "Lighthouse Performance",
    method: "LH mobile · categoría performance (post warm-up)",
    phase: 2,
    action: "LCP ≤2.5s · lazy HomeFeed · keep-warm pre-audit",
  },
  {
    id: "lh-accessibility",
    name: "Lighthouse Accessibility",
    method: "LH mobile · categoría accessibility",
    phase: 1,
    action: "Mantener axe E2E en home + ampliar a explorar/partido",
  },
  {
    id: "lh-best-practices",
    name: "Lighthouse Best Practices",
    method: "LH mobile · categoría best-practices",
    phase: 1,
    action: "HTTPS, imágenes aspect-ratio, sin deprecated APIs",
  },
  {
    id: "lh-seo",
    name: "Lighthouse SEO",
    method: "LH mobile · categoría seo",
    phase: 1,
    action: "meta, canonical, robots, hreflang ES",
  },
  {
    id: "cwv-lcp",
    name: "LCP (Core Web Vital)",
    method: "LH lab · largest-contentful-paint",
    phase: 2,
    action: "preload LCP poster WebP · TMDB w154 · SSR hero",
  },
  {
    id: "cwv-inp",
    name: "INP / interactividad",
    method: "LH lab · max-potential-fid (proxy INP)",
    phase: 3,
    action: "defer client islands · interaction-gate · INP RUM",
  },
  {
    id: "cwv-cls",
    name: "CLS (Core Web Vital)",
    method: "LH lab · cumulative-layout-shift",
    phase: 1,
    action: "dimensiones fijas en posters y crests",
  },
  {
    id: "cwv-tbt",
    name: "TBT (main thread)",
    method: "LH lab · total-blocking-time",
    phase: 2,
    action: "code-split HomeFeed · optimizePackageImports",
  },
  {
    id: "cwv-fcp",
    name: "FCP",
    method: "LH lab · first-contentful-paint",
    phase: 2,
    action: "CSS crítico inline · menos JS bloqueante",
  },
  {
    id: "cwv-si",
    name: "Speed Index",
    method: "LH lab · speed-index",
    phase: 2,
    action: "prioridad LCP · skeleton above-the-fold",
  },
  {
    id: "ttfb",
    name: "TTFB",
    method: "curl time_starttransfer · home /",
    phase: 2,
    action: "ISR feed · edge cache · keep-warm cron",
  },
  {
    id: "security-headers",
    name: "Security headers",
    method: "Probe HTTP · HSTS CSP XFO XCTO Referrer",
    phase: 3,
    action: "endurecer CSP scripts · Permissions-Policy",
  },
  {
    id: "prod-smoke",
    name: "Production smoke",
    method: "verify-prod-current.mjs pass rate",
    phase: 1,
    action: "22/22 checks verdes tras cada deploy",
  },
  {
    id: "api-contract",
    name: "API contract",
    method: "health + feed-meta + home-feed ETag",
    phase: 1,
    action: "304 home-feed · feed-meta revalidate 900s",
  },
  {
    id: "seo-infra",
    name: "SEO infrastructure",
    method: "HTML home · JSON-LD + sitemap + robots",
    phase: 1,
    action: "IndexNow ping · hubs OG · FAQ schema",
  },
  {
    id: "a11y-automation",
    name: "A11y automation",
    method: "LH a11y + landmarks E2E (proxy)",
    phase: 2,
    action: "axe matrix 5 URLs · contraste CI",
  },
  {
    id: "dependency-security",
    name: "Dependency security",
    method: "npm audit --audit-level=high",
    phase: 3,
    action: "0 vulns high+ · Trivy en CI blocking",
  },
  {
    id: "e2e-quality",
    name: "E2E quality",
    method: "Playwright smoke + quality specs",
    phase: 2,
    action: "blocking en deploy · mobile viewport",
  },
  {
    id: "cache-cdn",
    name: "CDN / cache",
    method: "Cache-Control + ETag en APIs clave",
    phase: 2,
    action: "s-maxage feed · stale-while-revalidate",
  },
  {
    id: "pwa-readiness",
    name: "PWA / install readiness",
    method: "manifest + SW + LH installable (proxy)",
    phase: 4,
    action: "manifest completo · SW offline shell opcional",
  },
];

/**
 * Escala métrica ms: good → 100, poor → 0 (lineal entre umbrales).
 * @param {number | null | undefined} valueMs
 * @param {{ good: number; poor: number }} thresholds
 */
export function scoreMetricMs(valueMs, { good, poor }) {
  if (valueMs == null || Number.isNaN(valueMs)) return null;
  if (valueMs <= good) return 100;
  if (valueMs >= poor) return 0;
  return Math.round(((poor - valueMs) / (poor - good)) * 100);
}

/** @param {number | null | undefined} value */
export function scoreCls(value) {
  if (value == null || Number.isNaN(value)) return null;
  if (value <= 0.05) return 100;
  if (value >= 0.25) return 0;
  return Math.round(((0.25 - value) / 0.2) * 100);
}

/** @param {number | null | undefined} ratio 0–1 */
export function scoreLighthouseCategory(ratio) {
  if (ratio == null || Number.isNaN(ratio)) return null;
  return Math.round(ratio * 100);
}

/**
 * @param {number} score
 * @param {number} [target=95]
 */
export function rankingStatus(score, target = TARGET_SCORE) {
  if (score == null) return "pending";
  if (score >= target) return "pass";
  if (score >= target - 10) return "warn";
  return "fail";
}

/**
 * @param {Record<string, number | null>} scoresById
 * @param {number} [target=95]
 */
export function summarizeScorecard(scoresById, target = TARGET_SCORE) {
  const rows = QUALITY_RANKINGS.map((ranking) => {
    const score = scoresById[ranking.id] ?? null;
    return {
      ...ranking,
      score,
      status: rankingStatus(score, target),
      gap: score == null ? null : Math.max(0, target - score),
    };
  });

  const measured = rows.filter((row) => row.score != null);
  const passing = measured.filter((row) => row.status === "pass");
  const average =
    measured.length > 0
      ? Math.round(
          measured.reduce((sum, row) => sum + (row.score ?? 0), 0) /
            measured.length
        )
      : null;

  const byPhase = [1, 2, 3, 4].map((phase) => {
    const phaseRows = rows.filter((row) => row.phase === phase);
    const phaseMeasured = phaseRows.filter((row) => row.score != null);
    const phasePassing = phaseRows.filter((row) => row.status === "pass");
    return {
      phase,
      total: phaseRows.length,
      passing: phasePassing.length,
      pending: phaseRows.filter((row) => row.score == null).length,
      avg:
        phaseMeasured.length > 0
          ? Math.round(
              phaseMeasured.reduce((sum, row) => sum + (row.score ?? 0), 0) /
                phaseMeasured.length
            )
          : null,
    };
  });

  return {
    target,
    average,
    measured: measured.length,
    total: rows.length,
    passing: passing.length,
    rows,
    byPhase,
  };
}

/**
 * @param {Record<string, string | undefined>} headers
 */
export function scoreSecurityHeaders(headers) {
  const checks = [
    Boolean(headers["strict-transport-security"]),
    Boolean(headers["content-security-policy"]),
    headers["x-frame-options"]?.toLowerCase() === "deny" ||
      headers["x-frame-options"]?.toLowerCase() === "sameorigin",
    headers["x-content-type-options"]?.toLowerCase() === "nosniff",
    Boolean(headers["referrer-policy"]),
    Boolean(headers["permissions-policy"] || headers["feature-policy"]),
  ];
  const hit = checks.filter(Boolean).length;
  return Math.round((hit / checks.length) * 100);
}

/**
 * @param {string} html
 */
export function scoreSeoInfrastructure(html) {
  const checks = [
    /<script[^>]+application\/ld\+json/i.test(html),
    /rel=["']canonical["']/i.test(html),
    /<meta[^>]+name=["']description["']/i.test(html),
    /<meta[^>]+property=["']og:title["']/i.test(html),
    /<html[^>]+lang=/i.test(html),
  ];
  const hit = checks.filter(Boolean).length;
  return Math.round((hit / checks.length) * 100);
}

/**
 * @param {{ manifestOk: boolean; swOk: boolean; lhPwaScore?: number | null }} input
 */
export function scorePwaReadiness({ manifestOk, swOk, lhPwaScore }) {
  const parts = [
    manifestOk ? 40 : 0,
    swOk ? 35 : 0,
    lhPwaScore != null ? Math.round(lhPwaScore * 25) : 0,
  ];
  return Math.min(100, parts.reduce((a, b) => a + b, 0));
}

/**
 * @param {{ high: number; critical: number; moderate: number }} audit
 */
export function scoreDependencySecurity(audit) {
  if (audit.critical > 0) return 0;
  if (audit.high > 0) return Math.max(0, 70 - audit.high * 15);
  if (audit.moderate > 0) return 92;
  return 100;
}
