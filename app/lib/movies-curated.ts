import type { EventRow } from "../components/types";

export type CuratedMovie = {
  id: string;
  tmdbId: number;
  /** Fecha de estreno en cines (España), YYYY-MM-DD. */
  releaseDate: string;
  competition?: string;
  priority: number;
};

/** Estrenos de cine que el cron siempre vigila (fecha España, no la de TMDB US). */
export const CURATED_MOVIES: CuratedMovie[] = [
  {
    id: "el-drama",
    tmdbId: 1325734,
    releaseDate: "2026-05-29",
    competition: "Estreno top · Cines",
    priority: 95,
  },
];

export function curatedMovieByExternalId(
  externalId?: string | null
): CuratedMovie | null {
  const match = externalId?.match(/^tmdb_movie_(\d+)$/);
  if (!match) return null;
  const tmdbId = Number(match[1]);
  return CURATED_MOVIES.find((movie) => movie.tmdbId === tmdbId) ?? null;
}

export function isCuratedMovieEvent(event: EventRow): boolean {
  return event.sport === "cine" && curatedMovieByExternalId(event.external_id) !== null;
}
