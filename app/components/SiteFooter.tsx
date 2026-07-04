import { LogoMark } from "./LogoMark";
import { SEO_FOOTER_HUB_SLUGS, SEO_HUB_NAV_LINKS } from "../lib/seo-hub-nav";
import { SEO_GUIDES } from "../lib/seo-guides";
import { PRODUCT_VERSION } from "../lib/product-version";

const FOOTER_GUIDE_SLUGS = SEO_GUIDES.slice(0, 6).map((g) => g.slug);

const hubTitleBySlug = Object.fromEntries(
  SEO_HUB_NAV_LINKS.map((link) => [link.slug, link.title])
) as Record<string, string>;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="qvh-site-footer">
      <div className="qvh-site-footer-aurora" aria-hidden>
        <span className="qvh-site-footer-aurora-a" />
        <span className="qvh-site-footer-aurora-b" />
        <span className="qvh-site-footer-aurora-c" />
      </div>
      <div className="qvh-site-footer-rule" aria-hidden />

      <div className="qvh-site-footer-inner">
        <div className="qvh-site-footer-top qvh-site-footer-top-wide">
          <div className="qvh-site-footer-brand-block">
            <a
              href="/"
              className="qvh-logo-link qvh-logo-link--full qvh-site-footer-logo"
              aria-label="Qué veo hoy — Inicio"
            >
              <LogoMark className="qvh-logo-svg qvh-logo-svg--full" />
            </a>
            <p className="qvh-site-footer-tagline">
              La agenda de España para saber qué ver hoy en TV, streaming y deportes.
            </p>
          </div>

          <nav className="qvh-site-footer-nav" aria-label="Agendas deportivas">
            <p className="qvh-site-footer-nav-kicker">Agenda</p>
            <ul className="qvh-site-footer-nav-list">
              {SEO_FOOTER_HUB_SLUGS.map((slug) => (
                <li key={slug}>
                  <a href={slug === "partidos-hoy" ? "/partidos-hoy" : `/${slug}`}>
                    {hubTitleBySlug[slug] ?? slug}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="qvh-site-footer-nav" aria-label="Guías y proyecto">
            <p className="qvh-site-footer-nav-kicker">Guías y proyecto</p>
            <ul className="qvh-site-footer-nav-list">
              <li>
                <a href="/guia">
                  Todas las guías
                </a>
              </li>
              {FOOTER_GUIDE_SLUGS.map((slug) => {
                const guide = SEO_GUIDES.find((g) => g.slug === slug);
                if (!guide) return null;
                return (
                  <li key={slug}>
                    <a href={`/guia/${slug}`}>{guide.title}</a>
                  </li>
                );
              })}
              <li>
                <a href="/sobre">Sobre nosotros</a>
              </li>
              <li>
                <a href="/novedades">
                  Novedades
                </a>
              </li>
              <li>
                <a href="/contacto">Contacto</a>
              </li>
              <li>
                <a href="/explorar">
                  Explorar categorías
                </a>
              </li>
              <li>
                <a href="/desarrolladores">
                  API y widget
                </a>
              </li>
            </ul>
          </nav>

          <nav className="qvh-site-footer-nav" aria-label="Información legal">
            <p className="qvh-site-footer-nav-kicker">Legal</p>
            <ul className="qvh-site-footer-nav-list">
              <li>
                <a href="/privacidad">Política de privacidad</a>
              </li>
              <li>
                <a href="/cookies">Política de cookies</a>
              </li>
              <li>
                <a href="/aviso-legal">Aviso legal</a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="qvh-site-footer-divider" aria-hidden />

        <div className="qvh-site-footer-bottom">
          <p className="qvh-site-footer-meta">
            © {year} queveohoy.es · v{PRODUCT_VERSION} · Horario: península y Baleares
          </p>
          <p className="qvh-site-footer-credit">
            Datos abiertos con cita a queveohoy.es
          </p>
        </div>
      </div>
    </footer>
  );
}
