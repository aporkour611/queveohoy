export function sportAccentClass(sportId?: string | null): string {
  switch (sportId) {
    case "tenis":
    case "basket":
    case "ciclismo":
      return "fh-comp-purple";
    case "formula1":
    case "motos":
      return "fh-comp-motor";
    case "cine":
    case "series":
      return "fh-comp-gold";
    case "tv":
      return "fh-comp-pink";
    case "csgo":
    case "valorant":
    case "lol":
      return "fh-comp-green";
    default:
      return "fh-comp-purple";
  }
}

export function competitionAccentClass(competition?: string | null): string {
  const c = (competition ?? "").toLowerCase();
  if (c.includes("champions")) return "fh-comp-purple";
  if (c.includes("europa") || c.includes("conference")) return "fh-comp-blue";
  if (c.includes("premier") || c.includes("bundesliga")) return "fh-comp-orange";
  return "fh-comp-purple";
}
