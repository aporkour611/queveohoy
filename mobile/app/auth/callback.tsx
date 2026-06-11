import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import { useAuth } from "@/lib/auth-context"

export default function AuthCallbackScreen() {
  const router = useRouter()
  const { completeAuthFromUrl } = useAuth()

  useEffect(() => {
    const finish = async (url: string | null) => {
      if (!url) {
        router.replace("/(tabs)/cuenta")
        return
      }
      await completeAuthFromUrl(url)
      router.replace("/(tabs)/favoritos")
    }

    void Linking.getInitialURL().then((url) => finish(url))

    const sub = Linking.addEventListener("url", (event) => {
      void finish(event.url)
    })

    return () => sub.remove()
  }, [completeAuthFromUrl, router])

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#a3e635" />
      <Text style={styles.text}>Completando inicio de sesión…</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0a",
  },
  text: {
    color: "#a3a3a3",
    marginTop: 12,
  },
})
