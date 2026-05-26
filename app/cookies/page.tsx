import Link from "next/link";
import { Logo } from "../components/Logo";

export const metadata = {
  title: "Política de cookies — queveohoy.es",
};

export default function CookiesPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="qvh-legal-page">
        <div className="fh-container">
          <h1>Política de cookies</h1>
          <p className="qvh-legal-updated">Última actualización: mayo de 2026</p>

          <section>
            <h2>Qué son las cookies</h2>
            <p>
              Las cookies y tecnologías similares son pequeños archivos que el
              navegador guarda para recordar preferencias o permitir el
              funcionamiento de un sitio web.
            </p>
          </section>

          <section>
            <h2>Cookies que utilizamos</h2>
            <ul>
              <li>
                <strong>Preferencias de filtros</strong> — almacenamiento local
                del navegador para recordar las categorías que has seleccionado.
              </li>
              <li>
                <strong>Acceso de administración</strong> — cookie técnica
                opcional, solo si activas el panel de administración mediante la
                URL autorizada.
              </li>
              <li>
                <strong>Medición y hosting</strong> — el proveedor de alojamiento
                puede usar cookies o identificadores técnicos propios para
                seguridad, rendimiento y estadísticas anónimas.
              </li>
            </ul>
          </section>

          <section>
            <h2>Cómo gestionarlas</h2>
            <p>
              Puedes eliminar o bloquear cookies desde la configuración de tu
              navegador. Si desactivas el almacenamiento local, los filtros
              volverán a su estado predeterminado en cada visita.
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
