import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let eventId: number;
  try {
    const body = await request.json();
    eventId = Number(body.eventId);
    if (!Number.isFinite(eventId) || eventId <= 0) throw new Error();
  } catch {
    return NextResponse.json({ error: "eventId inválido" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("event_id", eventId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("event_id", eventId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorited: false, eventId });
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    event_id: eventId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ favorited: true, eventId });
}
