import { sportLabel } from "./filter-config";
import { parseChannels } from "./channels";
import { displayTime } from "./madrid-time";
import { parseTmdbPoster } from "./tmdb";
import {
  formatEventDateLabel,
  parseUfcHeadline,
  parseUfcImage,
  parseUfcKindFromSource,
  ufcKindLabel,
} from "./thesportsdb-ufc";
import type { EventRow } from "../components/types";

export type SpotlightBadgeVariant =
  | "ppv"
  | "fight-night"
  | "ufc"
  | "futbol"
  | "motor"
  | "esports"
  | "media"
  | "default";

export type SpotlightCardModel = {
  headline: string;
  badge: string;
  badgeVariant: SpotlightBadgeVariant;
  dateLabel: string;
  time: string;
  meta: string;
  platform: string;
  poster?: string;
  visualClass?: string;
};

function teamTitle(event: EventRow): string | null {
  const home = event.home_team?.trim();
  const away = event.away_team?.trim();
  if (home && away) return `${home} vs ${away}`;
  return null;
}

export function getSpotlightCardModel(event: EventRow): SpotlightCardModel {
  const sport = event.sport ?? "";
  const date = event.date ?? "";
  const dateLabel = date ? formatEventDateLabel(date) : "";
  const time = displayTime(event.time);
  const channels = parseChannels(event.platform).join(" · ");

  if (sport === "ufc") {
    const kind = parseUfcKindFromSource(event.source);
    return {
      headline: event.title?.trim() || parseUfcHeadline(event.title ?? ""),
      badge: event.competition?.trim() || ufcKindLabel(kind),
      badgeVariant: kind === "ppv" ? "ppv" : kind === "fight-night" ? "fight-night" : "ufc",
      dateLabel,
      time,
      meta: event.platform?.trim() || "UFC",
      platform: "UFC Fight Pass",
      poster: parseUfcImage(event.source) ?? undefined,
      visualClass: "qvh-spotlight-visual-ufc",
    };
  }

  if (sport === "cine" || sport === "series") {
    return {
      headline: event.title?.trim() || "Sin título",
      badge: sport === "cine" ? "Cine" : "Series",
      badgeVariant: "media",
      dateLabel,
      time,
      meta: event.competition?.trim() || sportLabel(sport),
      platform: event.platform?.trim() || channels || "TV y streaming",
      poster: parseTmdbPoster(event.source) ?? undefined,
      visualClass: "qvh-spotlight-visual-media",
    };
  }

  if (sport === "formula1" || sport === "motos") {
    return {
      headline: event.title?.trim() || sportLabel(sport),
      badge: sportLabel(sport),
      badgeVariant: "motor",
      dateLabel,
      time,
      meta: event.competition?.trim() || "Motor",
      platform: event.platform?.trim() || channels || "TV",
      visualClass: "qvh-spotlight-visual-motor",
    };
  }

  if (["csgo", "valorant", "lol"].includes(sport)) {
    return {
      headline: teamTitle(event) || event.title?.trim() || sportLabel(sport),
      badge: event.competition?.split(" · ")[0]?.trim() || sportLabel(sport),
      badgeVariant: "esports",
      dateLabel,
      time,
      meta: channels || event.competition?.trim() || sportLabel(sport),
      platform: event.platform?.trim() || "Streaming",
      visualClass: "qvh-spotlight-visual-esports",
    };
  }

  if (sport === "futbol") {
    return {
      headline: teamTitle(event) || event.title?.trim() || "Partido",
      badge: event.competition?.split(" · ")[0]?.trim() || "Fútbol",
      badgeVariant: "futbol",
      dateLabel,
      time,
      meta: channels || event.competition?.trim() || "Fútbol",
      platform: event.platform?.trim() || channels || "TV",
      visualClass: "qvh-spotlight-visual-futbol",
    };
  }

  return {
    headline: teamTitle(event) || event.title?.trim() || sportLabel(sport) || "Evento",
    badge: event.competition?.trim() || sportLabel(sport) || "Deportes",
    badgeVariant: "default",
    dateLabel,
    time,
    meta: channels || event.competition?.trim() || sportLabel(sport),
    platform: event.platform?.trim() || channels || "TV",
    visualClass: "qvh-spotlight-visual-default",
  };
}
