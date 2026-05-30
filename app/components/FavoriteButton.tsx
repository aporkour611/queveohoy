"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState, type MouseEvent } from "react"
import { createBrowserClient, isSupabaseConfigured } from "@/app/lib/supabase/browser-client"

type Props = {
  eventId: number
  className?: string
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="qvh-fav-icon"
      aria-hidden
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  )
}

export const FavoriteButton = ({ eventId, className }: Props) => {
  const pathname = usePathname()
  const [ready, setReady] = useState(() => !isSupabaseConfigured())
  const [loggedIn, setLoggedIn] = useState(false)
  const [favorited, setFavorited] = useState(false)
  const [busy, setBusy] = useState(false)

  const loginHref = `/cuenta/login?next=${encodeURIComponent(pathname || "/")}`

  useEffect(() => {
    const supabase = createBrowserClient()
    if (!supabase) return

    let cancelled = false

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (cancelled) return

      if (!user) {
        setLoggedIn(false)
        setReady(true)
        return
      }

      setLoggedIn(true)

      const { data } = await supabase
        .from("favorites")
        .select("event_id")
        .eq("event_id", eventId)
        .maybeSingle()

      if (!cancelled) {
        setFavorited(Boolean(data))
        setReady(true)
      }
    }

    void load()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [eventId])

  const handleToggle = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()

      const supabase = createBrowserClient()
      if (!supabase || !loggedIn || busy) return

      setBusy(true)

      if (favorited) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("event_id", eventId)

        if (!error) setFavorited(false)
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setBusy(false)
          return
        }

        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          event_id: eventId,
        })

        if (!error) setFavorited(true)
      }

      setBusy(false)
    },
    [busy, eventId, favorited, loggedIn]
  )

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.stopPropagation()
  }

  if (!ready) {
    return (
      <span
        className={`qvh-fav-btn ${className ?? ""}`.trim()}
        aria-hidden
      />
    )
  }

  if (!loggedIn) {
    return (
      <Link
        href={loginHref}
        className={`qvh-fav-btn ${className ?? ""}`.trim()}
        aria-label="Inicia sesión para guardar favoritos"
        onClick={handleLinkClick}
      >
        <HeartIcon filled={false} />
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={`qvh-fav-btn${favorited ? " qvh-fav-btn-active" : ""}${className ? ` ${className}` : ""}`}
      aria-label={favorited ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={favorited}
      disabled={busy}
      onClick={handleToggle}
    >
      <HeartIcon filled={favorited} />
    </button>
  )
}
