import type { EventRow } from "../components/types";
import { DESTACADOS_VISIBLE_SLOTS } from "./destacados-config";
import { buildWeekDestacadosPresentation } from "./destacados-week-present";
import { getSpotlightCardModel } from "./featured-card";
import { resolveLcpLocalRasterUrl } from "./lcp-local-poster";
import { isTmdbPosterUrl, resolveLcpCoverImgSrc } from "./lcp-poster";
import { buildDisplayDays, MADRID_TZ } from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  isUfcWeekEditorialWindow,
  resolveUfcWeekContext,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "./ufc-week";
import type { SpotlightPreloadEntry } from "./optimized-image";
import type { SpotlightCover } from "./spotlight-art";
import { safeRemoteImageUrl } from "./remote-image";

type SpotlightCardModel = ReturnType<typeof getSpotlightCardModel>;

function hasTeamDuelVisual(card: SpotlightCardModel): boolean {
  return Boolean(card.showTeamDuel && card.homeCrest && card.awayCrest);
}

/** Portada realmente pintada (no escudos ni duelos que la sustituyen). */
function resolveVisibleLcpCover(card: SpotlightCardModel): SpotlightCover | null {
  if (!card.coverImage) return null;
  if (
    hasTeamDuelVisual(card) ||
    card.showUfcDuel ||
    card.showRolandGarrosDuel ||
    card.showTennisDuel
  ) {
    return null;
  }
  return card.coverImage;
}

function lcpCoverScore(cover: SpotlightCover): number {
  if (!cover.url) return -1;

  const isSmallDuelIcon =
    cover.local && /\/esports\/|\/crests\/|_logo\./i.test(cover.url);

  if (isSmallDuelIcon) return 2;

  if (!cover.local && !isTmdbPosterUrl(cover.url)) {
    return 3;
  }

  if (cover.local) {
    const raster = resolveLcpLocalRasterUrl(cover.url);
    const isRaster = /\.(png|jpe?g|webp|avif)$/i.test(raster);
    if (isRaster) {
      if (raster.includes("/posters/")) return 25;
      return raster.endsWith(".webp") ? 20 : 18;
    }
    return 4;
  }

  if (isTmdbPosterUrl(cover.url)) return 15;
  return 5;
}

function lcpCardScore(card: SpotlightCardModel): number {
  const visibleCover = resolveVisibleLcpCover(card);
  if (visibleCover) return lcpCoverScore(visibleCover);

  if (card.showUfcDuel) {
    return safeRemoteImageUrl(card.homeCrest) ? 10 : -1;
  }

  if (hasTeamDuelVisual(card)) return 2;

  return -1;
}

/** Preload alineado con el <img> LCP (local mismo origen > TMDB directo > remoto). */
export function resolveLcpPreloadEntryFromCover(
  cover: SpotlightCover
): SpotlightPreloadEntry | null {
  if (!cover.url) return null;

  const href = resolveLcpCoverImgSrc(cover.url, cover.local);
  return href ? { href } : null;
}

/** Preload del visual LCP real de la tarjeta (portada, escudo o luchador). */
export function resolveLcpPreloadEntryFromCard(
  card: SpotlightCardModel
): SpotlightPreloadEntry | null {
  const visibleCover = resolveVisibleLcpCover(card);
  if (visibleCover) return resolveLcpPreloadEntryFromCover(visibleCover);

  if (card.showUfcDuel) {
    const f1 = safeRemoteImageUrl(card.homeCrest);
    return f1 ? { href: f1 } : null;
  }

  if (hasTeamDuelVisual(card)) {
    const crest = safeRemoteImageUrl(card.homeCrest);
    return crest ? { href: crest } : null;
  }

  return null;
}

function resolveCoverPreloadEntry(event: EventRow): SpotlightPreloadEntry | null {
  const card = getSpotlightCardModel(event, MADRID_TZ);
  return resolveLcpPreloadEntryFromCard(card);
}

/** Índice de la tarjeta visible más probable como LCP (un solo eager+high). */
export function resolveLcpPriorityIndex(events: EventRow[]): number {
  const featured = events.slice(0, DESTACADOS_VISIBLE_SLOTS);
  let bestIndex = 0;
  let bestScore = -1;

  featured.forEach((event, index) => {
    const card = getSpotlightCardModel(event, MADRID_TZ);
    const score = lcpCardScore(card);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

/** Posters visibles en la primera página de destacados (candidatos LCP en home). */
export function resolveHomeLcpPreloadEntries(
  events: EventRow[],
  todayKey?: string
): SpotlightPreloadEntry[] {
  const today =
    todayKey ?? buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";

  if (isUfcWeekEditorialWindow(today)) {
    const ctx = resolveUfcWeekContext(events, today);
    if (ctx) {
      const entries: SpotlightPreloadEntry[] = [];
      for (const src of [UFC_CASABLANCA_FIGHTER_IMAGES.topuria]) {
        if (src.startsWith("/")) entries.push({ href: src });
      }
      if (entries.length > 0) return entries;
    }
  }

  const { weekFeatured } = buildWeekDestacadosPresentation(
    events,
    today,
    FEED_DAY_COUNT
  );
  const featured = weekFeatured.slice(0, DESTACADOS_VISIBLE_SLOTS);

  const lcpIndex = resolveLcpPriorityIndex(featured);
  const event = featured[lcpIndex];
  if (!event) return [];

  const entry = resolveCoverPreloadEntry(event);
  return entry ? [entry] : [];
}
