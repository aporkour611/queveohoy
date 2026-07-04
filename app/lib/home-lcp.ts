import type { EventRow } from "../components/types";
import { DESTACADOS_VISIBLE_SLOTS, pickWeekDestacados } from "./destacados-config";
import { getSpotlightCardModel } from "./featured-card";
import { resolveLcpLocalRasterUrl } from "./lcp-local-poster";
import { buildLcpPosterUrl, isTmdbPosterUrl } from "./lcp-poster";
import { buildDisplayDays, MADRID_TZ } from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  isUfcWeekEditorialWindow,
  resolveUfcWeekContext,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "./ufc-week";
import {
  buildSpotlightPreloadEntry,
  type SpotlightPreloadEntry,
} from "./optimized-image";
import type { SpotlightCover } from "./spotlight-art";

function lcpCoverScore(
  cover: SpotlightCover | undefined,
  card: ReturnType<typeof getSpotlightCardModel>
): number {
  if (!cover?.url) return -1;

  const isSmallDuelIcon =
    card.showTeamDuel &&
    cover.local &&
    /\/esports\/|\/crests\/|_logo\./i.test(cover.url);

  if (isSmallDuelIcon) return 2;

  if (card.showTeamDuel && !cover.local && !isTmdbPosterUrl(cover.url)) {
    return 3
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

/** Preload alineado con el <img> LCP (local mismo origen > TMDB directo > next/image). */
export function resolveLcpPreloadEntryFromCover(
  cover: SpotlightCover
): SpotlightPreloadEntry | null {
  if (!cover.url) return null;

  if (cover.local && cover.url.startsWith("/")) {
    return { href: resolveLcpLocalRasterUrl(cover.url) };
  }

  const lcpUrl = buildLcpPosterUrl(cover.url);
  if (lcpUrl?.includes("image.tmdb.org")) {
    return { href: lcpUrl };
  }

  return buildSpotlightPreloadEntry(cover.url);
}

function resolveCoverPreloadEntry(event: EventRow): SpotlightPreloadEntry | null {
  const cover = getSpotlightCardModel(event, MADRID_TZ).coverImage;
  if (!cover) return null;
  return resolveLcpPreloadEntryFromCover(cover);
}

/** Índice de la tarjeta visible más probable como LCP (un solo eager+high). */
export function resolveLcpPriorityIndex(events: EventRow[]): number {
  const featured = events.slice(0, DESTACADOS_VISIBLE_SLOTS);
  let bestIndex = 0;
  let bestScore = -1;

  featured.forEach((event, index) => {
    const card = getSpotlightCardModel(event, MADRID_TZ);
    const score = lcpCoverScore(card.coverImage, card);
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

  const featured = pickWeekDestacados(events, { todayKey: today }).slice(
    0,
    DESTACADOS_VISIBLE_SLOTS
  );

  const lcpIndex = resolveLcpPriorityIndex(featured);
  const event = featured[lcpIndex];
  if (!event) return [];

  const entry = resolveCoverPreloadEntry(event);
  return entry ? [entry] : [];
}
