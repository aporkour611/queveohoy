import { sportLabel } from "./filter-config";
import { resolveChannelsForEvent } from "./channels";
import { eventDisplayTime, MADRID_TZ } from "./madrid-time";
import { formatDisplayDateLabel } from "./timezone";
import {
  parseFootballTeamIds,
  shortTeamName,
  teamCrestUrl,
  footballSpotlightMeta,
} from "./football";
import { getTvShowCategory, tvCategoryLabel } from "./tv-show-category";
import { displaySeriesSubtitle, displaySeriesTitle } from "./series-display";
import { resolveEventChannelList } from "./media-platform";
import { isSeasonPremiereEvent } from "./tmdb-client";
import { curatedMovieByExternalId } from "./movies-curated";
import {
  buildEntertainmentCover,
  entertainmentSpotlightVisualClass,
} from "./entertainment-art";
import {
  parseUfcFighterImages,
  parseUfcKindFromSource,
  parseUfcMainEventFighters,
  ufcKindLabel,
} from "./thesportsdb-ufc-client";
import {
  esportsLogoFallbackUrls,
  isEsportsSport,
  parseEsportsTeamLogos,
} from "./esports";
import {
  getEsportsGameArt,
  getMotorArt,
  localSpotlightCover,
  mediaFallbackCover,
  remoteSpotlightCover,
  type SpotlightCover,
} from "./spotlight-art";
import { eventDisplayTitle } from "./event-display";
import { isChampionsFinal } from "./event-card-stamp";
import { parseLeaguePoster } from "./thesportsdb-leagues";
import {
  isRolandGarrosEvent,
  isRolandGarrosKnockout,
} from "./roland-garros";
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
  /** Canales como pegatinas individuales (fútbol, motor, etc.) */
  channelList?: string[];
  coverImage?: SpotlightCover;
  visualClass?: string;
  homeCrest?: string;
  awayCrest?: string;
  homeCrestList?: string[];
  awayCrestList?: string[];
  homeName?: string;
  awayName?: string;
  showTeamDuel?: boolean;
  showUfcDuel?: boolean;
  showRolandGarrosDuel?: boolean;
};

function mediaCover(event: EventRow, sport: string): SpotlightCover {
  return buildEntertainmentCover({ ...event, sport });
}

function teamTitle(event: EventRow): string | null {
  const home = event.home_team?.trim();
  const away = event.away_team?.trim();
  if (home && away) return `${home} vs ${away}`;
  return null;
}

function ufcSpotlightBadge(
  kind: ReturnType<typeof parseUfcKindFromSource>,
  eventName: string,
  cardLine?: string | null
): string {
  if (kind === "ppv" || /^UFC\s+\d+$/i.test(eventName)) return eventName;
  if (kind === "fight-night") {
    return /^UFC Fight Night/i.test(eventName) ? eventName : ufcKindLabel(kind);
  }
  if (kind === "road" || /temporada\s+\d+/i.test(cardLine ?? "")) return "UFC";
  return ufcKindLabel(kind);
}

export function getSpotlightCardModel(
  event: EventRow,
  timeZone: string = MADRID_TZ
): SpotlightCardModel {
  const sport = event.sport ?? "";
  const date = event.date ?? "";
  const dateLabel = date ? formatDisplayDateLabel(date, timeZone) : "";
  const time = eventDisplayTime(event);
  const channelList = resolveEventChannelList(event);
  const channels = channelList.join(" · ");

  if (sport === "ufc") {
    const kind = parseUfcKindFromSource(event.source);
    const eventName = event.title?.trim() || "UFC";
    const cardLine = event.competition?.trim();
    const badge = ufcSpotlightBadge(kind, eventName, cardLine);
    const { f1, f2 } = parseUfcFighterImages(event.source);
    const matchup = parseUfcMainEventFighters(event.competition, event.title);
    const homeName = event.home_team || matchup?.n1;
    const awayName = event.away_team || matchup?.n2;

    return {
      headline: eventName,
      badge,
      badgeVariant: kind === "ppv" ? "ppv" : kind === "fight-night" ? "fight-night" : "ufc",
      dateLabel,
      time,
      meta: cardLine && cardLine !== ufcKindLabel(kind) ? cardLine : event.platform?.trim() || "UFC",
      platform: "UFC Fight Pass",
      showUfcDuel: Boolean(f1 || f2 || (homeName && awayName)),
      homeCrest: f1,
      awayCrest: f2,
      homeName: homeName ?? undefined,
      awayName: awayName ?? undefined,
      visualClass: "qvh-spotlight-visual-ufc",
    };
  }

  if (sport === "cine" || sport === "series" || sport === "anime") {
    const premiere = sport === "series" && isSeasonPremiereEvent(event);
    const curatedMovie = sport === "cine" ? curatedMovieByExternalId(event.external_id) : null;
    const competition = event.competition?.trim() || "";
    const coverImage = mediaCover(event, sport);

    return {
      headline:
        sport === "series"
          ? displaySeriesTitle(event)
          : event.title?.trim() || "Sin título",
      badge: premiere
        ? "Estreno"
        : sport === "cine"
          ? "Cine"
          : sport === "anime"
            ? "Anime"
            : "Series",
      badgeVariant: premiere ? "premiere" : "media",
      dateLabel,
      time,
      meta:
        sport === "series"
          ? displaySeriesSubtitle(event) ||
            competition ||
            "Nuevo episodio"
          : premiere
            ? competition || "Nuevo estreno de temporada"
            : competition || sportLabel(sport),
      platform:
        channelList[0] ||
        event.platform?.trim() ||
        "TV y streaming",
      coverImage,
      visualClass: entertainmentSpotlightVisualClass(sport, coverImage, {
        premiere,
        curatedMovie: Boolean(curatedMovie),
      }),
      channelList: channelList.length ? channelList : undefined,
    };
  }

  if (sport === "tv") {
    const category = getTvShowCategory(event);
    const badge = category ? tvCategoryLabel(category) : "Reality";
    const coverImage = mediaCover(event, sport);

    return {
      headline: event.title?.trim() || badge,
      badge,
      badgeVariant:
        category === "concurso"
          ? "media"
          : category === "directo"
            ? "premiere"
            : "premiere",
      dateLabel,
      time,
      meta: event.competition?.trim() || `${badge} · Nuevo episodio`,
      platform: channelList[0] || event.platform?.trim() || "TV y streaming",
      coverImage,
      visualClass: entertainmentSpotlightVisualClass(sport, coverImage),
      channelList: channelList.length ? channelList : undefined,
    };
  }

  if (sport === "formula1" || sport === "motos") {
    const motorArt = getMotorArt(sport);
    return {
      headline: eventDisplayTitle(event),
      badge: sportLabel(sport),
      badgeVariant: "motor",
      dateLabel,
      time,
      meta: event.competition?.trim() || "Motor",
      platform: event.platform?.trim() || channels || "TV",
      channelList: channelList.length ? channelList : undefined,
      coverImage: localSpotlightCover(motorArt.url, "emblem"),
      visualClass: motorArt.visualClass,
    };
  }

  if (sport === "ciclismo") {
    const poster = parseLeaguePoster(event.source);
    const competition = event.competition?.split(" · ")[0]?.trim() || "Ciclismo";

    return {
      headline: eventDisplayTitle(event),
      badge: competition,
      badgeVariant: "motor",
      dateLabel,
      time,
      meta: competition,
      platform: event.platform?.trim() || channels || "TV",
      channelList: channelList.length ? channelList : undefined,
      coverImage: poster
        ? remoteSpotlightCover(poster, "poster")
        : mediaFallbackCover(sport) ??
          localSpotlightCover("/fallback/deportes.svg", "emblem"),
      visualClass: "qvh-spotlight-visual-motor",
    };
  }

  if (isEsportsSport(sport)) {
    const gameArt = getEsportsGameArt(sport);
    const logos = parseEsportsTeamLogos(event.source);
    const homeName = shortTeamName(event.home_team);
    const awayName = shortTeamName(event.away_team);
    const hasDuel = Boolean(logos?.homeUrl || logos?.awayUrl);

    return {
      headline: teamTitle(event) || event.title?.trim() || gameArt.label,
      badge: event.competition?.split(" · ")[0]?.trim() || gameArt.label,
      badgeVariant: "esports",
      dateLabel,
      time,
      meta: channels || event.competition?.trim() || gameArt.label,
      platform: event.platform?.trim() || channels || "Streaming",
      coverImage: localSpotlightCover(gameArt.url, "poster"),
      visualClass: gameArt.visualClass,
      channelList: channelList.length ? channelList : undefined,
      homeCrest: logos?.homeUrl ?? undefined,
      awayCrest: logos?.awayUrl ?? undefined,
      homeCrestList: logos?.homeUrl
        ? esportsLogoFallbackUrls(logos.homeUrl)
        : undefined,
      awayCrestList: logos?.awayUrl
        ? esportsLogoFallbackUrls(logos.awayUrl)
        : undefined,
      homeName,
      awayName,
      showTeamDuel: hasDuel,
    };
  }

  if (sport === "tenis" && isRolandGarrosEvent(event)) {
    const homeName = event.home_team?.trim() || "";
    const awayName = event.away_team?.trim() || "";
    const competition = event.competition?.trim() || "Roland Garros";
    const isKnockout = isRolandGarrosKnockout(event);

    return {
      headline: teamTitle(event) || event.title?.trim() || "Partido",
      badge: competition,
      badgeVariant: "default",
      dateLabel,
      time,
      meta: competition,
      platform: event.platform?.trim() || channels || "TV",
      channelList: channelList.length ? channelList : undefined,
      visualClass: isKnockout
        ? "qvh-spotlight-visual-rg-knockout"
        : "qvh-spotlight-visual-rg",
      homeName: homeName || undefined,
      awayName: awayName || undefined,
      showRolandGarrosDuel: Boolean(homeName && awayName),
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
    const isClFinal = isChampions && isChampionsFinal(event);

    return {
      headline: teamTitle(event) || event.title?.trim() || "Partido",
      badge: competition,
      badgeVariant: isChampions ? "champions" : "futbol",
      dateLabel,
      time,
      meta: footballSpotlightMeta(event.competition),
      platform: channels || "TV y streaming",
      channelList: channelList.length ? channelList : undefined,
      visualClass: isClFinal
        ? "qvh-spotlight-visual-champions-final"
        : isChampions
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
    headline: eventDisplayTitle(event),
    badge: event.competition?.trim() || sportLabel(sport) || "Deportes",
    badgeVariant: "default",
    dateLabel,
    time,
    meta: channels || event.competition?.trim() || sportLabel(sport),
    platform: event.platform?.trim() || channels || "TV",
    channelList: channelList.length ? channelList : undefined,
    coverImage:
      mediaFallbackCover(sport) ??
      localSpotlightCover("/fallback/deportes.svg", "emblem"),
    visualClass: "qvh-spotlight-visual-default",
  };
}
