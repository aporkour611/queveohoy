import { NextResponse } from "next/server";
import type { EventRow } from "@/app/components/types";
import { createClient } from "@/app/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ eventIds: [], events: [] });
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("event_id, created_at, events(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const events = (data ?? [])
    .map((row) => row.events as unknown as EventRow | null)
    .filter((event): event is EventRow => Boolean(event?.id));

  return NextResponse.json({
    eventIds: (data ?? []).map((row) => row.event_id as number),
    events,
  });
}
