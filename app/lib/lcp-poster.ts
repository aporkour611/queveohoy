import { safeRemoteImageUrl } from "./remote-image";

const TMDB_HOST = "image.tmdb.org";

/** Póster TMDB w342: un salto menos que /_next/image (mejor LCP en mobile). */
export function buildLcpPosterUrl(src?: string | null): string | null {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return null;

  if (safe.startsWith("/")) return safe;

  try {
    const url = new URL(safe);
    if (url.hostname.toLowerCase() !== TMDB_HOST) return safe;
    url.pathname = url.pathname.replace(/\/w\d+\//i, "/w342/");
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
