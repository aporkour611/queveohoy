import { isCronAuthorized } from "@/app/lib/admin-auth";
import { collectIndexNowUrls, pingIndexNow } from "@/app/lib/indexnow";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Dispara IndexNow tras deploy o a mano: Authorization: Bearer CRON_SECRET */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await collectIndexNowUrls();
  const result = await pingIndexNow(urls);

  return NextResponse.json({
    ok: result.ok,
    skipped: result.skipped ?? false,
    status: result.status,
    urlCount: urls.length,
    error: result.error,
  });
}
