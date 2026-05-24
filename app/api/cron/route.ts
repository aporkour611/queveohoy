import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1. evitar duplicados
    const { data: existing } = await supabase
      .from("events")
      .select("*")
      .eq("date", today);

    if (existing && existing.length > 5) {
      return Response.json({
        ok: true,
        message: "Ya actualizado hoy",
      });
    }

    // 2. API fútbol real
    const footballRes = await fetch(
      "https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=" +
        today +
        "&s=Soccer"
    );

    const footballData = await footballRes.json();

    const footballEvents = (footballData?.events || []).map((e: any) => ({
      title: e.strEvent,
      time: e.strTime || "Sin hora",
      category: "Fútbol",
      platform: e.strLeague || "TV",
      date: today,
      featured: false,
    }));

    // 3. Twitch (streams en directo básicos)
    const twitchEvents = [
      {
        title: "Streams en directo en Twitch",
        time: "Live",
        category: "Gaming",
        platform: "Twitch",
        date: today,
        featured: true,
      },
    ];

    // 4. unir todo
    const allEvents = [...footballEvents, ...twitchEvents];

    if (allEvents.length === 0) {
      return Response.json({
        ok: false,
        message: "Sin datos",
      });
    }

    // 5. limpiar día anterior (opcional pero recomendado)
    await supabase.from("events").delete().neq("date", today);

    // 6. insertar nuevo día
    const { error } = await supabase.from("events").insert(allEvents);

    if (error) {
      return Response.json({
        ok: false,
        error: error.message,
      });
    }

    return Response.json({
      ok: true,
      message: "Sistema automático ejecutado",
      count: allEvents.length,
    });
  } catch (err: any) {
    return Response.json({
      ok: false,
      error: err.message,
    });
  }
}