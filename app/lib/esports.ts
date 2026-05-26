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
  acronym?: string | null;
} | null): string | null {
  if (!opponent) return null;

  const candidates: string[] = [];

  const url = opponent.image_url?.trim();
  if (url) candidates.push(url.replace(/^http:\/\//i, "https://"));

  if (opponent.id && opponent.slug) {
    candidates.push(
      `https://cdn.pandascore.co/images/team/image/${opponent.id}/${opponent.slug}.png`
    );
  }

  if (opponent.id) {
    candidates.push(
      `https://cdn.pandascore.co/images/team/image/${opponent.id}/image.png`
    );
    if (opponent.acronym) {
      candidates.push(
        `https://cdn.pandascore.co/images/team/image/${opponent.id}/${opponent.acronym.toLowerCase()}.png`
      );
    }
  }

  return candidates[0] ?? null;
}

/** Variantes alternativas para reintentar carga en cliente o cron */
export function pandascoreTeamLogoCandidates(opponent?: {
  image_url?: string | null;
  id?: number;
  slug?: string | null;
  acronym?: string | null;
} | null): string[] {
  if (!opponent) return [];

  const seen = new Set<string>();
  const out: string[] = [];

  function add(url?: string | null) {
    if (!url) return;
    const normalized = url.replace(/^http:\/\//i, "https://");
    if (seen.has(normalized)) return;
    seen.add(normalized);
    out.push(normalized);
  }

  add(opponent.image_url);
  if (opponent.id && opponent.slug) {
    add(`https://cdn.pandascore.co/images/team/image/${opponent.id}/${opponent.slug}.png`);
  }
  if (opponent.id) {
    add(`https://cdn.pandascore.co/images/team/image/${opponent.id}/image.png`);
    if (opponent.acronym) {
      add(
        `https://cdn.pandascore.co/images/team/image/${opponent.id}/${opponent.acronym.toLowerCase()}.png`
      );
    }
  }

  return out;
}

/** URLs alternativas a probar si falla la carga del logo en el navegador */
export function esportsLogoFallbackUrls(url?: string | null): string[] {
  if (!url?.trim()) return [];

  const normalized = url.replace(/^http:\/\//i, "https://");
  const seen = new Set<string>();
  const out: string[] = [];

  function add(candidate?: string | null) {
    if (!candidate) return;
    const value = candidate.replace(/^http:\/\//i, "https://");
    if (seen.has(value)) return;
    seen.add(value);
    out.push(value);
  }

  add(normalized);

  const match = normalized.match(
    /\/images\/team\/image\/(\d+)\/([^/?#]+)\.(png|jpg|webp)$/i
  );
  if (match) {
    const [, id, slug] = match;
    add(`https://cdn.pandascore.co/images/team/image/${id}/image.png`);
    if (slug.toLowerCase() !== "image") {
      add(`https://cdn.pandascore.co/images/team/image/${id}/${slug}.png`);
    }
  }

  return out;
}
