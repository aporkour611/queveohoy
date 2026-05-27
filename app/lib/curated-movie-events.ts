import type { EventRow } from "../components/types";
import { addDaysToDateKey } from "./madrid-time";
import { CURATED_MOVIES, type CuratedMovie } from "./movies-curated";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbBuzzScore, parseTmdbPoster } from "./tmdb-client";

function curatedMovieSource(movie: CuratedMovie, existing?: EventRow): string {
  const buzz = parseTmdbBuzzScore(existing?.source) || movie.priority;

  if (movie.posterPath) {
    return encodeTmdbSource(movie.posterPath, buzz);
  }

  if (existing?.source?.trim() && parseTmdbPoster(existing.source, "poster")) {
    return existing.source.trim();
  }

  return encodeTmdbSource(null, buzz);
}

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
    const existing = merged.get(externalId);

    if (existing) {
      merged.set(externalId, {
        ...existing,
        title: movie.title,
        date: movie.releaseDate,
        time: undefined,
        sport: "cine",
        competition: movie.competition ?? existing.competition ?? "Estreno top · Cines",
        platform: existing.platform?.trim() || "Cines",
        source: curatedMovieSource(movie, existing),
      });
      continue;
    }

    if (movie.releaseDate < graceStart || movie.releaseDate > visibleUntil) {
      continue;
    }

    merged.set(externalId, {
      id: -movie.tmdbId,
      external_id: externalId,
      title: movie.title,
      date: movie.releaseDate,
      sport: "cine",
      competition: movie.competition ?? "Estreno top · Cines",
      platform: "Cines",
      source: curatedMovieSource(movie),
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
