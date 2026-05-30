"use client";

import Image from "next/image";
import { useState } from "react";
import {
  canOptimizeImageSrc,
  CREST_IMAGE_QUALITY,
  IMAGE_QUALITY,
  POSTER_SIZES,
  SPOTLIGHT_IMAGE_QUALITY,
  type PosterSizeVariant,
} from "../lib/optimized-image";
import { POSTER_BLUR_DATA_URL } from "../lib/premium-images";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  src: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  /** Contexto responsive para `sizes` de next/image. */
  sizeVariant?: PosterSizeVariant;
  onFailed?: () => void;
};

/** Poster remoto: next/image (AVIF/WebP vía sharp) cuando la URL es optimizable. */
export function RemotePoster({
  src,
  className = "qvh-remote-poster",
  priority = false,
  objectPosition,
  sizeVariant = "card",
  onFailed,
}: Props) {
  const safeSrc = safeRemoteImageUrl(src);
  const optimizable = canOptimizeImageSrc(safeSrc);
  const isSvg = Boolean(safeSrc?.toLowerCase().endsWith(".svg"));
  const { ref, inView } = useLazyInView({
    eager: priority,
    rootMargin: priority ? "0px" : "200px 0px",
  });
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    setFailed(true);
    onFailed?.();
  };

  if (!safeSrc || failed) return null;

  const shouldLoad = priority || inView;
  const sizes = POSTER_SIZES[sizeVariant];
  const quality =
    sizeVariant === "spotlight"
      ? SPOTLIGHT_IMAGE_QUALITY
      : sizeVariant === "crest"
        ? CREST_IMAGE_QUALITY
        : IMAGE_QUALITY;
  const imgStyle = objectPosition ? { objectPosition } : undefined;

  return (
    <div
      ref={ref}
      className={`${className}${shouldLoad ? "" : " qvh-remote-poster-pending"}`}
      aria-hidden
    >
      {shouldLoad && isSvg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt=""
          className="qvh-remote-poster-img"
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={handleError}
        />
      ) : shouldLoad && optimizable ? (
        <Image
          src={safeSrc}
          alt=""
          fill
          className="qvh-remote-poster-img"
          style={imgStyle}
          sizes={sizes}
          quality={quality}
          priority={priority}
          placeholder="blur"
          blurDataURL={POSTER_BLUR_DATA_URL}
          fetchPriority={priority ? "high" : undefined}
          onError={handleError}
        />
      ) : shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt=""
          className="qvh-remote-poster-img"
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={handleError}
        />
      ) : null}
    </div>
  );
}
