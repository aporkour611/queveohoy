import type { EventRow } from "../components/types";
import { getTvShowCategory } from "./tv-show-category";

export type MediaPlatformStyle = {
  name: string;
  initials?: string;
  accent: "netflix" | "prime" | "disney" | "max" | "movistar" | "filmin" | "apple" | "default";
};

export function resolveMediaPlatform(channel?: string | null): MediaPlatformStyle | null {
  const raw = channel?.trim();
  if (!raw) return null;

  const c = raw.toLowerCase();
  if (/netflix/i.test(c)) return { name: "Netflix", initials: "N", accent: "netflix" };
  if (/prime|amazon/i.test(c)) return { name: "Prime Video", initials: "p", accent: "prime" };
  if (/disney/i.test(c)) return { name: "Disney+", initials: "D+", accent: "disney" };
  if (/max|hbo/i.test(c)) return { name: "Max", initials: "M", accent: "max" };
  if (/movistar|m\+/i.test(c)) return { name: "Movistar+", initials: "M+", accent: "movistar" };
  if (/filmin/i.test(c)) return { name: "Filmin", initials: "F", accent: "filmin" };
  if (/apple/i.test(c)) return { name: "Apple TV+", initials: "tv", accent: "apple" };
  if (/telecinco|mitele/i.test(c)) return { name: "Telecinco", initials: "T5", accent: "default" };
  if (/rtve|pepetv/i.test(c)) return { name: "RTVE", initials: "R", accent: "default" };
  if (/antena|atresplayer/i.test(c)) return { name: "Antena 3", initials: "A3", accent: "default" };

  return { name: raw, initials: raw.slice(0, 2).toUpperCase(), accent: "default" };
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
