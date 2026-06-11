import * as QueryParams from "expo-auth-session/build/QueryParams"
import * as WebBrowser from "expo-web-browser"
import { makeRedirectUri } from "expo-auth-session"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseClient, isSupabaseConfigured } from "./supabase"

WebBrowser.maybeCompleteAuthSession()

type AuthContextValue = {
  configured: boolean
  loading: boolean
  user: User | null
  session: Session | null
  signInWithGoogle: () => Promise<string | null>
  signInWithEmail: (email: string) => Promise<string | null>
  signOut: () => Promise<void>
  completeAuthFromUrl: (url: string) => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function authRedirectUri(): string {
  return makeRedirectUri({
    scheme: "queveohoy",
    path: "auth/callback",
  })
}

async function setSessionFromUrl(url: string): Promise<string | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return "Supabase no configurado en la app."

  const { params, errorCode } = QueryParams.getQueryParams(url)
  if (errorCode) return `Error de autenticación: ${errorCode}`

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    return error?.message ?? null
  }

  const accessToken = params.access_token
  const refreshToken = params.refresh_token
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return error?.message ?? null
  }

  return "Enlace de sesión inválido."
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return "Supabase no configurado."

    const redirectTo = authRedirectUri()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    })

    if (error) return error.message
    if (!data?.url) return "No se pudo abrir Google."

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    if (result.type !== "success") {
      return result.type === "cancel" ? null : "Inicio de sesión cancelado."
    }

    return setSessionFromUrl(result.url)
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    const supabase = getSupabaseClient()
    if (!supabase) return "Supabase no configurado."

    const trimmed = email.trim()
    if (!trimmed) return "Introduce tu correo."

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: authRedirectUri() },
    })

    return error?.message ?? null
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const completeAuthFromUrl = useCallback(async (url: string) => {
    return setSessionFromUrl(url)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user: session?.user ?? null,
      session,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      completeAuthFromUrl,
    }),
    [loading, session, signInWithGoogle, signInWithEmail, signOut, completeAuthFromUrl]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
