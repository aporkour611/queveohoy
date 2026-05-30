"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import type { EventRow } from "@/app/components/types"
import { eventDisplayTitle } from "@/app/lib/event-display"
import { partidoPath } from "@/app/lib/event-slug"
import { eventDisplayTime } from "@/app/lib/madrid-time"
import { formatDisplayDateLabel, MADRID_TZ } from "@/app/lib/timezone"
import {
  SPANISH_PLATFORM_OPTIONS,
  type UserPreferences,
} from "@/app/lib/user-preferences"
import { syncStoredUserPlatforms } from "@/app/lib/user-platforms-client"

type FavoriteItem = {
  event: EventRow
  created_at: string
}

type AccountTab = "favoritos" | "plataformas" | "avisos" | "seguridad"

type Props = {
  email: string
  displayName: string
  favorites: FavoriteItem[]
  preferences: UserPreferences
}

const TABS: { id: AccountTab; label: string; desc: string }[] = [
  { id: "favoritos", label: "Favoritos", desc: "Eventos guardados" },
  { id: "plataformas", label: "Plataformas", desc: "Dónde ves" },
  { id: "avisos", label: "Avisos", desc: "Push y alertas" },
  { id: "seguridad", label: "Cuenta", desc: "Sesión y datos" },
]

export function CuentaPortal({
  email,
  displayName,
  favorites,
  preferences: initialPreferences,
}: Props) {
  const [activeTab, setActiveTab] = useState<AccountTab>("favoritos")
  const [preferences, setPreferences] = useState(initialPreferences)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    syncStoredUserPlatforms(initialPreferences)
  }, [initialPreferences])

  const sortedFavorites = useMemo(
    () =>
      [...favorites].sort((a, b) =>
        `${b.event.date ?? ""}${b.event.time ?? ""}`.localeCompare(
          `${a.event.date ?? ""}${a.event.time ?? ""}`
        )
      ),
    [favorites]
  )

  const handleTogglePlatform = (platform: string) => {
    setPreferences((current) => {
      const has = current.platforms.includes(platform)
      return {
        ...current,
        platforms: has
          ? current.platforms.filter((item) => item !== platform)
          : [...current.platforms, platform],
      }
    })
  }

  const handleSavePlatforms = () => {
    setSaveMessage(null)
    setSaveError(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/cuenta/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platforms: preferences.platforms }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error ?? "No se pudieron guardar las preferencias")
        }
        const body = (await res.json()) as { preferences?: UserPreferences }
        if (body.preferences) syncStoredUserPlatforms(body.preferences)
        setSaveMessage("Plataformas guardadas. El feed resaltará dónde ver.")
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Error al guardar")
      }
    })
  }

  const handleSavePrimeTime = () => {
    setSaveMessage(null)
    setSaveError(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/cuenta/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ primeTime: preferences.primeTime }),
        })
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error ?? "No se pudo guardar el prime time")
        }
        setSaveMessage("Prime time actualizado.")
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Error al guardar")
      }
    })
  }

  return (
    <div className="fh-container fh-account-page">
      <div className="fh-account-layout">
        <aside className="fh-account-sidebar" aria-label="Menú de cuenta">
          <div className="fh-account-sidebar-head">
            <p className="fh-account-sidebar-kicker">Mi espacio</p>
            <p className="fh-account-sidebar-name">{displayName}</p>
            <p className="fh-account-sidebar-email">{email}</p>
          </div>

          <nav className="fh-account-menu" aria-label="Secciones de cuenta">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`fh-account-menu-item${
                  activeTab === tab.id ? " active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={activeTab === tab.id ? "page" : undefined}
              >
                <span className="fh-account-menu-label">{tab.label}</span>
                <span className="fh-account-menu-desc">{tab.desc}</span>
              </button>
            ))}
          </nav>

          <div className="fh-account-sidebar-foot">
            <Link href="/" className="fh-account-menu-link">
              ← Volver a la agenda
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="fh-account-menu-link fh-account-logout">
                Cerrar sesión
              </button>
            </form>
          </div>
        </aside>

        <div className="fh-auth-card fh-account-main">
          {activeTab === "favoritos" ? (
            <>
              <h1>Mis favoritos</h1>
              {sortedFavorites.length === 0 ? (
                <div className="fh-account-empty">
                  <p className="fh-account-empty-hint">
                    Aún no has guardado eventos. Pulsa el corazón en cualquier tarjeta
                    de la home para añadirlos aquí.
                  </p>
                  <Link href="/" className="fh-btn fh-btn-primary">
                    Ver agenda
                  </Link>
                </div>
              ) : (
                <ul className="fh-fav-list">
                  {sortedFavorites.map(({ event }) => {
                    const title = eventDisplayTitle(event)
                    const time = eventDisplayTime(event)
                    const dateLabel = event.date
                      ? formatDisplayDateLabel(event.date, MADRID_TZ)
                      : ""
                    const meta = [dateLabel, time].filter(Boolean).join(" · ")

                    return (
                      <li key={event.id} className="fh-fav-list-item">
                        <Link href={partidoPath(event)} className="fh-fav-list-main">
                          <strong>{title}</strong>
                          {meta ? <span>{meta}</span> : null}
                        </Link>
                        <span className="fh-fav-list-heart" aria-hidden>
                          ♥
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          ) : null}

          {activeTab === "plataformas" ? (
            <>
              <h1>Mis plataformas</h1>
              <p className="fh-account-empty-hint">
                Marca dónde tienes suscripción. Usaremos esto para resaltar dónde ver
                cada evento en tu agenda.
              </p>
              <div className="fh-platform-grid" role="group" aria-label="Plataformas">
                {SPANISH_PLATFORM_OPTIONS.map((platform) => {
                  const checked = preferences.platforms.includes(platform)
                  return (
                    <label
                      key={platform}
                      className={`fh-platform-chip${checked ? " is-active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleTogglePlatform(platform)}
                      />
                      <span>{platform}</span>
                    </label>
                  )
                })}
              </div>
              <div className="fh-account-actions">
                <button
                  type="button"
                  className="fh-btn fh-btn-primary"
                  onClick={handleSavePlatforms}
                  disabled={isPending}
                >
                  {isPending ? "Guardando…" : "Guardar plataformas"}
                </button>
              </div>
              {saveMessage ? (
                <p className="fh-auth-message fh-auth-message-success">{saveMessage}</p>
              ) : null}
              {saveError ? (
                <p className="fh-auth-message fh-auth-message-error">{saveError}</p>
              ) : null}
            </>
          ) : null}

          {activeTab === "avisos" ? (
            <>
              <h1>Avisos push</h1>
              <section className="fh-settings-block">
                <h2>Preferencias de notificación</h2>
                <p>
                  Gestiona categorías y activación de notificaciones desde la home.
                </p>
                <p className="fh-settings-muted">
                  Pulsa el icono de campana en la barra superior para abrir los ajustes
                  de avisos. Con cuenta activa puedes usar el modo «solo favoritos».
                </p>
                <Link href="/" className="fh-account-menu-link">
                  Ir a ajustes push →
                </Link>
              </section>
            </>
          ) : null}

          {activeTab === "seguridad" ? (
            <>
              <h1>Tu cuenta</h1>
              <dl className="fh-account-details">
                <div>
                  <dt>Correo</dt>
                  <dd>{email}</dd>
                </div>
              </dl>
              <section className="fh-settings-block">
                <h2>Prime time</h2>
                <p className="fh-account-empty-hint">
                  Hora desde la que prefieres ver eventos destacados (widget y
                  recomendaciones futuras).
                </p>
                <label className="fh-account-prime-time">
                  <span className="sr-only">Prime time</span>
                  <select
                    value={preferences.primeTime}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        primeTime: event.target.value,
                      }))
                    }
                  >
                    {["17:00", "18:00", "19:00", "20:00", "21:00", "22:00"].map(
                      (time) => (
                        <option key={time} value={time}>
                          {time} h (Madrid)
                        </option>
                      )
                    )}
                  </select>
                </label>
                <div className="fh-account-actions">
                  <button
                    type="button"
                    className="fh-btn fh-btn-primary"
                    onClick={handleSavePrimeTime}
                    disabled={isPending}
                  >
                    {isPending ? "Guardando…" : "Guardar prime time"}
                  </button>
                </div>
              </section>
              {saveMessage ? (
                <p className="fh-auth-message fh-auth-message-success">{saveMessage}</p>
              ) : null}
              {saveError ? (
                <p className="fh-auth-message fh-auth-message-error">{saveError}</p>
              ) : null}
              <section className="fh-settings-block">
                <h2>Privacidad</h2>
                <p>
                  Descarga un JSON con tu correo, perfil, favoritos y preferencias
                  (derecho de acceso RGPD).
                </p>
                <a
                  href="/api/cuenta/export"
                  className="fh-btn fh-btn-primary"
                  download="queveohoy-datos.json"
                >
                  Descargar mis datos
                </a>
                <p className="fh-settings-muted">
                  Consulta cómo tratamos tus datos en nuestra política de privacidad.
                </p>
                <Link href="/privacidad" className="fh-account-menu-link">
                  Política de privacidad →
                </Link>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
