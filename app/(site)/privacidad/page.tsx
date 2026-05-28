import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/privacidad",
  "Política de privacidad",
  "Información sobre el tratamiento de datos personales en queveohoy.es."
);

export default function PrivacidadPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="qvh-legal-page">
        <div className="fh-container">
          <h1>Política de privacidad</h1>
          <p className="qvh-legal-updated">Última actualización: 27 de mayo de 2026</p>

          <section>
            <h2>Responsable</h2>
            <p>
              El sitio queveohoy.es es un proyecto informativo sobre eventos
              deportivos, e-sports y entretenimiento en televisión y plataformas
              de streaming. Para cuestiones relacionadas con tus datos personales
              puedes escribir a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>.
            </p>
          </section>

          <section>
            <h2>Datos que tratamos</h2>
            <p>
              Podemos tratar datos técnicos habituales (dirección IP, tipo de
              dispositivo, páginas visitadas) a través del proveedor de
              alojamiento con fines de seguridad y estadísticas agregadas. Las
              preferencias de filtros se guardan en tu navegador;
              no identifican por sí solas a una persona concreta. Si activas
              avisos push, almacenamos un identificador de suscripción y tus
              categorías preferidas (fútbol, UFC, series, motor) para enviarte
              como máximo 2 avisos al día.
            </p>
          </section>

          <section>
            <h2>Finalidad y base legal</h2>
            <ul>
              <li>
                <strong>Recordar preferencias</strong> — filtros en tu
                navegador. Base: interés legítimo en ofrecer una experiencia
                cómoda.
              </li>
              <li>
                <strong>Seguridad y funcionamiento</strong> — logs técnicos del
                hosting y prevención de abusos. Base: interés legítimo.
              </li>
              <li>
                <strong>Notificaciones push (opcional)</strong> — avisos de
                eventos destacados ~45 min antes de su hora. Base: consentimiento
                explícito del navegador. Puedes desactivarlas en cualquier
                momento desde el icono de campana en la home.
              </li>
            </ul>
          </section>

          <section>
            <h2>Encargados</h2>
            <p>Utilizamos proveedores que tratan datos en nuestro nombre:</p>
            <ul>
              <li>
                <strong>Supabase</strong> — base de datos de eventos.
              </li>
              <li>
                <strong>Vercel</strong> — alojamiento y entrega del sitio.
              </li>
            </ul>
          </section>

          <section>
            <h2>Conservación</h2>
            <p>
              Los datos técnicos del hosting se conservan el tiempo necesario
              para seguridad y estadísticas agregadas.
            </p>
          </section>

          <section>
            <h2>Tus derechos</h2>
            <p>
              Puedes acceder, rectificar o suprimir tus datos, limitar u oponerte
              a determinados tratamientos cuando corresponda. Para ejercer estos
              derechos, escribe a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>.
              Tienes derecho a reclamar ante la Agencia Española de Protección de
              Datos (
              <a
                href="https://www.aepd.es"
                target="_blank"
                rel="noopener noreferrer"
              >
                aepd.es
              </a>
              ).
            </p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>
              Detalle de cookies y almacenamiento local en la{" "}
              <Link href="/cookies">política de cookies</Link>.
            </p>
          </section>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
