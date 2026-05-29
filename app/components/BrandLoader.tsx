import { LogoMark } from "./LogoMark"

type Props = {
  label?: string
  variant?: "inline" | "overlay"
}

/** Loader de marca: logotipo QVH centrado con pulso suave. */
export function BrandLoader({
  label = "Cargando eventos…",
  variant = "inline",
}: Props) {
  const logo = (
    <LogoMark className="qvh-page-logo-loader-mark" aria-hidden />
  )

  if (variant === "overlay") {
    return (
      <div className="qvh-feed-loader qvh-feed-loader-centered" role="status" aria-live="polite">
        <div className="qvh-feed-loader-brand qvh-feed-loader-brand-logo">
          {logo}
        </div>
        <span className="sr-only">{label}</span>
      </div>
    )
  }

  return (
    <div className="fh-empty fh-loading fh-loading-logo" role="status" aria-live="polite">
      {logo}
      {label ? <p>{label}</p> : null}
    </div>
  )
}
