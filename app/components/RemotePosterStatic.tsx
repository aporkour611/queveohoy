import {
  canOptimizeImageSrc,
  POSTER_SIZES,
  type PosterSizeVariant,
} from "../lib/optimized-image"
import { buildLcpPosterUrl } from "../lib/lcp-poster"
import { safeRemoteImageUrl } from "../lib/remote-image"

type Props = {
  src: string
  className?: string
  priority?: boolean
  objectPosition?: string
  sizeVariant?: PosterSizeVariant
}

/** Poster server-side — sin next/image ni JS client. */
export function RemotePosterStatic({
  src,
  className = "qvh-remote-poster",
  priority = false,
  objectPosition,
  sizeVariant = "card",
}: Props) {
  const safeSrc = safeRemoteImageUrl(src)
  if (!safeSrc) return null

  const imgStyle = objectPosition ? { objectPosition } : undefined
  const sizes = POSTER_SIZES[sizeVariant]
  const resolvedSrc =
    canOptimizeImageSrc(safeSrc) && !safeSrc.toLowerCase().endsWith(".svg")
      ? buildLcpPosterUrl(safeSrc) ?? safeSrc
      : safeSrc

  return (
    <div className={className} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt=""
        className="qvh-remote-poster-img"
        style={imgStyle}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  )
}
