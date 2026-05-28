import type { EventRow } from "../components/types";
import { curatedMovieByExternalId } from "./movies-curated";
import { curatedSeriesByExternalId } from "./series-curated";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";
import { parseJikanPoster } from "./jikan-client";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbPoster } from "./tmdb-client";

function flagshipTmdbPoster(
  flagship: NonNullable<ReturnType<typeof matchesSpanishTvFlagship>>,
  size: "thumb" | "card" | "poster"
): string | null {
  if (!flagship.posterPath) return null;
  return parseTmdbPoster(
    encodeTmdbSource(flagship.posterPath, flagship.priority),
    size
  );
}

/** Poster del evento: TMDB oficial primero; fallback editorial local. */
export function resolveEventPosterUrl(
  event: EventRow,
  size: "thumb" | "card" | "poster" = "poster"
): string | null {
  const flagship = matchesSpanishTvFlagship(event);

  const fromJikan = parseJikanPoster(event.source, size);
  if (fromJikan) return fromJikan;

  const fromSource = parseTmdbPoster(event.source, size);
  if (fromSource) return fromSource;

  if (flagship) {
    const official = flagshipTmdbPoster(flagship, size);
    if (official) return official;
  }

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

  if (flagship?.localPosterPath) return flagship.localPosterPath;

  return null;
}

export function resolveEventPosterObjectPosition(
  event: EventRow
): string | undefined {
  return matchesSpanishTvFlagship(event)?.posterObjectPosition;
}
