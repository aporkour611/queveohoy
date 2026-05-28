/** Deportes/juegos excluidos: no se importan, muestran ni indexan. */
export const BLOCKED_SPORT_IDS = ["dota2"] as const;

export type BlockedSportId = (typeof BLOCKED_SPORT_IDS)[number];

export function isBlockedSport(sport?: string | null): boolean {
  if (!sport) return false;
  return (BLOCKED_SPORT_IDS as readonly string[]).includes(sport);
}

export function filterBlockedSports<T extends { sport?: string | null }>(
  events: T[]
): T[] {
  return events.filter((event) => !isBlockedSport(event.sport));
}
