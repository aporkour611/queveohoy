type Props = {
  className?: string
}

/** Marca unificada: icono monitor QVH + wordmark con efecto altavoz */
export function LogoMark({ className }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <filter id="qvh-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="0.5"
            floodColor="#fff"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      <g transform="translate(0 0) scale(0.5625)">
        <rect x="4" y="5" width="56" height="46" rx="7" className="qvh-logo-monitor-frame" />
        <rect x="7" y="8" width="50" height="38" rx="5" className="qvh-logo-monitor-screen" />
        <rect x="9" y="10" width="21" height="15.5" rx="3.5" className="qvh-logo-tile-q" />
        <rect x="33" y="10" width="21" height="15.5" rx="3.5" className="qvh-logo-tile-v" />
        <rect x="9" y="28" width="45" height="15.5" rx="3.5" className="qvh-logo-tile-hoy" />
        <text
          x="19.5"
          y="22"
          textAnchor="middle"
          className="qvh-logo-tile-letter"
          filter="url(#qvh-logo-glow)"
        >
          Q
        </text>
        <text
          x="43.5"
          y="22"
          textAnchor="middle"
          className="qvh-logo-tile-letter"
          filter="url(#qvh-logo-glow)"
        >
          V
        </text>
        <text
          x="31.5"
          y="39.5"
          textAnchor="middle"
          className="qvh-logo-tile-letter qvh-logo-tile-hoy-text"
          filter="url(#qvh-logo-glow)"
        >
          HOY
        </text>
        <rect x="4" y="51" width="56" height="7" className="qvh-logo-monitor-chin" />
        <circle cx="32" cy="54.5" r="1.6" className="qvh-logo-monitor-led" />
        <rect x="28" y="56" width="8" height="3.5" rx="1" className="qvh-logo-monitor-frame" />
        <rect x="21" y="60" width="22" height="3" rx="1.5" className="qvh-logo-monitor-frame" />
      </g>

      <text
        x="44"
        y="11"
        className="qvh-logo-text qvh-logo-text-q"
        transform="rotate(-7 44 11)"
      >
        Qué
      </text>
      <text x="44" y="20.5" className="qvh-logo-text qvh-logo-text-v">
        veo
      </text>
      <text
        x="44"
        y="30"
        className="qvh-logo-text qvh-logo-text-h"
        transform="rotate(7 44 30)"
      >
        hoy
      </text>
    </svg>
  )
}
