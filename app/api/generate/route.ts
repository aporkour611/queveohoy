import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  try {
    // evitar duplicados
    const { data: existing } = await supabase
      .from("events")
      .select("*")
      .eq("date", today);

    if (existing && existing.length > 0) {
      return Response.json({
        ok: true,
        message: "Ya hay eventos hoy",
        count: existing.length,
      });
    }

    // 🔥 API REAL (TheSportsDB - gratis y sin auth compleja)
    const res = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=" +
        today +
        "&s=Soccer"
    );

    const data = await res.json();

    const events = (data?.events || []).slice(0, 6).map((e: any) => ({
      title: e.strEvent,
      time: e.strTime || "Sin hora",
      category: "Fútbol",
      platform: e.strLeague || "TV",
      date: today,
      featured: false,
    }));

    // si no hay datos reales → fallback
    if (events.length === 0) {
      events.push({
        title: "Evento destacado del día",
        time: "20:00",
        category: "General",
        platform: "TV",
        date: today,
        featured: true,
      });
    }

    const { error } = await supabase.from("events").insert(events);

    if (error) {
      return Response.json({
        ok: false,
        error: error.message,
      });
    }

    return Response.json({
      ok: true,
      message: "Eventos reales generados",
      count: events.length,
    });
  } catch (err: any) {
    return Response.json({
      ok: false,
      error: err.message,
    });
  }
}