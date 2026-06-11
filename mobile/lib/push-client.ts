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

export async function isMobilePushEnabledLocally(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PUSH_ENABLED_KEY)
  return value === "1"
}

export async function setMobilePushEnabledLocally(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(PUSH_ENABLED_KEY, enabled ? "1" : "0")
}

export async function registerForPushNotifications(): Promise<{
  token: string | null
  error: string | null
}> {
  if (!Device.isDevice) {
    return { token: null, error: "Las notificaciones requieren un dispositivo físico." }
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

  const res = await fetch(`${API_BASE}/api/push/subscribe`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      platform: "expo",
      expoPushToken: options.expoPushToken,
      favoritesOnly: options.favoritesOnly ?? false,
      topics: ["futbol", "ufc", "series", "motor"],
    }),
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string }
    return body.error ?? `HTTP ${res.status}`
  }

  await setMobilePushEnabledLocally(true)
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

  await setMobilePushEnabledLocally(false)
}
