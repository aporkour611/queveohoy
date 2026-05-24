import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function getWeekDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return formatDate(d);
  });
}

async function upsertEvents(events: any[]) {
  if (!events.length) return;
  const { error } = await getSupabase()
    .from("events")
    .upsert(events, { onConflict: "external_id", ignoreDuplicates: false });
  if (error) console.error("Upsert error:", error);
}

async function fetchFootball() {
  const competiciones = ["PD", "CL", "PL", "BL1", "SA"];
  const dates = getWeekDates();
  const dateFrom = dates[0];
  const dateTo = dates[6];
  const events: any[] = [];

  for (const comp of competiciones) {
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! } }
      );
      const data = await res.json();
      console.log(`${comp} response:`, JSON.stringify(data).slice(0, 200));
      if (!data.matches) continue;

      for (const match of data.matches) {
        const utcDate = new Date(match.utcDate);
        events.push({
          external_id: `football_${match.id}`,
          title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          date: formatDate(utcDate),
          time: utcDate.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid",
          }),
          sport: "futbol",
          category: "deportes",
          competition: match.competition.name,
          platform: "DAZN",
          source: "football-data",
        });
      }
    } catch (e) {
      console.error(`Error fetching ${comp}:`, e);
    }
  }

  await upsertEvents(events);
  console.log(`Football: ${events.length} eventos`);
}

async function fetchF1() {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/2025/races.json");
    const data = await res.json();
    console.log("F1 response:", JSON.stringify(data).slice(0, 200));
    const races = data?.MRData?.RaceTable?.Races || [];
    const dates = getWeekDates();
    const events: any[] = [];

    for (const race of races) {
      const raceDate = race.date;
      if (!dates.includes(raceDate)) continue;

      events.push({
        external_id: `f1_${race.season}_${race.round}_race`,
        title: `F1 — ${race.raceName}`,
        date: raceDate,
        time: race.time ? race.time.slice(0, 5) : "15:00",
        sport: "formula1",
        category: "deportes",
        competition: "Fórmula 1",
        platform: "DAZN F1",
        source: "jolpica",
      });

      if (race.Qualifying) {
        events.push({
          external_id: `f1_${race.season}_${race.round}_qualy`,
          title: `F1 Clasificación — ${race.raceName}`,
          date: race.Qualifying.date,
          time: race.Qualifying.time ? race.Qualifying.time.slice(0, 5) : "15:00",
          sport: "formula1",
          category: "deportes",
          competition: "Fórmula 1",
          platform: "DAZN F1",
          source: "jolpica",
        });
      }
    }

    await upsertEvents(events);
    console.log(`F1: ${events.length} eventos`);
  } catch (e) {
    console.error("Error fetching F1:", e);
  }
}

async function fetchEsports() {
  const games = [
    { slug: "cs-go", sport: "csgo" },
    { slug: "valorant", sport: "valorant" },
    { slug: "league-of-legends", sport: "lol" },
    { slug: "dota-2", sport: "dota2" },
  ];

  const dates = getWeekDates();
  const dateFrom = dates[0] + "T00:00:00Z";
  const dateTo = dates[6] + "T23:59:59Z";
  const events: any[] = [];

  for (const game of games) {
    try {
      const res = await fetch(
        `https://api.pandascore.co/matches?filter[videogame]=${game.slug}&range[begin_at]=${dateFrom},${dateTo}&per_page=50`,
        { headers: { Authorization: `Bearer ${process.env.PANDASCORE_API_KEY}` } }
      );
      const data = await res.json();
      console.log(`Esports ${game.slug}:`, JSON.stringify(data).slice(0, 200));
      if (!Array.isArray(data)) continue;

      for (const match of data) {
        if (!match.begin_at) continue;
        const dt = new Date(match.begin_at);
        const team1 = match.opponents?.[0]?.opponent?.name || "TBD";
        const team2 = match.opponents?.[1]?.opponent?.name || "TBD";

        events.push({
          external_id: `esports_${match.id}`,
          title: `${team1} vs ${team2}`,
          home_team: team1,
          away_team: team2,
          date: formatDate(dt),
          time: dt.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Madrid",
          }),
          sport: game.sport,
          category: "esports",
          competition: match.league?.name || match.serie?.full_name || "",
          platform: "Twitch",
          source: "pandascore",
        });
      }
    } catch (e) {
      console.error(`Error fetching esports ${game.slug}:`, e);
    }
  }

  await upsertEvents(events);
  console.log(`E-Sports: ${events.length} eventos`);
}

export async function GET(request: Request) {
  console.log("=== CRON INICIADO ===");

  try {
    await fetchFootball();
    console.log("✓ Football done");
  } catch (e) {
    console.error("✗ Football error:", e);
  }

  try {
    await fetchF1();
    console.log("✓ F1 done");
  } catch (e) {
    console.error("✗ F1 error:", e);
  }

  try {
    await fetchEsports();
    console.log("✓ Esports done");
  } catch (e) {
    console.error("✗ Esports error:", e);
  }

  console.log("=== CRON TERMINADO ===");

  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}