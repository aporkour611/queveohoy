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
import { fetchWeekFeed, formatDayTitle } from "@/lib/api"
import { formatMobileNetworkError } from "@/lib/ensure-https"

export default function SemanaScreen() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState<
    { date: string; events: import("@/lib/api").FeedEvent[] }[]
  >([])

  const load = useCallback(async () => {
    try {
      const result = await fetchWeekFeed(7)
      setDays(result.days)
      setError(result.error)
    } catch (err) {
      setError(
        formatMobileNetworkError(
          err instanceof Error ? err.message : "Error de red"
        )
      )
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
            {day.events.map((event) => (
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
