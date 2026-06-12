import type { EventRow } from "../components/types";
import { CHAMPIONS_FINAL_FALLBACK } from "./champions-week";
import { resolveChannelsForEvent } from "./channels";
import { addDaysToDateKey, eventDisplayTime } from "./madrid-time";
import { getMadridTodayKey } from "./seo-date";
import {
  parseUfcFighterImages,
  parseUfcKindFromSource,
  parseUfcMainEventFighters,
} from "./thesportsdb-ufc-client";
import { formatDisplayDateLabel, MADRID_TZ } from "./timezone";

export type UfcWeekContext = {
  isActive: true;
  mainEvent: EventRow;
  kicker: string;
  headline: string;
  stageLabel: string;
  fighter1: string;
  fighter2: string;
  fighter1Image?: string;
  fighter2Image?: string;
  dateLabel: string;
  time: string;
  eventDate: string;
  eventTime: string;
  channels: string[];
  venueLabel: string;
};

/** Retratos editoriales (TheSportsDB cutouts) para Freedom 250. */
export const UFC_CASABLANCA_FIGHTER_IMAGES = {
  topuria:
    "https://r2.thesportsdb.com/images/media/player/cutout/cz7spq1706003785.png",
  gaethje:
    "https://r2.thesportsdb.com/images/media/player/cutout/vstc9p1690818737.png",
} as const;

const UFC_CASABLANCA_SOURCE = [
  "ufc",
  "kind:ppv",
  "num:250",
  `f1:${UFC_CASABLANCA_FIGHTER_IMAGES.topuria}`,
  `f2:${UFC_CASABLANCA_FIGHTER_IMAGES.gaethje}`,
].join("|");

/** Ventana editorial UFC Casablanca (Freedom 250 · Topuria vs Gaethje). */
export const UFC_CASABLANCA_FALLBACK = {
  windowStart: "2026-05-30",
  windowEnd: "2026-06-15",
  event: {
    id: -9101,
    title: "UFC Freedom 250",
    sport: "ufc",
    date: "2026-06-15",
    time: "02:00",
    competition: "Ilia Topuria vs Justin Gaethje · Título ligero",
    home_team: "Ilia Topuria",
    away_team: "Justin Gaethje",
    external_id: "ufc_editorial_freedom_250",
    source: UFC_CASABLANCA_SOURCE,
    platform: "Casa Blanca · Washington · Paramount+",
  } satisfies EventRow,
};

export function isUfcWeekEditorialWindow(todayKey: string): boolean {
  return (
    todayKey >= UFC_CASABLANCA_FALLBACK.windowStart &&
    todayKey <= UFC_CASABLANCA_FALLBACK.windowEnd
  );
}

function fightBlob(event: EventRow): string {
  return `${event.title ?? ""} ${event.competition ?? ""} ${event.home_team ?? ""} ${event.away_team ?? ""}`.toLowerCase();
}

export function isTopuriaGaethjeFight(event: EventRow): boolean {
  if (event.sport !== "ufc") return false;
  const blob = fightBlob(event);
  return /topuria|ilia/.test(blob) && /gaethje|justin/.test(blob);
}

export function isUfcFreedom250(event: EventRow): boolean {
  if (event.sport !== "ufc") return false;
  const blob = fightBlob(event);
  if (/freedom\s*250|ufc\s+250/.test(blob)) return true;
  return /\|num:250/.test(event.source ?? "");
}

export function isUfcWeekMainEvent(event: EventRow): boolean {
  if (!isTopuriaGaethjeFight(event)) return false;
  if (!event.date) return false;
  return (
    event.date >= UFC_CASABLANCA_FALLBACK.windowStart &&
    event.date <= UFC_CASABLANCA_FALLBACK.windowEnd
  );
}

function isMainEventInWindow(
  event: EventRow,
  todayKey: string,
  weekEnd: string
): boolean {
  if (!isUfcWeekMainEvent(event)) return false;
  return event.date! >= todayKey && event.date! <= weekEnd;
}

function stageLabel(event: EventRow): string {
  if (/freedom\s*250/i.test(event.title ?? "")) return "Freedom 250";
  if (/\|num:250/.test(event.source ?? "")) return "Freedom 250";
  const kind = parseUfcKindFromSource(event.source);
  if (kind === "ppv") return "PPV";
  return "Main Event";
}

function venueLabel(event: EventRow): string {
  const platform = event.platform?.trim() ?? "";
  if (platform.includes("Casa Blanca") || /casablanca|white house|washington/i.test(platform)) {
    return "Casablanca";
  }
  return "Casablanca";
}

function resolveFighters(event: EventRow): { f1: string; f2: string; f1Img?: string; f2Img?: string } {
  const matchup = parseUfcMainEventFighters(event.competition, event.title);
  const { f1, f2 } = parseUfcFighterImages(event.source);
  const fighter1 =
    event.home_team?.trim() || matchup?.n1 || "Ilia Topuria";
  const fighter2 =
    event.away_team?.trim() || matchup?.n2 || "Justin Gaethje";

  const editorialFallback = isTopuriaGaethjeFight(event)
    ? {
        f1Img: UFC_CASABLANCA_FIGHTER_IMAGES.topuria,
        f2Img: UFC_CASABLANCA_FIGHTER_IMAGES.gaethje,
      }
    : {};

  return {
    f1: fighter1,
    f2: fighter2,
    f1Img: f1 ?? editorialFallback.f1Img,
    f2Img: f2 ?? editorialFallback.f2Img,
  };
}

function buildUfcWeekContext(mainEvent: EventRow): UfcWeekContext {
  const { f1, f2, f1Img, f2Img } = resolveFighters(mainEvent);

  return {
    isActive: true,
    mainEvent,
    kicker: "Semana de",
    headline: "UFC Casablanca",
    stageLabel: stageLabel(mainEvent),
    fighter1: f1,
    fighter2: f2,
    fighter1Image: f1Img,
    fighter2Image: f2Img,
    dateLabel: mainEvent.date
      ? formatDisplayDateLabel(mainEvent.date, MADRID_TZ)
      : "",
    time: eventDisplayTime(mainEvent),
    eventDate: mainEvent.date ?? "",
    eventTime: mainEvent.time?.trim() || "02:00",
    channels: resolveChannelsForEvent(mainEvent),
    venueLabel: venueLabel(mainEvent),
  };
}

function resolveEditorialMainEvent(events: EventRow[]): EventRow {
  const fromFeed = events.find(isUfcWeekMainEvent);
  if (fromFeed) return fromFeed;
  return UFC_CASABLANCA_FALLBACK.event;
}

/** Main event UFC Casablanca dentro de la ventana → hero y temática especial. */
export function resolveUfcWeekContext(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): UfcWeekContext | null {
  if (!isUfcWeekEditorialWindow(todayKey)) return null;

  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);
  const inWindow = events.find((event) =>
    isMainEventInWindow(event, todayKey, weekEnd)
  );

  if (inWindow) return buildUfcWeekContext(inWindow);

  return buildUfcWeekContext(resolveEditorialMainEvent(events));
}

export function isUfcCompetitionTitle(title: string): boolean {
  return /\bufc\b/i.test(title);
}

/** Temática global del sitio (prioriza UFC sobre Champions). */
export function resolveSiteWeekTheme(
  todayKey: string = getMadridTodayKey()
): "ufc-casablanca" | "champions" | null {
  if (isUfcWeekEditorialWindow(todayKey)) return "ufc-casablanca";

  if (
    todayKey >= CHAMPIONS_FINAL_FALLBACK.windowStart &&
    todayKey <= CHAMPIONS_FINAL_FALLBACK.windowEnd
  ) {
    return "champions";
  }

  return null;
}
