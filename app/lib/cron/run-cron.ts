import { isCronAuthorized } from "@/app/lib/admin-auth";
import { BLOCKED_SPORT_IDS } from "@/app/lib/blocked-sports";
import { createSupabaseAdmin } from "@/app/lib/supabase-admin";
import { NextResponse } from "next/server";
import { defaultChannelsForCompetition } from "@/app/lib/channels";
import {
  needsCrestEnrichment,
  prepareEventsForImport,
  type CronEventInput,
} from "@/app/lib/cron-events";
import { isPlaceholderTeamName } from "@/app/lib/event-quality";
import { dedupeEvents, findDuplicateIdsToRemove, type EventRecord } from "@/app/lib/dedupe-events";
import { eventHasTeamCrests } from "@/app/lib/event-crests";
import { enrichEventCrests } from "@/app/lib/event-enrich";
import { ensureEventsDateIndex } from "@/app/lib/ensure-db-index";
import {
  isValidPandascoreMatchForImport,
  pandascoreMatchCompetition,
  PANDASCORE_ESPORTS_GAMES,
  PANDASCORE_MAX_PAGES,
  PANDASCORE_PER_PAGE,
} from "@/app/lib/esports-cron";
import { encodeEsportsSource, pandascoreTeamLogo } from "@/app/lib/esports";
import { fetchJsonWithTimeout } from "@/app/lib/fetch-json";
import { fetchJikanAnimeEventsForWeek } from "@/app/lib/jikan-anime";
import { fetchTmdbEventsForWeek } from "@/app/lib/tmdb";
import { fetchRealityCronEvents } from "@/app/lib/tmdb-reality";
import { fetchSpanishTvScheduleEvents } from "@/app/lib/spanish-tv-schedule";
import { fetchBasketballCronEvents } from "@/app/lib/balldontlie";
import { fetchMotogpCronEvents } from "@/app/lib/motogp";
import { fetchRallyCronEvents } from "@/app/lib/rally";
import { fetchTheSportsDbLeagueEvents } from "@/app/lib/thesportsdb-leagues";
import { fetchUfcCronEvents } from "@/app/lib/thesportsdb-ufc";
import { pingIndexNow } from "@/app/lib/indexnow";
import { warmFeedCacheAfterCron } from "@/app/lib/revalidate-feed";
import {
  ergastToMadrid,
  addDaysToDateKey,
  getMadridWeekDates,
  madridWeekUtcRange,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "@/app/lib/madrid-time";
import { purgePastDayEvents } from "@/app/lib/purge-past-events";
import { evaluateCronHealth, sendCronAlert } from "@/app/lib/cron-alerts";

function getSupabase() {
  return createSupabaseAdmin();
}

function getWeekDates() {
  return getMadridWeekDates(7);
}

type CountResult = { count: number; error?: string; dateFrom?: string; dateTo?: string; errors?: string[] };

const FOOTBALL_COMPETITIONS = ["PD", "CL", "PL", "BL1", "SA", "WC", "FL1", "EL", "ECL", "CDR"];
const CRON_ROW_SELECT =
  "id, title, date, time, sport, home_team, away_team, external_id, source, platform, competition";
const MAX_CREST_ENRICH = 20;

type FootballMatch = {
  id: number;
  utcDate: string;
  stage?: string;
  homeTeam: { id: number; name: string; shortName?: string };
  awayTeam: { id: number; name: string; shortName?: string };
  competition: { name: string };
};

async function upsertEvents(events: CronEventInput[]) {
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
  const dates = getWeekDates();
  const dateFrom = dates[0];
  const dateTo = dates[6];
  const events: CronEventInput[] = [];
  const errors: string[] = [];
  const token = process.env.FOOTBALL_DATA_API_KEY?.trim();

  if (!token) {
    return { count: 0, dateFrom, dateTo, errors: ["FOOTBALL_DATA_API_KEY missing"] };
  }

  const results = await Promise.allSettled(
    FOOTBALL_COMPETITIONS.map(async (comp) => {
      const result = await fetchJsonWithTimeout<{ matches?: FootballMatch[]; message?: string }>(
        `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        { headers: { "X-Auth-Token": token } },
        18_000
      );

      if (!result.ok || !result.data?.matches) {
        errors.push(`${comp}: ${result.error ?? "sin datos"}`);
        return;
      }

      for (const match of result.data.matches) {
        const homeName = match.homeTeam.shortName || match.homeTeam.name;
        const awayName = match.awayTeam.shortName || match.awayTeam.name;
        if (
          isPlaceholderTeamName(match.homeTeam.name) ||
          isPlaceholderTeamName(match.awayTeam.name) ||
          isPlaceholderTeamName(homeName) ||
          isPlaceholderTeamName(awayName)
        ) {
          continue;
        }

        const utcDate = parseUtcIso(match.utcDate);
        const { date, time } = splitToMadrid(utcDate);
        events.push({
          external_id: `football_${match.id}`,
          title: `${homeName} vs ${awayName}`,
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
    })
  );

  for (const result of results) {
    if (result.status === "rejected") {
      errors.push(String(result.reason));
    }
  }

  const unique = dedupeEvents(events as EventRecord[]);
  const prepared = await prepareEventsForImport(unique);
  const upsertError = await upsertEvents(prepared);
  if (upsertError) errors.push(`upsert: ${upsertError}`);
  console.log(`Football: ${prepared.length}/${unique.length} eventos`);
  return { count: prepared.length, dateFrom, dateTo, errors };
}

async function fetchF1(): Promise<CountResult> {
  try {
    const result = await fetchJsonWithTimeout<{ MRData?: { RaceTable?: { Races?: ErgastRace[] } } }>(
      "https://api.jolpi.ca/ergast/f1/2026/races.json",
      undefined,
      15_000
    );
    if (!result.ok || !result.data) {
      return { count: 0, error: result.error ?? "F1 sin datos" };
    }

    const races = result.data.MRData?.RaceTable?.Races || [];
    const dates = getWeekDates();
    const events: CronEventInput[] = [];

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

async function fetchRally(): Promise<CountResult> {
  try {
    const events = await fetchRallyCronEvents(7);
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`Rally WRC: ${events.length} eventos`);
    return { count: events.length, error: undefined };
  } catch (e) {
    console.error("Error fetching Rally:", e);
    return { count: 0, error: String(e) };
  }
}

async function fetchLeagueSports(): Promise<CountResult> {
  try {
    const events = await fetchTheSportsDbLeagueEvents(7);
    const upsertError = await upsertEvents(events);
    if (upsertError) return { count: events.length, error: upsertError };
    console.log(`TheSportsDB ligas: ${events.length} eventos (${events.filter((e) => e.sport === "tenis").length} tenis)`);
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

async function purgeOutOfWindowScheduleEvents(
  dateFrom: string,
  dateTo: string,
  prefixes: string[]
): Promise<{ purged: number; error?: string }> {
  const graceStart = addDaysToDateKey(dateFrom, -3);
  const graceEnd = addDaysToDateKey(dateTo, 3);

  const { data, error } = await getSupabase()
    .from("events")
    .select("id, external_id, date")
    .eq("sport", "tv");

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids =
    data
      ?.filter((row) => {
        if (!row.external_id || !row.date) return false;
        if (!prefixes.some((prefix) => row.external_id!.startsWith(prefix))) {
          return false;
        }
        return row.date < graceStart || row.date > graceEnd;
      })
      .map((row) => row.id) ?? [];

  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    return { purged: 0, error: delError.message };
  }

  return { purged: ids.length };
}

async function fetchSpanishTv(): Promise<{ count: number; purged: number; error?: string }> {
  try {
    const { events, error } = await fetchSpanishTvScheduleEvents(7);
    if (error) {
      console.error("Spanish TV schedule:", error);
    }

    const upsertError = events.length ? await upsertEvents(events) : null;
    if (upsertError) {
      return { count: 0, purged: 0, error: upsertError };
    }

    const dates = getWeekDates();
    const purge = await purgeOutOfWindowScheduleEvents(
      dates[0],
      dates[dates.length - 1],
      ["tvmaze_", "rtve_", "curated_tv_"]
    );

    console.log(
      `TV España (TVmaze/RTVE): ${events.length} eventos (${purge.purged} fuera de ventana)`
    );
    return { count: events.length, purged: purge.purged, error };
  } catch (e) {
    console.error("Error fetching Spanish TV schedule:", e);
    return { count: 0, purged: 0, error: String(e) };
  }
}

type ErgastRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Qualifying?: { date: string; time?: string };
};

type PandaScoreOpponent = Parameters<typeof pandascoreTeamLogo>[0] & {
  name?: string;
};

type PandaScoreMatch = {
  id: number;
  begin_at?: string;
  opponents?: Array<{ opponent?: PandaScoreOpponent }>;
  league?: { name?: string; tier?: string };
  serie?: { full_name?: string; tier?: string };
  tournament?: { name?: string; tier?: string };
};

const ESPORTS_GAME_CONFIG = PANDASCORE_ESPORTS_GAMES;

async function fetchEsports(): Promise<CountResult> {
  const { dates, from: dateFrom, to: dateTo } = madridWeekUtcRange(7);
  const events: CronEventInput[] = [];
  const errors: string[] = [];
  const token = process.env.PANDASCORE_API_KEY?.trim();

  if (!token) {
    return { count: 0, error: "PANDASCORE_API_KEY missing" };
  }

  const results = await Promise.allSettled(
    ESPORTS_GAME_CONFIG.map(async (game) => {
      const matches: PandaScoreMatch[] = [];

      for (let page = 1; page <= PANDASCORE_MAX_PAGES; page += 1) {
        const result = await fetchJsonWithTimeout<PandaScoreMatch[]>(
          `https://api.pandascore.co/matches?filter[videogame]=${game.slug}&range[begin_at]=${dateFrom},${dateTo}&per_page=${PANDASCORE_PER_PAGE}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } },
          18_000
        );

        if (!result.ok || !Array.isArray(result.data)) {
          errors.push(`${game.slug} p${page}: ${result.error ?? "sin datos"}`);
          break;
        }

        matches.push(...result.data);
        if (result.data.length < PANDASCORE_PER_PAGE) break;
      }

      for (const match of matches) {
        if (!match.begin_at) continue;
        if (!isValidPandascoreMatchForImport(match)) continue;

        const { date, time } = splitToMadrid(parseUtcIso(String(match.begin_at)));
        if (!dates.includes(date)) continue;

        const team1 = match.opponents?.[0]?.opponent?.name?.trim();
        const team2 = match.opponents?.[1]?.opponent?.name?.trim();
        if (
          !team1 ||
          !team2 ||
          isPlaceholderTeamName(team1) ||
          isPlaceholderTeamName(team2)
        ) {
          continue;
        }

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
          competition: pandascoreMatchCompetition(match),
          platform: "Twitch, YouTube",
          source: encodeEsportsSource(homeLogo, awayLogo),
        });
      }
    })
  );

  for (const result of results) {
    if (result.status === "rejected") {
      errors.push(String(result.reason));
    }
  }

  const unique = dedupeEvents(events as EventRecord[]);
  const prepared = await prepareEventsForImport(unique);
  const upsertError = await upsertEvents(prepared);
  if (upsertError) errors.push(`upsert: ${upsertError}`);
  console.log(`E-Sports: ${prepared.length}/${unique.length} eventos`);
  return {
    count: prepared.length,
    error: errors.length ? errors.join("; ") : undefined,
  };
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

/** Elimina de BD deportes/juegos bloqueados (p. ej. Dota 2 legacy). */
async function purgeBlockedSportEvents(): Promise<{ purged: number; error?: string }> {
  const { data, error } = await getSupabase()
    .from("events")
    .select("id")
    .in("sport", [...BLOCKED_SPORT_IDS]);

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids = (data ?? []).map((row) => row.id);
  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    console.error("Blocked sports purge error:", delError);
    return { purged: 0, error: delError.message };
  }

  console.log(`Eventos de deportes bloqueados eliminados: ${ids.length}`);
  return { purged: ids.length };
}

/** Solo borra TMDB fuera de ventana; no toca fútbol, e-sports ni tenis. */
async function purgeOutOfWindowTmdbEvents(
  dateFrom: string,
  dateTo: string
): Promise<{ purged: number; error?: string }> {
  const graceStart = addDaysToDateKey(dateFrom, -21);
  const graceEnd = addDaysToDateKey(dateTo, 21);

  const { data, error } = await getSupabase()
    .from("events")
    .select("id, external_id, date")
    .like("external_id", "tmdb_%");

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids =
    data
      ?.filter((row) => {
        if (!row.date) return false;
        return row.date < graceStart || row.date > graceEnd;
      })
      .map((row) => row.id) ?? [];

  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    return { purged: 0, error: delError.message };
  }

  console.log(`TMDB fuera de ventana eliminados: ${ids.length}`);
  return { purged: ids.length };
}

async function purgeOutOfWindowJikanEvents(
  dateFrom: string,
  dateTo: string
): Promise<{ purged: number; error?: string }> {
  const graceStart = addDaysToDateKey(dateFrom, -7);
  const graceEnd = addDaysToDateKey(dateTo, 7);

  const { data, error } = await getSupabase()
    .from("events")
    .select("id, external_id, date")
    .like("external_id", "jikan_%");

  if (error) {
    return { purged: 0, error: error.message };
  }

  const ids =
    data
      ?.filter((row) => {
        if (!row.date) return false;
        return row.date < graceStart || row.date > graceEnd;
      })
      .map((row) => row.id) ?? [];

  if (!ids.length) return { purged: 0 };

  const { error: delError } = await getSupabase()
    .from("events")
    .delete()
    .in("id", ids);

  if (delError) {
    return { purged: 0, error: delError.message };
  }

  console.log(`Jikan fuera de ventana eliminados: ${ids.length}`);
  return { purged: ids.length };
}

async function fetchAnime(): Promise<{
  count: number;
  purged: number;
  error?: string;
}> {
  try {
    const { events, error } = await fetchJikanAnimeEventsForWeek(7);
    if (error) {
      console.error("Jikan:", error);
    }

    const upsertError = events.length ? await upsertEvents(events) : null;
    if (upsertError) {
      return { count: 0, purged: 0, error: upsertError };
    }

    const dates = getWeekDates();
    const purge = await purgeOutOfWindowJikanEvents(
      dates[0],
      dates[dates.length - 1]
    );

    console.log(`Jikan: ${events.length} anime (${purge.purged} fuera de ventana)`);
    return { count: events.length, purged: purge.purged, error };
  } catch (e) {
    console.error("Error fetching Jikan:", e);
    return { count: 0, purged: 0, error: String(e) };
  }
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

    const events = [...movies, ...series];
    const upsertError = await upsertEvents(events);
    if (upsertError) {
      return {
        movies: movies.length,
        series: series.length,
        purged: 0,
        error: upsertError,
      };
    }

    const dates = getWeekDates();
    const purge = await purgeOutOfWindowTmdbEvents(
      dates[0],
      dates[dates.length - 1]
    );

    console.log(
      `TMDB: ${movies.length} cine, ${series.length} series (${purge.purged} fuera de ventana)`
    );
    return { movies: movies.length, series: series.length, purged: purge.purged };
  } catch (e) {
    console.error("Error fetching TMDB:", e);
    return { movies: 0, series: 0, purged: 0, error: String(e) };
  }
}

async function removeDuplicateRows() {
  const { data, error } = await getSupabase().from("events").select(CRON_ROW_SELECT);
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
  const { data, error } = await getSupabase().from("events").select(CRON_ROW_SELECT);
  if (error || !data?.length) {
    return { enriched: 0, error: error?.message };
  }

  let enriched = 0;
  let processed = 0;

  for (const row of data) {
    if (!needsCrestEnrichment(row)) continue;
    if (processed >= MAX_CREST_ENRICH) break;
    processed++;

    const updated = await enrichEventCrests(row, 2);
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

export async function runCronJob(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("=== CRON INICIADO ===");
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING");
  console.log("Football key:", process.env.FOOTBALL_DATA_API_KEY ? "OK" : "MISSING");
  console.log("Pandascore key:", process.env.PANDASCORE_API_KEY ? "OK" : "MISSING");
  console.log("TMDB key:", process.env.TMDB_API_KEY ? "OK" : "MISSING");
  console.log("Balldontlie key:", process.env.BALLDONTLIE_API_KEY ? "OK" : "MISSING");

  let dbIndex: Awaited<ReturnType<typeof ensureEventsDateIndex>> = {
    ok: false,
    skipped: true,
  };
  try {
    dbIndex = await ensureEventsDateIndex();
    if (dbIndex.ok) console.log("✓ events_date_time_idx OK");
    else if (!dbIndex.skipped) console.warn("DB index:", dbIndex.error);
  } catch (e) {
    console.warn("DB index error:", e);
  }

  let pastDayPurge: Awaited<ReturnType<typeof purgePastDayEvents>> = {
    purged: 0,
    todayKey: toMadridDateKey(new Date()),
  };
  try {
    pastDayPurge = await purgePastDayEvents(getSupabase());
    if (pastDayPurge.purged > 0) {
      console.log(
        `✓ Eventos anteriores a ${pastDayPurge.todayKey} eliminados: ${pastDayPurge.purged}`
      );
    }
  } catch (e) {
    console.error("✗ Purge past day error:", e);
    pastDayPurge.error = String(e);
  }

  let football = { count: 0, dateFrom: "", dateTo: "", errors: [] as string[] };
  let esports: CountResult = { count: 0 };
  let f1: CountResult = { count: 0 };
  let motos: CountResult = { count: 0 };
  let rally: CountResult = { count: 0 };
  let leagues: CountResult = { count: 0 };
  let basket: CountResult = { count: 0 };
  let tmdb: { movies: number; series: number; purged: number; error?: string } = {
    movies: 0,
    series: 0,
    purged: 0,
  };
  let reality: CountResult = { count: 0 };
  let spanishTv: { count: number; purged: number; error?: string } = {
    count: 0,
    purged: 0,
  };
  let ufc: CountResult = { count: 0 };
  let anime: { count: number; purged: number; error?: string } = {
    count: 0,
    purged: 0,
  };

  // TheSportsDB rate-limita si tenis compite con el resto de fuentes en paralelo
  try {
    leagues = await fetchLeagueSports();
  } catch (e) {
    console.error("Error fetching TheSportsDB leagues (prefetch):", e);
  }

  const ingest = await Promise.allSettled([
    fetchFootball(),
    fetchEsports(),
    fetchF1(),
    fetchMotos(),
    fetchRally(),
    fetchBasketball(),
    fetchTmdb(),
    fetchAnime(),
    fetchRealityTv(),
    fetchSpanishTv(),
    fetchUfc(),
  ]);

  if (ingest[0].status === "fulfilled") football = ingest[0].value;
  else football.errors.push(String(ingest[0].reason));

  if (ingest[1].status === "fulfilled") esports = ingest[1].value;
  if (ingest[2].status === "fulfilled") f1 = ingest[2].value;
  if (ingest[3].status === "fulfilled") motos = ingest[3].value;
  if (ingest[4].status === "fulfilled") rally = ingest[4].value;
  if (ingest[5].status === "fulfilled") basket = ingest[5].value;
  if (ingest[6].status === "fulfilled") tmdb = ingest[6].value;
  if (ingest[7].status === "fulfilled") anime = ingest[7].value;
  if (ingest[8].status === "fulfilled") reality = ingest[8].value;
  if (ingest[9].status === "fulfilled") spanishTv = ingest[9].value;
  if (ingest[10].status === "fulfilled") ufc = ingest[10].value;

  console.log("✓ Ingesta paralela completada");

  let enrich: { enriched: number; error?: string } = { enriched: 0 };
  try {
    enrich = await enrichImportantEventsMissingCrests();
    console.log("✓ Crest enrich done");
  } catch (e) {
    console.error("✗ Crest enrich error:", e);
  }

  let dedupe: { removed: number; error?: string } = { removed: 0 };
  try {
    dedupe = await removeDuplicateRows();
    console.log("✓ Dedupe done");
  } catch (e) {
    console.error("✗ Dedupe error:", e);
  }

  let blockedSportsPurge: { purged: number; error?: string } = { purged: 0 };
  try {
    blockedSportsPurge = await purgeBlockedSportEvents();
    if (blockedSportsPurge.purged > 0) {
      console.log(`✓ Blocked sports purge: ${blockedSportsPurge.purged}`);
    }
  } catch (e) {
    console.error("✗ Blocked sports purge error:", e);
  }

  console.log("=== CRON TERMINADO ===");

  let indexNow: Awaited<ReturnType<typeof pingIndexNow>> = {
    ok: false,
    skipped: true,
  };
  try {
    indexNow = await pingIndexNow();
    if (indexNow.ok) {
      console.log("✓ IndexNow ping OK");
    } else if (!indexNow.skipped) {
      console.warn("IndexNow ping:", indexNow.error ?? indexNow.status);
    }
  } catch (e) {
    console.warn("IndexNow error:", e);
  }

  let feedCache: Awaited<ReturnType<typeof warmFeedCacheAfterCron>> = {
    ok: false,
    error: "skipped",
  };
  try {
    feedCache = await warmFeedCacheAfterCron();
    if (feedCache.ok) {
      console.log("✓ Feed cache warmed");
    } else {
      console.warn("Feed cache warm:", feedCache.error);
    }
  } catch (e) {
    console.warn("Feed cache warm error:", e);
  }

  const supabaseConfigured = Boolean(
    (process.env.SUPABASE_URL?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );

  const cronResult = {
    ok: true,
    supabaseConfigured,
    timestamp: new Date().toISOString(),
    dbIndex,
    pastDayPurged: pastDayPurge.purged,
    pastDayPurgeDate: pastDayPurge.todayKey,
    pastDayPurgeError: pastDayPurge.error,
    indexNow,
    feedCache,
    football,
    esports: esports.count,
    esportsError: esports.error,
    f1: f1.count,
    f1Error: f1.error,
    motos: motos.count,
    motosError: motos.error,
    rally: rally.count,
    rallyError: rally.error,
    tenisCiclismo: leagues.count,
    tenisCiclismoError: leagues.error,
    basket: basket.count,
    basketError: basket.error,
    tmdbMovies: tmdb.movies,
    tmdbSeries: tmdb.series,
    tmdbPurged: tmdb.purged,
    tmdbError: tmdb.error,
    anime: anime.count,
    animePurged: anime.purged,
    animeError: anime.error,
    reality: reality.count,
    realityError: reality.error,
    spanishTv: spanishTv.count,
    spanishTvPurged: spanishTv.purged,
    spanishTvError: spanishTv.error,
    ufc: ufc.count,
    ufcError: ufc.error,
    crestsEnriched: enrich.enriched,
    crestEnrichError: enrich.error,
    crestsPurged: 0,
    blockedSportsPurged: blockedSportsPurge.purged,
    blockedSportsPurgeError: blockedSportsPurge.error,
    esportsPurged: 0,
    duplicatesRemoved: dedupe.removed,
    dedupeError: dedupe.error,
    hint: !supabaseConfigured
      ? "Configura SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY en Vercel (Production)."
      : football.count === 0
        ? "La API respondió pero no hay partidos en este rango de fechas (fin de temporada). Prueba otro día en la UI."
        : undefined,
  };

  try {
    for (const alert of evaluateCronHealth(cronResult)) {
      await sendCronAlert(alert);
    }
  } catch (e) {
    console.warn("Cron health alerts failed:", e);
  }

  return NextResponse.json(cronResult);
}