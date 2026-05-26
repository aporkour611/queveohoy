import {
  formatMadridMonthShort,
  formatMadridWeekday,
  getMadridWeekDates,
  madridDayNumber,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";
import {
  encodeUfcSource as buildUfcSource,
  parseUfcEventNumberFromSource,
  parseUfcImage,
  parseUfcKindFromSource,
  parseUfcMainEventFighters,
  type UfcKind,
  ufcKindLabel,
} from "./thesportsdb-ufc-client";

export type { UfcKind } from "./thesportsdb-ufc-client";
export {
  parseUfcEventNumberFromSource,
  parseUfcFighterImages,
  parseUfcImage,
  parseUfcKindFromSource,
  parseUfcMainEventFighters,
  ufcKindLabel,
} from "./thesportsdb-ufc-client";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
export const UFC_LEAGUE_ID = "4443";
export const UFC_MAX_UPCOMING = 8;

export type UfcEventLabel = {
  eventName: string;
  cardLine?: string;
  kind: UfcKind;
  eventNumber?: number;
};

export type UfcCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time: string;
  sport: "ufc";
  category: "deportes";
  competition: string;
  platform: string;
  source: string;
  home_team?: string | null;
  away_team?: string | null;
};

type RawEvent = {
  idEvent?: string;
  strEvent?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strTimeLocal?: string;
  strVenue?: string;
  strCity?: string;
  strCountry?: string;
  strPoster?: string;
  strThumb?: string;
  strStatus?: string;
  strPostponed?: string;
};

export function parseUfcEventLabel(strEvent: string): UfcEventLabel {
  const raw = strEvent.trim();
  if (!raw) {
    return { eventName: "UFC", kind: "other" };
  }

  const numbered = raw.match(/^UFC\s+(\d+)\s*(.*)$/i);
  if (numbered && !/fight\s+night/i.test(raw)) {
    const eventNumber = parseInt(numbered[1], 10);
    const cardLine = numbered[2]?.trim();
    return {
      eventName: `UFC ${eventNumber}`,
      cardLine: cardLine || undefined,
      kind: "ppv",
      eventNumber,
    };
  }

  const fightNight = raw.match(/^UFC\s+Fight\s+Night(?::|\s+)(\d+)?\s*(.*)$/i);
  if (fightNight) {
    const num = fightNight[1]?.trim();
    const cardLine = fightNight[2]?.trim();
    return {
      eventName: num ? `UFC Fight Night ${num}` : "UFC Fight Night",
      cardLine: cardLine || undefined,
      kind: "fight-night",
      eventNumber: num ? parseInt(num, 10) : undefined,
    };
  }

  const roadEpisode = raw.match(/^Road to UFC\s+Season\s+(\d+)\s+Episode\s+(\d+)/i);
  if (roadEpisode) {
    return {
      eventName: "Road to UFC",
      cardLine: `Temporada ${roadEpisode[1]} · Episodio ${roadEpisode[2]}`,
      kind: "road",
    };
  }

  if (/^Road to UFC/i.test(raw)) {
    return {
      eventName: "Road to UFC",
      cardLine: raw.replace(/^Road to UFC\s*/i, "").trim() || undefined,
      kind: "road",
    };
  }

  return {
    eventName: raw,
    kind: "other",
  };
}

/** @deprecated Usar parseUfcEventLabel */
export function parseUfcHeadline(strEvent: string): string {
  const label = parseUfcEventLabel(strEvent);
  if (label.cardLine && label.kind === "ppv") {
    return label.cardLine;
  }
  return label.eventName;
}

export function parseUfcKind(strEvent: string): UfcKind {
  return parseUfcEventLabel(strEvent).kind;
}

export function isMainUfcCard(strEvent: string): boolean {
  const kind = parseUfcKind(strEvent);
  return kind === "ppv" || kind === "fight-night";
}

export function encodeUfcSource(
  poster?: string | null,
  thumb?: string | null,
  kind?: UfcKind,
  eventNumber?: number,
  fighters?: { f1?: string | null; f2?: string | null }
): string {
  return buildUfcSource({
    img: poster?.trim() || thumb?.trim() || null,
    f1: fighters?.f1,
    f2: fighters?.f2,
    kind,
    eventNumber,
  });
}

async function lookupFighterImage(
  name: string,
  cache: Map<string, string | null>
): Promise<string | null> {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  const surname = name.trim().split(/\s+/).pop() ?? name.trim();
  const queries = [name.trim(), surname].filter(
    (q, index, arr) => q && arr.indexOf(q) === index
  );

  for (const query of queries) {
    const data = await fetchJson<{
      player?: Array<{
        strSport?: string;
        strPlayer?: string;
        strCutout?: string;
        strThumb?: string;
      }> | null;
    }>(`/searchplayers.php?p=${encodeURIComponent(query.replace(/\s+/g, "_"))}`);

    const candidates = (data?.player ?? []).filter(
      (player) =>
        player.strSport === "Fighting" ||
        player.strSport === "MMA" ||
        !player.strSport
    );

    const surnameLower = surname.toLowerCase();
    const match =
      candidates.find((player) =>
        player.strPlayer?.toLowerCase().includes(surnameLower)
      ) ?? candidates[0];

    const image = match?.strCutout?.trim() || match?.strThumb?.trim();
    if (image) {
      cache.set(key, image);
      return image;
    }
  }

  cache.set(key, null);
  return null;
}

async function enrichUfcFighters(
  event: UfcCronEvent,
  cache: Map<string, string | null>
): Promise<UfcCronEvent> {
  const matchup =
    parseUfcMainEventFighters(event.competition, event.title) ??
    (event.home_team && event.away_team
      ? { n1: event.home_team, n2: event.away_team }
      : null);

  if (!matchup) return event;

  const [f1, f2] = await Promise.all([
    lookupFighterImage(matchup.n1, cache),
    lookupFighterImage(matchup.n2, cache),
  ]);

  const kind = parseUfcKindFromSource(event.source);
  const eventNumber = parseUfcEventNumberFromSource(event.source) ?? undefined;

  return {
    ...event,
    home_team: matchup.n1,
    away_team: matchup.n2,
    source: encodeUfcSource(null, parseUfcImage(event.source), kind, eventNumber, {
      f1,
      f2,
    }),
  };
}

export function formatEventDateLabel(date: string): string {
  const today = toMadridDateKey(new Date());
  const tomorrow = getMadridWeekDates(2)[1];
  if (date === today) return "Hoy";
  if (date === tomorrow) return "Mañana";
  const weekday = formatMadridWeekday(date, "short");
  const month = formatMadridMonthShort(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1, 3)} ${madridDayNumber(date)} ${month}`;
}

function normalizeRaw(raw: RawEvent, weekDates: string[]): UfcCronEvent | null {
  if (!raw.idEvent || !raw.strEvent) return null;
  if (raw.strPostponed === "yes") return null;
  if (raw.strStatus === "FT") return null;

  let date: string;
  let time: string;

  if (raw.strTimestamp) {
    ({ date, time } = splitToMadrid(parseUtcIso(raw.strTimestamp)));
  } else if (raw.dateEvent) {
    date = raw.dateEvent;
    time = (raw.strTimeLocal || raw.strTime || "22:00:00").slice(0, 5);
  } else {
    return null;
  }

  const today = toMadridDateKey(new Date());
  const weekEnd = weekDates[weekDates.length - 1];
  if (date < today || date > weekEnd) return null;

  const label = parseUfcEventLabel(raw.strEvent);
  const venue = raw.strVenue?.trim() || "Por confirmar";
  const location = [raw.strCity?.trim(), raw.strCountry?.trim()]
    .filter(Boolean)
    .join(", ");

  return {
    external_id: `ufc_${raw.idEvent}`,
    title: label.eventName,
    date,
    time,
    sport: "ufc",
    category: "deportes",
    competition: label.cardLine || ufcKindLabel(label.kind),
    platform: location ? `${venue} · ${location}` : venue,
    source: encodeUfcSource(
      raw.strPoster,
      raw.strThumb,
      label.kind,
      label.eventNumber
    ),
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

export async function fetchUfcCronEvents(
  dayCount = 7
): Promise<UfcCronEvent[]> {
  const weekDates = getMadridWeekDates(dayCount);
  const year = new Date().getFullYear();
  const fighterCache = new Map<string, string | null>();
  const [nextData, seasonData] = await Promise.all([
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsnextleague.php?id=${UFC_LEAGUE_ID}`
    ),
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsseason.php?id=${UFC_LEAGUE_ID}&s=${year}`
    ),
  ]);

  const map = new Map<string, UfcCronEvent>();
  const roadEvents: UfcCronEvent[] = [];

  for (const raw of [...(nextData?.events ?? []), ...(seasonData?.events ?? [])]) {
    if (!raw.strEvent) continue;
    const event = normalizeRaw(raw, weekDates);
    if (!event) continue;

    if (parseUfcKind(raw.strEvent) === "road") {
      roadEvents.push(event);
      continue;
    }

    map.set(event.external_id, event);
  }

  const mainEvents = [...map.values()].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
  );

  let combined: UfcCronEvent[];
  if (mainEvents.length >= UFC_MAX_UPCOMING) {
    combined = mainEvents.slice(0, UFC_MAX_UPCOMING);
  } else {
    const extras = roadEvents
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
      )
      .slice(0, UFC_MAX_UPCOMING - mainEvents.length);
    combined = [...mainEvents, ...extras];
  }

  return Promise.all(
    combined.map((event) => enrichUfcFighters(event, fighterCache))
  );
}

/** @deprecated Usar fetchUfcCronEvents vía cron */
export async function fetchUpcomingUfcEvents(limit = UFC_MAX_UPCOMING) {
  const events = await fetchUfcCronEvents(7);
  return events.slice(0, limit).map((e) => ({
    id: e.external_id.replace(/^ufc_/, ""),
    title: e.title,
    headline: e.title,
    kind: parseUfcKindFromSource(e.source),
    date: e.date,
    time: e.time,
    dateLabel: formatEventDateLabel(e.date),
    venue: e.platform.split(" · ")[0] ?? e.platform,
    location: e.platform.includes(" · ")
      ? e.platform.split(" · ").slice(1).join(" · ")
      : "",
    poster: parseUfcImage(e.source) ?? undefined,
    platform: "UFC Fight Pass",
  }));
}

export { ufcKindLabel as kindLabel };
