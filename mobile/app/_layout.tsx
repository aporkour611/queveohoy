import { useEffect } from "react"
import * as Linking from "expo-linking"
import * as Notifications from "expo-notifications"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider, useTheme } from "@/lib/theme-context"
import "@/widgets/register-widgets"
import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SITE_URL } from "@/lib/api"

function usePushDeepLinks() {
  useEffect(() => {
    const openFromNotification = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as {
        url?: string
      }
      const url = typeof data?.url === "string" ? data.url : null
      if (!url) return
      if (url.startsWith("http://") || url.startsWith("https://")) {
        void Linking.openURL(url)
        return
      }
      void Linking.openURL(`${SITE_URL}${url.startsWith("/") ? url : `/${url}`}`)
    }

    const sub = Notifications.addNotificationResponseReceivedListener(
      openFromNotification
    )

    void Notifications.getLastNotificationResponseAsync().then((last) => {
      if (last) openFromNotification(last)
    })

    return () => sub.remove()
  }, [])
}

function ThemedStack() {
  const { colors, resolved } = useTheme()
  usePushDeepLinks()

  return (
    <>
      <StatusBar style={resolved === "light" ? "dark" : "light"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/callback"
          options={{ title: "Iniciando sesión", headerShown: false }}
        />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedStack />
      </AuthProvider>
    </ThemeProvider>
  )
}
