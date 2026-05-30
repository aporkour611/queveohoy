import { safeRemoteImageUrl } from "../lib/remote-image"
import {
  resolveTennisPlayerCountry,
  tennisFlagUrl,
} from "../lib/tennis-player-country"

function fighterInitials(name?: string | null): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function shortPlayerName(name?: string | null): string {
  if (!name?.trim()) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0]
  return parts[parts.length - 1]
}

type UfcProps = {
  f1Url?: string | null
  f2Url?: string | null
  f1Name?: string | null
  f2Name?: string | null
  size?: "card" | "spotlight"
  priority?: boolean
  className?: string
}

/** UFC duel sin JS — lazy nativo del navegador. */
export function StaticUfcFightVisual({
  f1Url,
  f2Url,
  f1Name,
  f2Name,
  size = "spotlight",
  priority = false,
  className,
}: UfcProps) {
  const f1Safe = safeRemoteImageUrl(f1Url)
  const f2Safe = safeRemoteImageUrl(f2Url)
  const rootClass = [
    size === "spotlight" ? "qvh-ufc-duel" : "fh-ufc-duel",
    className,
  ]
    .filter(Boolean)
    .join(" ")
  const imgClass =
    size === "spotlight" ? "qvh-ufc-fighter-img" : "fh-ufc-fighter-img"
  const fighterWrap =
    size === "spotlight" ? "qvh-ufc-fighter" : "fh-ufc-fighter"
  const vsClass = size === "spotlight" ? "qvh-ufc-vs" : "fh-ufc-vs"

  if (!f1Safe && !f2Safe && !f1Name?.trim() && !f2Name?.trim()) return null

  return (
    <div className={rootClass} aria-hidden>
      <div className={fighterWrap}>
        <div className="fh-ufc-fighter-slot">
          {f1Safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f1Safe}
              alt=""
              width={120}
              height={120}
              className={imgClass}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <span className="fh-ufc-fighter-fallback">{fighterInitials(f1Name)}</span>
          )}
        </div>
      </div>
      <span className={vsClass}>vs</span>
      <div className={fighterWrap}>
        <div className="fh-ufc-fighter-slot">
          {f2Safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f2Safe}
              alt=""
              width={120}
              height={120}
              className={imgClass}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <span className="fh-ufc-fighter-fallback">{fighterInitials(f2Name)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

type RgProps = {
  homeName?: string | null
  awayName?: string | null
  size?: "card" | "spotlight"
  className?: string
}

/** Roland Garros / tenis duel — server-only. */
export function StaticRolandGarrosDuelVisual({
  homeName,
  awayName,
  size = "spotlight",
  className,
}: RgProps) {
  const home = homeName?.trim()
  const away = awayName?.trim()
  if (!home && !away) return null

  const homeCode = resolveTennisPlayerCountry(home)
  const awayCode = resolveTennisPlayerCountry(away)
  const homeFlag = tennisFlagUrl(homeCode)
  const awayFlag = tennisFlagUrl(awayCode)
  const rootClass = [
    size === "spotlight" ? "qvh-rg-duel" : "fh-rg-duel",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={rootClass} aria-hidden>
      <div className={size === "spotlight" ? "qvh-rg-flags" : "fh-rg-flags"}>
        <div
          className={
            size === "spotlight" ? "qvh-rg-flag qvh-rg-flag-home" : "fh-rg-flag fh-rg-flag-home"
          }
          style={homeFlag ? { backgroundImage: `url("${homeFlag}")` } : undefined}
        />
        <div
          className={
            size === "spotlight" ? "qvh-rg-flag qvh-rg-flag-away" : "fh-rg-flag fh-rg-flag-away"
          }
          style={awayFlag ? { backgroundImage: `url("${awayFlag}")` } : undefined}
        />
        <div
          className={size === "spotlight" ? "qvh-rg-flags-center" : "fh-rg-flags-center"}
        />
        <div className={size === "spotlight" ? "qvh-rg-ball" : "fh-rg-ball"} aria-hidden>
          <span className={size === "spotlight" ? "qvh-rg-ball-core" : "fh-rg-ball-core"} />
        </div>
      </div>
      <div className={size === "spotlight" ? "qvh-rg-players" : "fh-rg-players"}>
        <span
          className={
            size === "spotlight" ? "qvh-rg-player qvh-rg-player-home" : "fh-rg-player fh-rg-player-home"
          }
        >
          {shortPlayerName(home)}
        </span>
        <span className={size === "spotlight" ? "qvh-rg-vs" : "fh-rg-vs"}>vs</span>
        <span
          className={
            size === "spotlight" ? "qvh-rg-player qvh-rg-player-away" : "fh-rg-player fh-rg-player-away"
          }
        >
          {shortPlayerName(away)}
        </span>
      </div>
    </div>
  )
}
