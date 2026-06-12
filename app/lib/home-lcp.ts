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
} from "./ufc-week";
import {
  buildSpotlightPreloadEntry,
  type SpotlightPreloadEntry,
} from "./optimized-image";
import type { SpotlightCover } from "./spotlight-art";
import { safeRemoteImageUrl } from "./remote-image";

function lcpCoverScore(cover: SpotlightCover | undefined): number {
  if (!cover?.url) return -1;

  if (cover.local) {
    const raster = resolveLcpLocalRasterUrl(cover.url);
    const isRaster = /\.(png|jpe?g|webp|avif)$/i.test(raster);
    return isRaster ? (raster.endsWith(".webp") ? 12 : 10) : 4;
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

  if (isUfcWeekEditorialWindow(today)) {
    const ctx = resolveUfcWeekContext(events, today);
    if (ctx) {
      const entries: SpotlightPreloadEntry[] = [];
      for (const src of [ctx.fighter1Image, ctx.fighter2Image]) {
        const href = safeRemoteImageUrl(src);
        if (href) entries.push({ href });
      }
      if (entries.length > 0) return entries.slice(0, 2);
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
