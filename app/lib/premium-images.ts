import { buildLcpPosterUrl, isTmdbPosterUrl } from "./lcp-poster";
import { preferLocalWebpUrl } from "./prefer-local-webp";
import { safeRemoteImageUrl } from "./remote-image";
import {
  SPOTLIGHT_IMAGE_HEIGHT,
  SPOTLIGHT_IMAGE_WIDTH,
  spotlightCoverImageStyle,
} from "./optimized-image";

/** Placeholder blur neutro (sin base64 pesado) para lazy posters. */
export const POSTER_BLUR_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"><rect width="16" height="9" fill="%231a1a2e"/></svg>'
  );

/** Misma URL que SSR LCP: TMDB w342 directo; resto vía next/image. */
export function resolvePrioritySpotlightSrc(url: string): {
  mode: "lcp-direct" | "next-image" | "native";
  src: string;
} | null {
  const safe = safeRemoteImageUrl(url);
  if (!safe) return null;

  if (isTmdbPosterUrl(safe)) {
    const lcp = buildLcpPosterUrl(safe);
    if (lcp) return { mode: "lcp-direct", src: lcp };
  }

  if (safe.startsWith("/")) {
    const raster = preferLocalWebpUrl(safe);
    if (/\.(webp|png|jpe?g|avif)$/i.test(raster)) {
      return { mode: "lcp-direct", src: raster };
    }
    return { mode: "next-image", src: safe };
  }

  return { mode: "native", src: safe };
}

export function prioritySpotlightImgProps(objectPosition?: string) {
  return {
    width: SPOTLIGHT_IMAGE_WIDTH,
    height: SPOTLIGHT_IMAGE_HEIGHT,
    style: spotlightCoverImageStyle(objectPosition),
    loading: "eager" as const,
    fetchPriority: "high" as const,
    decoding: "sync" as const,
  };
}
