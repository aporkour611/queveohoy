import { revalidatePath, revalidateTag } from "next/cache";
import {
  fetchDestacadosFeedEvents,
  fetchFeedEvents,
  fetchHomeFeedEvents,
  fetchWeekViewFeedEvents,
} from "./events-feed-server";

/** Tras el cron: precarga el feed y luego invalida HTML (evita ventana sin caché). */
export async function warmFeedCacheAfterCron(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    await Promise.all([
      fetchHomeFeedEvents(),
      fetchWeekViewFeedEvents(),
      fetchFeedEvents(),
      fetchDestacadosFeedEvents(),
    ]);
    revalidateTag("feed", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/events");
    revalidatePath("/api/home-feed");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("warmFeedCacheAfterCron:", message);
    return { ok: false, error: message };
  }
}
