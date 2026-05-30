import Link from "next/link"
import { redirect } from "next/navigation"
import { createServerClient } from "@/app/lib/supabase/server-auth"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"
import { eventDisplayTitle } from "@/app/lib/event-display"
import { partidoPath } from "@/app/lib/event-slug"
import { eventDisplayTime } from "@/app/lib/madrid-time"
import { formatDisplayDateLabel, MADRID_TZ } from "@/app/lib/timezone"
import type { EventRow } from "@/app/components/types"
import "../futbolhoy-feed.css"

type FavoriteRow = {
  event_id: number
  created_at: string
  events: EventRow | EventRow[] | null
}

function resolveFavoriteEvent(row: FavoriteRow): EventRow | null {
  if (!row.events) return null
  return Array.isArray(row.events) ? row.events[0] ?? null : row.events
}

export default async function CuentaPage() {
  if (!isSupabaseConfigured()) {
    redirect("/")
  }

  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/cuenta/login")
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select("event_id, created_at, events(*)")
    .order("created_at", { ascending: false })

  const favoriteEvents = (favorites ?? [])
    .map((row) => {
      const event = resolveFavoriteEvent(row as FavoriteRow)
      return event ? { event, created_at: row.created_at as string } : null
    })
    .filter((row): row is { event: EventRow; created_at: string } => row !== null)

  return (
    <main className="fh-auth-page">
      <div className="fh-container fh-account-page">
        <div className="fh-auth-card fh-account-main">
          <h1>Mi cuenta</h1>

          <div className="fh-account-panel">
            <p className="fh-account-greeting">Hola, {user.email}</p>

            <dl className="fh-account-details">
              <div>
                <dt>Correo</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>

            <section aria-labelledby="favoritos-heading">
              <h2 id="favoritos-heading">Mis favoritos</h2>
              {favoriteEvents.length === 0 ? (
                <div className="fh-account-empty">
                  <p className="fh-account-empty-hint">
                    Aún no has guardado eventos. Pulsa el corazón en cualquier
                    tarjeta de la home para añadirlos aquí.
                  </p>
                  <Link href="/" className="fh-btn fh-btn-primary">
                    Ver agenda
                  </Link>
                </div>
              ) : (
                <ul className="fh-fav-list">
                  {favoriteEvents.map(({ event }) => {
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
            </section>

            <section className="fh-settings-block" aria-labelledby="push-heading">
              <h2 id="push-heading">Avisos push</h2>
              <p>
                Gestiona categorías y activación de notificaciones desde la home.
              </p>
              <p className="fh-settings-muted">
                Pulsa el icono de campana en la barra superior para abrir los
                ajustes de avisos.
              </p>
              <Link href="/" className="fh-account-menu-link">
                Ir a la home →
              </Link>
            </section>

            <div className="fh-account-actions">
              <Link href="/" className="fh-btn">
                Volver al inicio
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="fh-btn fh-btn-ghost">
                  Cerrar sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
