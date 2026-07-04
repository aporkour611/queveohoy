import { safeRemoteImageUrl } from "./remote-image";
import { preferLocalWebpUrl } from "./prefer-local-webp";

const TMDB_HOST = "image.tmdb.org";

/** Ancho TMDB para LCP móvil (visual 132px alto). w92 reduce bytes en camino crítico. */
export const LCP_TMDB_POSTER_WIDTH = "w92";

/** Póster TMDB directo (sin /_next/image) para preload + <img> LCP. */
export function buildLcpPosterUrl(src?: string | null): string | null {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return null;

  if (safe.startsWith("/")) return preferLocalWebpUrl(safe);

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

/** Misma URL que `<img>` LCP en `FeaturedEventCardStatic` (priority). */
export function resolveLcpCoverImgSrc(url: string, local: boolean): string | null {
  if (local && url.startsWith("/")) {
    return preferLocalWebpUrl(url);
  }
  return buildLcpPosterUrl(url) ?? safeRemoteImageUrl(url);
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
