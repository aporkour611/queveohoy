"use client";

import { useState } from "react";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  src: string;
  className?: string;
  priority?: boolean;
  objectPosition?: string;
};

/** Poster remoto: img nativa lazy, solo cuando entra en pantalla (sin /_next/image). */
export function RemotePoster({
  src,
  className = "qvh-remote-poster",
  priority = false,
  objectPosition,
}: Props) {
  const safeSrc = safeRemoteImageUrl(src);
  const { ref, inView } = useLazyInView({
    eager: priority,
    rootMargin: priority ? "0px" : "240px 0px",
  });
  const [failed, setFailed] = useState(false);

  if (!safeSrc || failed) return null;

  const shouldLoad = priority || inView;

  return (
    <div ref={ref} className={className} aria-hidden>
      {shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt=""
          className="qvh-remote-poster-img"
          style={objectPosition ? { objectPosition } : undefined}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
