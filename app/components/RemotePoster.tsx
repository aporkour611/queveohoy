"use client";

import Image from "next/image";
import { useState } from "react";
import {
  canOptimizeImageSrc,
  IMAGE_QUALITY,
  POSTER_SIZES,
  SPOTLIGHT_IMAGE_QUALITY,
  type PosterSizeVariant,
} from "../lib/optimized-image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  src: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
  /** Contexto responsive para `sizes` de next/image. */
  sizeVariant?: PosterSizeVariant;
};

/** Poster remoto: next/image (AVIF/WebP vía sharp) cuando la URL es optimizable. */
export function RemotePoster({
  src,
  className = "qvh-remote-poster",
  priority = false,
  objectPosition,
  sizeVariant = "card",
}: Props) {
  const safeSrc = safeRemoteImageUrl(src);
  const optimizable = canOptimizeImageSrc(safeSrc);
  const { ref, inView } = useLazyInView({
    eager: priority,
    rootMargin: priority ? "0px" : "240px 0px",
  });
  const [failed, setFailed] = useState(false);

  if (!safeSrc || failed) return null;

  const shouldLoad = priority || inView;
  const sizes = POSTER_SIZES[sizeVariant];
  const quality =
    sizeVariant === "spotlight" ? SPOTLIGHT_IMAGE_QUALITY : IMAGE_QUALITY;
  const imgStyle = objectPosition ? { objectPosition } : undefined;

  return (
    <div ref={ref} className={className} aria-hidden>
      {shouldLoad && optimizable ? (
        <Image
          src={safeSrc}
          alt=""
          fill
          className="qvh-remote-poster-img"
          style={imgStyle}
          sizes={sizes}
          quality={quality}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          onError={() => setFailed(true)}
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
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
