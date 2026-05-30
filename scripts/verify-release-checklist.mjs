/**
 * Checklist de release v1.0 — verifica peticiones del usuario en código.
 * Uso: node scripts/verify-release-checklist.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (rel) => readFileSync(join(root, rel), "utf8");

const checks = [];
const fail = (name, detail) => checks.push({ name, ok: false, detail });
const pass = (name, detail = "") => checks.push({ name, ok: true, detail });

try {
  const brand = read("app/brand.css");
  if (brand.includes("--qvh-shell-max: 950px")) pass("Shell Letterboxd 950px");
  else fail("Shell Letterboxd 950px", "Falta --qvh-shell-max: 950px");

  if (brand.includes("--qvh-navbar-content-h: 60px")) pass("Header 60px");
  else fail("Header 60px", "Falta navbar 60px");

  const destacados = read("app/components/DestacadosSection.tsx");
  if (!destacados.includes("pickTodayDestacados") && !destacados.includes('"Hoy"'))
    pass("Sin módulo Destacados Hoy");
  else fail("Sin módulo Destacados Hoy", "Aún referencia Hoy/today");

  if (destacados.includes('"Esta semana"')) pass("Bloque Esta semana presente");
  else fail("Bloque Esta semana presente");

  const eventDetails = read("app/lib/event-details.ts");
  if (!/Interés|interés/.test(eventDetails)) pass("Interés oculto en tarjetas");
  else fail("Interés oculto en tarjetas", "Sigue en event-details");

  const featured = read("app/lib/featured-card.ts");
  if (featured.includes("ufcSpotlightBadge")) pass("Badge UFC corregido");
  else fail("Badge UFC corregido");

  if (featured.includes("resolveEventChannelList")) pass("Canales separados en destacados");
  else fail("Canales separados en destacados");

  const media = read("app/lib/media-platform.ts");
  if (!media.includes("Antena 3 · ATRESPLAYER TV"))
    pass("Canales no fusionados en normalize");
  else fail("Canales no fusionados en normalize", "Sigue fusionando Antena+Atres");

  const poster = read("app/lib/event-poster.ts");
  if (
    poster.indexOf("parseTmdbPoster(event.source") <
    poster.indexOf("localPosterPath")
  )
    pass("TMDB oficial antes que poster local");
  else fail("TMDB oficial antes que poster local");

  const tmdbJson = JSON.parse(read("app/lib/spanish-tv-tmdb-posters.json"));
  const missingPosters = Object.entries(tmdbJson).filter(([, v]) => !v.posterPath);
  if (missingPosters.length === 0) pass("15/15 pósters TMDB en catálogo");
  else
    fail(
      "15/15 pósters TMDB en catálogo",
      `Sin póster: ${missingPosters.map(([k]) => k).join(", ")}`
    );

  const hero = read("app/components/ChampionsWeekHero.tsx");
  if (hero.includes("TeamCrest") && hero.includes("homeCrest"))
    pass("Escudos en hero Champions");
  else fail("Escudos en hero Champions");

  const clCss = read("app/champions-week.css");
  if (
    clCss.includes("width: 100%") &&
    !clCss.includes("calc(100% - 24px)")
  )
    pass("Champions shell ancho completo");
  else fail("Champions shell ancho completo", "Sigue estrecho con calc(-24px)");

  const curated = read("app/lib/spanish-tv-curated.ts");
  if (!curated.includes('from "./spanish-tv-tmdb-posters"'))
    pass("Sin import circular TMDB posters");
  else fail("Sin import circular TMDB posters", "Import circular detectado");

  for (const id of [
    "el-hormiguero",
    "pasapalabra",
    "la-revuelta",
    "la-promesa",
    "suenos-libertad",
    "late-xou",
    "isla-tentaciones",
    "la-ruleta",
  ]) {
    if (tmdbJson[id]?.posterPath) pass(`Póster TMDB: ${id}`);
    else fail(`Póster TMDB: ${id}`);
  }

  const rgCss = read("app/roland-garros.css");
  if (rgCss.includes("fh-rg-flag-home") && rgCss.includes("fh-rg-flags-center"))
    pass("Roland Garros banderas fusionadas");
  else fail("Roland Garros banderas fusionadas");

  const rgVisual = read("app/components/RolandGarrosDuelVisual.tsx");
  if (rgVisual.includes("resolveTennisPlayerCountry"))
    pass("Roland Garros visual por nacionalidad");
  else fail("Roland Garros visual por nacionalidad");

  if (
    featured.includes("showRolandGarrosDuel") &&
    featured.includes("qvh-spotlight-visual-rg")
  )
    pass("Roland Garros en destacados");
  else fail("Roland Garros en destacados");
} catch (error) {
  fail("Checklist ejecutado", error.message);
}

const failed = checks.filter((c) => !c.ok);
for (const c of checks) {
  console.log(`${c.ok ? "✓" : "✗"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

console.log(`\n${checks.length - failed.length}/${checks.length} OK`);
if (failed.length) process.exit(1);
