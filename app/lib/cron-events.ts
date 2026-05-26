import type { EventRow } from "../components/types";
import {
  eventHasTeamCrests,
  isTeamCrestSport,
} from "./event-crests";
import { enrichEventCrests } from "./event-enrich";
import { isImportantEvent } from "./featured";

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

/** Importación: descarta menores sin escudo; reintenta importantes hasta obtener logos */
export async function prepareEventsForImport<T extends CronEventInput>(
  events: T[]
): Promise<T[]> {
  const out: T[] = [];

  for (const raw of events) {
    const e = asScorable(raw);
    const sport = e.sport ?? "";

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
    } else {
      console.log(
        `Import omitido (importante sin escudos, reintento en cron): ${e.title}`
      );
    }
  }

  return out;
}

export function shouldPurgeEvent(e: EventRow): boolean {
  if (!isTeamCrestSport(e.sport ?? "")) return false;
  if (eventHasTeamCrests(e)) return false;
  return !isImportantEvent(e);
}

export function needsCrestEnrichment(e: EventRow): boolean {
  if (!isTeamCrestSport(e.sport ?? "")) return false;
  if (eventHasTeamCrests(e)) return false;
  return isImportantEvent(e);
}
