/** IDs en source: football-data:{homeId}:{awayId} o legacy en external_id */
export function parseFootballTeamIds(
  externalId?: string | null,
  source?: string | null
) {
  const fromSource = source?.match(/^football-data:(\d+):(\d+)$/);
  if (fromSource) return { homeId: fromSource[1], awayId: fromSource[2] };

  const legacy = externalId?.match(/^football_\d+_h(\d+)_a(\d+)$/);
  if (legacy) return { homeId: legacy[1], awayId: legacy[2] };

  return null;
}

export function teamCrestUrl(teamId: string) {
  return `https://crests.football-data.org/${teamId}.png`;
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
