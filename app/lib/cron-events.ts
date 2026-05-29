import type { EventRow } from "../components/types";
import { isBlockedSport } from "./blocked-sports";
import {
  eventHasTeamCrests,
  isTeamCrestSport,
} from "./event-crests";
import { enrichEventCrests } from "./event-enrich";
import { isEsportsSport } from "./esports";
import { isImportantEvent } from "./featured";
import { eventHasPlaceholderTeams, isPublishableTeamEvent } from "./event-quality";

const ENRICH_RETRIES = 3;

export type CronEventInput = {
  external_id?: string | null;
  title?: string | null;
  home_team?: string | null;
  away_team?: string | null;
  date?: string | null;
  time?: string | null;
  sport?: string | null;
  category?: string | null;
  competition?: string | null;
  platform?: string | null;
  source?: string | null;
};

function asScorable(e: CronEventInput): EventRow {
  return e as unknown as EventRow;
}

/** Importación: e-sports siempre; resto de deportes de equipo exige escudo o importancia. */
export async function prepareEventsForImport<T extends CronEventInput>(
  events: T[]
): Promise<T[]> {
  const out: T[] = [];

  for (const raw of events) {
    if (isBlockedSport(raw.sport)) continue;
    if (!isPublishableTeamEvent(raw)) continue;

    const e = asScorable(raw);
    const sport = e.sport ?? "";

    if (isEsportsSport(sport)) {
      let row = raw;
      if (!eventHasTeamCrests(e)) {
        const enriched = await enrichEventCrests(e, ENRICH_RETRIES);
        if (enriched) row = { ...raw, ...enriched } as T;
      }
      out.push(row);
      continue;
    }

    if (!isTeamCrestSport(sport)) {
      out.push(raw);
      continue;
    }

    if (eventHasTeamCrests(e)) {
      out.push(raw);
      continue;
    }

    if (!isImportantEvent(e)) continue;

    const enriched = await enrichEventCrests(e, ENRICH_RETRIES);
    if (enriched && eventHasTeamCrests(enriched)) {
      out.push({ ...raw, ...enriched } as T);
    } else if (isImportantEvent(e)) {
      out.push(enriched ? ({ ...raw, ...enriched } as T) : raw);
      if (!enriched || !eventHasTeamCrests(enriched)) {
        console.log(
          `Import importante sin escudos completos (reintento en cron): ${e.title}`
        );
      }
    }
  }

  return out;
}

export function shouldPurgeEvent(e: EventRow): boolean {
  if (isBlockedSport(e.sport)) return true;
  /** Solo placeholders; no borrar partidos por falta de escudo (se enriquecen en cron). */
  return eventHasPlaceholderTeams(e);
}

export function needsCrestEnrichment(e: EventRow): boolean {
  if (!isTeamCrestSport(e.sport ?? "")) return false;
  if (eventHasTeamCrests(e)) return false;
  return isImportantEvent(e);
}
