import { NextResponse } from "next/server";
import {
  fetchJustWatchAvailability,
  getJustWatchPartnerToken,
  parseJustWatchMediaRef,
} from "@/app/lib/justwatch";

export async function GET(request: Request) {
  if (!getJustWatchPartnerToken()) {
    return NextResponse.json(
      {
        error: "missing_token",
        message:
          "Configura JUSTWATCH_PARTNER_TOKEN (o JUSTWATCH_API_KEY) en Vercel y .env.local",
      },
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
    return NextResponse.json(
      {
        error: "justwatch_unavailable",
        message: "JustWatch no respondió para este título con TMDB id " + ref.tmdbId,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
