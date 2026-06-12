/**
 * Fase descubrimiento — SEO en producción (solo lectura).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.DISCOVERY_URL ?? "https://queveohoy.es";
const OUT = join(process.cwd(), "docs", "marathon-100k");

function readHubSlugs() {
  const src = readFileSync(join(process.cwd(), "app/lib/seo-hubs.ts"), "utf8");
  return [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
}

async function fetchText(path) {
  const url = `${BASE}${path}`;
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(url, {
      headers: { "Cache-Control": "no-cache", Accept: "text/html,application/xml" },
      signal: controller.signal,
    });
    const text = await res.text();
    return { url, status: res.status, ms: Date.now() - started, text, ok: res.ok };
  } catch (err) {
    return {
      url,
      status: 0,
      ms: Date.now() - started,
      text: "",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timer);
  }
}

function scoreSeoHtml(text, path) {
  const checks = {
    hasJsonLd: /<script[^>]+application\/ld\+json/i.test(text),
    hasCanonical: /rel=["']canonical["']/i.test(text),
    hasDescription: /name=["']description["']/i.test(text),
    hasOgTitle: /property=["']og:title["']/i.test(text),
    hasLang: /<html[^>]+lang=["']es/i.test(text),
    hasH1: /<h1[\s>]/i.test(text),
    jsonLdAtEnd: (() => {
      const idx = text.lastIndexOf("application/ld+json");
      const footer = text.lastIndexOf("</footer>");
      return footer > 0 && idx > footer;
    })(),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  return { path, checks, score: Math.round((passed / Object.keys(checks).length) * 100) };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const slugs = readHubSlugs();
  const samples = ["/", "/robots.txt", "/sitemap.xml", ...slugs.slice(0, 8).map((s) => `/${s}`)];
  const pages = await Promise.all(
    samples.map(async (path) => {
      const res = await fetchText(path);
      return {
        path,
        status: res.status,
        ms: res.ms,
        ok: res.ok,
        error: res.error,
        seo:
          path.endsWith(".xml") || path.endsWith(".txt")
            ? null
            : scoreSeoHtml(res.text, path),
      };
    })
  );

  const recommendations = [];
  const home = pages.find((p) => p.path === "/");
  const hubs = pages.filter((p) => p.seo && p.path !== "/");

  if (home?.seo && !home.seo.checks.jsonLdAtEnd) {
    recommendations.push({
      priority: "P1",
      area: "seo",
      action: "Mover JSON-LD de hubs al footer (patrón home)",
    });
  }

  for (const hub of hubs) {
    if (hub.seo && !hub.seo.checks.hasJsonLd) {
      recommendations.push({
        priority: "P0",
        area: "seo",
        action: `Añadir JSON-LD en ${hub.path}`,
      });
    }
  }

  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    pages,
    recommendations,
    hubCount: slugs.length,
  };

  writeFileSync(join(OUT, "discovery-seo.json"), `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`SEO discovery → ${pages.length} URLs · ${recommendations.length} recomendaciones`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
