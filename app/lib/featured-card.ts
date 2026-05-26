import { sportLabel } from "./filter-config";
import { parseChannels } from "./channels";
import { displayTime, MADRID_TZ } from "./madrid-time";
import { formatDisplayDateLabel } from "./timezone";
import {
  parseFootballTeamIds,
  shortTeamName,
  teamCrestUrl,
  footballSpotlightMeta,
} from "./football";
import { parseTmdbPoster, isSeasonPremiereEvent } from "./tmdb-client";
import {
  parseUfcImage,
  parseUfcKindFromSource,
  ufcKindLabel,
} from "./thesportsdb-ufc-client";
import type { EventRow } from "../components/types";

export type SpotlightBadgeVariant =
  | "ppv"
  | "fight-night"
  | "ufc"
  | "futbol"
  | "champions"
  | "motor"
  | "esports"
  | "media"
  | "premiere"
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
  homeCrest?: string;
  awayCrest?: string;
  homeName?: string;
  awayName?: string;
  showTeamDuel?: boolean;
};

function teamTitle(event: EventRow): string | null {
  const home = event.home_team?.trim();
  const away = event.away_team?.trim();
  if (home && away) return `${home} vs ${away}`;
  return null;
}

export function getSpotlightCardModel(
  event: EventRow,
  timeZone: string = MADRID_TZ
): SpotlightCardModel {
  const sport = event.sport ?? "";
  const date = event.date ?? "";
  const dateLabel = date ? formatDisplayDateLabel(date, timeZone) : "";
  const time = displayTime(event.time);
  const channels = parseChannels(event.platform).join(" · ");

  if (sport === "ufc") {
    const kind = parseUfcKindFromSource(event.source);
    const eventName = event.title?.trim() || "UFC";
    const cardLine = event.competition?.trim();
    const badge =
      kind === "ppv" || /^UFC\s+\d+$/i.test(eventName)
        ? eventName
        : cardLine || ufcKindLabel(kind);

    return {
      headline: eventName,
      badge,
      badgeVariant: kind === "ppv" ? "ppv" : kind === "fight-night" ? "fight-night" : "ufc",
      dateLabel,
      time,
      meta: cardLine && cardLine !== ufcKindLabel(kind) ? cardLine : event.platform?.trim() || "UFC",
      platform: "UFC Fight Pass",
      poster: parseUfcImage(event.source) ?? undefined,
      visualClass: "qvh-spotlight-visual-ufc",
    };
  }

  if (sport === "cine" || sport === "series") {
    const premiere = sport === "series" && isSeasonPremiereEvent(event);
    const competition = event.competition?.trim() || "";

    return {
      headline: event.title?.trim() || "Sin título",
      badge: premiere ? "Estreno" : sport === "cine" ? "Cine" : "Series",
      badgeVariant: premiere ? "premiere" : "media",
      dateLabel,
      time,
      meta: premiere
        ? competition || "Nuevo estreno de temporada"
        : competition || sportLabel(sport),
      platform: event.platform?.trim() || channels || "TV y streaming",
      poster: parseTmdbPoster(event.source) ?? undefined,
      visualClass: premiere
        ? "qvh-spotlight-visual-premiere"
        : sport === "cine"
          ? "qvh-spotlight-visual-cine"
          : "qvh-spotlight-visual-series",
    };
  }

  if (sport === "tv") {
    return {
      headline: event.title?.trim() || "Reality",
      badge: "Reality",
      badgeVariant: "premiere",
      dateLabel,
      time,
      meta: event.competition?.trim() || "Reality · Nuevo episodio",
      platform: event.platform?.trim() || channels || "TV y streaming",
      poster: parseTmdbPoster(event.source) ?? undefined,
      visualClass: "qvh-spotlight-visual-premiere",
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
    const ids = parseFootballTeamIds(
      event.external_id,
      event.source,
      event.home_team,
      event.away_team
    );
    const homeName = shortTeamName(event.home_team);
    const awayName = shortTeamName(event.away_team);
    const competition = event.competition?.split(" · ")[0]?.trim() || "Fútbol";
    const isChampions = /champions/i.test(event.competition ?? "");

    return {
      headline: teamTitle(event) || event.title?.trim() || "Partido",
      badge: competition,
      badgeVariant: isChampions ? "champions" : "futbol",
      dateLabel,
      time,
      meta: footballSpotlightMeta(event.competition),
      platform: channels || "TV y streaming",
      visualClass: isChampions
        ? "qvh-spotlight-visual-champions"
        : "qvh-spotlight-visual-futbol",
      homeCrest: ids ? teamCrestUrl(ids.homeId) : undefined,
      awayCrest: ids ? teamCrestUrl(ids.awayId) : undefined,
      homeName,
      awayName,
      showTeamDuel: Boolean(ids),
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
