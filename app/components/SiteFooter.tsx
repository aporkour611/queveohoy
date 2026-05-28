import Link from "next/link";
import { LogoMark } from "./LogoMark";

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
        <div className="qvh-site-footer-top">
          <div className="qvh-site-footer-brand-block">
            <Link
              href="/"
              className="qvh-logo-link qvh-logo-link--full qvh-site-footer-logo"
              aria-label="Qué veo hoy — Inicio"
            >
              <LogoMark className="qvh-logo-svg qvh-logo-svg--full" />
            </Link>
            <p className="qvh-site-footer-tagline">
              La agenda de España para saber qué ver hoy en TV, streaming y deportes.
            </p>
          </div>

          <nav className="qvh-site-footer-nav" aria-label="Información legal">
            <p className="qvh-site-footer-nav-kicker">Información</p>
            <ul className="qvh-site-footer-nav-list">
              <li>
                <Link href="/privacidad">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/cookies">Política de cookies</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="qvh-site-footer-divider" aria-hidden />

        <div className="qvh-site-footer-bottom">
          <p className="qvh-site-footer-meta">
            © {year} queveohoy.es · Horario: península y Baleares
          </p>
          <p className="qvh-site-footer-credit">
            Datos abiertos con cita a queveohoy.es
          </p>
        </div>
      </div>
    </footer>
  );
}
