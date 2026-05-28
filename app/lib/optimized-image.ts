import { isAllowedRemoteImageUrl, safeRemoteImageUrl } from "./remote-image";

/** Calidad por defecto para pósters (debe estar en next.config `images.qualities`). */
export const IMAGE_QUALITY = 75;

/** Destacados above-the-fold: tarjetas ~236–320px de ancho, visual 132px alto. */
export const SPOTLIGHT_IMAGE_QUALITY = 68;

export const SPOTLIGHT_IMAGE_WIDTH = 320;
export const SPOTLIGHT_IMAGE_HEIGHT = 132;

export const POSTER_SIZES = {
  card: "(max-width: 480px) 45vw, (max-width: 768px) 40vw, 280px",
  spotlight: "(max-width: 640px) 72vw, 320px",
  crest: "96px",
} as const;

export type PosterSizeVariant = keyof typeof POSTER_SIZES;

export type SpotlightPreloadEntry = {
  href: string;
  imageSrcSet?: string;
  imageSizes?: string;
};

const spotlightCoverLayoutStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
  position: "absolute" as const,
  inset: 0,
};

export function canOptimizeImageSrc(src?: string | null): boolean {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return false;
  if (safe.toLowerCase().endsWith(".svg")) return false;
  if (/cdn\.pandascore\.co/i.test(safe)) return false;
  if (safe.startsWith("/")) return true;
  return isAllowedRemoteImageUrl(safe);
}

/** Mismos parámetros que `FeaturedEventCard` / preload LCP. */
export function buildSpotlightImageProps(src: string, priority = false) {
  const safe = safeRemoteImageUrl(src);
  if (!safe || !canOptimizeImageSrc(safe)) return null;

  const base = {
    alt: "",
    sizes: POSTER_SIZES.spotlight,
    quality: SPOTLIGHT_IMAGE_QUALITY,
    priority,
  };

  if (safe.startsWith("/")) {
    return {
      props: {
        ...base,
        src: safe,
        width: SPOTLIGHT_IMAGE_WIDTH,
        height: SPOTLIGHT_IMAGE_HEIGHT,
      },
    };
  }

  return {
    props: {
      ...base,
      src: safe,
      fill: true as const,
    },
  };
}

export function spotlightCoverImageStyle(objectPosition?: string) {
  return objectPosition
    ? { ...spotlightCoverLayoutStyle, objectPosition }
    : spotlightCoverLayoutStyle;
}

function buildNextImagePreloadHref(src: string): string {
  const params = new URLSearchParams({
    url: src,
    w: String(SPOTLIGHT_IMAGE_WIDTH),
    q: String(SPOTLIGHT_IMAGE_QUALITY),
  });
  return `/_next/image?${params.toString()}`;
}

/** URL servida por `/_next/image` (AVIF/WebP) para `<link rel="preload">`. */
export function buildOptimizedPreloadHref(src: string): string | null {
  const safe = safeRemoteImageUrl(src);
  if (!safe || !canOptimizeImageSrc(safe)) return safe;
  return buildNextImagePreloadHref(safe);
}

/** Preload LCP alineado con el `<Image>` de destacados. */
export function buildSpotlightPreloadEntry(src: string): SpotlightPreloadEntry | null {
  const href = buildOptimizedPreloadHref(src);
  if (!href) return null;

  return {
    href,
    imageSizes: POSTER_SIZES.spotlight,
  };
}
