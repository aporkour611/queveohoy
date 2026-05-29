"use client"

type Props = {
  homeName?: string | null
  awayName?: string | null
  className?: string
  size?: "card" | "spotlight"
}

function shortTeamName(name?: string | null): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return parts.join(" ")
  return parts[parts.length - 1]
}

export function BasketballDuelVisual({
  homeName,
  awayName,
  className,
  size = "card",
}: Props) {
  const prefix = size === "spotlight" ? "qvh-bb" : "fh-bb"
  const home = homeName?.trim()
  const away = awayName?.trim()

  if (!home && !away) return null

  const rootClass = [`${prefix}-duel`, className].filter(Boolean).join(" ")

  return (
    <div className={rootClass} aria-hidden>
      <div className={`${prefix}-court`}>
        <span className={`${prefix}-team ${prefix}-team-home`}>
          {shortTeamName(home)}
        </span>
        <div className={`${prefix}-ball-wrap`}>
          <div className={`${prefix}-ball`} aria-hidden>
            <span className={`${prefix}-ball-core`} />
          </div>
        </div>
        <span className={`${prefix}-team ${prefix}-team-away`}>
          {shortTeamName(away)}
        </span>
      </div>
    </div>
  )
}
