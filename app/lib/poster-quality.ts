import type { EventRow } from "../components/types";
import {
  getSpotlightCardModel,
} from "./featured-card";
import { resolveEventPosterUrl } from "./event-poster";
import { isChampionsWeekDestacado } from "./destacados-importance";
import { preferLocalWebpUrl } from "./prefer-local-webp";
import { MADRID_TZ } from "./timezone";

/** Pósters genéricos por deporte (SVG/PNG generados) — no válidos como portada editorial. */
const GENERIC_SPORT_PLACEHOLDER_PATHS = new Set([
  "/deportes/futbol.png",
  "/deportes/baloncesto.png",
  "/deportes/baloncesto-nba.png",
  "/deportes/tenis.png",
  "/deportes/ciclismo.png",
  "/deportes/copa-rey.png",
  "/deportes/formula1.png",
  "/deportes/motos.png",
  "/deportes/ufc.png",
]);

export function normalizePosterPath(url: string | undefined | null): string {
  if (!url) return "";
  return url.split("?")[0].split("#")[0];
}

/** Portada temporal/genérica (no TMDB, no editorial, no crestas). */
export function isGenericSportPlaceholderUrl(url: string | undefined | null): boolean {
  const path = normalizePosterPath(url);
  if (!path) return false;
  if (GENERIC_SPORT_PLACEHOLDER_PATHS.has(path)) return true;
  if (/^\/deportes\/[^/]+\.png$/i.test(path) && !path.includes("/ufc/")) {
    return true;
  }
  return false;
}

export function preferEditorialPosterUrl(url: string | null): string | null {
  if (!url) return null;
  const raster = preferLocalWebpUrl(url);
  return isGenericSportPlaceholderUrl(raster) ? null : raster;
}

export function destacadoHasQualityVisual(event: EventRow): boolean {
  const poster = preferEditorialPosterUrl(resolveEventPosterUrl(event, "poster"));
  if (poster) return true;

  const card = getSpotlightCardModel(event, MADRID_TZ);
  const coverUrl = card.coverImage?.url;

  if (card.showTeamDuel && card.homeCrest && card.awayCrest) return true;

  if (isChampionsWeekDestacado(event)) return true;

  if (
    card.showUfcDuel ||
    card.showRolandGarrosDuel ||
    card.showTennisDuel ||
    card.showBasketballDuel
  ) {
    if (coverUrl && !isGenericSportPlaceholderUrl(coverUrl)) return true;
    return Boolean(card.showUfcDuel && card.homeCrest && card.awayCrest);
  }

  return Boolean(coverUrl && !isGenericSportPlaceholderUrl(coverUrl));
}
