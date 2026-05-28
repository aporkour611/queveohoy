import type { EventRow } from "../components/types";
import { resolveEventPosterUrl } from "./event-poster";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";
import {
  hasSpotlightPosterCover,
  localSpotlightCover,
  mediaFallbackCover,
  remoteSpotlightCover,
  type SpotlightCover,
} from "./spotlight-art";

export type EntertainmentSport = "cine" | "series" | "anime" | "tv";

export function isEntertainmentSport(
  sport?: string | null
): sport is EntertainmentSport {
  return (
    sport === "cine" ||
    sport === "series" ||
    sport === "anime" ||
    sport === "tv"
  );
}

export type EntertainmentVisualOptions = {
  premiere?: boolean;
  curatedMovie?: boolean;
};

/** Portada TMDB oficial cuando existe; fallback editorial local. */
export function buildEntertainmentCover(event: EventRow): SpotlightCover {
  const sport = isEntertainmentSport(event.sport) ? event.sport : "tv";
  const flagship = matchesSpanishTvFlagship(event);
  const poster = resolveEventPosterUrl(event, "poster");

  if (poster) {
    const isLocal =
      poster.startsWith("/") &&
      !poster.startsWith("//") &&
      !poster.includes("image.tmdb.org") &&
      !poster.includes("media.themoviedb.org");

    if (isLocal) {
      return localSpotlightCover(
        poster,
        "poster",
        flagship?.posterObjectPosition
      );
    }

    return remoteSpotlightCover(
      poster,
      "poster",
      flagship?.posterObjectPosition
    );
  }

  return (
    mediaFallbackCover(sport) ??
    localSpotlightCover("/fallback/tv.svg", "emblem")
  );
}

/** Clase visual de Destacados: con portada usa fondo de póster; sin ella, gradiente por tipo. */
export function entertainmentSpotlightVisualClass(
  sport: string,
  cover: SpotlightCover,
  options: EntertainmentVisualOptions = {}
): string {
  if (hasSpotlightPosterCover(cover)) {
    return "qvh-spotlight-visual-series";
  }

  if (options.premiere || options.curatedMovie) {
    return "qvh-spotlight-visual-premiere";
  }

  if (sport === "cine") return "qvh-spotlight-visual-cine";
  if (sport === "series" || sport === "anime") return "qvh-spotlight-visual-series";
  return "qvh-spotlight-visual-premiere";
}

/** Clase visual de tarjetas del feed de entretenimiento. */
export function matchCardEntertainmentVisualClass(
  sport: string,
  hasPoster: boolean,
  options: EntertainmentVisualOptions = {}
): string {
  if (hasPoster) return "fh-media-spotlight-visual-series";

  if (options.premiere || options.curatedMovie) {
    return "fh-media-spotlight-visual-premiere";
  }

  if (sport === "cine") return "fh-media-spotlight-visual-cine";
  if (sport === "series" || sport === "anime") {
    return "fh-media-spotlight-visual-series";
  }
  return "fh-media-spotlight-visual-premiere";
}
