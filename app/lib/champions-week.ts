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

function championsStageLabel(event: EventRow): string {
  const comp = event.competition ?? "";
  const stageMatch = comp.match(/·\s*(.+)$/);
  if (stageMatch?.[1]?.trim()) return stageMatch[1].trim();
  if (/\bfinal\b/i.test(comp)) return "Final";
  return "Final";
}

/** Ventana editorial UCL final 2026 (si el cron aún no trajo el partido). */
const CHAMPIONS_FINAL_FALLBACK = {
  windowStart: "2026-05-25",
  windowEnd: "2026-06-05",
  event: {
    id: -9001,
    title: "Paris Saint-Germain vs Inter",
    sport: "futbol",
    date: "2026-05-31",
    time: "21:00",
    competition: "UEFA Champions League · Final",
    home_team: "Paris Saint-Germain",
    away_team: "Inter",
    external_id: "football-data:524:108",
    source: "football-data:524:108",
    platform: "Movistar+ · DAZN",
  } satisfies EventRow,
};

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
    eventTime: finalEvent.time?.trim() || "00:00",
    channels: resolveChannelsForEvent(finalEvent),
  };
}

/** Final de Champions dentro de la ventana semanal → activar diseño especial. */
export function resolveChampionsWeekContext(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): ChampionsWeekContext | null {
  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);

  const finalEvent =
    events.find((event) => {
      if (!isChampionsFinal(event)) return false;
      if (!event.date) return false;
      return event.date >= todayKey && event.date <= weekEnd;
    }) ??
    (todayKey >= CHAMPIONS_FINAL_FALLBACK.windowStart &&
    todayKey <= CHAMPIONS_FINAL_FALLBACK.windowEnd &&
    CHAMPIONS_FINAL_FALLBACK.event.date >= todayKey &&
    CHAMPIONS_FINAL_FALLBACK.event.date <= weekEnd
      ? CHAMPIONS_FINAL_FALLBACK.event
      : null);

  if (!finalEvent) return null;

  return buildChampionsWeekContext(finalEvent);
}

export function isChampionsCompetitionTitle(title: string): boolean {
  return /champions/i.test(title);
}
