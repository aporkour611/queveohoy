import { createSupabaseAdmin } from "@/app/lib/supabase-admin";
import { NextResponse } from "next/server";
import { defaultChannelsForCompetition } from "@/app/lib/channels";
import { dedupeEvents, findDuplicateIdsToRemove } from "@/app/lib/dedupe-events";
import { encodeEsportsSource, pandascoreTeamLogo } from "@/app/lib/esports";
import {
  ergastToMadrid,
  getMadridWeekDates,
  madridWeekUtcRange,
  parseUtcIso,
  splitToMadrid,
} from "@/app/lib/madrid-time";

function getSupabase() {
  return createSupabaseAdmin();
}

function getWeekDates() {
  return getMadridWeekDates(7);
}

async function upsertEvents(events: any[]) {
  if (!events.length) return null;
  const { error } = await getSupabase()
    .from("events")
    .upsert(events, { onConflict: "external_id", ignoreDuplicates: false });
  if (error) {
    console.error("Upsert error:", error);
    return error.message;
  }
  return null;
}

async function fetchFootball() {
  const competiciones = ["PD", "CL", "PL", "BL1", "SA", "WC", "FL1"];
  const dates = getWeekDates();
  const dateFrom = dates[0];
  const dateTo = dates[6];
  const events: any[] = [];
  const errors: string[] = [];

  for (const comp of competiciones) {
    try {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! } }
      );
      const data = await res.json();
      console.log(`${comp} response:`, JSON.stringify(data).slice(0, 200));
      if (!res.ok) {
        errors.push(`${comp}: HTTP ${res.status} — ${data.message || "error"}`);
        continue;
      }
      if (!data.matches) continue;

      for (const match of data.matches) {
        const utcDate = parseUtcIso(match.utcDate);
        const { date, time } = splitToMadrid(utcDate);
        events.push({
          external_id: `football_${match.id}`,
          title: `${match.homeTeam.shortName || match.homeTeam.name} vs ${match.awayTeam.shortName || match.awayTeam.name}`,
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          date,
          time,
          sport: "futbol",
          category: "deportes",
          competition:
            match.stage === "FINAL"
              ? `${match.competition.name} · Final`
              : match.competition.name,
          platform: defaultChannelsForCompetition(match.competition.name),
          source: `football-data:${match.homeTeam.id}:${match.awayTeam.id}`,
        });
      }
    } catch (e) {
      console.error(`Error fetching ${comp}:`, e);
    }
  }

  const unique = dedupeEvents(events);
  const upsertError = await upsertEvents(unique);
  if (upsertError) errors.push(`upsert: ${upsertError}`);
  console.log(`Football: ${unique.length} eventos`);
  return { count: unique.length, dateFrom, dateTo, errors };
}

async function fetchF1() {
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/2026/races.json");
    const data = await res.json();
    console.log("F1 response:", JSON.stringify(data).slice(0, 200));
    const races = data?.MRData?.RaceTable?.Races || [];
    const dates = getWeekDates();
    const events: any[] = [];

    for (const race of races) {
      const raceMadrid = ergastToMadrid(race.date, race.time);
      if (!dates.includes(raceMadrid.date)) continue;

      events.push({
        external_id: `f1_${race.season}_${race.round}_race`,
        title: `F1 — ${race.raceName}`,
        date: raceMadrid.date,
        time: raceMadrid.time,
        sport: "formula1",
        category: "deportes",
        competition: "Fórmula 1",
        platform: "DAZN F1",
        source: "jolpica",
      });

      if (race.Qualifying) {
        const qMadrid = ergastToMadrid(race.Qualifying.date, race.Qualifying.time);
        events.push({
          external_id: `f1_${race.season}_${race.round}_qualy`,
          title: `F1 Clasificación — ${race.raceName}`,
          date: qMadrid.date,
          time: qMadrid.time,
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

  const { dates, from: dateFrom, to: dateTo } = madridWeekUtcRange(7);
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
        const { date, time } = splitToMadrid(parseUtcIso(match.begin_at));
        const team1 = match.opponents?.[0]?.opponent?.name || "TBD";
        const team2 = match.opponents?.[1]?.opponent?.name || "TBD";
        const homeLogo = pandascoreTeamLogo(match.opponents?.[0]?.opponent);
        const awayLogo = pandascoreTeamLogo(match.opponents?.[1]?.opponent);

        events.push({
          external_id: `esports_${match.id}`,
          title: `${team1} vs ${team2}`,
          home_team: team1,
          away_team: team2,
          date,
          time,
          sport: game.sport,
          category: "esports",
          competition: match.league?.name || match.serie?.full_name || "",
          platform: "Twitch",
          source: encodeEsportsSource(homeLogo, awayLogo),
        });
      }
    } catch (e) {
      console.error(`Error fetching esports ${game.slug}:`, e);
    }
  }

  const unique = dedupeEvents(events);
  await upsertEvents(unique);
  console.log(`E-Sports: ${unique.length} eventos`);
}

async function removeDuplicateRows() {
  const { data, error } = await getSupabase().from("events").select("*");
  if (error || !data?.length) {
    console.error("Dedupe fetch error:", error);
    return { removed: 0, error: error?.message };
  }

  const ids = findDuplicateIdsToRemove(data);
  if (!ids.length) return { removed: 0 };

  const { error: delError } = await getSupabase().from("events").delete().in("id", ids);
  if (delError) {
    console.error("Dedupe delete error:", delError);
    return { removed: 0, error: delError.message };
  }

  console.log(`Duplicados eliminados: ${ids.length}`);
  return { removed: ids.length };
}

export async function GET() {
  console.log("=== CRON INICIADO ===");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING");
  console.log("Football key:", process.env.FOOTBALL_DATA_API_KEY ? "OK" : "MISSING");
  console.log("Pandascore key:", process.env.PANDASCORE_API_KEY ? "OK" : "MISSING");

  let football = { count: 0, dateFrom: "", dateTo: "", errors: [] as string[] };

  try {
    football = await fetchFootball();
    console.log("✓ Football done");
  } catch (e) {
    console.error("✗ Football error:", e);
    football.errors.push(String(e));
  }

  try {
    await fetchEsports();
    console.log("✓ Esports done");
  } catch (e) {
    console.error("✗ Esports error:", e);
  }

  let dedupe: { removed: number; error?: string } = { removed: 0 };
  try {
    dedupe = await removeDuplicateRows();
    console.log("✓ Dedupe done");
  } catch (e) {
    console.error("✗ Dedupe error:", e);
  }

  console.log("=== CRON TERMINADO ===");

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    football,
    duplicatesRemoved: dedupe.removed,
    dedupeError: dedupe.error,
    hint:
      football.count === 0
        ? "La API respondió pero no hay partidos en este rango de fechas (fin de temporada). Prueba otro día en la UI."
        : undefined,
  });
}