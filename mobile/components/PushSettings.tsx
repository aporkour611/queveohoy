import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native"
import { useAuth } from "@/lib/auth-context"
import { useTheme } from "@/lib/theme-context"
import {
  getStoredPushToken,
  isMobilePushEnabledLocally,
  isMobilePushFavoritesOnlyLocally,
  refreshPushPreferencesOnServer,
  registerForPushNotifications,
  syncPushPreferencesFromServer,
  syncPushTokenWithServer,
  unregisterPushFromServer,
} from "@/lib/push-client"

export function PushSettings() {
  const { user, session } = useAuth()
  const { colors } = useTheme()
  const [enabled, setEnabled] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const refreshLocalState = useCallback(async () => {
    const [pushEnabled, favOnly, storedToken] = await Promise.all([
      isMobilePushEnabledLocally(),
      isMobilePushFavoritesOnlyLocally(),
      getStoredPushToken(),
    ])
    setEnabled(pushEnabled)
    setFavoritesOnly(favOnly)
    setToken(storedToken)
  }, [])

  useEffect(() => {
    void refreshLocalState()
  }, [refreshLocalState])

  useEffect(() => {
    if (!user || !session?.access_token) return
    void syncPushPreferencesFromServer({
      accessToken: session.access_token,
    }).then(() => refreshLocalState())
  }, [user, session?.access_token, refreshLocalState])

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        box: {
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.bgElevated,
        },
        title: {
          color: colors.text,
          fontSize: 18,
          fontWeight: "700",
          marginBottom: 6,
        },
        lead: {
          color: colors.textMuted,
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
          color: colors.text,
          fontSize: 15,
        },
        sublabel: {
          color: colors.textSubtle,
          fontSize: 12,
          marginTop: 2,
        },
        error: {
          color: colors.error,
          marginTop: 4,
        },
        hint: {
          color: colors.textSubtle,
          fontSize: 12,
          marginTop: 4,
        },
      }),
    [colors]
  )

  if (!user) return null

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Avisos de eventos</Text>
      <Text style={styles.lead}>
        Sincronizados con la web. Te avisamos ~45 min antes (máx. 2/día).
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Activar push</Text>
        {busy ? (
          <ActivityIndicator color={colors.accent} />
        ) : (
          <Switch
            value={enabled}
            onValueChange={(value) => void handlePushToggle(value)}
            trackColor={{
              false: colors.switchTrackOff,
              true: colors.switchTrackOn,
            }}
            thumbColor={enabled ? colors.switchThumbOn : colors.switchThumbOff}
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
          trackColor={{
            false: colors.switchTrackOff,
            true: colors.switchTrackOn,
          }}
          thumbColor={favoritesOnly ? colors.switchThumbOn : colors.switchThumbOff}
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
