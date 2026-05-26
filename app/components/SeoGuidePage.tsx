import Link from "next/link";
import type { SeoGuideConfig } from "../lib/seo-guides";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";

type Props = {
  guide: SeoGuideConfig;
};

export function SeoGuidePage({ guide }: Props) {
  const isChampions = guide.slug === "champions-espana";

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

      <main className="fh-content">
        <article className="fh-container fh-main fh-seo-guide">
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">{guide.title}</span>
          </nav>

          <h1 className="fh-page-title">{guide.h1}</h1>
          <p className="fh-page-lead">{guide.description}</p>

          <section className="fh-seo-guide-block">
            <h2>Canales y plataformas en España</h2>
            {isChampions ? (
              <ul className="fh-seo-guide-list">
                <li>
                  <strong>La 1 / RTVE:</strong> partidos seleccionados en abierto.
                </li>
                <li>
                  <strong>Movistar Liga de Campeones:</strong> la mayor parte de
                  la fase de liga y muchos playoffs.
                </li>
                <li>
                  <strong>DAZN:</strong> partidos según derechos de la temporada.
                </li>
                <li>
                  <strong>Otros:</strong> consulta la fila de cada partido en la
                  agenda — el canal exacto cambia por jornada.
                </li>
              </ul>
            ) : (
              <ul className="fh-seo-guide-list">
                <li>
                  <strong>Movistar LaLiga:</strong> partidos del paquete
                  tradicional de Movistar.
                </li>
                <li>
                  <strong>DAZN LaLiga:</strong> gran parte de la jornada en
                  suscripción.
                </li>
                <li>
                  <strong>Gol Play / abierto:</strong> algunos encuentros en
                  televisión abierta.
                </li>
              </ul>
            )}
          </section>

          <section className="fh-seo-guide-block">
            <h2>Agenda con horarios de hoy</h2>
            <p>
              Para ver <strong>qué partidos hay hoy</strong> y a qué hora empiezan
              en península y Baleares, usa la agenda actualizada:
            </p>
            <p className="fh-seo-guide-ctas">
              <Link href={isChampions ? "/champions" : "/laliga"} className="qvh-hero-cta-primary">
                Ver {isChampions ? "Champions" : "LaLiga"} hoy →
              </Link>
              {" "}
              <Link href="/partidos-hoy">Todos los partidos hoy</Link>
            </p>
          </section>

          <section className="fh-seo-guide-block">
            <h2>Consejo rápido</h2>
            <p>
              Los derechos cambian por temporada. La forma más fiable de saber dónde
              ver un partido concreto es mirar la fila del evento en{" "}
              <Link href="/">queveohoy.es</Link>: ahí aparece canal y hora.
            </p>
          </section>
        </article>
        <SiteFooter />
      </main>
    </div>
  );
}
