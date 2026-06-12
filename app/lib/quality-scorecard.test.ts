import { describe, expect, it } from "vitest";
import {
  QUALITY_RANKINGS,
  scoreCls,
  scoreDependencySecurity,
  scoreLighthouseCategory,
  scoreMetricMs,
  scorePwaReadiness,
  scoreSecurityHeaders,
  scoreSeoInfrastructure,
  summarizeScorecard,
  rankingStatus,
  TARGET_SCORE,
} from "../../scripts/quality-scorecard-lib.mjs";

describe("quality-scorecard-lib", () => {
  it("define 20 rankings", () => {
    expect(QUALITY_RANKINGS).toHaveLength(20);
  });

  it("puntúa LCP en escala good/poor", () => {
    expect(scoreMetricMs(2000, { good: 2500, poor: 4000 })).toBe(100);
    expect(scoreMetricMs(3250, { good: 2500, poor: 4000 })).toBe(50);
    expect(scoreMetricMs(5000, { good: 2500, poor: 4000 })).toBe(0);
  });

  it("puntúa CLS", () => {
    expect(scoreCls(0.01)).toBe(100);
    expect(scoreCls(0.15)).toBe(50);
  });

  it("resume scorecard con meta 95%", () => {
    const scores = Object.fromEntries(
      QUALITY_RANKINGS.map((ranking, index) => [
        ranking.id,
        index < 15 ? 96 : 80,
      ])
    );
    const summary = summarizeScorecard(scores, TARGET_SCORE);
    expect(summary.passing).toBe(15);
    expect(summary.average).toBeGreaterThan(90);
  });

  it("detecta headers de seguridad", () => {
    expect(
      scoreSecurityHeaders({
        "strict-transport-security": "max-age=63072000",
        "content-security-policy": "default-src 'self'",
        "x-frame-options": "DENY",
        "x-content-type-options": "nosniff",
        "referrer-policy": "strict-origin-when-cross-origin",
        "permissions-policy": "camera=()",
      })
    ).toBe(100);
  });

  it("puntúa SEO infra en HTML", () => {
    const html = `<!DOCTYPE html><html lang="es">
      <meta name="description" content="x"/>
      <meta property="og:title" content="x"/>
      <link rel="canonical" href="https://queveohoy.es"/>
      <script type="application/ld+json">{}</script>`;
    expect(scoreSeoInfrastructure(html)).toBe(100);
  });

  it("puntúa PWA readiness parcial", () => {
    expect(
      scorePwaReadiness({
        manifestOk: true,
        swOk: true,
        swOfflineReady: true,
        manifestComplete: true,
        lhPwaScore: null,
      })
    ).toBeGreaterThanOrEqual(95);
  });

  it("penaliza vulns npm high", () => {
    expect(scoreDependencySecurity({ critical: 0, high: 2, moderate: 0 })).toBeLessThan(
      70
    );
    expect(scoreDependencySecurity({ critical: 0, high: 0, moderate: 0 })).toBe(100);
  });

  it("clasifica rankingStatus", () => {
    expect(rankingStatus(96)).toBe("pass");
    expect(rankingStatus(88)).toBe("warn");
    expect(rankingStatus(70)).toBe("fail");
  });

  it("convierte LH ratio a porcentaje", () => {
    expect(scoreLighthouseCategory(0.91)).toBe(91);
  });
});
