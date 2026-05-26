import type { EventRow } from "../components/types";
import { sportFilterGroupId } from "./filter-config";
import { eventCanDisplay, filterEventsForDisplay } from "./event-crests";
import { capTopMediaEvents, parseTmdbBuzzScore } from "./tmdb";

const COMPETITION_PRIORITY: { match: RegExp; score: number }[] = [
  { match: /champions|mundial|world cup/i, score: 100 },
  { match: /europa league/i, score: 92 },
  { match: /conference/i, score: 88 },
  { match: /libertadores|sudamericana/i, score: 86 },
  { match: /primera|laliga|liga española/i, score: 85 },
  { match: /premier/i, score: 84 },
  { match: /bundesliga/i, score: 82 },
  { match: /serie a/i, score: 81 },
  { match: /ligue 1/i, score: 80 },
  { match: /formula|f1/i, score: 78 },
  { match: /vct|major|worlds|iem|blast/i, score: 76 },
];

const SPORT_BASE: Record<string, number> = {
  futbol: 70,
  formula1: 65,
  motos: 64,
  cine: 62,
  series: 61,
  tv: 68,
  tenis: 60,
  basket: 58,
  ciclismo: 55,
  ufc: 63,
  csgo: 55,
  valorant: 54,
  lol: 53,
};

/** Orden de bloques en la leyenda / filtros */
export const FEATURED_CATEGORY_ORDER = [
  "deportes",
  "motor",
  "esports",
  "cine",
  "tv",
] as const;

/** Cuántos eventos destacados por categoría en la home sin filtros */
export const FEATURED_PER_CATEGORY = 1;

/** Umbral para considerar un evento "importante" (reintento de escudos en cron) */
export const IMPORTANT_EVENT_MIN_SCORE = 75;

export function isImportantEvent(e: EventRow): boolean {
  return eventPriority(e) >= IMPORTANT_EVENT_MIN_SCORE;
}

export function eventPriority(e: EventRow): number {
  let score = SPORT_BASE[e.sport ?? ""] ?? 40;

  const comp = e.competition ?? "";
  for (const { match, score: s } of COMPETITION_PRIORITY) {
    if (match.test(comp)) {
      score = Math.max(score, s);
      break;
    }
  }

  if (comp.includes("· Final")) score += 15;
  if (e.sport === "cine" || e.sport === "series") {
    const buzz = parseTmdbBuzzScore(e.source);
    if (buzz > 0) score += Math.min(50, Math.round(buzz / 8));
  }
  if ((e as { featured?: boolean }).featured) score += 25;
  if ((e as { popularity?: number }).popularity) {
    score += Math.min(20, (e as { popularity?: number }).popularity ?? 0);
  }

  return score;
}

function groupByCategory(events: EventRow[]): Map<string, EventRow[]> {
  const byCategory = new Map<string, EventRow[]>();

  for (const e of events) {
    const cat = sportFilterGroupId(e.sport ?? "");
    if (!cat) continue;
    const list = byCategory.get(cat) ?? [];
    list.push(e);
    byCategory.set(cat, list);
  }

  return byCategory;
}

function pickTopPerCategory(
  pool: EventRow[],
  requireCrests: boolean
): EventRow[] {
  const eligible = requireCrests ? pool.filter(eventCanDisplay) : pool;
  const byCategory = groupByCategory(eligible);
  const picked: EventRow[] = [];

  for (const cat of FEATURED_CATEGORY_ORDER) {
    const list = byCategory.get(cat);
    if (!list?.length) continue;

    if (cat === "cine") {
      for (const sportId of ["cine", "series"] as const) {
        const sportList = list.filter((e) => e.sport === sportId);
        if (!sportList.length) continue;
        const sorted = [...sportList].sort(
          (a, b) =>
            eventPriority(b) - eventPriority(a) ||
            (a.time ?? "").localeCompare(b.time ?? "")
        );
        picked.push(sorted[0]);
      }
      continue;
    }

    const sorted = [...list].sort(
      (a, b) =>
        eventPriority(b) - eventPriority(a) ||
        (a.time ?? "").localeCompare(b.time ?? "")
    );
    picked.push(...sorted.slice(0, FEATURED_PER_CATEGORY));
  }

  return picked.sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}

/** Vista principal: lo más importante de cada categoría (con escudos si aplica) */
export function pickFeaturedEvents(dayEvents: EventRow[]): EventRow[] {
  return pickTopPerCategory(dayEvents, true);
}

/** Al filtrar: solo eventos con escudo en deportes de equipo; cine/series top por día */
export function pickFilteredEvents(events: EventRow[]): EventRow[] {
  const sorted = filterEventsForDisplay(events).sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
  return capTopMediaEvents(sorted) as EventRow[];
}

/** Próximos al filtrar: ordenados por importancia, sin exigir escudo */
export function pickUpcomingFilteredEvents(events: EventRow[]): EventRow[] {
  return pickFilteredEvents(events);
}

/** Próximos en vista destacada: solo importantes con escudos */
export function pickUpcomingFeaturedEvents(
  events: EventRow[],
  selectedDate: string
): EventRow[] {
  const upcoming = events.filter((e) => e.date && e.date > selectedDate);
  return pickTopPerCategory(upcoming, true);
}
