import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { SiteFooter } from "../../components/SiteFooter";
import { PRODUCT_RELEASES } from "../../lib/product-releases";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/novedades",
  "Novedades — queveohoy.es",
  "Historial de mejoras y lanzamientos de queveohoy.es: agenda TV, deportes y streaming en España.",
  ["novedades queveohoy", "actualizaciones agenda tv"]
);

function formatReleaseDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NovedadesPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="fh-content">
        <div className="qvh-legal-page fh-container qvh-releases-page">
          <h1>Novedades</h1>
          <p className="qvh-legal-updated">
            Historial de releases · versión actual {PRODUCT_RELEASES[0]?.version}
          </p>

          <ol className="qvh-releases-list">
            {PRODUCT_RELEASES.map((release) => (
              <li key={release.version} className="qvh-releases-item">
                <div className="qvh-releases-head">
                  <span className="qvh-releases-version">v{release.version}</span>
                  <time dateTime={release.date}>{formatReleaseDate(release.date)}</time>
                </div>
                <h2 className="qvh-releases-title">{release.title}</h2>
                <ul>
                  {release.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
            {" · "}
            <Link href="/sobre">Sobre el proyecto</Link>
          </p>
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
