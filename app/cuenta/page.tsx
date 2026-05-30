import { redirect } from "next/navigation"
import { CuentaPortal } from "@/app/components/CuentaPortal"
import { PageMain } from "@/app/components/PageMain";
import type { EventRow } from "@/app/components/types"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"
import { createServerClient } from "@/app/lib/supabase/server-auth"
import { parseUserPreferences } from "@/app/lib/user-preferences"
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

  const [{ data: favorites }, { data: profile }, { data: preferencesRow }] =
    await Promise.all([
      supabase
        .from("favorites")
        .select("event_id, created_at, events(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_preferences")
        .select("platforms, prime_time, hidden_sports, spoilers_off")
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

  const favoriteEvents = (favorites ?? [])
    .map((row) => {
      const event = resolveFavoriteEvent(row as FavoriteRow)
      return event ? { event, created_at: row.created_at as string } : null
    })
    .filter((row): row is { event: EventRow; created_at: string } => row !== null)

  const displayName =
    profile?.display_name?.trim() ||
    user.email?.split("@")[0]?.trim() ||
    "Usuario"

  return (
    <PageMain className="fh-auth-page">
      <CuentaPortal
        email={user.email ?? ""}
        displayName={displayName}
        favorites={favoriteEvents}
        preferences={parseUserPreferences(preferencesRow)}
      />
    </PageMain>
  )
}
