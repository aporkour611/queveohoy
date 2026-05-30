import Image from "next/image"
import {
  canOptimizeImageSrc,
  IMAGE_QUALITY,
  POSTER_SIZES,
  type PosterSizeVariant,
} from "../lib/optimized-image"
import { POSTER_BLUR_DATA_URL } from "../lib/premium-images"
import { safeRemoteImageUrl } from "../lib/remote-image"
type Props = {
  src: string
  className?: string
  priority?: boolean
  objectPosition?: string
  sizeVariant?: PosterSizeVariant
}

/** Poster server-side — sin IntersectionObserver ni JS client (v16/v1.0). */
export function RemotePosterStatic({
  src,
  className = "qvh-remote-poster",
  priority = false,
  objectPosition,
  sizeVariant = "card",
}: Props) {
  const safeSrc = safeRemoteImageUrl(src)
  if (!safeSrc) return null

  const isSvg = safeSrc.toLowerCase().endsWith(".svg")
  const optimizable = canOptimizeImageSrc(safeSrc)
  const imgStyle = objectPosition ? { objectPosition } : undefined
  const sizes = POSTER_SIZES[sizeVariant]

  return (
    <div className={className} aria-hidden>
      {isSvg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt=""
          className="qvh-remote-poster-img"
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      ) : optimizable ? (
        <Image
          src={safeSrc}
          alt=""
          fill
          className="qvh-remote-poster-img"
          style={imgStyle}
          sizes={sizes}
          quality={IMAGE_QUALITY}
          priority={priority}
          placeholder="blur"
          blurDataURL={POSTER_BLUR_DATA_URL}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? "eager" : "lazy"}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeSrc}
          alt=""
          className="qvh-remote-poster-img"
          style={imgStyle}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      )}
    </div>
  )
}
