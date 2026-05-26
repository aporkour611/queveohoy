import Link from "next/link";

type Props = {
  variant?: "header" | "full";
};

/** Logo de marca: iconos QVH + wordmark (imagen oficial en /logo-queveohoy.png) */
export function Logo({ variant = "header" }: Props) {
  if (variant === "full") {
    return (
      <Link href="/" className="qvh-logo-link qvh-logo-link--full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-queveohoy.png"
          alt="Qué veo hoy — queveohoy.es"
          className="qvh-logo-img-full"
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="qvh-logo-link" aria-label="Qué veo hoy — Inicio">
      <span className="qvh-logo-tiles" aria-hidden>
        <span className="qvh-tile qvh-tile-q">Q</span>
        <span className="qvh-tile qvh-tile-v">V</span>
        <span className="qvh-tile qvh-tile-h">H</span>
      </span>
      <span className="qvh-logo-divider" aria-hidden />
      <span className="qvh-logo-wordmark">
        <span className="qvh-wm qvh-wm-muted">que</span>
        <span className="qvh-wm qvh-wm-accent">veo</span>
        <span className="qvh-wm qvh-wm-muted">hoy</span>
        <span className="qvh-wm-es">.es</span>
      </span>
    </Link>
  );
}
