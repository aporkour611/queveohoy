import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { PageMain } from "../../components/PageMain";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/cookies",
  "Política de cookies",
  "Cookies y almacenamiento local utilizados en queveohoy.es."
);

export default function CookiesPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <PageMain className="qvh-legal-page">
        <div className="fh-container">
          <h1>Política de cookies</h1>
          <p className="qvh-legal-updated">Última actualización: 27 de mayo de 2026</p>

          <section>
            <h2>Qué son las cookies</h2>
            <p>
              Las cookies y tecnologías similares son pequeños archivos o
              identificadores que el navegador guarda para recordar preferencias
              o permitir el funcionamiento de un sitio web.
            </p>
          </section>

          <section>
            <h2>Cookies y almacenamiento que utilizamos</h2>
            <ul>
              <li>
                <strong>Preferencias de filtros</strong> — almacenamiento local
                del navegador para recordar las categorías deportivas o de
                entretenimiento que has seleccionado en la home.
              </li>
              <li>
                <strong>Acceso de administración</strong> — cookie técnica
                opcional, solo si activas el panel de administración mediante la
                URL autorizada.
              </li>
              <li>
                <strong>Medición y hosting</strong> — el proveedor de alojamiento
                (Vercel) y servicios relacionados pueden usar cookies o
                identificadores técnicos propios para seguridad, rendimiento y
                estadísticas agregadas.
              </li>
              <li>
                <strong>Avisos push (opcional)</strong> — si activas las
                notificaciones, guardamos en tu navegador las preferencias de
                categorías y un identificador de suscripción push en nuestros
                servidores para enviarte avisos de eventos destacados. Solo se
                activa con tu permiso explícito.
              </li>
            </ul>
          </section>

          <section>
            <h2>Cómo gestionarlas</h2>
            <p>
              Al entrar por primera vez te pedimos consentimiento con un aviso
              en la parte inferior de la pantalla. Puedes aceptar o rechazar el
              uso de preferencias y medición. También puedes eliminar o bloquear
              cookies desde la configuración de tu navegador. Si desactivas el
              almacenamiento local, los filtros volverán a su
              estado predeterminado en cada visita.
            </p>
          </section>

          <section>
            <h2>Más información</h2>
            <p>
              Consulta también nuestra{" "}
              <Link href="/privacidad">política de privacidad</Link>.
            </p>
          </section>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
      </PageMain>
    </div>
  );
}
