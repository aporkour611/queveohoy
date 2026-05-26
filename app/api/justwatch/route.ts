import { NextResponse } from "next/server";
import {
  fetchJustWatchAvailability,
  getJustWatchPartnerToken,
  parseJustWatchMediaRef,
} from "@/app/lib/justwatch";

export async function GET(request: Request) {
  if (!getJustWatchPartnerToken()) {
    return NextResponse.json(
      { error: "JUSTWATCH_PARTNER_TOKEN missing" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport");
  const externalId = searchParams.get("externalId");

  const ref = parseJustWatchMediaRef(sport, externalId);
  if (!ref) {
    return NextResponse.json({ error: "Invalid media reference" }, { status: 400 });
  }

  const data = await fetchJustWatchAvailability(ref);
  if (!data) {
    return NextResponse.json({ error: "JustWatch unavailable" }, { status: 502 });
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
