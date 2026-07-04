import type { EventRow } from "./types"
import { pickPersonalizedTonightEvents } from "../lib/personalized-tonight"
import { FeaturedEventCardStatic } from "./FeaturedEventCardStatic"

type Props = {
  events: EventRow[]
  todayKey: string
}

/** Prime time SSR — cero JS en el camino crítico (v13). */
export function TonightForYouSectionStatic({ events, todayKey }: Props) {
  const tonightEvents = pickPersonalizedTonightEvents(events, todayKey, {
    userPlatforms: [],
    primeTime: "18:00",
    limit: 6,
  })

  if (tonightEvents.length === 0) return null

  return (
    <section
      className="qvh-tonight-for-you qvh-tonight-ssr"
      aria-labelledby="qvh-tonight-title"
    >
      <div className="qvh-tonight-head">
        <div>
          <p className="qvh-tonight-kicker">Para ti</p>
          <h2 id="qvh-tonight-title" className="qvh-tonight-title">
            Esta noche
          </h2>
          <p className="qvh-tonight-desc">
            Prime time desde las 18:00 h. Configura plataformas en tu cuenta
            para personalizar.
          </p>
        </div>
        <a href="/cuenta" className="qvh-tonight-cta">
          Mis plataformas
        </a>
      </div>
      <ul className="qvh-tonight-grid">
        {tonightEvents.map((event) => (
          <li key={event.id ?? `${event.title}-${event.time}`}>
            <FeaturedEventCardStatic event={event} />
          </li>
        ))}
      </ul>
    </section>
  )
}
