import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  // 🔥 comprobar si ya existen eventos hoy
  const { data: existing, error: checkError } = await supabase
    .from("events")
    .select("*")
    .eq("date", today);

  if (checkError) {
    return Response.json({ ok: false, error: checkError });
  }

  if (existing && existing.length > 0) {
    return Response.json({
      ok: true,
      message: "Ya existen eventos hoy",
      count: existing.length,
    });
  }

  // 🔥 eventos base
  const baseEvents = [
    {
      title: "Real Madrid vs Barcelona",
      time: "20:00",
      category: "Fútbol",
      platform: "Movistar+",
    },
    {
      title: "UFC Fight Night",
      time: "22:00",
      category: "UFC",
      platform: "DAZN",
    },
    {
      title: "MotoGP Qualifying",
      time: "18:00",
      category: "Motos",
      platform: "DAZN",
    },
  ];

  // 🔥 añadir fecha a cada evento
  const eventsWithDate = baseEvents.map((event) => ({
    ...event,
    date: today,
  }));

  const { error } = await supabase.from("events").insert(eventsWithDate);

  if (error) {
    return Response.json({ ok: false, error });
  }

  return Response.json({
    ok: true,
    message: "Eventos generados correctamente",
    inserted: eventsWithDate,
  });
}