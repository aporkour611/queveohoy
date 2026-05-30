import { getMadridWeekDates } from "./madrid-time";
import { encodeTmdbSource } from "./tmdb-client";
import {
  SPANISH_TV_FLAGSHIP,
  matchSpanishTvByRtveProgramId,
  type SpanishTvShow,
} from "./spanish-tv-curated";
import { isRtveLinearShow, resolveRtveProgramId } from "./rtve-program-lookup";
import { fetchJsonWithTimeout } from "./fetch-json";

const RTVE_API = "https://api.rtve.es/api";

export type RtveCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time: string;
  sport: "tv";
  category: "tv";
  competition: string;
  platform: string;
  source: string;
};

type RtveProgramItem = {
  id?: number;
  name?: string;
};

type RtveProgramPage = {
  page?: {
    items?: RtveProgramItem[];
  };
};

type RtveVideoItem = {
  id?: number;
  title?: string;
  longTitle?: string;
  publicationDate?: string;
  emissionDate?: string;
  emissionTime?: string;
};

type RtveVideoPage = {
  page?: {
    items?: RtveVideoItem[];
  };
};

function parseRtveDateTime(
  dateRaw?: string | null,
  timeRaw?: string | null
): { date: string; time: string } | null {
  const date = dateRaw?.trim().slice(0, 10);
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const timeMatch = timeRaw?.match(/(\d{2}:\d{2})/);
  return { date, time: timeMatch?.[1] ?? "22:00" };
}

function buildRtveEvent(
  show: SpanishTvShow,
  video: RtveVideoItem
): RtveCronEvent | null {
  const parsed =
    parseRtveDateTime(video.emissionDate, video.emissionTime) ??
    parseRtveDateTime(video.publicationDate, null);
  if (!parsed) return null;

  const videoId = video.id ?? 0;
  const title = video.longTitle?.trim() || video.title?.trim() || show.search;

  return {
    external_id: `rtve_${show.id}_${parsed.date}_${videoId}`,
    title: title.includes(show.search) ? title : `${show.search} — ${title}`,
    date: parsed.date,
    time: show.airTime ?? parsed.time,
    sport: "tv",
    category: "tv",
    competition: show.competition,
    platform: show.platform,
    source: encodeTmdbSource(show.posterPath ?? null, show.priority),
  };
}

async function fetchProgramVideos(
  programId: number
): Promise<RtveVideoItem[]> {
  const result = await fetchJsonWithTimeout<RtveVideoPage>(
    `${RTVE_API}/programas/${programId}/videos.json?size=20`,
    { next: { revalidate: 0 } },
    12_000
  );
  if (!result.ok || !result.data?.page?.items) return [];
  return result.data.page.items;
}

async function fetchTrendingProgramIds(): Promise<number[]> {
  const result = await fetchJsonWithTimeout<RtveProgramPage>(
    `${RTVE_API}/programas/mas-vistos.json?size=30`,
    { next: { revalidate: 0 } },
    12_000
  );
  if (!result.ok || !result.data?.page?.items) return [];

  return result.data.page.items
    .map((item) => item.id)
    .filter((id): id is number => typeof id === "number" && id > 0);
}

/** Emisiones RTVE recientes para programas flagship con rtveProgramId. */
export async function fetchRtveFlagshipEvents(
  dayCount = 7
): Promise<{ events: RtveCronEvent[]; error?: string }> {
  const dates = getMadridWeekDates(dayCount);
  const dateFrom = dates[0];
  const dateTo = dates[dates.length - 1];
  const byExternalId = new Map<string, RtveCronEvent>();
  const errors: string[] = [];

  const rtveShows = SPANISH_TV_FLAGSHIP.filter(
    (show) => show.category !== "ficcion" && isRtveLinearShow(show)
  );

  const programIds = new Set<number>();
  for (const id of await fetchTrendingProgramIds()) programIds.add(id);

  const showByProgramId = new Map<number, SpanishTvShow>();

  for (const show of rtveShows) {
    try {
      const programId = await resolveRtveProgramId(show);
      if (!programId) continue;
      programIds.add(programId);
      showByProgramId.set(programId, show);
    } catch (err) {
      errors.push(
        `${show.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  for (const programId of programIds) {
    const show =
      showByProgramId.get(programId) ?? matchSpanishTvByRtveProgramId(programId);
    if (!show) continue;

    try {
      const videos = await fetchProgramVideos(programId);
      for (const video of videos) {
        const event = buildRtveEvent(show, video);
        if (!event) continue;
        if (event.date < dateFrom || event.date > dateTo) continue;
        byExternalId.set(event.external_id, event);
      }
    } catch (err) {
      errors.push(
        `${show.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return {
    events: [...byExternalId.values()],
    error: errors.length ? errors.join("; ") : undefined,
  };
}
