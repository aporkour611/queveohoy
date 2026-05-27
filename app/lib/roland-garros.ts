import type { EventRow } from "../components/types";

export const ROLAND_GARROS_PATTERN = /roland garros|french open|roland-garros/i;

export const ROLAND_GARROS_KNOCKOUT_PATTERN =
  /semifinal|semi-final|semi final|octavos|cuartos|quarter.?final|round of 16|last.?16|4th round|\bfinal\b/i;

export function isRolandGarrosEvent(event: EventRow): boolean {
  if (event.sport !== "tenis") return false;
  const blob = `${event.competition ?? ""} ${event.title ?? ""}`;
  return ROLAND_GARROS_PATTERN.test(blob);
}

export function isRolandGarrosKnockout(event: EventRow): boolean {
  if (!isRolandGarrosEvent(event)) return false;
  const blob = `${event.competition ?? ""} ${event.title ?? ""}`;
  if (/semi.?final|semifinal/i.test(blob)) return true;
  if (/octavos|round of 16|last.?16|4th round/i.test(blob)) return true;
  if (/cuartos|quarter.?final/i.test(blob)) return true;
  if (/\bfinal\b/i.test(blob) && !/semi/i.test(blob)) return true;
  if ((event.competition ?? "").includes("· Final")) return true;
  if ((event.competition ?? "").includes("· Semifinal")) return true;
  if ((event.competition ?? "").includes("· Cuartos")) return true;
  if ((event.competition ?? "").includes("· Octavos")) return true;
  return false;
}

/** Partidos de Roland Garros — siempre destacados durante el torneo. */
export function isRolandGarrosWeekDestacado(event: EventRow): boolean {
  return isRolandGarrosEvent(event);
}

export function formatRolandGarrosCompetition(strEvent: string): string | null {
  if (!ROLAND_GARROS_PATTERN.test(strEvent)) return null;

  if (/semi.?final|semifinal/i.test(strEvent)) {
    return "Roland Garros · Semifinal";
  }
  if (/octavos|round of 16|last.?16|4th round/i.test(strEvent)) {
    return "Roland Garros · Octavos de final";
  }
  if (/cuartos|quarter.?final/i.test(strEvent)) {
    return "Roland Garros · Cuartos de final";
  }
  if (/\bfinal\b/i.test(strEvent) && !/semi/i.test(strEvent)) {
    return "Roland Garros · Final";
  }

  return "Roland Garros";
}
