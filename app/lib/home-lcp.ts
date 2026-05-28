import type { EventRow } from "../components/types";
import { DESTACADOS_VISIBLE_SLOTS, pickWeekDestacados } from "./destacados-config";
import { getSpotlightCardModel } from "./featured-card";
import { buildDisplayDays, MADRID_TZ } from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  buildSpotlightPreloadEntry,
  type SpotlightPreloadEntry,
} from "./optimized-image";

function resolveCoverPreloadEntry(event: EventRow): SpotlightPreloadEntry | null {
  const cover = getSpotlightCardModel(event, MADRID_TZ).coverImage;
  if (!cover?.url) return null;
  return buildSpotlightPreloadEntry(cover.url);
}

/** Posters visibles en la primera página de destacados (candidatos LCP en home). */
export function resolveHomeLcpPreloadEntries(events: EventRow[]): SpotlightPreloadEntry[] {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const featured = pickWeekDestacados(events, { todayKey }).slice(
    0,
    DESTACADOS_VISIBLE_SLOTS
  );

  const entries: SpotlightPreloadEntry[] = [];
  const seen = new Set<string>();

  for (const event of featured) {
    const entry = resolveCoverPreloadEntry(event);
    if (!entry || seen.has(entry.href)) continue;
    seen.add(entry.href);
    entries.push(entry);
  }

  return entries;
}
