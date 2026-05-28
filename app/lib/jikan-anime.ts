import type { CronEventInput } from "./cron-events";
import { fetchJsonWithTimeout } from "./fetch-json";
import { addDaysToDateKey, getMadridWeekDates, toMadridDateKey, toMadridTime } from "./madrid-time";
import { isoWeekdayFromDateKey } from "./curated-tv-events";
import { encodeJikanSource } from "./jikan-client";

const JIKAN_BASE = "https://api.jikan.moe/v4";
const JIKAN_REQUEST_GAP_MS = 400;
const MAX_ANIME_EVENTS_WEEK = 32;
const MIN_MEMBERS = 800;
const MIN_SCORE = 6;

const WEEKDAY_FILTERS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const BROADCAST_DAY_TO_FILTER: Record<string, (typeof WEEKDAY_FILTERS)[number]> = {
  mondays: "monday",
  monday: "monday",
  tuesdays: "tuesday",
  tuesday: "tuesday",
  wednesdays: "wednesday",
  wednesday: "wednesday",
  thursdays: "thursday",
  thursday: "thursday",
  fridays: "friday",
  friday: "friday",
  saturdays: "saturday",
  saturday: "saturday",
  sundays: "sunday",
  sunday: "sunday",
};

type JikanAnime = {
  mal_id: number;
  title?: string;
  title_english?: string | null;
  type?: string | null;
  status?: string | null;
  score?: number | null;
  popularity?: number | null;
  members?: number | null;
  rank?: number | null;
  season?: string | null;
  year?: number | null;
  aired?: {
    from?: string | null;
    to?: string | null;
  } | null;
  broadcast?: {
    day?: string | null;
    time?: string | null;
    timezone?: string | null;
  } | null;
  images?: {
    jpg?: {
      image_url?: string | null;
      large_image_url?: string | null;
    } | null;
  } | null;
  genres?: Array<{ name?: string | null }> | null;
  explicit_genres?: Array<{ name?: string | null }> | null;
  rating?: string | null;
  licensors?: Array<{ name?: string | null }> | null;
};

type JikanListResponse = {
  data?: JikanAnime[];
};

export type JikanCronResult = {
  events: CronEventInput[];
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeBroadcastDay(day?: string | null): (typeof WEEKDAY_FILTERS)[number] | null {
  if (!day?.trim()) return null;
  const key = day.trim().toLowerCase().replace(/\s+/g, "");
  return BROADCAST_DAY_TO_FILTER[key] ?? null;
}

function isBlockedAnime(anime: JikanAnime): boolean {
  const rating = anime.rating?.toLowerCase() ?? "";
  if (/rx|hentai|erotica/i.test(rating)) return true;

  const genres = [
    ...(anime.genres ?? []),
    ...(anime.explicit_genres ?? []),
  ]
    .map((g) => g.name?.toLowerCase() ?? "")
    .join(" ");

  return /hentai|erotica/i.test(genres);
}

function animeDisplayTitle(anime: JikanAnime): string {
  const english = anime.title_english?.trim();
  const base = anime.title?.trim();
  return english || base || "Anime";
}

function animeBuzzScore(anime: JikanAnime): number {
  const members = anime.members ?? 0;
  const score = anime.score ?? 0;
  const rank = anime.rank ?? 20_000;
  const popularity = anime.popularity ?? 20_000;

  let buzz = Math.min(40, Math.round(members / 2500));
  if (score >= 7.5) buzz += 18;
  else if (score >= 7) buzz += 12;
  else if (score >= MIN_SCORE) buzz += 6;
  buzz += Math.max(0, 24 - Math.round(rank / 400));
  buzz += Math.max(0, 16 - Math.round(popularity / 600));
  return buzz;
}

function resolveAnimePlatform(anime: JikanAnime): string {
  const licensors = (anime.licensors ?? [])
    .map((l) => l.name?.trim())
    .filter(Boolean)
    .join(" ");

  if (/crunchyroll/i.test(licensors)) return "Crunchyroll";
  if (/netflix/i.test(licensors)) return "Netflix";
  if (/amazon|prime/i.test(licensors)) return "Prime Video";
  if (/disney/i.test(licensors)) return "Disney+";
  return "Streaming";
}

/** Convierte hora de emisión JST a fecha/hora visibles en Madrid. */
export function tokyoBroadcastToMadrid(
  dateKey: string,
  timeJst: string
): { date: string; time: string } {
  const match = timeJst.match(/^(\d{1,2}):(\d{2})/);
  const targetH = match ? parseInt(match[1], 10) : 0;
  const targetM = match ? parseInt(match[2], 10) : 0;

  const tokyoDateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const tokyoTimeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const searchStart = Date.parse(`${dateKey}T00:00:00Z`) - 48 * 3_600_000;

  for (let t = searchStart; t < searchStart + 96 * 3_600_000; t += 60_000) {
    const instant = new Date(t);
    if (tokyoDateFmt.format(instant) !== dateKey) continue;

    const parts = tokyoTimeFmt.formatToParts(instant);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0",
      10
    );

    if (hour === targetH && minute === targetM) {
      return { date: toMadridDateKey(instant), time: toMadridTime(instant) };
    }
  }

  return { date: dateKey, time: "22:00" };
}

function competitionLabel(anime: JikanAnime, isSeasonPremiere: boolean): string {
  const type = anime.type?.trim() || "TV";
  if (isSeasonPremiere) {
    const season = anime.season?.trim();
    const year = anime.year;
    if (season && year) {
      return `Estreno · Anime ${season} ${year}`;
    }
    return "Estreno · Anime";
  }
  return `Capítulo · ${type}`;
}

function posterUrl(anime: JikanAnime): string | null {
  return (
    anime.images?.jpg?.large_image_url?.trim() ||
    anime.images?.jpg?.image_url?.trim() ||
    null
  );
}

function buildWeeklyEpisodeEvents(
  anime: JikanAnime,
  dateFrom: string,
  dateTo: string
): CronEventInput[] {
  const broadcastDay = normalizeBroadcastDay(anime.broadcast?.day);
  const broadcastTime = anime.broadcast?.time?.trim();
  if (!broadcastDay || !broadcastTime) return [];

  const events: CronEventInput[] = [];
  let date = dateFrom;

  while (date <= dateTo) {
    const weekday = isoWeekdayFromDateKey(date);
    const filterIndex = WEEKDAY_FILTERS.indexOf(broadcastDay);
    const targetIso = filterIndex >= 0 ? filterIndex + 1 : 0;

    if (weekday === targetIso) {
      const madrid = tokyoBroadcastToMadrid(date, broadcastTime);
      const buzz = animeBuzzScore(anime);

      events.push({
        external_id: `jikan_anime_${anime.mal_id}_${madrid.date}`,
        title: animeDisplayTitle(anime),
        date: madrid.date,
        time: madrid.time,
        sport: "anime",
        category: "cine",
        competition: competitionLabel(anime, false),
        platform: resolveAnimePlatform(anime),
        source: encodeJikanSource(posterUrl(anime), buzz),
      });
    }

    date = addDaysToDateKey(date, 1);
  }

  return events;
}

function buildSeasonPremiereEvent(
  anime: JikanAnime,
  dateFrom: string,
  dateTo: string
): CronEventInput | null {
  const from = anime.aired?.from?.slice(0, 10);
  if (!from || from < dateFrom || from > dateTo) return null;

  const buzz = animeBuzzScore(anime) + 12;

  return {
    external_id: `jikan_premiere_${anime.mal_id}_${from}`,
    title: animeDisplayTitle(anime),
    date: from,
    time: "22:00",
    sport: "anime",
    category: "cine",
    competition: competitionLabel(anime, true),
    platform: resolveAnimePlatform(anime),
    source: encodeJikanSource(posterUrl(anime), buzz),
  };
}

async function fetchJikanSchedule(
  weekday: (typeof WEEKDAY_FILTERS)[number]
): Promise<JikanAnime[]> {
  const result = await fetchJsonWithTimeout<JikanListResponse>(
    `${JIKAN_BASE}/schedules?filter=${weekday}`,
    undefined,
    18_000
  );

  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

async function fetchJikanSeasonNow(): Promise<JikanAnime[]> {
  const result = await fetchJsonWithTimeout<JikanListResponse>(
    `${JIKAN_BASE}/seasons/now?page=1`,
    undefined,
    18_000
  );

  if (!result.ok || !result.data?.data) return [];
  return result.data.data;
}

function passesQualityBar(anime: JikanAnime): boolean {
  if (isBlockedAnime(anime)) return false;
  if (!anime.mal_id) return false;
  if ((anime.members ?? 0) < MIN_MEMBERS && (anime.score ?? 0) < MIN_SCORE) {
    return false;
  }
  if ((anime.score ?? 0) > 0 && (anime.score ?? 0) < 5.5) return false;
  return true;
}

/** Episodios semanales y estrenos de temporada vía Jikan (MyAnimeList). */
export async function fetchJikanAnimeEventsForWeek(
  windowDays = 7
): Promise<JikanCronResult> {
  const weekDates = getMadridWeekDates(windowDays);
  const dateFrom = weekDates[0];
  const dateTo = weekDates[weekDates.length - 1];

  const byKey = new Map<string, { event: CronEventInput; score: number }>();
  const errors: string[] = [];

  try {
    for (const weekday of WEEKDAY_FILTERS) {
      const list = await fetchJikanSchedule(weekday);
      await sleep(JIKAN_REQUEST_GAP_MS);

      for (const anime of list) {
        if (!passesQualityBar(anime)) continue;

        for (const event of buildWeeklyEpisodeEvents(anime, dateFrom, dateTo)) {
          const key = event.external_id ?? "";
          const score = animeBuzzScore(anime);
          const existing = byKey.get(key);
          if (!existing || score > existing.score) {
            byKey.set(key, { event, score });
          }
        }
      }
    }

    const seasonNow = await fetchJikanSeasonNow();
    await sleep(JIKAN_REQUEST_GAP_MS);

    for (const anime of seasonNow) {
      if (!passesQualityBar(anime)) continue;
      const premiere = buildSeasonPremiereEvent(anime, dateFrom, dateTo);
      if (!premiere?.external_id) continue;

      const score = animeBuzzScore(anime) + 15;
      const existing = byKey.get(premiere.external_id);
      if (!existing || score > existing.score) {
        byKey.set(premiere.external_id, { event: premiere, score });
      }
    }
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
  }

  const events = [...byKey.values()]
    .sort((a, b) => b.score - a.score || (a.event.date ?? "").localeCompare(b.event.date ?? ""))
    .slice(0, MAX_ANIME_EVENTS_WEEK)
    .map((item) => item.event);

  return {
    events,
    error: errors.length ? errors.join("; ") : undefined,
  };
}
