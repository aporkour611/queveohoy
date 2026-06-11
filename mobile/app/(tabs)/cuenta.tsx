import { useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useAuth } from "@/lib/auth-context"
import { SITE_URL } from "@/lib/api"

export default function CuentaScreen() {
  const {
    configured,
    loading,
    user,
    signInWithGoogle,
    signInWithEmail,
    signOut,
  } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#a3e635" />
      </View>
    )
  }

  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tu cuenta</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.lead}>
          Tus favoritos se sincronizan con la web en {SITE_URL.replace("https://", "")}.
        </Text>
        <Pressable
          style={styles.outlineBtn}
          onPress={() => void signOut()}
          accessibilityRole="button"
        >
          <Text style={styles.outlineText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    )
  }

  const handleGoogle = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const err = await signInWithGoogle()
    if (err) setError(err)
    setBusy(false)
  }

  const handleEmail = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const err = await signInWithEmail(email)
    if (err) setError(err)
    else setMessage("Te hemos enviado un enlace. Ábrelo en este móvil.")
    setBusy(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.lead}>
        Guarda favoritos sincronizados con la web. Google o enlace mágico por correo.
      </Text>

      {!configured ? (
        <Text style={styles.warn}>
          Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en mobile/.env
        </Text>
      ) : null}

      {error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
      {message ? (
        <Text style={styles.success}>{message}</Text>
      ) : null}

      <Pressable
        style={styles.primaryBtn}
        onPress={() => void handleGoogle()}
        disabled={busy || !configured}
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>
          {busy ? "Conectando…" : "Continuar con Google"}
        </Text>
      </Pressable>

      <Text style={styles.divider}>o</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        placeholderTextColor="#737373"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!busy}
      />

      <Pressable
        style={styles.secondaryBtn}
        onPress={() => void handleEmail()}
        disabled={busy || !configured}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Enviar enlace mágico</Text>
      </Pressable>

      <Text style={styles.hint}>
        En Supabase añade redirect: queveohoy://auth/callback
      </Text>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0a0a0a",
  },
  title: {
    color: "#fafafa",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  email: {
    color: "#a3e635",
    fontSize: 16,
    marginBottom: 12,
  },
  lead: {
    color: "#a3a3a3",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  warn: {
    color: "#fbbf24",
    marginBottom: 12,
  },
  error: {
    color: "#fca5a5",
    marginBottom: 12,
  },
  success: {
    color: "#86efac",
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: "#a3e635",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#0a0a0a",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#404040",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#fafafa",
    fontWeight: "600",
  },
  outlineBtn: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#525252",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  outlineText: {
    color: "#fafafa",
    fontWeight: "600",
  },
  divider: {
    color: "#737373",
    textAlign: "center",
    marginVertical: 16,
  },
  input: {
    backgroundColor: "#171717",
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fafafa",
    marginBottom: 12,
  },
  hint: {
    color: "#525252",
    fontSize: 12,
    marginTop: 20,
  },
})
