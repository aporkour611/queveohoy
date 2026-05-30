import type { EventRow } from "../components/types";
import { DESTACADOS_VISIBLE_SLOTS, pickWeekDestacados } from "./destacados-config";
import { getSpotlightCardModel } from "./featured-card";
import { buildLcpPosterUrl, isTmdbPosterUrl } from "./lcp-poster";
import { buildDisplayDays, MADRID_TZ } from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  buildSpotlightPreloadEntry,
  type SpotlightPreloadEntry,
} from "./optimized-image";
import type { SpotlightCover } from "./spotlight-art";

function lcpCoverScore(cover: SpotlightCover | undefined): number {
  if (!cover?.url) return -1;

  if (cover.local) {
    const isRaster = /\.(png|jpe?g|webp|avif)$/i.test(cover.url);
    return isRaster ? 10 : 4;
  }

  if (isTmdbPosterUrl(cover.url)) return 3;
  return 1;
}

/** Preload alineado con el <img> LCP (local mismo origen > TMDB directo > next/image). */
export function resolveLcpPreloadEntryFromCover(
  cover: SpotlightCover
): SpotlightPreloadEntry | null {
  if (!cover.url) return null;

  if (cover.local && cover.url.startsWith("/")) {
    return { href: cover.url };
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
    const cover = getSpotlightCardModel(event, MADRID_TZ).coverImage;
    const score = lcpCoverScore(cover);
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
