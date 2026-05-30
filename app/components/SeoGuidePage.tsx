import Link from "next/link";
import type { SeoGuideConfig } from "../lib/seo-guides";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

type Props = {
  guide: SeoGuideConfig;
};

export function SeoGuidePage({ guide }: Props) {
  const hubHref = guide.hubSlug === "partidos-hoy" ? "/partidos-hoy" : `/${guide.hubSlug}`;

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <Link href="/guia" className="fh-seo-hub-back">
              Todas las guías
            </Link>
            <Link href="/" className="fh-seo-hub-back">
              Agenda completa
            </Link>
          </div>
        </div>
      </nav>

      <main className="fh-content">
        <article className="fh-container fh-main fh-seo-guide">
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <Link href="/guia">Guías</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">{guide.title}</span>
          </nav>

          <h1 className="fh-page-title">{guide.h1}</h1>
          <p className="fh-page-lead">{guide.description}</p>

          <section className="fh-seo-guide-block">
            <h2>Canales y plataformas en España</h2>
            <ul className="fh-seo-guide-list">
              {guide.channels.map((channel) => (
                <li key={channel.name}>
                  <strong>{channel.name}:</strong> {channel.detail}
                </li>
              ))}
            </ul>
          </section>

          <section className="fh-seo-guide-block">
            <h2>Agenda con horarios de hoy</h2>
            <p>
              Para ver <strong>qué hay hoy</strong> y a qué hora empieza en
              península y Baleares, usa la agenda actualizada:
            </p>
            <p className="fh-seo-guide-ctas">
              <Link href={hubHref} className="qvh-hero-cta-primary">
                Ver {guide.hubLabel} hoy →
              </Link>
              {" "}
              <Link href="/partidos-hoy">Todos los partidos hoy</Link>
            </p>
          </section>

          <section className="fh-seo-guide-block">
            <h2>Consejo rápido</h2>
            <p>
              {guide.tip}{" "}
              <Link href="/">queveohoy.es</Link> actualiza canales y horarios
              varias veces al día.
            </p>
          </section>
        </article>
        <SiteFooter />
      </main>
    </div>
  );
}
