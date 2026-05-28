export function competitionMatchClass(
  competition?: string | null,
  sport?: string | null
): string {
  if (sport === "formula1" || sport === "motos") return "fh-match_motor fh-match-solo";
  if (sport === "ciclismo") return "fh-match_ciclismo fh-match-solo";
  if (sport === "ufc") return "fh-match_ufc fh-match-media";
  if (sport === "cine") return "fh-match_cine fh-match-media";
  if (sport === "series" || sport === "anime") {
    return "fh-match_series fh-match-media";
  }
  if (sport === "tv") return "fh-match_tv fh-match-media";
  if (["tenis", "basket", "ciclismo"].includes(sport ?? "")) {
    return "fh-match_default";
  }
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
