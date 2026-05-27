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

export type EntertainmentSport = "cine" | "series" | "tv";

export function isEntertainmentSport(
  sport?: string | null
): sport is EntertainmentSport {
  return sport === "cine" || sport === "series" || sport === "tv";
}

export type EntertainmentVisualOptions = {
  premiere?: boolean;
  curatedMovie?: boolean;
};

/** Portada TMDB remota cuando existe; fallback local si no. */
export function buildEntertainmentCover(event: EventRow): SpotlightCover {
  const sport = isEntertainmentSport(event.sport) ? event.sport : "tv";
  const flagship = matchesSpanishTvFlagship(event);
  if (flagship?.localPosterPath) {
    return localSpotlightCover(
      flagship.localPosterPath,
      "poster",
      flagship.posterObjectPosition
    );
  }
  const poster = resolveEventPosterUrl(event, "poster");
  if (poster) return remoteSpotlightCover(poster, "poster");

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
  if (sport === "series") return "qvh-spotlight-visual-series";
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
  if (sport === "series") return "fh-media-spotlight-visual-series";
  return "fh-media-spotlight-visual-premiere";
}
