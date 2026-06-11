import { NextResponse } from "next/server"
import { publicApiCorsHeaders } from "@/app/lib/public-api"
import { resolveRequestUser } from "@/app/lib/supabase/request-user"
import { createSupabaseAdmin } from "@/app/lib/supabase-admin"
import { pickNextFavoriteEvent } from "@/app/lib/next-favorite-event"
import type { EventRow } from "@/app/components/types"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: Request) {
  const user = await resolveRequestUser(request)
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: publicApiCorsHeaders() }
    )
  }

  const admin = createSupabaseAdmin()
  const { data, error } = await admin
    .from("favorites")
    .select("event_id, events(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(80)

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron cargar favoritos" },
      { status: 500, headers: publicApiCorsHeaders() }
    )
  }

  const events: EventRow[] = []
  for (const row of data ?? []) {
    const raw = (row as { events?: EventRow | EventRow[] | null }).events
    const event = Array.isArray(raw) ? raw[0] : raw
    if (event) events.push(event)
  }

  const next = pickNextFavoriteEvent(events)

  return NextResponse.json(
    {
      version: "1",
      next,
      count: events.length,
    },
    { headers: publicApiCorsHeaders() }
  )
}
