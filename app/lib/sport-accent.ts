export function sportAccentClass(sportId?: string | null): string {
  switch (sportId) {
    case "tenis":
      return "fh-comp-orange";
    case "formula1":
      return "fh-comp-blue";
    case "csgo":
    case "valorant":
    case "lol":
    case "dota2":
      return "fh-comp-green";
    case "basket":
    case "ciclismo":
      return "fh-comp-purple";
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
