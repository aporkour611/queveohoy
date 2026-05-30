"use client"

import Link from "next/link"
import { useMemo } from "react"
import type { EventRow } from "./types"
import { buildEventDetails } from "../lib/event-details"
import { eventDisplayTitle } from "../lib/event-display"
import { partidoPath } from "../lib/event-slug"
import { sportLabel } from "../lib/filter-config"
import { eventDisplayTime } from "../lib/madrid-time"
import { resolveChannelsForEvent } from "../lib/channels"
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone"
import { eventMatchesUserPlatforms } from "../lib/user-preferences"
import { useUserPlatforms } from "../lib/use-user-platforms"
import { ChannelBadges } from "./ChannelBadge"
import { FavoriteButton } from "./FavoriteButton"

type Props = {
  event: EventRow | null
  onClose: () => void
}

export function EventDetailDrawer({ event, onClose }: Props) {
  const userPlatforms = useUserPlatforms()
  const details = useMemo(
    () => (event ? buildEventDetails(event) : []),
    [event]
  )
  const channels = useMemo(
    () => (event ? resolveChannelsForEvent(event) : []),
    [event]
  )

  if (!event) return null

  const title = eventDisplayTitle(event)
  const time = eventDisplayTime(event)
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : ""
  const sport = event.sport ? sportLabel(event.sport) : null
  const onMyPlatform = eventMatchesUserPlatforms(event.platform, userPlatforms)
  const detailPath = partidoPath(event)

  return (
    <>
      <button
        type="button"
        className="qvh-event-drawer-backdrop"
        aria-label="Cerrar detalle"
        onClick={onClose}
      />
      <aside
        className="qvh-event-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qvh-event-drawer-title"
      >
        <header className="qvh-event-drawer-head">
          <div>
            {sport ? (
              <p className="qvh-event-drawer-kicker">{sport}</p>
            ) : null}
            <h2 id="qvh-event-drawer-title" className="qvh-event-drawer-title">
              {title}
            </h2>
            <p className="qvh-event-drawer-when">
              {[dateLabel, time].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            className="qvh-event-drawer-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        <div className="qvh-event-drawer-body">
          {onMyPlatform ? (
            <p className="qvh-event-drawer-badge">En tus plataformas</p>
          ) : null}

          {channels.length > 0 ? (
            <div className="qvh-event-drawer-channels">
              <p className="qvh-event-drawer-label">Dónde ver</p>
              <ChannelBadges channels={channels} prominent />
            </div>
          ) : event.platform ? (
            <div className="qvh-event-drawer-channels">
              <p className="qvh-event-drawer-label">Plataforma</p>
              <p>{event.platform}</p>
            </div>
          ) : null}

          {details.length > 0 ? (
            <dl className="qvh-event-drawer-details">
              {details.map(({ label, value }) => (
                <div key={label} className="qvh-event-drawer-row">
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        <footer className="qvh-event-drawer-foot">
          <FavoriteButton eventId={event.id} />
          <Link
            href={detailPath}
            className="fh-btn fh-btn-primary qvh-event-drawer-cta"
            onClick={onClose}
          >
            Ver ficha completa
          </Link>
        </footer>
      </aside>
    </>
  )
}
