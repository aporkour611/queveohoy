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

function resolveCoverPreloadEntry(event: EventRow): SpotlightPreloadEntry | null {
  const cover = getSpotlightCardModel(event, MADRID_TZ).coverImage;
  if (!cover?.url) return null;

  const lcpUrl = buildLcpPosterUrl(cover.url);
  if (lcpUrl?.includes("image.tmdb.org")) {
    return { href: lcpUrl };
  }

  return buildSpotlightPreloadEntry(cover.url);
}

/** Índice de la tarjeta visible más probable como LCP (un solo eager+high). */
export function resolveLcpPriorityIndex(events: EventRow[]): number {
  const featured = events.slice(0, DESTACADOS_VISIBLE_SLOTS);
  let bestIndex = 0;
  let bestScore = -1;

  featured.forEach((event, index) => {
    const cover = getSpotlightCardModel(event, MADRID_TZ).coverImage;
    if (!cover?.url) return;

    const score = isTmdbPosterUrl(cover.url) ? 3 : cover.local ? 2 : 1;
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