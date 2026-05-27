import type { EventRow } from "../components/types";
import { curatedMovieByExternalId } from "./movies-curated";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbPoster } from "./tmdb-client";

/** Poster TMDB del evento, con fallback editorial para estrenos curados. */
export function resolveEventPosterUrl(
  event: EventRow,
  size: "thumb" | "card" | "poster" = "poster"
): string | null {
  const fromSource = parseTmdbPoster(event.source, size);
  if (fromSource) return fromSource;

  const curated = curatedMovieByExternalId(event.external_id);
  if (!curated?.posterPath) return null;

  return parseTmdbPoster(
    encodeTmdbSource(curated.posterPath, curated.priority),
    size
  );
}
