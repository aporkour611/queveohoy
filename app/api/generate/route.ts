import { supabase } from "@/app/lib/supabase";

export async function GET() {
  const sampleEvents = [
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

  const { error } = await supabase.from("events").insert(sampleEvents);

  if (error) {
    return Response.json({ ok: false, error });
  }

  return Response.json({ ok: true });
}