const ESPORTS_SPORTS = new Set(["csgo", "valorant", "lol", "dota2"]);

const LOGO_PREFIX = "pandascore-logos:";

export function isEsportsSport(sport?: string | null): boolean {
  return !!sport && ESPORTS_SPORTS.has(sport);
}

/** Guarda URLs de escudos en source (sin columnas extra en BD) */
export function encodeEsportsSource(
  homeLogo?: string | null,
  awayLogo?: string | null
): string {
  const home = homeLogo?.trim() || "";
  const away = awayLogo?.trim() || "";
  if (!home && !away) return "pandascore";
  return `${LOGO_PREFIX}${home}::${away}`;
}

export function parseEsportsTeamLogos(source?: string | null): {
  homeUrl: string | null;
  awayUrl: string | null;
} | null {
  if (!source?.startsWith(LOGO_PREFIX)) return null;

  const rest = source.slice(LOGO_PREFIX.length);
  const sep = rest.indexOf("::");
  if (sep === -1) return null;

  const homeUrl = rest.slice(0, sep).trim() || null;
  const awayUrl = rest.slice(sep + 2).trim() || null;

  if (!homeUrl && !awayUrl) return null;
  return { homeUrl, awayUrl };
}

/** Logo de equipo desde respuesta PandaScore (opponents[].opponent) */
export function pandascoreTeamLogo(opponent?: {
  image_url?: string | null;
  id?: number;
  slug?: string | null;
} | null): string | null {
  if (!opponent) return null;

  const url = opponent.image_url?.trim();
  if (url) return url.replace(/^http:\/\//i, "https://");

  if (opponent.id && opponent.slug) {
    return `https://cdn.pandascore.co/images/team/image/${opponent.id}/${opponent.slug}.png`;
  }

  if (opponent.id) {
    return `https://cdn.pandascore.co/images/team/image/${opponent.id}/image.png`;
  }

  return null;
}
