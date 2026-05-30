import { NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase/server-auth"
import { parseUserPreferences } from "@/app/lib/user-preferences"

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [{ data: profile }, { data: favorites }, { data: preferencesRow }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, created_at, updated_at")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("favorites")
        .select("event_id, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_preferences")
        .select("platforms, prime_time, hidden_sports, spoilers_off, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
    ])

  const payload = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
    },
    profile: profile ?? null,
    preferences: parseUserPreferences(preferencesRow),
    preferencesUpdatedAt: preferencesRow?.updated_at ?? null,
    favorites: favorites ?? [],
  }

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="queveohoy-datos.json"',
      "Cache-Control": "no-store",
    },
  })
}
