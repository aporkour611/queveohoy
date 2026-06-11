import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { fetchTodayFeed, formatEventMeta, type FeedEvent } from "@/lib/api"

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; events: FeedEvent[]; date: string }
  | { kind: "error"; message: string }

export default function HomeScreen() {
  const [state, setState] = useState<LoadState>({ kind: "loading" })
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const feed = await fetchTodayFeed()
      if (feed.error) {
        setState({ kind: "error", message: feed.error })
        return
      }
      setState({
        kind: "ready",
        events: feed.events,
        date: feed.date,
      })
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Error de red",
      })
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
          style={styles.retryBtn}
          onPress={() => {
            setState({ kind: "loading" })
            void load()
          }}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga de agenda"
        >
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
        <Text style={styles.dateHeader}>Agenda · {state.date}</Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card} accessibilityRole="text">
          <Text style={styles.title}>{item.title}</Text>
          {formatEventMeta(item) ? (
            <Text style={styles.meta}>{formatEventMeta(item)}</Text>
          ) : null}
        </View>
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
    gap: 12,
  },
  dateHeader: {
    color: "#a3e635",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "#171717",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#262626",
  },
  title: {
    color: "#fafafa",
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    color: "#a3a3a3",
    fontSize: 13,
    marginTop: 4,
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
