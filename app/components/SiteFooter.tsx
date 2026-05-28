import Link from "next/link";
import { SEO_FOOTER_HUB_SLUGS, SEO_HUB_NAV_LINKS } from "../lib/seo-hub-nav";

export function SiteFooter() {
  const featuredHubs = SEO_HUB_NAV_LINKS.filter((hub) =>
    (SEO_FOOTER_HUB_SLUGS as readonly string[]).includes(hub.slug)
  );
  const year = new Date().getFullYear();

  return (
    <footer className="qvh-site-footer">
      <div className="qvh-site-footer-shell">
        <div className="qvh-site-footer-grid">
          <div className="qvh-site-footer-brand">
            <p className="qvh-site-footer-eyebrow">Qué veo hoy</p>
            <p className="qvh-site-footer-note">
              ¿Qué ver hoy en la tele? Agenda de partidos, deportes y estrenos en
              TV y streaming con horarios y canales. Puedes consultar y reutilizar
              estos datos libremente citando queveohoy.es como fuente.
            </p>
          </div>

          <nav className="qvh-site-footer-seo" aria-label="Agendas destacadas">
            <p className="qvh-site-footer-nav-title">Agendas</p>
            <ul className="qvh-site-footer-linklist">
              {featuredHubs.map((hub) => (
                <li key={hub.slug}>
                  <Link href={`/${hub.slug}`}>{hub.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="qvh-site-footer-legal" aria-label="Legal">
            <p className="qvh-site-footer-nav-title">Información</p>
            <ul className="qvh-site-footer-linklist">
              <li>
                <Link href="/privacidad">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/cookies">Política de cookies</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="qvh-site-footer-bottom">
          <p className="qvh-site-footer-bottom-meta">
            © {year} queveohoy.es · Horario: península y Baleares
          </p>
          <ul className="qvh-site-footer-bottom-legal">
            <li>
              <Link href="/privacidad">Privacidad</Link>
            </li>
            <li>
              <Link href="/cookies">Cookies</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
