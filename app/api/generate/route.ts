import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  try {
    // 1. comprobar si ya existen eventos hoy
    const { data: existing } = await supabase
      .from("events")
      .select("*")
      .eq("date", today);

    if (existing && existing.length > 0) {
      return Response.json({
        ok: true,
        message: "Eventos ya existentes para hoy",
        count: existing.length,
      });
    }

    // 2. “motor de eventos realista”
    // (simula comportamiento tipo plataforma real)
    const baseEvents = [
      {
        title: "Champions League - Partido destacado",
        time: "21:00",
        category: "Fútbol",
        platform: "Movistar+",
        date: today,
        featured: true,
      },
      {
        title: "LaLiga EA Sports",
        time: "19:30",
        category: "Fútbol",
        platform: "DAZN",
        date: today,
        featured: false,
      },
      {
        title: "UFC Fight Night Main Card",
        time: "22:00",
        category: "UFC",
        platform: "DAZN",
        date: today,
        featured: true,
      },
      {
        title: "MotoGP Clasificación",
        time: "17:00",
        category: "Motos",
        platform: "DAZN",
        date: today,
        featured: false,
      },
    ];

    // 3. insertar solo si no existen duplicados
    const { error } = await supabase
      .from("events")
      .insert(baseEvents);

    if (error) {
      return Response.json({
        ok: false,
        error: error.message,
      });
    }

    return Response.json({
      ok: true,
      message: "Eventos generados con sistema inteligente",
    });
  } catch (err: any) {
    return Response.json({
      ok: false,
      error: err.message,
    });
  }
}