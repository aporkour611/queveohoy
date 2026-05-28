import { isCronAuthorized } from "@/app/lib/admin-auth";
import { pingIndexNow } from "@/app/lib/indexnow";
import { warmFeedCacheAfterCron } from "@/app/lib/revalidate-feed";
import { siteUrl } from "@/app/lib/seo";
import { NextResponse } from "next/server";

/** Precalienta cache + avisa a buscadores (IndexNow). Protegido por CRON_SECRET. */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [feedCache, indexNow] = await Promise.all([
    warmFeedCacheAfterCron(),
    pingIndexNow(),
  ]);

  return NextResponse.json({
    ok: feedCache.ok && (indexNow.ok || indexNow.skipped),
    sitemap: `${siteUrl}/sitemap.xml`,
    feedCache,
    indexNow,
    searchConsole: {
      property: siteUrl,
      sitemapUrl: `${siteUrl}/sitemap.xml`,
      note: "Envía el sitemap en Google Search Console si aún no está registrado.",
    },
  });
}
