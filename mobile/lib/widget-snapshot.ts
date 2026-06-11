import AsyncStorage from "@react-native-async-storage/async-storage"
import type { FeedEvent } from "./api"
import { API_BASE } from "./api"

export const WIDGET_SNAPSHOT_KEY = "qvh:widget:next-favorite"

export type WidgetFavoriteSnapshot = {
  id: number
  title: string
  date: string
  time: string | null
  updatedAt: string
}

function eventStartMs(event: FeedEvent): number | null {
  if (!event.date) return null
  const [y, m, d] = event.date.split("-").map(Number)
  const [hh = 12, mm = 0] = (event.time ?? "12:00").split(":").map(Number)
  return new Date(y, m - 1, d, hh, mm, 0, 0).getTime()
}

export function pickNextFavoriteEvent(
  events: FeedEvent[],
  now = Date.now()
): WidgetFavoriteSnapshot | null {
  let best: { event: FeedEvent; start: number } | null = null

  for (const event of events) {
    const start = eventStartMs(event)
    if (start === null || start < now) continue
    if (!best || start < best.start) {
      best = { event, start }
    }
  }

  if (!best) return null

  return {
    id: best.event.id,
    title: best.event.title,
    date: best.event.date,
    time: best.event.time ?? null,
    updatedAt: new Date().toISOString(),
  }
}

export async function writeWidgetSnapshot(
  snapshot: WidgetFavoriteSnapshot | null
): Promise<void> {
  if (!snapshot) {
    await AsyncStorage.removeItem(WIDGET_SNAPSHOT_KEY)
    return
  }
  await AsyncStorage.setItem(WIDGET_SNAPSHOT_KEY, JSON.stringify(snapshot))
}

export async function readWidgetSnapshot(): Promise<WidgetFavoriteSnapshot | null> {
  const raw = await AsyncStorage.getItem(WIDGET_SNAPSHOT_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as WidgetFavoriteSnapshot
  } catch {
    return null
  }
}

export async function updateWidgetSnapshotFromEvents(
  events: FeedEvent[]
): Promise<WidgetFavoriteSnapshot | null> {
  const snapshot = pickNextFavoriteEvent(events)
  await writeWidgetSnapshot(snapshot)
  return snapshot
}

export async function fetchRemoteWidgetSnapshot(
  accessToken: string
): Promise<WidgetFavoriteSnapshot | null> {
  const res = await fetch(`${API_BASE}/api/v1/widget/next-favorite`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
  if (!res.ok) return null
  const body = (await res.json()) as {
    next?: {
      id: number
      title: string
      date: string
      time: string | null
    } | null
  }
  if (!body.next) {
    await writeWidgetSnapshot(null)
    return null
  }
  const snapshot: WidgetFavoriteSnapshot = {
    id: body.next.id,
    title: body.next.title,
    date: body.next.date,
    time: body.next.time,
    updatedAt: new Date().toISOString(),
  }
  await writeWidgetSnapshot(snapshot)
  return snapshot
}
