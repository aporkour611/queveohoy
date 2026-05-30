import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";

import { PageMain } from "../../components/PageMain";
import { SiteFooter } from "../../components/SiteFooter";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/sobre",
  "Sobre queveohoy.es",
  "Qué es queveohoy.es: agenda diaria de deportes, TV y streaming en España con horarios y canales.",
  ["que veo hoy", "agenda tv españa", "partidos hoy"]
);

export default function SobrePage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <PageMain className="fh-content">
        <div className="qvh-legal-page fh-container">
          <h1>Sobre queveohoy.es</h1>
          <p className="qvh-legal-updated">Proyecto activo desde junio de 2025</p>

          <section>
            <h2>Qué hacemos</h2>
            <p>
              queveohoy.es es la agenda de España para decidir qué ver hoy en
              televisión, streaming y deportes en directo. Reunimos partidos de
              fútbol, motor, UFC, baloncesto, tenis, e-sports, series, cine,
              anime y programas de TV con <strong>horario en península y Baleares</strong>{" "}
              y el canal o plataforma cuando está disponible.
            </p>
          </section>

          <section>
            <h2>Cómo funciona</h2>
            <ul>
              <li>
                <strong>Datos automáticos</strong> — APIs deportivas, TMDB,
                parrillas de RTVE/TVmaze y fuentes abiertas, normalizados a
                hora de Madrid.
              </li>
              <li>
                <strong>Curación editorial</strong> — programas de máximo
                interés en España, posters y destacados de la semana.
              </li>
              <li>
                <strong>Actualización frecuente</strong> — el cron revisa la
                agenda varias veces al día; los cambios de última hora se
                reflejan en la home y en los hubs SEO.
              </li>
            </ul>
          </section>

          <section>
            <h2>Para quién es</h2>
            <p>
              Para cualquier persona en España que abra la tele o una app de
              streaming y quiera una respuesta rápida:{" "}
              <em>¿qué hay hoy y dónde lo veo?</em> Sin registro obligatorio,
              con filtros por deporte y avisos push opcionales.
            </p>
          </section>

          <section>
            <h2>Transparencia</h2>
            <p>
              No vendemos entradas ni suscripciones. Los enlaces a plataformas
              son informativos. Consulta la{" "}
              <Link href="/privacidad">política de privacidad</Link> y la{" "}
              <Link href="/cookies">política de cookies</Link>.
            </p>
          </section>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
            {" · "}
            <Link href="/contacto">Contacto</Link>
            {" · "}
            <Link href="/novedades">Novedades</Link>
          </p>
        </div>
        <SiteFooter />
      </PageMain>
    </div>
  );
}
