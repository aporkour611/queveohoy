import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { EventCard } from "@/components/EventCard"
import { fetchWeekFeed, formatDayTitle, type FeedEvent } from "@/lib/api"
import { formatMobileNetworkError } from "@/lib/ensure-https"
import {
  readCachedWeekFeed,
  writeCachedWeekFeed,
  type WeekDayCache,
} from "@/lib/feed-cache"

export default function SemanaScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stale, setStale] = useState(false)
  const [days, setDays] = useState<WeekDayCache[]>([])

  const load = useCallback(async () => {
    const cached = await readCachedWeekFeed()
    if (cached && cached.length > 0) {
      setDays(cached)
      setStale(false)
      setLoading(false)
    }

    try {
      const result = await fetchWeekFeed(7)
      if (result.days.length > 0) {
        setDays(result.days)
        await writeCachedWeekFeed(result.days)
        setStale(false)
      } else if (!cached?.length) {
        setDays([])
      }
      setError(result.error)
    } catch (err) {
      if (!cached?.length) {
        setError(
          formatMobileNetworkError(
            err instanceof Error ? err.message : "Error de red"
          )
        )
      } else {
        setStale(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    )
  }

  return (
    <ScrollView
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {stale ? (
        <Text style={styles.stale}>Mostrando agenda guardada (sin conexión)</Text>
      ) : null}
      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {days.length === 0 ? (
        <Text style={styles.muted}>Sin eventos esta semana.</Text>
      ) : (
        days.map((day) => (
          <View key={day.date} style={styles.dayBlock}>
            <Text style={styles.dayTitle}>{formatDayTitle(day.date)}</Text>
            {day.events.map((event: FeedEvent) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  stale: {
    color: "#fbbf24",
    fontSize: 13,
    marginBottom: 10,
  },
  dayBlock: {
    marginBottom: 20,
  },
  dayTitle: {
    color: "#a3e635",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "capitalize",
  },
  muted: {
    color: "#737373",
  },
  error: {
    color: "#fca5a5",
    marginBottom: 12,
  },
})
