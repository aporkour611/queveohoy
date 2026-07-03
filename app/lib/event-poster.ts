import type { EventRow } from "../components/types";
import { curatedMovieByExternalId } from "./movies-curated";
import { curatedSeriesByExternalId } from "./series-curated";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";
import { parseJikanPoster } from "./jikan-client";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbPoster } from "./tmdb-client";
import { preferLocalWebpUrl } from "./prefer-local-webp";

function localPosterPath(path: string): string {
  return preferLocalWebpUrl(path);
}

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

/** Poster del evento: póster editorial local en TV flagship; TMDB cuando es fiable. */
export function resolveEventPosterUrl(
  event: EventRow,
  size: "thumb" | "card" | "poster" = "poster"
): string | null {
  const flagship = matchesSpanishTvFlagship(event);

  const fromJikan = parseJikanPoster(event.source, size);
  if (fromJikan) return fromJikan;

  if (flagship?.localPosterPath) return localPosterPath(flagship.localPosterPath);

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

  if (event.sport === "series" && /mobland/i.test(`${event.title ?? ""} ${event.competition ?? ""}`)) {
    return localPosterPath("/posters/mobland-s2.png");
  }

  return null;
}

export function resolveEventPosterObjectPosition(
  event: EventRow
): string | undefined {
  return matchesSpanishTvFlagship(event)?.posterObjectPosition;
}
