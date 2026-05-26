export function competitionMatchClass(
  competition?: string | null,
  sport?: string | null
): string {
  if (sport === "formula1" || sport === "motos") return "fh-match_motor";
  if (sport === "ufc") return "fh-match_ufc";
  if (sport === "cine" || sport === "series") return "fh-match_cine";
  if (sport === "tv") return "fh-match_tv";
  if (sport && sport !== "futbol") return "fh-match_esports";

  const c = (competition ?? "").toLowerCase();
  if (c.includes("champions")) return "fh-match_championsleague";
  if (c.includes("europa") && !c.includes("conference")) return "fh-match_europa";
  if (c.includes("conference")) return "fh-match_europa";
  if (c.includes("premier")) return "fh-match_premierleague";
  if (c.includes("bundesliga")) return "fh-match_bundesliga";
  if (c.includes("serie")) return "fh-match_seriea";
  if (c.includes("liga") || c.includes("primera") || c.includes("laliga"))
    return "fh-match_laliga";

  return "fh-match_default";
}
