import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { EventCard } from "@/components/EventCard"
import { useAuth } from "@/lib/auth-context"
import type { FeedEvent } from "@/lib/api"
import { loadFavoriteEvents } from "@/lib/favorites"
import {
  fetchRemoteWidgetSnapshot,
  updateWidgetSnapshotFromEvents,
} from "@/lib/widget-snapshot"
import { getSupabaseClient } from "@/lib/supabase"
import { Link } from "expo-router"
import { useTheme } from "@/lib/theme-context"

export default function FavoritosScreen() {
  const { user, loading: authLoading, session } = useAuth()
  const { colors } = useTheme()
  const [events, setEvents] = useState<FeedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase || !user) {
      setEvents([])
      setLoading(false)
      return
    }

    const result = await loadFavoriteEvents(supabase)
    setEvents(result.events)
    setError(result.error)
    if (session?.access_token) {
      await fetchRemoteWidgetSnapshot(session.access_token)
    } else {
      await updateWidgetSnapshotFromEvents(result.events)
    }
    setLoading(false)
  }, [user, session?.access_token])

  useEffect(() => {
    if (!authLoading) void load()
  }, [authLoading, load])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  if (authLoading || loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.lead, { color: colors.text }]}>
          Inicia sesión para ver tus favoritos.
        </Text>
        <Link href="/(tabs)/cuenta" style={[styles.link, { color: colors.accent }]}>
          Ir a Cuenta
        </Link>
      </View>
    )
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={[styles.list, { backgroundColor: colors.bg }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        error ? (
          <Text style={[styles.error, { color: colors.error }]} accessibilityRole="alert">
            {error}
          </Text>
        ) : null
      }
      renderItem={({ item }) => <EventCard event={item} showShare />}
      ListEmptyComponent={
        <Text style={[styles.muted, { color: colors.textSubtle }]}>
          Aún no tienes favoritos. Márcalos con ♥ en la pestaña Hoy.
        </Text>
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
  },
  list: {
    padding: 16,
  },
  lead: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  link: {
    fontWeight: "700",
    fontSize: 16,
  },
  muted: {},
  error: {
    marginBottom: 12,
  },
})
