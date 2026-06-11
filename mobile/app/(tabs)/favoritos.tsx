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
import { getSupabaseClient } from "@/lib/supabase"
import { Link } from "expo-router"

export default function FavoritosScreen() {
  const { user, loading: authLoading } = useAuth()
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
    setLoading(false)
  }, [user])

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.lead}>Inicia sesión para ver tus favoritos.</Text>
        <Link href="/(tabs)/cuenta" style={styles.link}>
          Ir a Cuenta
        </Link>
      </View>
    )
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      ListHeaderComponent={
        error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null
      }
      renderItem={({ item }) => <EventCard event={item} />}
      ListEmptyComponent={
        <Text style={styles.muted}>
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
    backgroundColor: "#0a0a0a",
  },
  list: {
    padding: 16,
  },
  lead: {
    color: "#fafafa",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  link: {
    color: "#a3e635",
    fontWeight: "700",
    fontSize: 16,
  },
  muted: {
    color: "#737373",
  },
  error: {
    color: "#fca5a5",
    marginBottom: 12,
  },
})
