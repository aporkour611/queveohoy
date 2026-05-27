/** Ligas / torneos menores que no queremos en BD (ruido en home y cron lento). */
const ESPORTS_MINOR =
  /challenger|open qualifier|qualifier|academy|regional|circuit\s*x|division\s*[234]|div\s*[234]|emea\s*open|nacl|university|cbLOL|open\s*qual|road\s*of|prime\s*league\s*2|lidl|nexus|\bsplit\s*(?:[2-9]|\d{2,})\b/i;

/** Torneos de primer nivel que sí queremos. */
const ESPORTS_MAJOR =
  /lec|lck|lpl|lcs|vct|champions|masters|major|iem|blast|pgl|esl pro league|worlds|msi|emea|champions tour|cs2|counter-strike|the international|dota pro circuit|cdl|call of duty league/i;

export type PandascoreMatchMeta = {
  league?: { name?: string | null; tier?: string | null } | null;
  serie?: { full_name?: string | null; tier?: string | null } | null;
  tournament?: { name?: string | null; tier?: string | null } | null;
  opponents?: Array<{ opponent?: { name?: string | null } | null }> | null;
};

export function shouldIngestPandascoreMatch(match: PandascoreMatchMeta): boolean {
  const comp = [
    match.league?.name,
    match.serie?.full_name,
    match.tournament?.name,
  ]
    .filter(Boolean)
    .join(" ");

  if (!comp.trim()) return false;

  if (ESPORTS_MAJOR.test(comp)) return true;

  const tier =
    match.serie?.tier?.toLowerCase() ??
    match.league?.tier?.toLowerCase() ??
    match.tournament?.tier?.toLowerCase();
  if (tier === "s" || tier === "a") return true;
  if (tier === "c" || tier === "d") return false;

  if (ESPORTS_MINOR.test(comp)) return false;

  const teamBlob = (match.opponents ?? [])
    .map((o) => o.opponent?.name ?? "")
    .join(" ");
  if (ESPORTS_MAJOR.test(teamBlob)) return true;

  return false;
}

const ESPORTS_SPORTS = new Set(["csgo", "valorant", "lol"]);

/** Eventos esports ya en BD que deberían eliminarse (ligas menores). */
export function shouldPurgeStoredEsportsEvent(event: {
  sport?: string | null;
  competition?: string | null;
}): boolean {
  const sport = event.sport ?? "";
  if (!ESPORTS_SPORTS.has(sport)) return false;

  const comp = event.competition ?? "";
  if (!comp.trim()) return true;
  if (ESPORTS_MAJOR.test(comp)) return false;
  if (ESPORTS_MINOR.test(comp)) return true;

  return !shouldIngestPandascoreMatch({
    league: { name: comp },
    serie: { full_name: comp },
    tournament: { name: comp },
  });
}
