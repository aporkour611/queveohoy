import { Share } from "react-native"
import type { FeedEvent } from "./api"
import { API_BASE, formatEventMeta } from "./api"

export async function shareEvent(event: FeedEvent): Promise<void> {
  const meta = formatEventMeta(event)
  const message = meta
    ? `${event.title}\n${meta}\n${API_BASE}`
    : `${event.title}\n${API_BASE}`

  await Share.share({ message, title: event.title })
}
