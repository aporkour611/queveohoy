import type { EventRow } from "../components/types";
import { curatedMovieByExternalId } from "./movies-curated";
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

  const curated = curatedMovieByExternalId(event.external_id);
  if (curated?.posterPath) {
    return parseTmdbPoster(
      encodeTmdbSource(curated.posterPath, curated.priority),
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
