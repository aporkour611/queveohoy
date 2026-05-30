import { NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import { getMadridTodayKey } from "@/app/lib/seo-date"
import { MADRID_TZ } from "@/app/lib/timezone"

export const dynamic = "force-dynamic"

export async function GET() {
  const { events, error } = await fetchFeedEvents()
  const todayKey = getMadridTodayKey()
  const todayCount = events.filter((e) => e.date === todayKey).length

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      timezone: MADRID_TZ,
      date: todayKey,
      eventCount: events.length,
      todayCount,
      revalidateSeconds: FEED_REVALIDATE_SECONDS,
      error: error ?? null,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
