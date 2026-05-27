import type { EventRow } from "../components/types";
import { isCuratedMovieEvent } from "./movies-curated";
import { isSeasonPremiereEvent } from "./tmdb-client";

export type EventCardStampKind = "final" | "premiere";

export function isChampionsFinal(event: EventRow): boolean {
  if (event.sport !== "futbol") return false;
  const comp = `${event.competition ?? ""} ${event.title ?? ""}`;
  return /champions/i.test(comp) && /\bfinal\b/i.test(comp);
}

export function isDestacadoFinal(event: EventRow): boolean {
  const comp = event.competition ?? "";
  if (comp.includes("· Final")) return true;
  if (isChampionsFinal(event)) return true;

  const blob = `${comp} ${event.title ?? ""}`;
  if (/semi.?final|semifinal/i.test(blob)) return false;
  if (/\bfinal\b/i.test(comp)) return true;
  if (/final de la/i.test(blob)) return true;

  return false;
}

export function isDestacadoPremiere(event: EventRow): boolean {
  if (isSeasonPremiereEvent(event)) return true;
  if (isCuratedMovieEvent(event)) return true;

  const comp = event.competition ?? "";
  if (event.sport === "cine" && /estreno/i.test(comp)) return true;
  if (event.sport === "series" && /estreno/i.test(comp)) return true;

  return false;
}

export function getEventCardStamp(event: EventRow): EventCardStampKind | null {
  if (isDestacadoFinal(event)) return "final";
  if (isDestacadoPremiere(event)) return "premiere";
  return null;
}
