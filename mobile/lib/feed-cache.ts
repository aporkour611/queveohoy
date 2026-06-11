import AsyncStorage from "@react-native-async-storage/async-storage"
import type { FeedResponse } from "./api"

const CACHE_KEY = "qvh:feed:today:v1"
const CACHE_TTL_MS = 15 * 60 * 1000

type CachedFeed = {
  savedAt: number
  feed: FeedResponse
}

export async function readCachedTodayFeed(): Promise<FeedResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedFeed
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null
    return parsed.feed
  } catch {
    return null
  }
}

export async function writeCachedTodayFeed(feed: FeedResponse): Promise<void> {
  try {
    const payload: CachedFeed = { savedAt: Date.now(), feed }
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* best-effort */
  }
}

export async function clearCachedTodayFeed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY)
  } catch {
    /* best-effort */
  }
}
