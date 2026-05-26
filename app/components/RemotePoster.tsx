"use client";



import Image from "next/image";

import { safeRemoteImageUrl } from "../lib/remote-image";



type Props = {

  src: string;

  className?: string;

  sizes?: string;

  priority?: boolean;

  quality?: number;

};



/** Poster remoto optimizado (WebP, lazy) para TMDB / UFC / etc. */

export function RemotePoster({

  src,

  className = "qvh-remote-poster",

  sizes = "(max-width: 768px) 100vw, 280px",

  priority = false,

  quality = 60,

}: Props) {

  const safeSrc = safeRemoteImageUrl(src);

  if (!safeSrc) return null;



  return (

    <Image

      src={safeSrc}

      alt=""

      fill

      className={className}

      sizes={sizes}

      quality={quality}

      loading={priority ? "eager" : "lazy"}

      priority={priority}

      placeholder="empty"

    />

  );

}

