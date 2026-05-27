import {
  getMadridWeekDates,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";
import { isPlaceholderTeamName } from "./event-quality";

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
    maxEvents: 12,
  },
  {
    leagueId: "4517",
    sport: "tenis",
    competition: "WTA",
    platform: "Movistar+, DAZN, Eurosport",
    maxEvents: 12,
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
  const parsed = parseVersusTitle(raw.strEvent);

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

  return {
    external_id: `tsdb_${config.sport}_${raw.idEvent}`,
    title,
    home_team: home || parsed.home || null,
    away_team: away || parsed.away || null,
    date,
    time,
    sport: config.sport,
    category: "deportes",
    competition: raw.strLeague?.trim() || config.competition,
    platform: config.platform,
    source: encodeLeagueSource(raw.strPoster, raw.strThumb, config.leagueId),
  };
}

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
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
  const batches = await Promise.all(
    THESPORTSDB_LEAGUES.map((config) => fetchLeagueEvents(config, weekDates))
  );
  return batches.flat();
}
