import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  // 1. comprobar si ya hay eventos hoy
  const { data: existing } = await supabase
    .from("events")
    .select("*")
    .gte("created_at", today);

  if (existing && existing.length > 0) {
    return Response.json({
      ok: true,
      message: "Ya existen eventos hoy",
      count: existing.length,
    });
  }

  // 2. generar eventos nuevos
  const baseEvents = [
    { title: "Real Madrid vs Barcelona", time: "20:00", category: "Fútbol", platform: "Movistar+" },
    { title: "UFC Fight Night", time: "22:00", category: "UFC", platform: "DAZN" },
    { title: "MotoGP Qualifying", time: "18:00", category: "Motos", platform: "DAZN" },
  ];

  const { error } = await supabase.from("events").insert(baseEvents);

  if (error) {
    return Response.json({ ok: false, error });
  }

  return Response.json({
    ok: true,
    message: "Eventos generados correctamente",
  });
}