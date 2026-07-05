/** IDs en source, external_id legacy o nombres conocidos de football-data.org */
export function parseFootballTeamIds(
  externalId?: string | null,
  source?: string | null,
  homeTeam?: string | null,
  awayTeam?: string | null
) {
  const fromSource = source?.match(/^football-data:(\d+):(\d+)$/);
  if (fromSource) return { homeId: fromSource[1], awayId: fromSource[2] };

  const legacy = externalId?.match(/^football_\d+_h(\d+)_a(\d+)$/);
  if (legacy) return { homeId: legacy[1], awayId: legacy[2] };

  const homeId = teamIdFromName(homeTeam);
  const awayId = teamIdFromName(awayTeam);
  if (homeId && awayId) return { homeId, awayId };

  return null;
}

function teamIdFromName(name?: string | null): string | null {
  if (!name) return null;
  const n = name.toLowerCase();
  if (/paris saint|psg/.test(n)) return "524";
  if (/arsenal/.test(n)) return "57";
  if (/inter milan|\binter\b/.test(n)) return "108";
  if (/real madrid/.test(n) && !/castilla|femenino|fem/.test(n)) return "86";
  if (/barcelona/.test(n) && !/femenino|fem/.test(n)) return "81";
  return null;
}

import { lookupPinnedByKey, footballTeamRegistryKey } from "./pinned-images";

export function teamCrestUrl(teamId: string) {
  return (
    lookupPinnedByKey(footballTeamRegistryKey(teamId)) ??
    `https://crests.football-data.org/${teamId}.png`
  );
}

export function teamInitials(name?: string | null) {
  if (!name) return "?";
  const clean = name.replace(/\s+(FC|CF|UD|AC|SC|AFC|Fem\.?)$/i, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return clean.slice(0, 3).toUpperCase();
}

export function shortTeamName(name?: string | null) {
  if (!name) return "—";
  return name
    .replace(/\s+FC$/i, "")
    .replace(/\s+CF$/i, "")
    .replace(/\s+AFC$/i, "")
    .replace(/\s+Fem\.?$/i, "")
    .trim();
}

/** Texto editorial para tarjetas Destacados (no repetir canales) */
export function footballSpotlightMeta(competition?: string | null): string {
  const raw = competition?.trim() || "Partido de fútbol";
  const [base, ...rest] = raw.split(" · ").map((s) => s.trim()).filter(Boolean);
  const stage = rest.join(" · ");
  const blob = `${base} ${stage}`.toLowerCase();

  if (/champions/i.test(base)) {
    if (/final/i.test(blob)) return "Final de la UEFA Champions League";
    if (/semi/i.test(blob)) return "Semifinal de la UEFA Champions League";
    if (/quarter|cuartos|octavos|last.?16|round of 16/i.test(blob)) {
      return "Eliminatoria de la UEFA Champions League";
    }
    return stage ? `${stage} · UEFA Champions League` : "UEFA Champions League";
  }

  if (/europa/i.test(base) && /final/i.test(blob)) return "Final de la Europa League";
  if (/conference/i.test(base) && /final/i.test(blob)) {
    return "Final de la Conference League";
  }
  if (/mundial|world cup/i.test(blob)) {
    return /final/i.test(blob) ? "Final del Mundial" : raw;
  }

  return stage ? `${stage} · ${base}` : base;
}
