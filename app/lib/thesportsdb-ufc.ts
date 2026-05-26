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
export const UFC_MAX_UPCOMING = 6;

export type UfcEvent = {
  id: string;
  title: string;
  headline: string;
  kind: "ppv" | "fight-night" | "other";
  date: string;
  time: string;
  dateLabel: string;
  venue: string;
  location: string;
  poster?: string;
  thumb?: string;
  badge?: string;
  platform: string;
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
  strLeagueBadge?: string;
  strStatus?: string;
  strPostponed?: string;
};

function parseHeadline(strEvent: string): string {
  const cleaned = strEvent
    .replace(/^Road to UFC\s+/i, "")
    .replace(/^UFC\s+Fight Night\s+\d+\s+/i, "")
    .replace(/^UFC\s+\d+\s+/i, "")
    .trim();
  return cleaned || strEvent.replace(/^UFC\s+/i, "").trim();
}

function parseKind(strEvent: string): UfcEvent["kind"] {
  if (/^UFC\s+\d+/i.test(strEvent) && !/Fight Night/i.test(strEvent)) {
    return "ppv";
  }
  if (/Fight Night/i.test(strEvent)) return "fight-night";
  return "other";
}

function kindLabel(kind: UfcEvent["kind"]): string {
  if (kind === "ppv") return "PPV";
  if (kind === "fight-night") return "Fight Night";
  return "UFC";
}

function formatDateLabel(date: string): string {
  const today = toMadridDateKey(new Date());
  const tomorrow = getMadridWeekDates(2)[1];
  if (date === today) return "Hoy";
  if (date === tomorrow) return "Mañana";
  const weekday = formatMadridWeekday(date, "short");
  const month = formatMadridMonthShort(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1, 3)} ${madridDayNumber(date)} ${month}`;
}

function normalizeEvent(raw: RawEvent): UfcEvent | null {
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
  if (date < today) return null;

  const venue = raw.strVenue?.trim() || "Por confirmar";
  const city = raw.strCity?.trim();
  const country = raw.strCountry?.trim();
  const location = [city, country].filter(Boolean).join(", ") || country || "";

  const kind = parseKind(raw.strEvent);

  return {
    id: raw.idEvent,
    title: raw.strEvent.trim(),
    headline: parseHeadline(raw.strEvent),
    kind,
    date,
    time,
    dateLabel: formatDateLabel(date),
    venue,
    location,
    poster: raw.strPoster?.trim() || undefined,
    thumb: raw.strThumb?.trim() || undefined,
    badge: raw.strLeagueBadge?.trim() || undefined,
    platform: kind === "ppv" ? "PPV · UFC Fight Pass" : "UFC Fight Pass",
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

function dedupeAndSort(events: UfcEvent[]): UfcEvent[] {
  const map = new Map<string, UfcEvent>();
  for (const event of events) {
    map.set(event.id, event);
  }
  return [...map.values()].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
  );
}

export async function fetchUpcomingUfcEvents(
  limit = UFC_MAX_UPCOMING
): Promise<UfcEvent[]> {
  const year = new Date().getFullYear();
  const [nextData, seasonData] = await Promise.all([
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsnextleague.php?id=${UFC_LEAGUE_ID}`
    ),
    fetchJson<{ events?: RawEvent[] | null }>(
      `/eventsseason.php?id=${UFC_LEAGUE_ID}&s=${year}`
    ),
  ]);

  const pool: UfcEvent[] = [];

  for (const raw of nextData?.events ?? []) {
    const event = normalizeEvent(raw);
    if (event) pool.push(event);
  }

  for (const raw of seasonData?.events ?? []) {
    const event = normalizeEvent(raw);
    if (event) pool.push(event);
  }

  return dedupeAndSort(pool).slice(0, limit);
}

export { kindLabel };
