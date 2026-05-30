import type { CategoryVisualKey } from "../lib/category-visuals"
import { categoryIconColor, resolveCategoryIconId } from "../lib/category-visuals"

type Props = {
  id: string
  size?: number
  className?: string
  /** Si se omite, usa el color de categoría. */
  color?: string
}

const stroke = {
  fill: "none" as const,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function IconPaths({ iconId }: { iconId: CategoryVisualKey }) {
  switch (iconId) {
    case "deportes":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.6"
            d="M7 9h10v2.2c0 2.2-1.6 4-3.6 4.4H10.6C8.6 15.6 7 13.8 7 11.2V9z"
          />
          <path {...stroke} strokeWidth="1.6" d="M9 9V7.2c0-.9.7-1.6 1.6-1.6h2.8c.9 0 1.6.7 1.6 1.6V9" />
          <path {...stroke} strokeWidth="1.6" d="M8.2 9H6.4c-.7 0-1.2.5-1.2 1.2v.4M15.8 9h1.8c.7 0 1.2.5 1.2 1.2v.4" />
          <path {...stroke} strokeWidth="1.6" d="M10 15.6v2.2M14 15.6v2.2" />
        </>
      )
    case "futbol":
      return (
        <>
          <circle {...stroke} strokeWidth="1.5" cx="12" cy="12" r="7.5" />
          <path {...stroke} strokeWidth="1.2" d="M12 4.5l2.2 3.8-2.2 2.2-2.2-2.2L12 4.5z" />
          <path {...stroke} strokeWidth="1.2" d="M12 19.5l-2.2-3.8 2.2-2.2 2.2 2.2-2.2 3.8z" />
          <path {...stroke} strokeWidth="1.2" d="M4.5 12l3.8-2.2 2.2 2.2-2.2 2.2L4.5 12z" />
          <path {...stroke} strokeWidth="1.2" d="M19.5 12l-3.8 2.2-2.2-2.2 2.2-2.2 3.8 2.2z" />
        </>
      )
    case "tenis":
      return (
        <>
          <ellipse {...stroke} strokeWidth="1.5" cx="9.5" cy="14.5" rx="4.2" ry="5.2" transform="rotate(-28 9.5 14.5)" />
          <path {...stroke} strokeWidth="1" d="M7.2 11.8l4.6 5.4M11.8 11.8l-4.6 5.4" />
          <circle {...stroke} strokeWidth="1.5" cx="17" cy="8.5" r="2.2" />
        </>
      )
    case "basket":
      return (
        <>
          <circle {...stroke} strokeWidth="1.5" cx="12" cy="12" r="7.5" />
          <path {...stroke} strokeWidth="1.3" d="M4.5 12h15M12 4.5c2.8 2.4 4.2 5.6 4.2 7.5S14.8 17.1 12 19.5" />
          <path {...stroke} strokeWidth="1.3" d="M12 4.5c-2.8 2.4-4.2 5.6-4.2 7.5s1.4 5.1 4.2 7.5" />
        </>
      )
    case "ciclismo":
      return (
        <>
          <circle {...stroke} strokeWidth="1.5" cx="7" cy="15" r="3" />
          <circle {...stroke} strokeWidth="1.5" cx="17" cy="15" r="3" />
          <path {...stroke} strokeWidth="1.5" d="M10 15h4M7 15l3-5h4l3 5" />
          <path {...stroke} strokeWidth="1.5" d="M10 10l2-3h2" />
        </>
      )
    case "ufc":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.5"
            d="M12 3.5L18.8 7v10L12 20.5 5.2 17V7L12 3.5z"
          />
          <path
            {...stroke}
            strokeWidth="1.4"
            d="M10.2 11.2c.8-.8 2-.8 2.8 0 .8.8.8 2 0 2.8-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8z"
          />
          <path {...stroke} strokeWidth="1.3" d="M9.2 14.2l1.2 2.2M14.8 14.2l-1.2 2.2" />
        </>
      )
    case "motor":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.5"
            d="M4 14h16M6 14l1.5-4h9l1.5 4M8.5 10l1-2.5h5l1 2.5"
          />
          <circle {...stroke} strokeWidth="1.5" cx="8" cy="14" r="1.8" />
          <circle {...stroke} strokeWidth="1.5" cx="16" cy="14" r="1.8" />
        </>
      )
    case "formula1":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.5"
            d="M3.5 14.5h17M5.5 14.5l1.2-3.5h3.8l1.5-2h4l1.5 2h2.5l1 3.5"
          />
          <path {...stroke} strokeWidth="1.3" d="M9.5 11l1-2.5h3l1 2.5" />
          <circle {...stroke} strokeWidth="1.4" cx="8" cy="14.5" r="1.6" />
          <circle {...stroke} strokeWidth="1.4" cx="16" cy="14.5" r="1.6" />
        </>
      )
    case "motos":
      return (
        <>
          <circle {...stroke} strokeWidth="1.5" cx="7.5" cy="15" r="2.5" />
          <circle {...stroke} strokeWidth="1.5" cx="16.5" cy="15" r="2.5" />
          <path {...stroke} strokeWidth="1.5" d="M10 15h4M7.5 15l2.5-4h3l3 4" />
          <path {...stroke} strokeWidth="1.5" d="M10 11l1.5-2.5h2l1.5 2.5" />
        </>
      )
    case "esports":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="4" y="8" width="16" height="10" rx="2" />
          <path {...stroke} strokeWidth="1.5" d="M8 18v2M16 18v2" />
          <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
          <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
        </>
      )
    case "csgo":
      return (
        <>
          <circle {...stroke} strokeWidth="1.5" cx="12" cy="12" r="7" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
          <path {...stroke} strokeWidth="1.5" d="M12 5v3M12 16v3M5 12h3M16 12h3" />
        </>
      )
    case "valorant":
      return (
        <path
          {...stroke}
          strokeWidth="1.8"
          d="M12 4.5L16.5 19.5H14l-2-6.5-2 6.5H7.5L12 4.5z"
        />
      )
    case "lol":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.5"
            d="M12 3.5l7 3v5c0 3.5-2.8 6.5-7 8.5-4.2-2-7-5-7-8.5v-5l7-3z"
          />
          <path {...stroke} strokeWidth="1.3" d="M9 10.5l3 3M15 10.5l-3 3" />
          <path {...stroke} strokeWidth="1.3" d="M12 8v8" />
        </>
      )
    case "cine":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="4" y="6" width="16" height="12" rx="1.5" />
          <path {...stroke} strokeWidth="1.5" d="M4 10h16M8 6V4M16 6V4" />
        </>
      )
    case "series":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="3" y="7" width="18" height="11" rx="1.5" />
          <path {...stroke} strokeWidth="1.5" d="M8 21v-3M16 21v-3" />
        </>
      )
    case "anime":
      return (
        <>
          <path
            {...stroke}
            strokeWidth="1.5"
            d="M12 8.5c2.8 0 5 2.1 5 5.2 0 2.4-1.6 4.5-4 5.1-.6.1-1 .5-1.2 1.1l-.3 1.1h-2.5l-.3-1.1c-.2-.6-.6-1-1.2-1.1-2.4-.6-4-2.7-4-5.1 0-3.1 2.2-5.2 5-5.2z"
          />
          <circle cx="10" cy="13.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="13.5" r="1" fill="currentColor" stroke="none" />
        </>
      )
    case "tv":
    case "tv-directo":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="3" y="7" width="18" height="11" rx="1.5" />
          <path {...stroke} strokeWidth="1.5" d="M8 21v-2M16 21v-2M12 4v3" />
          <circle cx="12" cy="4" r="1" fill="currentColor" stroke="none" />
        </>
      )
    case "tv-reality":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="5" y="7" width="14" height="10" rx="2" />
          <path {...stroke} strokeWidth="1.5" d="M9 7V5h6v2M12 4v3" />
          <circle {...stroke} strokeWidth="1.5" cx="12" cy="12" r="2.5" />
        </>
      )
    case "tv-concurso":
      return (
        <>
          <path {...stroke} strokeWidth="1.5" d="M8 8h8v4H8zM10 12v5M14 12v5" />
          <path {...stroke} strokeWidth="1.5" d="M7 17h10M9 19h6" />
        </>
      )
    case "all":
      return (
        <>
          <rect {...stroke} strokeWidth="1.5" x="4" y="4" width="7" height="7" rx="1.5" />
          <rect {...stroke} strokeWidth="1.5" x="13" y="4" width="7" height="7" rx="1.5" />
          <rect {...stroke} strokeWidth="1.5" x="4" y="13" width="7" height="7" rx="1.5" />
          <rect {...stroke} strokeWidth="1.5" x="13" y="13" width="7" height="7" rx="1.5" />
        </>
      )
    default:
      return null
  }
}

export function CategoryIcon({ id, size = 24, className, color }: Props) {
  const iconId = resolveCategoryIconId(id)
  const strokeColor = color ?? categoryIconColor(id)

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      style={{ color: strokeColor }}
    >
      <IconPaths iconId={iconId} />
    </svg>
  )
}
