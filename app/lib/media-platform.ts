import type { EventRow } from "../components/types";
import { parseChannels } from "./channels";
import { parseTmdbEpisodeMeta } from "./tmdb-client";
import { getTvShowCategory } from "./tv-show-category";

export type MediaPlatformStyle = {
  name: string;
  initials?: string;
  accent:
    | "netflix"
    | "prime"
    | "disney"
    | "max"
    | "movistar"
    | "filmin"
    | "apple"
    | "default";
};

/** Plataformas reconocibles en España cuando TMDB devuelve marcas US (EPIX, MGM+…). */
const SERIES_PLATFORM_OVERRIDES: Record<string, string> = {
  "124364": "Prime Video", // FROM
  "85552": "HBO Max", // Euphoria
};

const OBSCURE_STREAMING = new Set([
  "epix",
  "mgm",
  "mgm+",
  "starz",
  "showtime",
  "peacock",
  "amc",
  "fx",
  "syfy",
  "tnt",
  "tbs",
  "usa network",
  "cinemax",
]);

function normalizeStreamingBrand(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const c = trimmed.toLowerCase();

  if (/netflix/i.test(c)) return "Netflix";
  if (/prime|amazon/i.test(c)) return "Prime Video";
  if (/disney/i.test(c)) return "Disney+";
  if (/hbo|hbo max|\bmax\b/i.test(c) && !/cinemax/i.test(c)) return "HBO Max";
  if (/movistar|m\+/i.test(c)) return "Movistar+";
  if (/filmin/i.test(c)) return "Filmin";
  if (/apple/i.test(c)) return "Apple TV+";
  if (/paramount/i.test(c)) return "Paramount+";
  if (/sky/i.test(c)) return "Sky Showtime";
  if (/rtve|pepetv/i.test(c)) return "RTVE";
  if (/telecinco|mitele/i.test(c)) return "Telecinco";
  if (/antena|atresplayer/i.test(c)) return "Antena 3";
  if (/twitch/i.test(c)) return "Twitch";
  if (/youtube/i.test(c)) return "YouTube";

  if (OBSCURE_STREAMING.has(c)) return null;

  if (/^[a-z0-9+.\- ]{1,18}$/i.test(trimmed) && trimmed.length <= 5) {
    return null;
  }

  return trimmed;
}

export function resolveMediaPlatform(
  channel?: string | null
): MediaPlatformStyle | null {
  const normalized = channel ? normalizeStreamingBrand(channel) : null;
  if (!normalized) return null;

  const c = normalized.toLowerCase();
  if (/netflix/i.test(c)) return { name: "Netflix", initials: "N", accent: "netflix" };
  if (/prime|amazon/i.test(c)) return { name: "Prime Video", initials: "PV", accent: "prime" };
  if (/disney/i.test(c)) return { name: "Disney+", initials: "D+", accent: "disney" };
  if (/hbo|max/i.test(c)) return { name: "HBO Max", initials: "HBO", accent: "max" };
  if (/movistar|m\+/i.test(c)) return { name: "Movistar+", initials: "M+", accent: "movistar" };
  if (/filmin/i.test(c)) return { name: "Filmin", initials: "F", accent: "filmin" };
  if (/apple/i.test(c)) return { name: "Apple TV+", initials: "tv", accent: "apple" };
  if (/paramount/i.test(c)) return { name: "Paramount+", initials: "P+", accent: "default" };
  if (/sky/i.test(c)) return { name: "Sky Showtime", initials: "Sky", accent: "default" };
  if (/telecinco|mitele/i.test(c)) return { name: "Telecinco", initials: "T5", accent: "default" };
  if (/rtve|pepetv/i.test(c)) return { name: "RTVE", initials: "R", accent: "default" };
  if (/antena|atresplayer/i.test(c)) return { name: "Antena 3", initials: "A3", accent: "default" };
  if (/twitch/i.test(c)) return { name: "Twitch", initials: "Tw", accent: "default" };
  if (/youtube/i.test(c)) return { name: "YouTube", initials: "YT", accent: "default" };

  return {
    name: normalized,
    initials: normalized.slice(0, 2).toUpperCase(),
    accent: "default",
  };
}

const TV_FALLBACKS = ["RTVE", "Telecinco", "Antena 3"];

export function resolveEventStreamingPlatform(
  event: Pick<EventRow, "sport" | "platform" | "external_id">
): MediaPlatformStyle | null {
  const meta = parseTmdbEpisodeMeta(event.external_id);
  const override = meta?.showId
    ? SERIES_PLATFORM_OVERRIDES[meta.showId]
    : undefined;
  if (override) {
    return resolveMediaPlatform(override);
  }

  for (const channel of parseChannels(event.platform)) {
    const normalized = normalizeStreamingBrand(channel);
    if (!normalized) continue;
    const resolved = resolveMediaPlatform(normalized);
    if (resolved) return resolved;
  }

  if (event.sport === "tv") {
    for (const fallback of TV_FALLBACKS) {
      const resolved = resolveMediaPlatform(fallback);
      if (resolved) return resolved;
    }
  }

  return null;
}

export type MediaBadgeTone = "release" | "trending" | "heat" | "news";

export function mediaBadgeForEvent(
  event: Pick<EventRow, "sport" | "title" | "competition">,
  isPremiere = false
): { label: string; tone: MediaBadgeTone } {
  if (event.sport === "tv") {
    const category = getTvShowCategory(event as EventRow);
    if (category === "concurso") return { label: "Concurso", tone: "heat" };
    if (category === "directo") return { label: "Directo", tone: "trending" };
    return { label: "Reality", tone: "trending" };
  }
  if (event.sport === "cine") return { label: "Cine", tone: "heat" };
  if (event.sport === "series" && isPremiere) {
    return { label: "Estreno", tone: "release" };
  }
  if (event.sport === "series") return { label: "Serie", tone: "news" };
  return { label: "Serie", tone: "news" };
}
