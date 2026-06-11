import AsyncStorage from "@react-native-async-storage/async-storage"
import type { FeedEvent, FeedResponse } from "./api"

const TODAY_CACHE_KEY = "qvh:feed:today:v1"
const WEEK_CACHE_KEY = "qvh:feed:week:v1"
const CACHE_TTL_MS = 15 * 60 * 1000

type CachedFeed = {
  savedAt: number
  feed: FeedResponse
}

export type WeekDayCache = {
  date: string
  events: FeedEvent[]
}

type CachedWeek = {
  savedAt: number
  days: WeekDayCache[]
}

function isFresh(savedAt: number): boolean {
  return Date.now() - savedAt <= CACHE_TTL_MS
}

export async function readCachedTodayFeed(): Promise<FeedResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(TODAY_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedFeed
    if (!isFresh(parsed.savedAt)) return null
    return parsed.feed
  } catch {
    return null
  }
}

export async function writeCachedTodayFeed(feed: FeedResponse): Promise<void> {
  try {
    const payload: CachedFeed = { savedAt: Date.now(), feed }
    await AsyncStorage.setItem(TODAY_CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* best-effort */
  }
}

export async function readCachedWeekFeed(): Promise<WeekDayCache[] | null> {
  try {
    const raw = await AsyncStorage.getItem(WEEK_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedWeek
    if (!isFresh(parsed.savedAt)) return null
    return parsed.days
  } catch {
    return null
  }
}

const TOMORROW_CACHE_KEY = "qvh:feed:tomorrow:v1"

export async function prefetchTomorrowFeed(
  todayDate: string,
  fetcher: (date: string) => Promise<FeedResponse>
): Promise<void> {
  try {
    const tomorrow = addDaysKey(todayDate, 1)
    const feed = await fetcher(tomorrow)
    const payload: CachedFeed = { savedAt: Date.now(), feed }
    await AsyncStorage.setItem(TOMORROW_CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* best-effort */
  }
}

function addDaysKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

export async function writeCachedWeekFeed(days: WeekDayCache[]): Promise<void> {
  try {
    const payload: CachedWeek = { savedAt: Date.now(), days }
    await AsyncStorage.setItem(WEEK_CACHE_KEY, JSON.stringify(payload))
  } catch {
    /* best-effort */
  }
}
