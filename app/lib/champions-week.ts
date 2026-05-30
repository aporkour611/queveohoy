import type { EventRow } from "../components/types";
import { resolveChannelsForEvent } from "./channels";
import { isChampionsFinal } from "./event-card-stamp";
import { parseFootballTeamIds, teamCrestUrl } from "./football";
import { addDaysToDateKey, eventDisplayTime } from "./madrid-time";
import { formatDisplayDateLabel, MADRID_TZ } from "./timezone";

export type ChampionsWeekContext = {
  isActive: true;
  finalEvent: EventRow;
  kicker: string;
  headline: string;
  stageLabel: string;
  homeTeam: string;
  awayTeam: string;
  homeCrest?: string;
  awayCrest?: string;
  dateLabel: string;
  time: string;
  eventDate: string;
  eventTime: string;
  channels: string[];
};

const PSG_TEAM_ID = "524";
const ARSENAL_TEAM_ID = "57";

function championsStageLabel(event: EventRow): string {
  const comp = event.competition ?? "";
  const stageMatch = comp.match(/·\s*(.+)$/);
  if (stageMatch?.[1]?.trim()) return stageMatch[1].trim();
  if (/\bfinal\b/i.test(comp)) return "Final";
  return "Final";
}

function isPsGArsenalFinal(event: EventRow): boolean {
  const ids = parseFootballTeamIds(
    event.external_id,
    event.source,
    event.home_team,
    event.away_team
  );
  if (ids) {
    return (
      (ids.homeId === PSG_TEAM_ID && ids.awayId === ARSENAL_TEAM_ID) ||
      (ids.homeId === ARSENAL_TEAM_ID && ids.awayId === PSG_TEAM_ID)
    );
  }

  const blob = `${event.home_team ?? ""} ${event.away_team ?? ""} ${event.title ?? ""}`.toLowerCase();
  return /paris saint|psg/.test(blob) && /arsenal/.test(blob);
}

function isFinalInWindow(
  event: EventRow,
  todayKey: string,
  weekEnd: string
): boolean {
  if (!isChampionsFinal(event) || !event.date) return false;
  return event.date >= todayKey && event.date <= weekEnd;
}

/** Ventana editorial UCL final 2026 (si el cron aún no trajo el partido). */
export const CHAMPIONS_FINAL_FALLBACK = {
  windowStart: "2026-05-25",
  windowEnd: "2026-06-05",
  event: {
    id: -9001,
    title: "Paris Saint-Germain vs Arsenal",
    sport: "futbol",
    date: "2026-05-31",
    time: "18:00",
    competition: "UEFA Champions League · Final",
    home_team: "Paris Saint-Germain",
    away_team: "Arsenal",
    external_id: "football-data:524:57",
    source: "football-data:524:57",
    platform: "Movistar+ · DAZN",
  } satisfies EventRow,
};

function isEditorialWindow(todayKey: string): boolean {
  return (
    todayKey >= CHAMPIONS_FINAL_FALLBACK.windowStart &&
    todayKey <= CHAMPIONS_FINAL_FALLBACK.windowEnd
  );
}

function buildChampionsWeekContext(finalEvent: EventRow): ChampionsWeekContext {
  const homeTeam =
    finalEvent.home_team?.trim() ||
    finalEvent.title?.split(/\s+vs\s+/i)[0]?.trim() ||
    "Local";
  const awayTeam =
    finalEvent.away_team?.trim() ||
    finalEvent.title?.split(/\s+vs\s+/i)[1]?.trim() ||
    "Visitante";

  const teamIds = parseFootballTeamIds(
    finalEvent.external_id,
    finalEvent.source,
    finalEvent.home_team,
    finalEvent.away_team
  );

  return {
    isActive: true,
    finalEvent,
    kicker: "Semana de",
    headline: "Champions League",
    stageLabel: championsStageLabel(finalEvent),
    homeTeam,
    awayTeam,
    homeCrest: teamIds ? teamCrestUrl(teamIds.homeId) : undefined,
    awayCrest: teamIds ? teamCrestUrl(teamIds.awayId) : undefined,
    dateLabel: finalEvent.date
      ? formatDisplayDateLabel(finalEvent.date, MADRID_TZ)
      : "",
    time: eventDisplayTime(finalEvent),
    eventDate: finalEvent.date ?? "",
    eventTime: finalEvent.time?.trim() || "18:00",
    channels: resolveChannelsForEvent(finalEvent),
  };
}

function isPsGArsenalFinalInEditorial(event: EventRow): boolean {
  if (!isChampionsFinal(event) || !isPsGArsenalFinal(event) || !event.date) {
    return false;
  }
  return (
    event.date >= CHAMPIONS_FINAL_FALLBACK.windowStart &&
    event.date <= CHAMPIONS_FINAL_FALLBACK.windowEnd
  );
}

function resolveEditorialFinalEvent(
  events: EventRow[],
  todayKey: string
): EventRow | null {
  if (!isEditorialWindow(todayKey)) return null;

  const psgArsenal = events.find(isPsGArsenalFinalInEditorial);
  if (psgArsenal) return psgArsenal;

  return CHAMPIONS_FINAL_FALLBACK.event;
}

/** Final de Champions dentro de la ventana semanal → activar diseño especial. */
export function resolveChampionsWeekContext(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): ChampionsWeekContext | null {
  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);

  const editorialFinal = resolveEditorialFinalEvent(events, todayKey);
  if (editorialFinal) {
    return buildChampionsWeekContext(editorialFinal);
  }

  const finalEvent = events.find((event) =>
    isFinalInWindow(event, todayKey, weekEnd)
  );

  if (!finalEvent) return null;

  return buildChampionsWeekContext(finalEvent);
}

export function isChampionsCompetitionTitle(title: string): boolean {
  return /champions/i.test(title);
}
