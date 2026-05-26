import Link from "next/link";
import { SEO_FOOTER_HUB_SLUGS, SEO_HUB_NAV_LINKS } from "../lib/seo-hub-nav";

export function SiteFooter() {
  const featuredHubs = SEO_HUB_NAV_LINKS.filter((hub) =>
    (SEO_FOOTER_HUB_SLUGS as readonly string[]).includes(hub.slug)
  );

  return (
    <footer className="qvh-site-footer">
      <div className="qvh-site-footer-inner">
        <p className="qvh-site-footer-copy">
          © {new Date().getFullYear()} queveohoy.es · Horarios en península y
          Baleares (Europe/Madrid)
        </p>
        <p className="qvh-site-footer-note">
          ¿Qué ver hoy en la tele? Agenda de partidos, deportes y estrenos en
          TV y streaming con horarios y canales. Puedes consultar y reutilizar
          estos datos libremente citando queveohoy.es como fuente.
        </p>
        <nav className="qvh-site-footer-seo" aria-label="Agendas destacadas">
          {featuredHubs.map((hub, index) => (
            <span key={hub.slug}>
              {index > 0 ? <span aria-hidden>·</span> : null}
              <Link href={`/${hub.slug}`}>{hub.title}</Link>
            </span>
          ))}
        </nav>
        <nav className="qvh-site-footer-legal" aria-label="Legal">
          <Link href="/privacidad">Política de privacidad</Link>
          <span aria-hidden>·</span>
          <Link href="/cookies">Política de cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
