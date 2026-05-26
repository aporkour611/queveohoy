import type { EventRow } from "../components/types";

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
];

const SPORT_BASE: Record<string, number> = {
  futbol: 70,
  formula1: 65,
  tenis: 60,
  basket: 58,
  csgo: 55,
  valorant: 54,
  lol: 53,
  dota2: 52,
};

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
  if ((e as { featured?: boolean }).featured) score += 25;
  if ((e as { popularity?: number }).popularity) {
    score += Math.min(20, (e as { popularity?: number }).popularity ?? 0);
  }

  return score;
}

/** Máximo de eventos destacados por deporte en la vista principal */
export const FEATURED_PER_SPORT = 2;

export function pickFeaturedEvents(events: EventRow[]): EventRow[] {
  const bySport = new Map<string, EventRow[]>();

  for (const e of events) {
    const key = e.sport || "otros";
    const list = bySport.get(key) ?? [];
    list.push(e);
    bySport.set(key, list);
  }

  const picked: EventRow[] = [];

  for (const list of bySport.values()) {
    const sorted = [...list].sort((a, b) => eventPriority(b) - eventPriority(a));
    picked.push(...sorted.slice(0, FEATURED_PER_SPORT));
  }

  return picked.sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}
