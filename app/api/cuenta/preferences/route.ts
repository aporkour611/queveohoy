import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/app/lib/supabase/server-auth"
import {
  parseUserPreferences,
  serializeUserPreferences,
} from "@/app/lib/user-preferences"

export async function PATCH(request: NextRequest) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const { data: existingRow } = await supabase
    .from("user_preferences")
    .select("platforms, prime_time, hidden_sports, spoilers_off")
    .eq("user_id", user.id)
    .maybeSingle()

  const current = parseUserPreferences(existingRow)
  const next = {
    ...current,
    ...(Array.isArray(payload.platforms)
      ? { platforms: payload.platforms.filter((item) => typeof item === "string") }
      : {}),
    ...(typeof payload.primeTime === "string"
      ? { primeTime: payload.primeTime.slice(0, 5) }
      : {}),
    ...(Array.isArray(payload.hiddenSports)
      ? {
          hiddenSports: payload.hiddenSports.filter(
            (item) => typeof item === "string"
          ),
        }
      : {}),
    ...(typeof payload.spoilersOff === "boolean"
      ? { spoilersOff: payload.spoilersOff }
      : {}),
  }

  const row = {
    user_id: user.id,
    ...serializeUserPreferences(next),
  }

  const { error } = await supabase.from("user_preferences").upsert(row, {
    onConflict: "user_id",
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preferences: next })
}
