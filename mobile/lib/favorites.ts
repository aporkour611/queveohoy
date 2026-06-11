import type { SupabaseClient } from "@supabase/supabase-js"
import type { FeedEvent } from "./api"

export type FavoriteRow = {
  event_id: number
  created_at: string
  events: FeedEvent | FeedEvent[] | null
}

export async function loadFavoriteEvents(
  supabase: SupabaseClient
): Promise<{ events: FeedEvent[]; error: string | null }> {
  const { data, error } = await supabase
    .from("favorites")
    .select("event_id, created_at, events(*)")
    .order("created_at", { ascending: false })

  if (error) return { events: [], error: error.message }

  const events: FeedEvent[] = []
  for (const row of (data ?? []) as FavoriteRow[]) {
    const event = Array.isArray(row.events) ? row.events[0] : row.events
    if (event) events.push(event)
  }

  return { events, error: null }
}

export async function isEventFavorited(
  supabase: SupabaseClient,
  eventId: number
): Promise<boolean> {
  const { data } = await supabase
    .from("favorites")
    .select("event_id")
    .eq("event_id", eventId)
    .maybeSingle()

  return Boolean(data)
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  eventId: number,
  favorited: boolean
): Promise<string | null> {
  if (favorited) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("event_id", eventId)
    return error?.message ?? null
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: userId,
    event_id: eventId,
  })
  return error?.message ?? null
}
