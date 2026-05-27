import type { EventRow } from "../components/types";
import { addDaysToDateKey } from "./madrid-time";
import { CURATED_MOVIES } from "./movies-curated";
import { encodeTmdbSource } from "./tmdb";

const CURATED_VISIBLE_AHEAD_DAYS = 14;
const CURATED_VISIBLE_BEHIND_DAYS = 21;

/** Asegura estrenos editoriales en Destacados aunque el cron aún no haya escrito la fila. */
export function mergeCuratedMovieEvents(
  events: EventRow[],
  todayKey: string
): EventRow[] {
  const merged = new Map<string, EventRow>();

  for (const event of events) {
    const key = event.external_id ?? String(event.id);
    merged.set(key, event);
  }

  const graceStart = addDaysToDateKey(todayKey, -CURATED_VISIBLE_BEHIND_DAYS);
  const visibleUntil = addDaysToDateKey(todayKey, CURATED_VISIBLE_AHEAD_DAYS);

  for (const movie of CURATED_MOVIES) {
    const externalId = `tmdb_movie_${movie.tmdbId}`;
    if (merged.has(externalId)) continue;

    if (movie.releaseDate < graceStart || movie.releaseDate > visibleUntil) {
      continue;
    }

    merged.set(externalId, {
      id: -movie.tmdbId,
      external_id: externalId,
      title: movie.title,
      date: movie.releaseDate,
      time: "21:00",
      sport: "cine",
      competition: movie.competition ?? "Estreno top · Cines",
      platform: "Cines",
      source: movie.posterPath
        ? encodeTmdbSource(movie.posterPath, movie.priority)
        : encodeTmdbSource(null, movie.priority),
    });
  }

  return [...merged.values()];
}

export function isUpcomingCuratedMovie(
  event: EventRow,
  todayKey: string
): boolean {
  const curated = CURATED_MOVIES.find(
    (movie) => event.external_id === `tmdb_movie_${movie.tmdbId}`
  );
  if (!curated) return false;
  return curated.releaseDate >= todayKey;
}
