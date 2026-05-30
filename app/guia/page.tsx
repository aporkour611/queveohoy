import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../components/Logo"
import { PageMain } from "../components/PageMain";
import { SiteFooter } from "../components/SiteFooter";
import { pageMetadata } from "../lib/seo";
import { SEO_GUIDES } from "../lib/seo-guides";

export const metadata: Metadata = pageMetadata(
  "/guia",
  "Guías: dónde ver deportes y TV en España",
  "Guías prácticas para saber dónde ver Champions, LaLiga, F1, UFC, NBA y más en TV y streaming en España.",
  [
    "donde ver champions",
    "donde ver laliga",
    "guia deportes tv españa",
    "canales streaming deportes",
  ]
);

export default function GuiaIndexPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <Link href="/" className="fh-seo-hub-back">
              Agenda completa
            </Link>
          </div>
        </div>
      </nav>

      <PageMain className="fh-content">
        <div className="fh-container fh-main fh-seo-guide">
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">Guías</span>
          </nav>

          <h1 className="fh-page-title">Guías: dónde ver en España</h1>
          <p className="fh-page-lead">
            Canales, plataformas y enlaces a la agenda diaria con horarios en
            península y Baleares. Actualizadas a lo largo de la temporada.
          </p>

          <ul className="qvh-guide-index-list">
            {SEO_GUIDES.map((guide) => (
              <li key={guide.slug}>
                <Link href={`/guia/${guide.slug}`} className="qvh-guide-index-card">
                  <span className="qvh-guide-index-title">{guide.title}</span>
                  <span className="qvh-guide-index-desc">{guide.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <SiteFooter />
      </PageMain>
    </div>
  );
}
