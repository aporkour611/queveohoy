import type { Metadata } from "next"
import Link from "next/link"
import { pickTonightEvents } from "@/app/lib/embed-tonight"
import { fetchFeedEvents } from "@/app/lib/events-feed-server"
import { getMadridTodayKey } from "@/app/lib/seo-date"
import { siteBrand, siteUrl } from "@/app/lib/seo"
import { eventDisplayTime } from "@/app/lib/madrid-time"
import { eventLabel } from "@/app/lib/seo-events"
import { partidoPath } from "@/app/lib/event-slug"

export const metadata: Metadata = {
  title: "Qué ver esta noche — widget",
  robots: { index: false, follow: false },
}

export default async function EmbedEstaNochePage() {
  const todayKey = getMadridTodayKey()
  const { events } = await fetchFeedEvents()
  const tonight = pickTonightEvents(events, todayKey)

  return (
    <div className="qvh-embed">
      <header className="qvh-embed-head">
        <p className="qvh-embed-kicker">Esta noche</p>
        <h1 className="qvh-embed-title">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            {siteBrand}
          </Link>
        </h1>
      </header>

      {tonight.length === 0 ? (
        <p className="qvh-embed-empty">
          No hay eventos programados a partir de las 18:00 hoy.
        </p>
      ) : (
        <ul className="qvh-embed-list">
          {tonight.map((event) => (
            <li key={event.id} className="qvh-embed-item">
              <Link
                href={partidoPath(event)}
                target="_blank"
                rel="noopener noreferrer"
                className="qvh-embed-link"
              >
                <span className="qvh-embed-time">
                  {eventDisplayTime(event)}
                </span>
                <span className="qvh-embed-label">{eventLabel(event)}</span>
                {event.platform ? (
                  <span className="qvh-embed-platform">{event.platform}</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <footer className="qvh-embed-foot">
        <Link href={siteUrl} target="_blank" rel="noopener noreferrer">
          Agenda completa en {siteBrand}
        </Link>
      </footer>
    </div>
  )
}
