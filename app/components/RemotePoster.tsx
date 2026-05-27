"use client";

import Image from "next/image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  src: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
};

/** Poster remoto: WebP vía next/image, solo cuando entra en pantalla. */
export function RemotePoster({
  src,
  className = "qvh-remote-poster",
  sizes = "(max-width: 768px) 50vw, 220px",
  priority = false,
  quality = 55,
}: Props) {
  const safeSrc = safeRemoteImageUrl(src);
  const { ref, inView } = useLazyInView({
    eager: priority,
    rootMargin: priority ? "0px" : "240px 0px",
  });

  if (!safeSrc) return null;

  const shouldLoad = priority || inView;

  return (
    <div ref={ref} className={className} aria-hidden>
      {shouldLoad ? (
        <Image
          src={safeSrc}
          alt=""
          fill
          className="qvh-remote-poster-img"
          sizes={sizes}
          quality={quality}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
          fetchPriority={priority ? "high" : "low"}
          placeholder="empty"
        />
      ) : null}
    </div>
  );
}
