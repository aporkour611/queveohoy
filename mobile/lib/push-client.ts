import AsyncStorage from "@react-native-async-storage/async-storage"
import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { Platform } from "react-native"
import { API_BASE } from "./api"
import { buildExpoPushEndpoint } from "./expo-push-endpoint"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const PUSH_ENABLED_KEY = "qvh:mobile:push-enabled"
const PUSH_TOKEN_KEY = "qvh:mobile:push-token"
const PUSH_FAVORITES_ONLY_KEY = "qvh:mobile:push-favorites-only"

export async function isMobilePushEnabledLocally(): Promise<boolean> {
  return (await AsyncStorage.getItem(PUSH_ENABLED_KEY)) === "1"
}

export async function isMobilePushFavoritesOnlyLocally(): Promise<boolean> {
  return (await AsyncStorage.getItem(PUSH_FAVORITES_ONLY_KEY)) === "1"
}

export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY)
}

async function persistPushState(options: {
  enabled: boolean
  token?: string | null
  favoritesOnly?: boolean
}): Promise<void> {
  await AsyncStorage.setItem(PUSH_ENABLED_KEY, options.enabled ? "1" : "0")
  if (options.token !== undefined) {
    if (options.token) await AsyncStorage.setItem(PUSH_TOKEN_KEY, options.token)
    else await AsyncStorage.removeItem(PUSH_TOKEN_KEY)
  }
  if (options.favoritesOnly !== undefined) {
    await AsyncStorage.setItem(
      PUSH_FAVORITES_ONLY_KEY,
      options.favoritesOnly ? "1" : "0"
    )
  }
}

export async function registerForPushNotifications(): Promise<{
  token: string | null
  error: string | null
}> {
  if (!Device.isDevice) {
    return {
      token: null,
      error: "Las notificaciones requieren un dispositivo físico.",
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Eventos",
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    return { token: null, error: "Permiso de notificaciones denegado." }
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId

  const tokenResult = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  )

  return { token: tokenResult.data, error: null }
}

export async function syncPushTokenWithServer(options: {
  expoPushToken: string
  accessToken?: string | null
  favoritesOnly?: boolean
  topics?: string[]
}): Promise<string | null> {
  const endpoint = buildExpoPushEndpoint(options.expoPushToken)
  if (!endpoint) return "Token Expo inválido"

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`
  }

  const favoritesOnly = options.favoritesOnly ?? false
  const topics = options.topics ?? ["futbol", "ufc", "series", "motor"]

  const res = await fetch(`${API_BASE}/api/push/subscribe`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      platform: "expo",
      expoPushToken: options.expoPushToken,
      favoritesOnly,
      topics,
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return body.error ?? `HTTP ${res.status}`
  }

  await persistPushState({
    enabled: true,
    token: options.expoPushToken,
    favoritesOnly,
  })
  return null
}

export async function unregisterPushFromServer(
  expoPushToken: string,
  accessToken?: string | null
): Promise<void> {
  const endpoint = buildExpoPushEndpoint(expoPushToken)
  if (!endpoint) return

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  await fetch(`${API_BASE}/api/push/subscribe`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined)

  await persistPushState({ enabled: false, token: null })
}

export async function refreshPushPreferencesOnServer(options: {
  accessToken?: string | null
  favoritesOnly: boolean
}): Promise<string | null> {
  const token = await getStoredPushToken()
  if (!token) return null
  if (!(await isMobilePushEnabledLocally())) return null

  return syncPushTokenWithServer({
    expoPushToken: token,
    accessToken: options.accessToken,
    favoritesOnly: options.favoritesOnly,
  })
}

export type RemotePushPreferences = {
  hasSubscription: boolean
  favoritesOnly: boolean
  topics: string[]
  platforms?: Array<"web" | "expo">
}

export async function fetchRemotePushPreferences(
  accessToken?: string | null
): Promise<RemotePushPreferences | null> {
  const headers: Record<string, string> = { Accept: "application/json" }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE}/api/push/subscribe`, { headers })
  if (res.status === 401) return null
  if (!res.ok) return null
  return (await res.json()) as RemotePushPreferences
}

export async function syncPushPreferencesFromServer(options: {
  accessToken?: string | null
}): Promise<void> {
  const remote = await fetchRemotePushPreferences(options.accessToken)
  if (!remote?.hasSubscription) return

  await persistPushState({
    enabled: await isMobilePushEnabledLocally(),
    favoritesOnly: remote.favoritesOnly,
  })

  if (remote.topics?.length && (await isMobilePushEnabledLocally())) {
    const token = await getStoredPushToken()
    if (token) {
      await syncPushTokenWithServer({
        expoPushToken: token,
        accessToken: options.accessToken,
        favoritesOnly: remote.favoritesOnly,
        topics: remote.topics,
      })
      return
    }
  }

  const token = await getStoredPushToken()
  if (token && (await isMobilePushEnabledLocally())) {
    await syncPushTokenWithServer({
      expoPushToken: token,
      accessToken: options.accessToken,
      favoritesOnly: remote.favoritesOnly,
    })
  }
}
