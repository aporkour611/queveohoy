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

/** Cuántos eventos destacados por categoría (legacy / upcoming) */
export const FEATURED_PER_CATEGORY = 1;

/** Home sin filtros: tope por categoría/deporte dentro de cada día */
export const HOME_SECTION_MAX = 5;

/** Umbral para considerar un evento "importante" (reintento de escudos en cron) */
export const IMPORTANT_EVENT_MIN_SCORE = 75;

const KNOCKOUT_BONUS: { match: RegExp; score: number }[] = [
  { match: /\bfinal\b|gran final/i, score: 18 },
  { match: /semifinal|semi-final|semi final|last.?16|octavos|cuartos|quarter/i, score: 12 },
  { match: /playoff|eliminatoria|knockout|round of/i, score: 8 },
];

const IMPORTANT_FOOTBALL_TEAMS =
  /real madrid|barcelona|atl[eé]tico madrid|sevilla|villarreal|real sociedad|athletic|betis|valencia|psg|paris saint|marseille|lyon|monaco|manchester (city|united)|liverpool|arsenal|chelsea|tottenham|newcastle|bayern|dortmund|leverkusen|juventus|inter milan|ac milan|napoli|roma|lazio|ajax|benfica|porto|sporting cp|celtic|rangers|river plate|boca juniors|flamengo|palmeiras|corinthians/i;

const IMPORTANT_ESPORTS_ORGS =
  /t1\b|gen\.g|hanwha|kt rolster|dk\b|g2\b|fnatic|vitality|karmine|sentinels|cloud9|team liquid|faze|navi|100 thieves|loud|paper rex|drx\b|bilibili|jd gaming|weibo|edg\b|blg\b|m80\b|falcons|heroic|mouz|spirit/i;

const IMPORTANT_ESPORTS_EVENTS =
  /worlds|msi\b|major|iem|blast|vct|champions tour|lec|lck|lpl|lcs|pgl/i;

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

  for (const { match, score: s } of KNOCKOUT_BONUS) {
    if (match.test(comp) || match.test(e.title ?? "")) {
      score += s;
      break;
    }
  }

  if (e.sport === "futbol") {
    const home = e.home_team ?? "";
    const away = e.away_team ?? "";
    const homeBig = IMPORTANT_FOOTBALL_TEAMS.test(home);
    const awayBig = IMPORTANT_FOOTBALL_TEAMS.test(away);
    if (homeBig && awayBig) score += 14;
    else if (homeBig || awayBig) score += 7;
  }

  if (e.sport === "csgo" || e.sport === "valorant" || e.sport === "lol") {
    const blob = `${e.competition ?? ""} ${e.title ?? ""} ${e.home_team ?? ""} ${e.away_team ?? ""}`;
    if (IMPORTANT_ESPORTS_EVENTS.test(blob)) score += 10;
    const homeOrg = IMPORTANT_ESPORTS_ORGS.test(e.home_team ?? "");
    const awayOrg = IMPORTANT_ESPORTS_ORGS.test(e.away_team ?? "");
    if (homeOrg && awayOrg) score += 8;
    else if (homeOrg || awayOrg) score += 4;
  }

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

function sortByPriority(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}

/** Clave de bloque en la home (competición de fútbol o deporte) */
export function displaySectionKey(e: EventRow): string {
  if (e.sport === "futbol") {
    return `futbol:${(e.competition || "Fútbol").split(" · ")[0]}`;
  }
  return `sport:${e.sport ?? "otros"}`;
}

/** Home sin filtros: hasta 5 eventos top por categoría (Valorant, CS2, Champions…) */
export function pickHomePageEvents(dayEvents: EventRow[]): EventRow[] {
  const eligible = dayEvents.filter(eventCanDisplay);
  const bySection = new Map<string, EventRow[]>();

  for (const e of eligible) {
    const key = displaySectionKey(e);
    const list = bySection.get(key) ?? [];
    list.push(e);
    bySection.set(key, list);
  }

  const picked: EventRow[] = [];
  for (const list of bySection.values()) {
    picked.push(...sortByPriority(list).slice(0, HOME_SECTION_MAX));
  }

  return sortByPriority(picked);
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
        const sorted = sortByPriority(sportList);
        picked.push(sorted[0]);
      }
      continue;
    }

    const sorted = sortByPriority(list);
    picked.push(...sorted.slice(0, FEATURED_PER_CATEGORY));
  }

  return sortByPriority(picked);
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
