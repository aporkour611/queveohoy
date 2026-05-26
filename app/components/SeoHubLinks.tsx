import Link from "next/link";
import { SEO_HUB_NAV_LINKS } from "../lib/seo-hub-nav";
import type { SeoHubConfig } from "../lib/seo-hubs";
import { SEO_HUBS } from "../lib/seo-hubs";

type Props = {
  current?: string;
};

export function SeoHubLinks({ current }: Props) {
  return (
    <nav className="fh-seo-hub-links" aria-label="Agendas por deporte y competición">
      <h2 className="fh-seo-hub-links-title">Agenda por deporte y competición</h2>
      <ul className="fh-seo-hub-links-list">
        {SEO_HUB_NAV_LINKS.map((hub) => (
          <li key={hub.slug}>
            {hub.slug === current ? (
              <span aria-current="page">{hub.title}</span>
            ) : (
              <Link href={`/${hub.slug}`}>{hub.title}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function hubLinkForEvent(
  event: { sport?: string | null; competition?: string | null }
): SeoHubConfig | null {
  const comp = event.competition ?? "";
  if (event.sport === "futbol" && /champions/i.test(comp)) {
    return SEO_HUBS.find((h) => h.slug === "champions") ?? null;
  }
  if (
    event.sport === "futbol" &&
    /laliga|primera\s*divisi|division\s*de\s*honor/i.test(comp)
  ) {
    return SEO_HUBS.find((h) => h.slug === "laliga") ?? null;
  }
  if (event.sport === "futbol" && /premier/i.test(comp)) {
    return SEO_HUBS.find((h) => h.slug === "premier-league") ?? null;
  }
  if (event.sport === "futbol" && /copa del rey/i.test(comp)) {
    return SEO_HUBS.find((h) => h.slug === "copa-del-rey") ?? null;
  }
  if (event.sport === "futbol") {
    return SEO_HUBS.find((h) => h.slug === "futbol") ?? null;
  }
  if (event.sport === "basket" && /nba/i.test(comp)) {
    return SEO_HUBS.find((h) => h.slug === "nba") ?? null;
  }
  if (event.sport === "basket") {
    return SEO_HUBS.find((h) => h.slug === "baloncesto") ?? null;
  }
  if (event.sport === "tenis") {
    return SEO_HUBS.find((h) => h.slug === "tenis") ?? null;
  }
  if (event.sport === "ciclismo") {
    return SEO_HUBS.find((h) => h.slug === "ciclismo") ?? null;
  }
  if (event.sport === "formula1") {
    return SEO_HUBS.find((h) => h.slug === "formula-1") ?? null;
  }
  if (event.sport === "motos") {
    return SEO_HUBS.find((h) => h.slug === "motogp") ?? null;
  }
  if (event.sport === "ufc") {
    return SEO_HUBS.find((h) => h.slug === "ufc") ?? null;
  }
  if (event.sport === "series" || event.sport === "cine") {
    return SEO_HUBS.find((h) => h.slug === "series") ?? null;
  }
  return null;
}
