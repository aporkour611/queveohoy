import { revalidatePath, revalidateTag } from "next/cache";
import { fetchFeedEvents, fetchHomeFeedEvents } from "./events-feed-server";

/** Tras el cron: invalida cache y precarga el feed para que la home no espere a Supabase. */
export async function warmFeedCacheAfterCron(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    revalidateTag("feed", { expire: 0 });
    await Promise.all([fetchHomeFeedEvents(), fetchFeedEvents()]);
    revalidatePath("/");
    revalidatePath("/api/events");
    revalidatePath("/api/events/home");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("warmFeedCacheAfterCron:", message);
    return { ok: false, error: message };
  }
}
