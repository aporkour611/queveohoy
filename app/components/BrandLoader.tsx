import { createPortal } from "react-dom"
import { LogoMark } from "./LogoMark"

type Props = {
  label?: string
  variant?: "inline" | "overlay" | "fixed"
}

function LogoLoaderMark() {
  return (
    <div className="qvh-page-logo-loader-wrap">
      <LogoMark className="qvh-page-logo-loader-mark" aria-hidden />
      <div className="qvh-page-logo-loader-glow" aria-hidden />
    </div>
  )
}

/** Loader de marca: logotipo QVH con barrido difuminado izquierda → derecha. */
export function BrandLoader({
  label = "Cargando eventos…",
  variant = "inline",
}: Props) {
  const logo = <LogoLoaderMark />

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
        <div className="qvh-feed-loader-brand qvh-feed-loader-brand-logo">
          {logo}
        </div>
        <span className="sr-only">{label}</span>
      </div>
    )

    if (variant === "fixed" && typeof document !== "undefined") {
      return createPortal(overlay, document.body)
    }

    return overlay
  }

  return (
    <div className="fh-empty fh-loading fh-loading-logo" role="status" aria-live="polite">
      {logo}
      {label ? <p>{label}</p> : null}
    </div>
  )
}
