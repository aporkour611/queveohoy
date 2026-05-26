const LOGO_PREFIX = "tmdb:poster:";
const BUZZ_SUFFIX = "|buzz:";

export function parseTmdbPoster(source?: string | null): string | null {
  const raw = source?.split("|")[0];
  if (!raw?.startsWith(LOGO_PREFIX)) return null;
  const path = raw.slice(LOGO_PREFIX.length).trim();
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w185${path.startsWith("/") ? path : `/${path}`}`;
}

export function parseTmdbEpisodeMeta(externalId?: string | null) {
  const match = externalId?.match(
    /^tmdb_tv_(\d+)_(\d{4}-\d{2}-\d{2})_s(\d+)e(\d+)$/
  );
  if (!match) return null;
  return {
    showId: match[1],
    airDate: match[2],
    season: parseInt(match[3], 10),
    episode: parseInt(match[4], 10),
  };
}

export function isSeasonPremiereEvent(event: {
  sport?: string | null;
  external_id?: string | null;
  competition?: string | null;
}): boolean {
  if (event.sport !== "series") return false;
  if (/estreno · temporada/i.test(event.competition ?? "")) return true;
  const meta = parseTmdbEpisodeMeta(event.external_id);
  return meta?.episode === 1 && (meta.season ?? 0) >= 2;
}

export function parseTmdbBuzzScore(source?: string | null): number {
  const match = source?.match(/\|buzz:(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export { LOGO_PREFIX, BUZZ_SUFFIX };
