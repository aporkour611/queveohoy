type Props = {
  label?: string
  variant?: "inline" | "overlay"
}

/** Loader de marca: 3 cuadrados Q · V · H con pulso escalonado (como el logo). */
export function BrandLoader({
  label = "Cargando eventos…",
  variant = "inline",
}: Props) {
  const tiles = (
    <div className="qvh-brand-loader" aria-hidden>
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-q">Q</span>
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-v">V</span>
      <span className="qvh-brand-loader-tile qvh-brand-loader-tile-h">H</span>
    </div>
  )

  if (variant === "overlay") {
    return (
      <div className="qvh-feed-loader" role="status" aria-live="polite">
        <div className="qvh-feed-loader-brand">{tiles}</div>
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <div className="fh-empty fh-loading" role="status" aria-live="polite">
      {tiles}
      {label ? <p>{label}</p> : null}
    </div>
  )
}
