import { NextResponse } from "next/server";
import type { EventRow } from "@/app/components/types";
import { createClient } from "@/app/lib/supabase/server";

function normalizeEvents(raw: unknown): EventRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (event): event is EventRow =>
      Boolean(event) && typeof (event as EventRow).id === "number"
  );
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      favoriteIds: [],
      favoriteEvents: [],
    });
  }

  const [profileRes, favRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("favorites")
      .select("event_id, created_at, events(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const favoriteRows = favRes.data ?? [];
  const favoriteEvents = favoriteRows
    .map((row) => row.events as unknown as EventRow | null)
    .filter((event): event is EventRow => Boolean(event?.id));

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      displayName:
        profileRes.data?.display_name ??
        user.user_metadata?.display_name ??
        user.email?.split("@")[0] ??
        "Usuario",
    },
    favoriteIds: favoriteRows.map((row) => row.event_id as number),
    favoriteEvents,
  });
}
