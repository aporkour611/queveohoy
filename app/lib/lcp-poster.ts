import { safeRemoteImageUrl } from "./remote-image";

const TMDB_HOST = "image.tmdb.org";

/** Ancho TMDB para LCP móvil (visual 132px alto; ~72vw ≤320px). w154 ≈ −17% bytes vs w185. */
export const LCP_TMDB_POSTER_WIDTH = "w154";

/** Póster TMDB directo (sin /_next/image) para preload + <img> LCP. */
export function buildLcpPosterUrl(src?: string | null): string | null {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return null;

  if (safe.startsWith("/")) return safe;

  try {
    const url = new URL(safe);
    if (url.hostname.toLowerCase() !== TMDB_HOST) return safe;
    url.pathname = url.pathname.replace(
      /\/w\d+\//i,
      `/${LCP_TMDB_POSTER_WIDTH}/`
    );
    return url.toString();
  } catch {
    return safe;
  }
}

export function isTmdbPosterUrl(src?: string | null): boolean {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return false;
  try {
    return new URL(safe).hostname.toLowerCase() === TMDB_HOST;
  } catch {
    return false;
  }
}
