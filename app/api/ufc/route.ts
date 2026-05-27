import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/app/lib/admin-auth";
import { isDebugRouteDisabled } from "@/app/lib/debug-routes";
import { fetchUfcCronEvents } from "@/app/lib/thesportsdb-ufc";

export async function GET(request: Request) {
  if (isDebugRouteDisabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await fetchUfcCronEvents();
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return NextResponse.json(
      { ok: false, events: [], error: String(error) },
      { status: 500 }
    );
  }
}
