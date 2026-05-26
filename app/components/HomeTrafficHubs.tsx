import Link from "next/link";
import type { EventRow } from "./types";
import { getMadridTodayKey, partidosHoyDatePath } from "../lib/seo-date";
import { SEO_HUBS } from "../lib/seo-hubs";
import { filterEventsForHub } from "../lib/seo-hubs";

const PROMO_HUB_SLUGS = [
  "partidos-hoy",
  "champions",
  "laliga",
  "futbol",
  "nba",
  "formula-1",
] as const;

type Props = {
  events: EventRow[];
};

export function HomeTrafficHubs({ events }: Props) {
  const todayKey = getMadridTodayKey();

  const links = PROMO_HUB_SLUGS.map((slug) => {
    const hub = SEO_HUBS.find((h) => h.slug === slug);
    if (!hub) return null;
    const count = filterEventsForHub(events, hub).length;
    const href =
      slug === "partidos-hoy"
        ? partidosHoyDatePath(todayKey)
        : `/${slug}`;
    return { hub, count, href };
  }).filter(Boolean) as {
    hub: (typeof SEO_HUBS)[number];
    count: number;
    href: string;
  }[];

  return (
    <nav className="qvh-traffic-hubs" aria-label="Accesos rápidos por competición">
      <h2 className="qvh-traffic-hubs-title">¿Qué quieres ver hoy?</h2>
      <ul className="qvh-traffic-hubs-list">
        {links.map(({ hub, count, href }) => (
          <li key={hub.slug}>
            <Link href={href} className="qvh-traffic-hub-card">
              <span className="qvh-traffic-hub-label">{hub.title}</span>
              {count > 0 ? (
                <span className="qvh-traffic-hub-count">
                  {count} {count === 1 ? "evento" : "eventos"}
                </span>
              ) : (
                <span className="qvh-traffic-hub-count qvh-traffic-hub-count-muted">
                  Ver agenda
                </span>
              )}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/guia/champions-espana" className="qvh-traffic-hub-card qvh-traffic-hub-card-guide">
            <span className="qvh-traffic-hub-label">Dónde ver Champions</span>
            <span className="qvh-traffic-hub-count qvh-traffic-hub-count-muted">Guía TV</span>
          </Link>
        </li>
        <li>
          <Link href="/guia/laliga-espana" className="qvh-traffic-hub-card qvh-traffic-hub-card-guide">
            <span className="qvh-traffic-hub-label">Dónde ver LaLiga</span>
            <span className="qvh-traffic-hub-count qvh-traffic-hub-count-muted">Guía TV</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
