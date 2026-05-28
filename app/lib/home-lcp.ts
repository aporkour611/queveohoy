import type { EventRow } from "../components/types";
import { pickWeekDestacados } from "./destacados-config";
import { getSpotlightCardModel } from "./featured-card";
import { buildDisplayDays, MADRID_TZ } from "./timezone";
import { FEED_DAY_COUNT } from "./events-feed";
import { safeRemoteImageUrl } from "./remote-image";

/** URL del primer poster/cover de destacados para preload (LCP en home). */
export function resolveHomeLcpPreloadUrl(events: EventRow[]): string | null {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const featured = pickWeekDestacados(events, { todayKey });
  const first = featured[0];
  if (!first) return null;

  const cover = getSpotlightCardModel(first, MADRID_TZ).coverImage;
  if (!cover?.url || cover.local) return null;

  return safeRemoteImageUrl(cover.url);
}
