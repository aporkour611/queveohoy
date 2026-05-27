import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/app/lib/admin-auth";
import { isDebugRouteDisabled } from "@/app/lib/debug-routes";
import { createSupabaseAdmin } from "@/app/lib/supabase-admin";

type SportsDbEvent = {
  strEvent?: string;
  strTime?: string;
  strLeague?: string;
};

export async function GET(request: Request) {
  if (isDebugRouteDisabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];
  const supabase = createSupabaseAdmin();

  try {
    const { data: existing } = await supabase
      .from("events")
      .select("*")
      .eq("date", today);

    if (existing && existing.length >= 5) {
      return Response.json({
        ok: true,
        message: "Dataset ya completo",
        count: existing.length,
      });
    }

    const res = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=" +
        today +
        "&s=Soccer"
    );

    const json = (await res.json()) as { events?: SportsDbEvent[] };
    const rawEvents = json?.events || [];

    const events = rawEvents.slice(0, 8).map((e: SportsDbEvent, index: number) => ({
      title: e.strEvent,
      time: e.strTime || "Sin hora",
      sport: "Fútbol",
      platform: e.strLeague || "TV",
      date: today,
      popularity: Math.max(1, 10 - index),
      featured: index < 2,
    }));

    if (events.length === 0) {
      events.push({
        title: "Evento destacado del día",
        time: "20:00",
        sport: "General",
        platform: "TV",
        date: today,
        popularity: 5,
        featured: true,
      });
    }

    const { error } = await supabase
      .from("events")
      .upsert(events, { onConflict: "title,date" });

    if (error) {
      return Response.json({
        ok: false,
        error: error.message,
      });
    }

    return Response.json({
      ok: true,
      message: "Engine v2 OK",
      count: events.length,
    });
  } catch (err: unknown) {
    return Response.json({
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
