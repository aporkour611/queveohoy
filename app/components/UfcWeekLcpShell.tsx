import Link from "next/link";
import { partidoPath } from "../lib/event-slug";
import {
  UFC_CASABLANCA_FALLBACK,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "../lib/ufc-week";

/** Shell SSR con imagen LCP estática — pinta antes de que resuelva la API de destacados. */
export function UfcWeekLcpShell() {
  const mainEvent = UFC_CASABLANCA_FALLBACK.event;
  const href = partidoPath(mainEvent);

  return (
    <article
      className="qvh-ufc-week-shell qvh-ufc-week-shell-loading"
      aria-busy="true"
      aria-label="Cargando semana de UFC Casablanca"
    >
      <Link
        href={href}
        className="qvh-ufc-week-lcp-link"
        tabIndex={-1}
        aria-hidden
      >
        <div className="qvh-ufc-week-fight-poster" aria-hidden>
          <div className="qvh-ufc-week-poster-fighter qvh-ufc-week-poster-fighter-red">
            <div className="qvh-ufc-week-corner-photo-wrap qvh-ufc-week-poster-bust">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={UFC_CASABLANCA_FIGHTER_IMAGES.topuria}
                alt=""
                className="qvh-ufc-week-poster-photo"
                width={140}
                height={196}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
              />
            </div>
            <p className="qvh-ufc-week-poster-name">{mainEvent.home_team}</p>
          </div>
          <span className="qvh-ufc-week-vs-octagon qvh-ufc-week-poster-vs">
            VS
          </span>
          <div className="qvh-ufc-week-poster-fighter qvh-ufc-week-poster-fighter-blue">
            <div className="qvh-ufc-week-corner-photo-wrap qvh-ufc-week-poster-bust">
              <span className="qvh-ufc-week-poster-fallback" aria-hidden>
                JG
              </span>
            </div>
            <p className="qvh-ufc-week-poster-name">{mainEvent.away_team}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
