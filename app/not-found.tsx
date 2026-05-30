import "./futbolhoy-shell.css";
import Link from "next/link";
import { SEO_HUB_NAV_LINKS } from "./lib/seo-hub-nav";

export default function NotFound() {
  return (
    <main id="main-content" className="fh-content qvh-not-found">
      <div className="fh-container">
        <h1>Página no encontrada</h1>
        <p>
          No existe esta URL en queveohoy.es. Prueba la agenda de hoy o una de
          las secciones más visitadas:
        </p>
        <ul className="qvh-not-found-links">
          <li>
            <Link href="/" className="qvh-hero-cta-primary">
              Agenda de hoy
            </Link>
          </li>
          <li>
            <Link href="/partidos-hoy">Partidos hoy en TV</Link>
          </li>
          <li>
            <Link href="/guia">Guías: dónde ver</Link>
          </li>
        </ul>
        <p className="qvh-not-found-hubs">
          {SEO_HUB_NAV_LINKS.slice(0, 8).map((hub, index) => (
            <span key={hub.slug}>
              {index > 0 ? " · " : null}
              <Link href={hub.slug === "partidos-hoy" ? "/partidos-hoy" : `/${hub.slug}`}>
                {hub.title}
              </Link>
            </span>
          ))}
        </p>
      </div>
    </main>
  );
}
