import { getEsportsGameArt } from "./spotlight-art";

/** Clase visual de tarjetas e-sports en el calendario (gradiente por juego). */
export function matchCardEsportsVisualClass(sport: string): string {
  const art = getEsportsGameArt(sport);
  return art.visualClass.replace(
    "qvh-spotlight-visual-",
    "fh-media-spotlight-visual-"
  );
}

export function matchCardEsportsShellClass(sport: string): string {
  if (sport === "valorant") return "fh-match_valorant";
  if (sport === "lol") return "fh-match_lol";
  if (sport === "csgo") return "fh-match_cs2";
  return "fh-match_esports";
}

export function matchCardEsportsGameArtUrl(sport: string): string {
  return getEsportsGameArt(sport).url;
}
