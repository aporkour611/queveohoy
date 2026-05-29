import type { EventRow } from "../components/types";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";

export type EventRecord = {
  id?: number;
  title?: string;
  date?: string;
  time?: string;
  sport?: string | null;
  home_team?: string | null;
  away_team?: string | null;
  external_id?: string | null;
  source?: string | null;
  platform?: string | null;
  competition?: string | null;
};

function normalizeTime(time?: string | null) {
  return time?.slice(0, 5) ?? "";
}

/** Título normalizado para deduplicar variantes (T12E1, subtítulos, etc.). */
export function normalizeTitleDedupeKey(title?: string | null): string {
  return (title ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s*[—–\-]\s*.+$/, "")
    .replace(/\bT\d+E\d+\b/gi, "")
    .replace(/\s*(episodio|cap[ií]tulo|cap\.?)\s*\d+.*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Clave estable para considerar dos filas el mismo evento */
export function eventDedupeKey(e: EventRecord): string {
  const footballId = e.external_id?.match(/^football_(\d+)/)?.[1];
  if (footballId) {
    return `football|${e.date}|${normalizeTime(e.time)}|${footballId}`;
  }

  const home = e.home_team?.trim();
  const away = e.away_team?.trim();
  if (home && away && home !== "TBD" && away !== "TBD") {
    const teams = [home, away].sort().join("|");
    return `${e.sport}|${e.date}|${normalizeTime(e.time)}|${teams}`;
  }

  if (e.sport === "tv") {
    const show = matchesSpanishTvFlagship(e as EventRow);
    if (show) {
      return `tv|${show.id}|${e.date}|${normalizeTime(e.time)}`;
    }
  }

  const titleKey = normalizeTitleDedupeKey(e.title);
  if (titleKey) {
    return `${e.sport}|${e.date}|${normalizeTime(e.time)}|${titleKey}`;
  }

  if (e.external_id) return `ext|${e.external_id}`;

  return `fallback|${e.id}`;
}

/** Preferimos la fila más completa (escudos, canales, título corto) */
export function eventQualityScore(e: EventRecord): number {
  let score = 0;

  if (/football-data:\d+:\d+/.test(e.source ?? "")) score += 30;
  if (e.external_id && !/_h\d+_a\d+$/.test(e.external_id)) score += 20;
  if (/_h\d+_a\d+$/.test(e.external_id ?? "")) score -= 40;
  if ((e.platform?.split(",")?.length ?? 0) > 1) score += 15;
  if (e.platform && e.platform !== "DAZN") score += 5;
  if (e.competition) score += 5;
  if (e.home_team && e.away_team) score += 5;
  if (e.title && e.title.length < 40) score += 3;
  if (typeof e.id === "number") score += e.id / 1_000_000;

  return score;
}

function mergeEventGroup<T extends EventRecord>(group: T[]): T {
  const sorted = [...group].sort(
    (a, b) => eventQualityScore(b) - eventQualityScore(a)
  );
  const best = { ...sorted[0] };

  for (const other of sorted.slice(1)) {
    if ((other.platform?.length ?? 0) > (best.platform?.length ?? 0)) {
      best.platform = other.platform;
    }
    if (
      /football-data:\d+:\d+/.test(other.source ?? "") &&
      !/football-data:\d+:\d+/.test(best.source ?? "")
    ) {
      best.source = other.source;
    }
    if (
      other.external_id &&
      !/_h\d+_a\d+$/.test(other.external_id) &&
      /_h\d+_a\d+$/.test(best.external_id ?? "")
    ) {
      best.external_id = other.external_id;
    }
  }

  return best;
}

/** Devuelve un evento por clave, el de mayor calidad (fusiona canales/escudos) */
export function dedupeEvents<T extends EventRecord>(events: T[]): T[] {
  const groups = new Map<string, T[]>();

  for (const e of events) {
    const key = eventDedupeKey(e);
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }

  return Array.from(groups.values()).map(mergeEventGroup);
}

/** IDs a borrar dejando solo el mejor de cada grupo */
export function findDuplicateIdsToRemove(events: EventRecord[]): number[] {
  const groups = new Map<string, EventRecord[]>();

  for (const e of events) {
    if (typeof e.id !== "number") continue;
    const key = eventDedupeKey(e);
    const list = groups.get(key) ?? [];
    list.push(e);
    groups.set(key, list);
  }

  const toRemove: number[] = [];

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    const sorted = [...group].sort(
      (a, b) => eventQualityScore(b) - eventQualityScore(a)
    );
    for (let i = 1; i < sorted.length; i++) {
      if (typeof sorted[i].id === "number") toRemove.push(sorted[i].id!);
    }
  }

  return toRemove;
}
