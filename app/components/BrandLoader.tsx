import { createPortal } from "react-dom"

type Props = {
  label?: string
  variant?: "inline" | "overlay" | "fixed"
}

function BrandLoaderTiles() {
  return (
    <div className="qvh-brand-loader" aria-hidden>
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-q" />
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-v" />
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-h" />
    </div>
  )
}

/** Loader de marca: tres cuadrados Q · V · H con iluminación secuencial. */
export function BrandLoader({
  label = "Cargando eventos…",
  variant = "inline",
}: Props) {
  const tiles = <BrandLoaderTiles />

  if (variant === "fixed" || variant === "overlay") {
    const overlay = (
      <div
        className={`qvh-feed-loader qvh-feed-loader-fixed${
          variant === "overlay" ? " qvh-feed-loader-anchored" : ""
        }`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="qvh-feed-loader-brand">{tiles}</div>
        <span className="sr-only">{label}</span>
      </div>
    )

    if (variant === "fixed" && typeof document !== "undefined") {
      return createPortal(overlay, document.body)
    }

    return overlay
  }

  return (
    <div className="fh-empty fh-loading" role="status" aria-live="polite">
      {tiles}
      {label ? <p>{label}</p> : null}
    </div>
  )
}
