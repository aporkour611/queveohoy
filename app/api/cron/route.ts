import { isCronAuthorized } from "@/app/lib/admin-auth";
import { createSupabaseAdmin } from "@/app/lib/supabase-admin";
import { NextResponse } from "next/server";
import { defaultChannelsForCompetition } from "@/app/lib/channels";
import {
  needsCrestEnrichment,
  prepareEventsForImport,
  shouldPurgeEvent,
} from "@/app/lib/cron-events";
import { dedupeEvents, findDuplicateIdsToRemove } from "@/app/lib/dedupe-events";
import { eventHasTeamCrests } from "@/app/lib/event-crests";
import { enrichEventCrests } from "@/app/lib/event-enrich";
import { encodeEsportsSource, pandascoreTeamLogo } from "@/app/lib/esports";
import { fetchTmdbEventsForWeek } from "@/app/lib/tmdb";
import { fetchRealityCronEvents } from "@/app/lib/tmdb-reality";
import { fetchBasketballCronEvents } from "@/app/lib/balldontlie";
import { fetchMotogpCronEvents } from "@/app/lib/motogp";
import { fetchTheSportsDbLeagueEvents } from "@/app/lib/thesportsdb-leagues";
import { fetchUfcCronEvents } from "@/app/lib/thesportsdb-ufc";
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

type CountResult = { count: number; error?: string };

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
  const prepared = await prepareEventsForImport(unique);
  const upsertError = await upsertEvents(prepared);
  if (upsertError) errors.push(`upsert: ${upsertError}`);
  console.log(`Football: ${prepared.length}/${unique.length} eventos`);
  return { count: prepared.length, dateFrom, dateTo, errors };
}

async function fetchF1(): Promise<CountResult> {
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
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching F1:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchMotos(): Promise<CountResult> {
  try {
    const events = await fetchMotogpCronEvents(7);
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`MotoGP: ${events.length} eventos`);
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching MotoGP:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchLeagueSports(): Promise<CountResult> {
  try {
    const events = await fetchTheSportsDbLeagueEvents(7);
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`TheSportsDB ligas: ${events.length} eventos`);
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching TheSportsDB leagues:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchBasketball(): Promise<CountResult> {
  try {
    const { events, error } = await fetchBasketballCronEvents(7);
    if (error) {
      console.error("Balldontlie:", error);
      return { count: 0, error };
    }
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`Baloncesto: ${events.length} eventos`);
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching basketball:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchRealityTv(): Promise<CountResult> {
  try {
    const { events, error } = await fetchRealityCronEvents(7);
    if (error) {
      console.error("TMDB reality:", error);
      return { count: 0, error };
    }
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`Reality TV: ${events.length} eventos`);
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching reality TV:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchEsports() {
  const games = [
    { slug: "cs-go", sport: "csgo" },
    { slug: "valorant", sport: "valorant" },
    { slug: "league-of-legends", sport: "lol" },
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
  const prepared = await prepareEventsForImport(unique);
  await upsertEvents(prepared);
  console.log(`E-Sports: ${prepared.length}/${unique.length} eventos`);
}

async function fetchUfc(): Promise<{ count: number; error?: string }> {
  try {
    const events = await fetchUfcCronEvents(7);
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`UFC: ${events.length} eventos`);
    return { count: events.length };
  } catch (e) {
    console.error("Error fetching UFC:", e);
    return { count: 0, error: String(e) };
  }
}

async function purgeStaleTmdbEvents(): Promise<{ purged: number; error?: string }> {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id, external_id");

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids =
    data
      ?.filter((row) => row.external_id?.startsWith("tmdb_"))
      .map((row) => row.id) ?? [];

  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    return { purged: 0, error: delError.message };
  }

  console.log(`TMDB antiguos eliminados: ${ids.length}`);
  return { purged: ids.length };
}

async function fetchTmdb(): Promise<{
  movies: number;
  series: number;
  purged: number;
  error?: string;
}> {
  try {
    const { movies, series, error } = await fetchTmdbEventsForWeek(7);
    if (error) {
      console.error("TMDB:", error);
      return { movies: 0, series: 0, purged: 0, error };
    }

    const purge = await purgeStaleTmdbEvents();
    const events = [...movies, ...series];
    const upsertError = await upsertEvents(events);
    if (upsertError) {
      return {
        movies: movies.length,
        series: series.length,
        purged: purge.purged,
        error: upsertError,
      };
    }

    console.log(
      `TMDB: ${movies.length} cine, ${series.length} series (${purge.purged} antiguos borrados)`
    );
    return { movies: movies.length, series: series.length, purged: purge.purged };
  } catch (e) {
    console.error("Error fetching TMDB:", e);
    return { movies: 0, series: 0, purged: 0, error: String(e) };
  }
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

async function enrichImportantEventsMissingCrests(): Promise<{
  enriched: number;
  error?: string;
}> {
  const { data, error } = await getSupabase().from("events").select("*");
  if (error || !data?.length) {
    return { enriched: 0, error: error?.message };
  }

  let enriched = 0;
  for (const row of data) {
    if (!needsCrestEnrichment(row)) continue;

    const updated = await enrichEventCrests(row, 3);
    if (!updated) continue;
    if (!eventHasTeamCrests(updated) && updated.source === row.source) continue;

    const { error: upError } = await getSupabase()
      .from("events")
      .update({
        home_team: updated.home_team,
        away_team: updated.away_team,
        source: updated.source,
      })
      .eq("id", row.id);

    if (!upError) {
      enriched++;
      console.log(`Escudos recuperados: ${updated.title}`);
    }
  }

  return { enriched };
}

async function purgeDota2Events(): Promise<{ purged: number; error?: string }> {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id")
    .eq("sport", "dota2");

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids = (data ?? []).map((e) => e.id);
  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    console.error("Dota2 purge error:", delError);
    return { purged: 0, error: delError.message };
  }

  console.log(`Eventos Dota 2 eliminados: ${ids.length}`);
  return { purged: ids.length };
}

async function purgeEventsWithoutCrests(): Promise<{
  purged: number;
  error?: string;
}> {
  const { data, error } = await getSupabase().from("events").select("*");
  if (error || !data?.length) {
    return { purged: 0, error: error?.message };
  }

  const ids = data.filter(shouldPurgeEvent).map((e) => e.id);
  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    console.error("Purge error:", delError);
    return { purged: 0, error: delError.message };
  }

  console.log(`Eventos sin escudo descartados: ${ids.length}`);
  return { purged: ids.length };
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("=== CRON INICIADO ===");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING");
  console.log("Football key:", process.env.FOOTBALL_DATA_API_KEY ? "OK" : "MISSING");
  console.log("Pandascore key:", process.env.PANDASCORE_API_KEY ? "OK" : "MISSING");
  console.log("TMDB key:", process.env.TMDB_API_KEY ? "OK" : "MISSING");
  console.log("Balldontlie key:", process.env.BALLDONTLIE_API_KEY ? "OK" : "MISSING");

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

  let f1: CountResult = { count: 0 };
  try {
    f1 = await fetchF1();
    console.log("✓ F1 done");
  } catch (e) {
    console.error("✗ F1 error:", e);
  }

  let motos: CountResult = { count: 0 };
  try {
    motos = await fetchMotos();
    console.log("✓ MotoGP done");
  } catch (e) {
    console.error("✗ MotoGP error:", e);
  }

  let leagues: CountResult = { count: 0 };
  try {
    leagues = await fetchLeagueSports();
    console.log("✓ Tenis/Ciclismo done");
  } catch (e) {
    console.error("✗ Tenis/Ciclismo error:", e);
  }

  let basket: CountResult = { count: 0 };
  try {
    basket = await fetchBasketball();
    console.log("✓ Baloncesto done");
  } catch (e) {
    console.error("✗ Baloncesto error:", e);
  }

  let tmdb: { movies: number; series: number; purged: number; error?: string } = {
    movies: 0,
    series: 0,
    purged: 0,
  };
  try {
    tmdb = await fetchTmdb();
    console.log("✓ TMDB done");
  } catch (e) {
    console.error("✗ TMDB error:", e);
  }

  let reality: CountResult = { count: 0 };
  try {
    reality = await fetchRealityTv();
    console.log("✓ Reality TV done");
  } catch (e) {
    console.error("✗ Reality TV error:", e);
  }

  let ufc: { count: number; error?: string } = { count: 0 };
  try {
    ufc = await fetchUfc();
    console.log("✓ UFC done");
  } catch (e) {
    console.error("✗ UFC error:", e);
  }

  let enrich: { enriched: number; error?: string } = { enriched: 0 };
  try {
    enrich = await enrichImportantEventsMissingCrests();
    console.log("✓ Crest enrich done");
  } catch (e) {
    console.error("✗ Crest enrich error:", e);
  }

  let dotaPurge: { purged: number; error?: string } = { purged: 0 };
  try {
    dotaPurge = await purgeDota2Events();
    console.log("✓ Dota 2 purge done");
  } catch (e) {
    console.error("✗ Dota 2 purge error:", e);
  }

  let purge: { purged: number; error?: string } = { purged: 0 };
  try {
    purge = await purgeEventsWithoutCrests();
    console.log("✓ Crest purge done");
  } catch (e) {
    console.error("✗ Crest purge error:", e);
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
    f1: f1.count,
    f1Error: f1.error,
    motos: motos.count,
    motosError: motos.error,
    tenisCiclismo: leagues.count,
    tenisCiclismoError: leagues.error,
    basket: basket.count,
    basketError: basket.error,
    tmdbMovies: tmdb.movies,
    tmdbSeries: tmdb.series,
    tmdbPurged: tmdb.purged,
    tmdbError: tmdb.error,
    reality: reality.count,
    realityError: reality.error,
    ufc: ufc.count,
    ufcError: ufc.error,
    crestsEnriched: enrich.enriched,
    crestEnrichError: enrich.error,
    crestsPurged: purge.purged,
    crestPurgeError: purge.error,
    dota2Purged: dotaPurge.purged,
    dota2PurgeError: dotaPurge.error,
    duplicatesRemoved: dedupe.removed,
    dedupeError: dedupe.error,
    hint:
      football.count === 0
        ? "La API respondió pero no hay partidos en este rango de fechas (fin de temporada). Prueba otro día en la UI."
        : undefined,
  });
}