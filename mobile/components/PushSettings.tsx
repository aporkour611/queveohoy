import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native"
import { useAuth } from "@/lib/auth-context"
import {
  getStoredPushToken,
  isMobilePushEnabledLocally,
  isMobilePushFavoritesOnlyLocally,
  refreshPushPreferencesOnServer,
  registerForPushNotifications,
  syncPushTokenWithServer,
  unregisterPushFromServer,
} from "@/lib/push-client"

export function PushSettings() {
  const { user, session } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    void Promise.all([
      isMobilePushEnabledLocally(),
      isMobilePushFavoritesOnlyLocally(),
      getStoredPushToken(),
    ]).then(([pushEnabled, favOnly, storedToken]) => {
      setEnabled(pushEnabled)
      setFavoritesOnly(favOnly)
      setToken(storedToken)
    })
  }, [])

  const handlePushToggle = useCallback(
    async (next: boolean) => {
      setBusy(true)
      setError(null)

      if (!next) {
        const activeToken = token ?? (await getStoredPushToken())
        if (activeToken) {
          await unregisterPushFromServer(activeToken, session?.access_token)
        }
        setEnabled(false)
        setToken(null)
        setBusy(false)
        return
      }

      const { token: expoToken, error: permError } =
        await registerForPushNotifications()

      if (permError || !expoToken) {
        setError(permError ?? "No se pudo obtener token push.")
        setBusy(false)
        return
      }

      setToken(expoToken)
      const syncError = await syncPushTokenWithServer({
        expoPushToken: expoToken,
        accessToken: session?.access_token,
        favoritesOnly,
      })

      if (syncError) {
        setError(syncError)
        setBusy(false)
        return
      }

      setEnabled(true)
      setBusy(false)
    },
    [favoritesOnly, session?.access_token, token]
  )

  const handleFavoritesToggle = useCallback(
    async (next: boolean) => {
      setFavoritesOnly(next)
      if (!enabled) return

      setBusy(true)
      setError(null)
      const syncError = await refreshPushPreferencesOnServer({
        accessToken: session?.access_token,
        favoritesOnly: next,
      })
      if (syncError) setError(syncError)
      setBusy(false)
    },
    [enabled, session?.access_token]
  )

  if (!user) return null

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Avisos de eventos</Text>
      <Text style={styles.lead}>
        Te avisamos ~45 min antes de partidos y estrenos (máx. 2/día).
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Activar push</Text>
        {busy ? (
          <ActivityIndicator color="#a3e635" />
        ) : (
          <Switch
            value={enabled}
            onValueChange={(value) => void handlePushToggle(value)}
            trackColor={{ false: "#404040", true: "#365314" }}
            thumbColor={enabled ? "#a3e635" : "#737373"}
            accessibilityLabel="Activar notificaciones push"
          />
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.labelBlock}>
          <Text style={styles.label}>Solo mis favoritos</Text>
          <Text style={styles.sublabel}>
            Solo eventos que marques con ♥ en Hoy
          </Text>
        </View>
        <Switch
          value={favoritesOnly}
          onValueChange={(value) => void handleFavoritesToggle(value)}
          disabled={busy || !enabled}
          trackColor={{ false: "#404040", true: "#365314" }}
          thumbColor={favoritesOnly ? "#a3e635" : "#737373"}
          accessibilityLabel="Solo avisos de favoritos"
        />
      </View>

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      <Text style={styles.hint}>
        Requiere build nativo (EAS); no funciona en simulador.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#262626",
    backgroundColor: "#171717",
  },
  title: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  lead: {
    color: "#a3a3a3",
    fontSize: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  labelBlock: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    color: "#fafafa",
    fontSize: 15,
  },
  sublabel: {
    color: "#737373",
    fontSize: 12,
    marginTop: 2,
  },
  error: {
    color: "#fca5a5",
    marginTop: 4,
  },
  hint: {
    color: "#525252",
    fontSize: 12,
    marginTop: 4,
  },
})
