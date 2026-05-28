type Props = {
  className?: string
}

/** Marca unificada: icono QVH + wordmark con efecto altavoz sutil */
export function LogoMark({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 186 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="0"
        y="2"
        width="28"
        height="28"
        rx="7"
        className="qvh-logo-tile-q"
      />
      <text
        x="14"
        y="21.5"
        textAnchor="middle"
        className="qvh-logo-tile-letter"
      >
        Q
      </text>

      <rect
        x="31"
        y="2"
        width="28"
        height="28"
        rx="7"
        className="qvh-logo-tile-v"
      />
      <text
        x="45"
        y="21.5"
        textAnchor="middle"
        className="qvh-logo-tile-letter"
      >
        V
      </text>

      <rect
        x="62"
        y="2"
        width="28"
        height="28"
        rx="7"
        className="qvh-logo-tile-h"
      />
      <text
        x="76"
        y="21.5"
        textAnchor="middle"
        className="qvh-logo-tile-letter"
      >
        H
      </text>

      <text
        x="98"
        y="10"
        className="qvh-logo-text qvh-logo-text-q"
        transform="rotate(-7 98 10)"
      >
        Qué
      </text>
      <text x="98" y="19.5" className="qvh-logo-text qvh-logo-text-v">
        veo
      </text>
      <text
        x="98"
        y="29"
        className="qvh-logo-text qvh-logo-text-h"
        transform="rotate(7 98 29)"
      >
        hoy
      </text>
    </svg>
  )
}
