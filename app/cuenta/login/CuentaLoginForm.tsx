"use client"

import Link from "next/link"
import { FormEvent, useMemo, useState } from "react"
import { createBrowserClient } from "@/app/lib/supabase/browser-client"
import { siteUrl } from "@/app/lib/seo"
import { sanitizeInternalRedirectPath } from "@/app/lib/safe-redirect"
import {
  OAUTH_PROVIDERS,
  type OAuthProviderId,
} from "@/app/lib/oauth-providers"
import "../../futbolhoy-feed.css"

const ERROR_MESSAGES: Record<string, string> = {
  auth: "No se pudo completar el inicio de sesión. Prueba de nuevo.",
}

const SUPABASE_UNAVAILABLE =
  "El inicio de sesión no está disponible: faltan variables de Supabase en el entorno (SUPABASE_URL y clave anon/publishable)."

type Props = {
  nextPath?: string
  errorKey?: string
}

export const CuentaLoginForm = ({ nextPath = "/cuenta", errorKey }: Props) => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  )
  const [message, setMessage] = useState("")

  const redirectTo = useMemo(() => {
    const safeNext = sanitizeInternalRedirectPath(nextPath, "/cuenta")
    return `${siteUrl}/auth/callback?next=${encodeURIComponent(safeNext)}`
  }, [nextPath])

  const handleOAuthSignIn = async (provider: OAuthProviderId) => {
    setStatus("loading")
    setMessage("")

    const supabase = createBrowserClient()
    if (!supabase) {
      setStatus("error")
      setMessage(SUPABASE_UNAVAILABLE)
      return
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })

    if (error) {
      setStatus("error")
      setMessage(error.message)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus("loading")
    setMessage("")

    const supabase = createBrowserClient()
    if (!supabase) {
      setStatus("error")
      setMessage(SUPABASE_UNAVAILABLE)
      return
    }

    const trimmed = email.trim()
    if (!trimmed) {
      setStatus("error")
      setMessage("Introduce tu correo electrónico.")
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo },
    })

    if (error) {
      setStatus("error")
      setMessage(error.message)
      return
    }

    setStatus("sent")
    setMessage("Te hemos enviado un enlace mágico. Revisa tu bandeja de entrada.")
  }

  const errorMessage = errorKey ? ERROR_MESSAGES[errorKey] : null
  const isLoading = status === "loading"

  return (
    <main id="main-content" className="fh-auth-page">
      <div className="fh-container">
        <div className="fh-auth-card">
          <h1>Iniciar sesión</h1>
          <p className="fh-auth-lead">
            Guarda favoritos con Google, Apple, Microsoft o un enlace mágico
            por correo. No necesitas contraseña.
          </p>

          {errorMessage ? (
            <p className="fh-auth-message fh-auth-message-error" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {status === "sent" ? (
            <p className="fh-auth-message fh-auth-message-success" role="status">
              {message}
            </p>
          ) : (
            <>
              <div className="fh-auth-oauth-stack" role="group" aria-label="Inicio de sesión social">
                {OAUTH_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    className={`fh-btn fh-auth-oauth ${provider.className}`}
                    onClick={() => handleOAuthSignIn(provider.id)}
                    disabled={isLoading}
                    aria-label={`Continuar con ${provider.label}`}
                  >
                    Continuar con {provider.label}
                  </button>
                ))}
              </div>

              <p className="fh-auth-divider" aria-hidden>
                <span>o</span>
              </p>

              <form className="fh-auth-form" onSubmit={handleSubmit}>
                <label className="fh-auth-field">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </label>

                {status === "error" && message ? (
                  <p
                    className="fh-auth-message fh-auth-message-error"
                    role="alert"
                  >
                    {message}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="fh-btn fh-btn-primary fh-auth-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando…" : "Enviar enlace mágico"}
                </button>
              </form>
            </>
          )}

          <p className="fh-auth-back">
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
