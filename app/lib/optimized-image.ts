import { getImageProps } from "next/image";
import { isAllowedRemoteImageUrl, safeRemoteImageUrl } from "./remote-image";

/** Calidad por defecto para pósters (debe estar en next.config `images.qualities`). */
export const IMAGE_QUALITY = 75;

export const POSTER_SIZES = {
  card: "(max-width: 480px) 45vw, (max-width: 768px) 40vw, 280px",
  spotlight: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 520px",
  crest: "96px",
} as const;

export type PosterSizeVariant = keyof typeof POSTER_SIZES;

export function canOptimizeImageSrc(src?: string | null): boolean {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return false;
  if (safe.startsWith("/")) return true;
  return isAllowedRemoteImageUrl(safe);
}

type PreloadOptions = {
  sizes?: string;
  width?: number;
  height?: number;
};

/** URL servida por `/_next/image` (AVIF/WebP) para `<link rel="preload">`. */
export function buildOptimizedPreloadHref(
  src: string,
  options: PreloadOptions = {}
): string | null {
  const safe = safeRemoteImageUrl(src);
  if (!safe || !canOptimizeImageSrc(safe)) return safe;

  const sizes = options.sizes ?? POSTER_SIZES.spotlight;

  if (safe.startsWith("/")) {
    const { props } = getImageProps({
      alt: "",
      src: safe,
      width: options.width ?? 520,
      height: options.height ?? 780,
      quality: IMAGE_QUALITY,
      sizes,
      priority: true,
    });
    return props.src;
  }

  const { props } = getImageProps({
    alt: "",
    src: safe,
    fill: true,
    sizes,
    quality: IMAGE_QUALITY,
    priority: true,
  });
  return props.src;
}
