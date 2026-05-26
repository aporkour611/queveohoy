import { NextResponse } from "next/server";
import { fetchFeedEvents } from "@/app/lib/events-feed-server";

export const revalidate = 300;

export async function GET() {
  const { events, error } = await fetchFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  return NextResponse.json(
    { events },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
