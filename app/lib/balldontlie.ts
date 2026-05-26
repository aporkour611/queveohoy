import {
  getMadridWeekDates,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time";

const API_BASE = "https://api.balldontlie.io/v1";

/** Balldontlie — NBA, plan gratis generoso; key ya en .env */
export function getBalldontlieApiKey(): string | undefined {
  return process.env.BALLDONTLIE_API_KEY?.trim();
}

export type BasketCronEvent = {
  external_id: string;
  title: string;
  home_team: string;
  away_team: string;
  date: string;
  time: string;
  sport: "basket";
  category: "deportes";
  competition: string;
  platform: string;
  source: string;
};

type RawGame = {
  id?: number;
  date?: string;
  datetime?: string;
  status?: string;
  postponed?: boolean;
  postseason?: boolean;
  home_team?: { full_name?: string; abbreviation?: string };
  visitor_team?: { full_name?: string; abbreviation?: string };
};

function encodeBasketSource(home?: string, away?: string): string {
  return `bdl:${home ?? ""}:${away ?? ""}`;
}

function normalizeGame(raw: RawGame, weekDates: string[]): BasketCronEvent | null {
  if (!raw.id) return null;
  if (raw.postponed) return null;
  if (raw.status && /final|postponed|cancelled/i.test(raw.status)) return null;

  const home = raw.home_team?.full_name?.trim();
  const away = raw.visitor_team?.full_name?.trim();
  if (!home || !away) return null;

  const iso = raw.datetime || (raw.date ? `${raw.date}T00:00:00Z` : null);
  if (!iso) return null;

  const { date, time } = splitToMadrid(parseUtcIso(iso));
  const today = toMadridDateKey(new Date());
  const weekEnd = weekDates[weekDates.length - 1];
  if (date < today || date > weekEnd) return null;

  const competition = raw.postseason ? "NBA · Playoffs" : "NBA";

  return {
    external_id: `basket_${raw.id}`,
    title: `${home} vs ${away}`,
    home_team: home,
    away_team: away,
    date,
    time,
    sport: "basket",
    category: "deportes",
    competition,
    platform: "NBA League Pass, Movistar+, DAZN",
    source: encodeBasketSource(home, away),
  };
}

export async function fetchBasketballCronEvents(
  dayCount = 7
): Promise<{ events: BasketCronEvent[]; error?: string }> {
  const apiKey = getBalldontlieApiKey();
  if (!apiKey) {
    return { events: [], error: "BALLDONTLIE_API_KEY missing" };
  }

  const weekDates = getMadridWeekDates(dayCount);
  const params = new URLSearchParams({ per_page: "100" });
  for (const date of weekDates) {
    params.append("dates[]", date);
  }

  try {
    const res = await fetch(`${API_BASE}/games?${params}`, {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { events: [], error: `Balldontlie HTTP ${res.status}` };
    }

    const payload = (await res.json()) as { data?: RawGame[] };
    const events = (payload.data ?? [])
      .map((game) => normalizeGame(game, weekDates))
      .filter((event): event is BasketCronEvent => Boolean(event))
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? "")
      )
      .slice(0, 20);

    return { events };
  } catch (error) {
    return { events: [], error: String(error) };
  }
}
