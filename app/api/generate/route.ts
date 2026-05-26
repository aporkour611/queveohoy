import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/app/lib/admin-auth";
import { supabase } from "@/app/lib/supabase";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

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

    const json = await res.json();
    const rawEvents = json?.events || [];

    const events = rawEvents.slice(0, 8).map((e: any, index: number) => ({
      title: e.strEvent,
      time: e.strTime || "Sin hora",
      category: "Fútbol",
      platform: e.strLeague || "TV",
      date: today,
      popularity: Math.max(1, 10 - index),
      featured: index < 2,
    }));

    if (events.length === 0) {
      events.push({
        title: "Evento destacado del día",
        time: "20:00",
        category: "General",
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
  } catch (err: any) {
    return Response.json({
      ok: false,
      error: err.message,
    });
  }
}
