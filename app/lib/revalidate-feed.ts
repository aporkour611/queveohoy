import { revalidatePath, revalidateTag } from "next/cache";
import {
  fetchDestacadosFeedEvents,
  fetchFeedEvents,
  fetchHomeFeedEvents,
  fetchWeekViewFeedEvents,
} from "./events-feed-server";
import { PRIORITY_SEO_HUB_PATHS } from "./seo-hub-warm-paths";

export const ROLLOVER_PATHS = [
  "/",
  "/explorar",
  ...PRIORITY_SEO_HUB_PATHS,
  "/embed/esta-noche",
  "/sitemap.xml",
  "/feed.xml",
  "/api/events",
  "/api/home-feed",
  "/api/v1/feed/week",
  "/api/v2/feed",
  "/api/feed-meta",
] as const;

/** Invalida HTML/API del calendario (cambio de día Madrid). */
export async function rolloverDayContent(options?: {
  preload?: boolean;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (options?.preload !== false) {
      await Promise.all([
        fetchHomeFeedEvents(),
        fetchWeekViewFeedEvents(),
        fetchFeedEvents(),
        fetchDestacadosFeedEvents(),
      ]);
    }

    revalidateTag("feed", { expire: 0 });
    revalidateTag("destacados", { expire: 0 });

    for (const path of ROLLOVER_PATHS) {
      revalidatePath(path);
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("rolloverDayContent:", message);
    return { ok: false, error: message };
  }
}

/** Tras el cron: precarga el feed y luego invalida HTML (evita ventana sin caché). */
export async function warmFeedCacheAfterCron(): Promise<{
  ok: boolean;
  error?: string;
}> {
  return rolloverDayContent({ preload: true });
}
