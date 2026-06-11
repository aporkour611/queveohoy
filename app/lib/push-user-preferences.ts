import { isExpoPushEndpoint } from "./expo-push-token"
import {
  DEFAULT_PUSH_TOPICS,
  normalizePushTopics,
  type PushTopicId,
} from "./push-preferences"
import { createSupabaseAdmin } from "./supabase-admin"

export type UserPushPreferences = {
  hasSubscription: boolean
  favoritesOnly: boolean
  topics: PushTopicId[]
  platforms: Array<"web" | "expo">
  updatedAt: string | null
}

type PushSubscriptionPrefRow = {
  endpoint: string
  topics: unknown
  favorites_only?: boolean | null
  updated_at?: string | null
}

export function parseUserPushPreferencesFromRows(
  rows: PushSubscriptionPrefRow[]
): UserPushPreferences {
  if (rows.length === 0) {
    return {
      hasSubscription: false,
      favoritesOnly: false,
      topics: [...DEFAULT_PUSH_TOPICS],
      platforms: [],
      updatedAt: null,
    }
  }

  const platforms = new Set<"web" | "expo">()
  for (const row of rows) {
    platforms.add(isExpoPushEndpoint(row.endpoint) ? "expo" : "web")
  }

  const latest = rows[0]!

  return {
    hasSubscription: true,
    favoritesOnly: Boolean(latest.favorites_only),
    topics: normalizePushTopics(latest.topics),
    platforms: [...platforms],
    updatedAt: latest.updated_at ?? null,
  }
}

export async function getUserPushPreferences(
  userId: string
): Promise<UserPushPreferences> {
  const admin = createSupabaseAdmin()
  const { data, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, topics, favorites_only, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error || !data?.length) {
    return parseUserPushPreferencesFromRows([])
  }

  return parseUserPushPreferencesFromRows(data as PushSubscriptionPrefRow[])
}
