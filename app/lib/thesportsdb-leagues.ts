import {
  getMadridWeekDates,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";
import { isPlaceholderTeamName } from "./event-quality";
import { fetchJsonWithTimeout } from "./fetch-json";
import {
  formatRolandGarrosCompetition,
  parseTennisMatchFromEventTitle,
} from "./roland-garros";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";

export type LeagueCronConfig = {
  leagueId: string;
  sport: "tenis" | "ciclismo";
  competition: string;
  platform: string;
  maxEvents: number;
};

/** TheSportsDB — gratis, ya usado para UFC. Mejor opción sin nueva API key. */
export const THESPORTSDB_LEAGUES: LeagueCronConfig[] = [
  {
    leagueId: "4464",
    sport: "tenis",
    competition: "ATP",
    platform: "Movistar+, DAZN, Eurosport",
    maxEvents: 16,
  },
  {
    leagueId: "4517",
    sport: "tenis",
    competition: "WTA",
    platform: "Movistar+, DAZN, Eurosport",
    maxEvents: 16,
  },
  {
    leagueId: "4465",
    sport: "ciclismo",
    competition: "UCI World Tour",
    platform: "Eurosport, GCN+, RTVE Deportes",
    maxEvents: 14,
  },
];

type RawEvent = {
  idEvent?: string;
  strEvent?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strTimeLocal?: string;
  strLeague?: string;
  strVenue?: string;
  strCountry?: string;
  strPoster?: string | null;
  strThumb?: string | null;
  strStatus?: string;
  strPostponed?: string;
  strHomeTeam?: string | null;
  strAwayTeam?: string | null;
  idLeague?: string | number | null;
};

export type LeagueCronEvent = {
  external_id: string;
  title: string;
  home_team?: string | null;
  away_team?: string | null;
  date: string;
  time: string;
  sport: "tenis" | "ciclismo";
  category: "deportes";
  competition: string;
  platform: string;
  source: string;
};

export function encodeLeagueSource(
  poster?: string | null,
  thumb?: string | null,
  leagueId?: string
): string {
  const parts = ["tsdb"];
  if (leagueId) parts.push(`league:${leagueId}`);
  const image = poster?.trim() || thumb?.trim();
  if (image) parts.push(`img:${image}`);
  return parts.join("|");
}

export function parseLeaguePoster(source?: string | null): string | null {
  const match = source?.match(/img:([^|]+)/);
  return match?.[1]?.trim() || null;
}

function parseVersusTitle(strEvent: string): {
  title: string;
  home?: string;
  away?: string;
} {
  const vsMatch = strEvent.match(/^(.+?)\s+vs\s+(.+)$/i);
  if (!vsMatch) return { title: strEvent.trim() };
  return {
    title: strEvent.trim(),
    home: vsMatch[1].trim(),
    away: vsMatch[2].trim(),
  };
}

function normalizeLeagueEvent(
  raw: RawEvent,
  config: LeagueCronConfig,
  weekDates: string[]
): LeagueCronEvent | null {
  if (!raw.idEvent || !raw.strEvent) return null;
  if (raw.strPostponed === "yes") return null;
  if (raw.strStatus === "FT") return null;

  let date: string;
  let time: string;

  if (raw.strTimestamp) {
    ({ date, time } = splitToMadrid(parseUtcIso(raw.strTimestamp)));
  } else if (raw.dateEvent) {
    date = raw.dateEvent;
    time = (raw.strTimeLocal || raw.strTime || "12:00:00").slice(0, 5);
  } else {
    return null;
  }

  const today = toMadridDateKey(new Date());
  const weekEnd = weekDates[weekDates.length - 1];
  if (date < today || date > weekEnd) return null;

  if (config.sport === "ciclismo") {
    const title = raw.strEvent.trim();
    if (!title) return null;

    return {
      external_id: `tsdb_${config.sport}_${raw.idEvent}`,
      title,
      home_team: null,
      away_team: null,
      date,
      time,
      sport: config.sport,
      category: "deportes",
      competition: raw.strLeague?.trim() || config.competition,
      platform: config.platform,
      source: encodeLeagueSource(raw.strPoster, raw.strThumb, config.leagueId),
    };
  }

  const home = raw.strHomeTeam?.trim() || null;
  const away = raw.strAwayTeam?.trim() || null;
  const parsed =
    config.sport === "tenis"
      ? parseTennisMatchFromEventTitle(raw.strEvent)
      : parseVersusTitle(raw.strEvent);

  if (
    isPlaceholderTeamName(home) ||
    isPlaceholderTeamName(away) ||
    isPlaceholderTeamName(parsed.home) ||
    isPlaceholderTeamName(parsed.away)
  ) {
    return null;
  }

  const title =
    home && away
      ? `${home} vs ${away}`
      : parsed.home && parsed.away
        ? `${parsed.home} vs ${parsed.away}`
        : parsed.title;

  const rgCompetition = formatRolandGarrosCompetition(raw.strEvent ?? title);
  const competition =
    rgCompetition ?? (raw.strLeague?.trim() || config.competition);

  return {
    external_id: `tsdb_${config.sport}_${raw.idEvent}`,
    title,
    home_team: home || parsed.home || null,
    away_team: away || parsed.away || null,
    date,
    time,
    sport: config.sport,
    category: "deportes",
    competition,
    platform: config.platform,
    source: encodeLeagueSource(raw.strPoster, raw.strThumb, config.leagueId),
  };
}

const TSDB_HEADERS: HeadersInit = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "es-ES,es;q=0.9",
  Referer: "https://www.thesportsdb.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

async function fetchJson<T>(path: string, retries = 2): Promise<T | null> {
  const url = `${API_BASE}${path}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fetchJsonWithTimeout<T>(url, {
      headers: TSDB_HEADERS,
    });

    if (result.ok && result.data) return result.data;

    if (result.status === 429 && attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
      continue;
    }
  }

  return null;
}

const DAY_FETCH_DELAY_MS = 650;

async function fetchTennisEventsByDay(
  weekDates: string[]
): Promise<LeagueCronEvent[]> {
  const fallbackConfig = THESPORTSDB_LEAGUES.find((c) => c.leagueId === "4464");
  if (!fallbackConfig) return [];

  const map = new Map<string, LeagueCronEvent>();

  for (const date of weekDates) {
    const data = await fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsday.php?d=${date}&s=Tennis`
    );

    for (const raw of data?.events ?? []) {
      if (!raw.strEvent) continue;

      const leagueId = raw.idLeague?.toString();
      const config =
        THESPORTSDB_LEAGUES.find((c) => c.leagueId === leagueId) ??
        fallbackConfig;
      const event = normalizeLeagueEvent(raw, config, weekDates);
      if (event) map.set(event.external_id, event);
    }

    await new Promise((resolve) => setTimeout(resolve, DAY_FETCH_DELAY_MS));
  }

  return [...map.values()];
}

async function fetchLeagueEvents(
  config: LeagueCronConfig,
  weekDates: string[]
): Promise<LeagueCronEvent[]> {
  const year = new Date().getFullYear();
  const [nextData, seasonData] = await Promise.all([
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsnextleague.php?id=${config.leagueId}`
    ),
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsseason.php?id=${config.leagueId}&s=${year}`
    ),
  ]);

  const map = new Map<string, LeagueCronEvent>();
  for (const raw of [...(nextData?.events ?? []), ...(seasonData?.events ?? [])]) {
    const event = normalizeLeagueEvent(raw, config, weekDates);
    if (event) map.set(event.external_id, event);
  }

  return [...map.values()]
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
    )
    .slice(0, config.maxEvents);
}

export async function fetchTheSportsDbLeagueEvents(
  dayCount = 7
): Promise<LeagueCronEvent[]> {
  const weekDates = getMadridWeekDates(dayCount);
  const nonTennisLeagues = THESPORTSDB_LEAGUES.filter(
    (config) => config.sport !== "tenis"
  );
  const [batches, dayTennis] = await Promise.all([
    Promise.all(
      nonTennisLeagues.map((config) => fetchLeagueEvents(config, weekDates))
    ),
    fetchTennisEventsByDay(weekDates),
  ]);

  const map = new Map<string, LeagueCronEvent>();
  for (const batch of batches) {
    for (const event of batch) map.set(event.external_id, event);
  }
  for (const event of dayTennis) map.set(event.external_id, event);

  return [...map.values()].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
  );
}
