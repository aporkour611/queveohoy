import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../components/Logo";
import { pageMetadata } from "../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/cookies",
  "Política de cookies",
  "Cookies, almacenamiento local y sesión de cuenta utilizados en queveohoy.es."
);

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
          <p className="qvh-legal-updated">Última actualización: 26 de mayo de 2026</p>

          <section>
            <h2>Qué son las cookies</h2>
            <p>
              Las cookies y tecnologías similares son pequeños archivos o
              identificadores que el navegador guarda para recordar preferencias,
              mantener una sesión iniciada o permitir el funcionamiento de un
              sitio web.
            </p>
          </section>

          <section>
            <h2>Cookies y almacenamiento que utilizamos</h2>
            <ul>
              <li>
                <strong>Sesión de cuenta</strong> — cookies técnicas gestionadas
                por Supabase Auth para que puedas iniciar sesión, mantener la
                sesión activa y cerrarla de forma segura. Son necesarias si usas
                registro o inicio de sesión.
              </li>
              <li>
                <strong>Preferencias de filtros</strong> — almacenamiento local
                del navegador para recordar las categorías deportivas o de
                entretenimiento que has seleccionado en la home.
              </li>
              <li>
                <strong>Preferencias de horario</strong> — almacenamiento local
                para recordar si consultas horarios de España o LATAM y la zona
                horaria elegida.
              </li>
              <li>
                <strong>Favoritos en caché</strong> — almacenamiento local con
                los identificadores de eventos que has marcado como favoritos,
                para mostrar el corazón activo más rápido. La lista definitiva
                se guarda en tu cuenta en nuestros servidores.
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
            </ul>
          </section>

          <section>
            <h2>Cookies de terceros</h2>
            <p>
              La autenticación y el almacenamiento de cuenta se apoyan en
              Supabase. Ese proveedor puede establecer cookies propias cuando
              inicias sesión. No usamos cookies publicitarias ni de seguimiento
              con fines de marketing.
            </p>
          </section>

          <section>
            <h2>Cómo gestionarlas</h2>
            <p>
              Puedes eliminar o bloquear cookies desde la configuración de tu
              navegador. Si desactivas las cookies de sesión, no podrás mantener
              la cuenta iniciada. Si desactivas el almacenamiento local, los
              filtros, la zona horaria y la caché de favoritos volverán a su
              estado predeterminado en cada visita, aunque tus favoritos
              seguirán guardados en el servidor mientras tengas sesión.
            </p>
          </section>

          <section>
            <h2>Más información</h2>
            <p>
              Consulta también nuestra{" "}
              <Link href="/privacidad">política de privacidad</Link> para saber
              qué datos personales tratamos cuando creas una cuenta.
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
