"use client";

import Image from "next/image";

type Props = {
  src: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/** Poster remoto optimizado (WebP, lazy) para TMDB / UFC / etc. */
export function RemotePoster({
  src,
  className = "qvh-remote-poster",
  sizes = "(max-width: 768px) 100vw, 280px",
  priority = false,
}: Props) {
  return (
    <Image
      src={src}
      alt=""
      fill
      className={className}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
    />
  );
}
