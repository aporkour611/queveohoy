import {
  formatMadridMonthShort,
  formatMadridWeekday,
  getMadridWeekDates,
  madridDayNumber,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3";
export const UFC_LEAGUE_ID = "4443";
export const UFC_MAX_UPCOMING = 8;

export type UfcKind = "ppv" | "fight-night" | "other";

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

export function parseUfcHeadline(strEvent: string): string {
  const cleaned = strEvent
    .replace(/^Road to UFC\s+/i, "")
    .replace(/^UFC\s+Fight Night\s+\d+\s+/i, "")
    .replace(/^UFC\s+\d+\s+/i, "")
    .trim();
  return cleaned || strEvent.replace(/^UFC\s+/i, "").trim();
}

export function parseUfcKind(strEvent: string): UfcKind {
  if (/^UFC\s+\d+/i.test(strEvent) && !/Fight Night/i.test(strEvent)) {
    return "ppv";
  }
  if (/Fight Night/i.test(strEvent)) return "fight-night";
  return "other";
}

export function ufcKindLabel(kind: UfcKind): string {
  if (kind === "ppv") return "PPV";
  if (kind === "fight-night") return "Fight Night";
  return "UFC";
}

export function encodeUfcSource(
  poster?: string | null,
  thumb?: string | null,
  kind?: UfcKind
): string {
  const parts = ["ufc"];
  const image = poster?.trim() || thumb?.trim();
  if (image) parts.push(`img:${image}`);
  if (kind) parts.push(`kind:${kind}`);
  return parts.join("|");
}

export function parseUfcImage(source?: string | null): string | null {
  if (!source?.startsWith("ufc")) return null;
  const match = source.match(/\|img:([^|]+)/) ?? source.match(/^ufc\|img:([^|]+)/);
  return match?.[1]?.trim() || null;
}

export function parseUfcKindFromSource(source?: string | null): UfcKind {
  const match = source?.match(/\|kind:(ppv|fight-night|other)/);
  return (match?.[1] as UfcKind) || "other";
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

  const kind = parseUfcKind(raw.strEvent);
  const headline = parseUfcHeadline(raw.strEvent);
  const venue = raw.strVenue?.trim() || "Por confirmar";
  const location = [raw.strCity?.trim(), raw.strCountry?.trim()]
    .filter(Boolean)
    .join(", ");

  return {
    external_id: `ufc_${raw.idEvent}`,
    title: headline,
    date,
    time,
    sport: "ufc",
    category: "deportes",
    competition: ufcKindLabel(kind),
    platform: location ? `${venue} · ${location}` : venue,
    source: encodeUfcSource(raw.strPoster, raw.strThumb, kind),
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
  const [nextData, seasonData] = await Promise.all([
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsnextleague.php?id=${UFC_LEAGUE_ID}`
    ),
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsseason.php?id=${UFC_LEAGUE_ID}&s=${year}`
    ),
  ]);

  const map = new Map<string, UfcCronEvent>();

  for (const raw of [...(nextData?.events ?? []), ...(seasonData?.events ?? [])]) {
    const event = normalizeRaw(raw, weekDates);
    if (event) map.set(event.external_id, event);
  }

  return [...map.values()]
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
    )
    .slice(0, UFC_MAX_UPCOMING);
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
