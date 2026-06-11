import { PushSettings } from "@/components/PushSettings"
import { ThemeSettings } from "@/components/ThemeSettings"
import { useMemo, useState } from "react"
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useAuth } from "@/lib/auth-context"
import { SITE_URL } from "@/lib/api"
import { useTheme } from "@/lib/theme-context"

export default function CuentaScreen() {
  const { colors } = useTheme()
  const {
    configured,
    loading,
    user,
    signInWithGoogle,
    signInWithApple,
    signInWithMicrosoft,
    signInWithEmail,
    signOut,
  } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const styles = useMemo(
    () =>
      StyleSheet.create({
        center: {
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.bg,
        },
        container: {
          flexGrow: 1,
          padding: 20,
          backgroundColor: colors.bg,
        },
        title: {
          color: colors.text,
          fontSize: 24,
          fontWeight: "800",
          marginBottom: 8,
        },
        email: {
          color: colors.accent,
          fontSize: 16,
          marginBottom: 12,
        },
        lead: {
          color: colors.textMuted,
          fontSize: 15,
          lineHeight: 22,
          marginBottom: 20,
        },
        warn: {
          color: colors.warning,
          marginBottom: 12,
        },
        error: {
          color: colors.error,
          marginBottom: 12,
        },
        success: {
          color: colors.success,
          marginBottom: 12,
        },
        primaryBtn: {
          backgroundColor: colors.accent,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        },
        primaryText: {
          color: colors.bg,
          fontWeight: "700",
          fontSize: 16,
        },
        appleBtn: {
          backgroundColor: colors.text,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 0,
        },
        appleText: {
          color: colors.bg,
          fontWeight: "700",
          fontSize: 16,
        },
        microsoftBtn: {
          backgroundColor: "#2563eb",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 10,
        },
        microsoftText: {
          color: "#fafafa",
          fontWeight: "700",
          fontSize: 16,
        },
        secondaryBtn: {
          borderWidth: 1,
          borderColor: colors.border,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        },
        secondaryText: {
          color: colors.text,
          fontWeight: "600",
        },
        outlineBtn: {
          marginTop: 24,
          borderWidth: 1,
          borderColor: colors.textSubtle,
          paddingVertical: 12,
          borderRadius: 12,
          alignItems: "center",
        },
        outlineText: {
          color: colors.text,
          fontWeight: "600",
        },
        divider: {
          color: colors.textSubtle,
          textAlign: "center",
          marginVertical: 16,
        },
        input: {
          backgroundColor: colors.inputBg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          marginBottom: 12,
        },
        hint: {
          color: colors.textSubtle,
          fontSize: 12,
          marginTop: 20,
        },
      }),
    [colors]
  )

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    )
  }

  if (user) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tu cuenta</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.lead}>
          Tus favoritos se sincronizan con la web en {SITE_URL.replace("https://", "")}.
        </Text>
        <PushSettings />
        <ThemeSettings />
        <Pressable
          style={styles.outlineBtn}
          onPress={() => void signOut()}
          accessibilityRole="button"
        >
          <Text style={styles.outlineText}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
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

  const handleApple = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const err = await signInWithApple()
    if (err) setError(err)
    setBusy(false)
  }

  const handleMicrosoft = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const err = await signInWithMicrosoft()
    if (err) setError(err)
    setBusy(false)
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.lead}>
        Guarda favoritos sincronizados con la web. Google, Apple, Microsoft o correo.
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

      <Pressable
        style={styles.appleBtn}
        onPress={() => void handleApple()}
        disabled={busy || !configured}
        accessibilityRole="button"
      >
        <Text style={styles.appleText}>
          {busy ? "Conectando…" : "Continuar con Apple"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.microsoftBtn}
        onPress={() => void handleMicrosoft()}
        disabled={busy || !configured}
        accessibilityRole="button"
      >
        <Text style={styles.microsoftText}>
          {busy ? "Conectando…" : "Continuar con Microsoft"}
        </Text>
      </Pressable>

      <Text style={styles.divider}>o correo</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="tu@correo.com"
        placeholderTextColor={colors.textSubtle}
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
    </ScrollView>
  )
}
