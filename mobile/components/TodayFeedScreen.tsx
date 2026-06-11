import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { EventCard } from "@/components/EventCard"
import {
  fetchTodayFeed,
  SITE_URL,
  type FeedEvent,
} from "@/lib/api"
import { readCachedTodayFeed, writeCachedTodayFeed } from "@/lib/feed-cache"
import { formatMobileNetworkError } from "@/lib/ensure-https"
import { getSupabaseClient } from "@/lib/supabase"
import { isEventFavorited, toggleFavorite } from "@/lib/favorites"
import { useAuth } from "@/lib/auth-context"

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; events: FeedEvent[]; date: string }
  | { kind: "error"; message: string }

export function TodayFeedScreen() {
  const { user } = useAuth()
  const [state, setState] = useState<LoadState>({ kind: "loading" })
  const [refreshing, setRefreshing] = useState(false)
  const [stale, setStale] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [busyId, setBusyId] = useState<number | null>(null)

  const syncFavorites = useCallback(
    async (events: FeedEvent[]) => {
      const supabase = getSupabaseClient()
      if (!supabase || !user) {
        setFavoriteIds(new Set())
        return
      }

      const ids = new Set<number>()
      await Promise.all(
        events.map(async (event) => {
          if (await isEventFavorited(supabase, event.id)) {
            ids.add(event.id)
          }
        })
      )
      setFavoriteIds(ids)
    },
    [user]
  )

  const load = useCallback(async () => {
    const cached = await readCachedTodayFeed()
    if (cached && cached.events.length > 0) {
      setState({
        kind: "ready",
        events: cached.events,
        date: cached.date,
      })
      setStale(false)
      await syncFavorites(cached.events)
    }

    try {
      const feed = await fetchTodayFeed()
      if (feed.error) {
        if (!cached) {
          setState({ kind: "error", message: feed.error })
        }
        return
      }
      setState({
        kind: "ready",
        events: feed.events,
        date: feed.date,
      })
      setStale(false)
      await writeCachedTodayFeed(feed)
      await syncFavorites(feed.events)
    } catch (err) {
      if (cached) {
        setStale(true)
        return
      }
      const raw = err instanceof Error ? err.message : "Error de red"
      setState({
        kind: "error",
        message: formatMobileNetworkError(raw),
      })
    }
  }, [syncFavorites])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const handleToggleFavorite = useCallback(
    async (eventId: number) => {
      const supabase = getSupabaseClient()
      if (!supabase || !user) return

      setBusyId(eventId)
      const favorited = favoriteIds.has(eventId)
      const error = await toggleFavorite(supabase, user.id, eventId, favorited)
      if (!error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (favorited) next.delete(eventId)
          else next.add(eventId)
          return next
        })
      }
      setBusyId(null)
    },
    [favoriteIds, user]
  )

  if (state.kind === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a3e635" />
        <Text style={styles.muted}>Cargando agenda…</Text>
      </View>
    )
  }

  if (state.kind === "error") {
    return (
      <View style={styles.center}>
        <Text style={styles.error} accessibilityRole="alert">
          {state.message}
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() => void Linking.openURL(SITE_URL)}
          accessibilityRole="link"
        >
          <Text style={styles.linkText}>Abrir queveohoy.es</Text>
        </Pressable>
        <Pressable style={styles.retryBtn} onPress={() => void load()}>
          <Text style={styles.retryText}>Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <FlatList
      data={state.events}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        <>
          {stale ? (
            <Text style={styles.stale}>Agenda guardada (sin conexión)</Text>
          ) : null}
          <Text style={styles.dateHeader}>Hoy · {state.date}</Text>
        </>
      }
      renderItem={({ item }) => (
        <EventCard
          event={item}
          showFavorite={Boolean(user)}
          favorited={favoriteIds.has(item.id)}
          favoriteBusy={busyId === item.id}
          onToggleFavorite={() => void handleToggleFavorite(item.id)}
        />
      )}
      ListEmptyComponent={
        <Text style={styles.muted}>Sin eventos para hoy.</Text>
      }
    />
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0a0a0a",
  },
  list: {
    padding: 16,
  },
  dateHeader: {
    color: "#a3e635",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  stale: {
    color: "#fbbf24",
    fontSize: 13,
    marginBottom: 6,
  },
  muted: {
    color: "#737373",
    marginTop: 12,
  },
  error: {
    color: "#fca5a5",
    textAlign: "center",
    marginBottom: 16,
  },
  linkBtn: {
    marginBottom: 12,
  },
  linkText: {
    color: "#a3e635",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  retryBtn: {
    backgroundColor: "#a3e635",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  retryText: {
    color: "#0a0a0a",
    fontWeight: "700",
  },
})
