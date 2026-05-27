import type { EventRow } from "../components/types";
import { curatedMovieByExternalId } from "./movies-curated";
import { curatedSeriesByExternalId } from "./series-curated";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbPoster } from "./tmdb-client";

/** Poster TMDB del evento, con fallback editorial para estrenos y TV curada. */
export function resolveEventPosterUrl(
  event: EventRow,
  size: "thumb" | "card" | "poster" = "poster"
): string | null {
  const fromSource = parseTmdbPoster(event.source, size);
  if (fromSource) return fromSource;

  const curatedMovie = curatedMovieByExternalId(event.external_id);
  if (curatedMovie?.posterPath) {
    return parseTmdbPoster(
      encodeTmdbSource(curatedMovie.posterPath, curatedMovie.priority),
      size
    );
  }

  const curatedSeries = curatedSeriesByExternalId(event.external_id);
  if (curatedSeries?.posterPath) {
    return parseTmdbPoster(
      encodeTmdbSource(curatedSeries.posterPath, curatedSeries.priority),
      size
    );
  }

  const flagship = matchesSpanishTvFlagship(event);
  if (flagship?.posterPath) {
    return parseTmdbPoster(
      encodeTmdbSource(flagship.posterPath, flagship.priority),
      size
    );
  }

  return null;
}
