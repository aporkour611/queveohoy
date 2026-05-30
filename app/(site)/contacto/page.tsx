import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { SiteFooter } from "../../components/SiteFooter";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/contacto",
  "Contacto — queveohoy.es",
  "Contacta con el equipo de queveohoy.es para consultas, correcciones de horarios o privacidad.",
  ["contacto queveohoy", "que veo hoy contacto"]
);

export default function ContactoPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="fh-content">
        <div className="qvh-legal-page fh-container">
          <h1>Contacto</h1>
          <p className="qvh-legal-updated">Respondemos en 2–5 días laborables</p>

          <section>
            <h2>Consultas generales</h2>
            <p>
              Escríbenos a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>{" "}
              para dudas sobre la agenda, sugerencias de programas o deportes
              que falten, o colaboraciones editoriales.
            </p>
          </section>

          <section>
            <h2>Correcciones de horarios o canales</h2>
            <p>
              Si un partido o programa muestra hora o canal incorrectos, indica
              el título del evento, la fecha y la fuente correcta. Priorizamos
              correcciones de eventos del día en curso.
            </p>
          </section>

          <section>
            <h2>Privacidad y datos personales</h2>
            <p>
              Para ejercer tus derechos (acceso, supresión, oposición) o
              consultas sobre cookies y push, usa el mismo correo indicando
              &quot;Privacidad&quot; en el asunto. Más información en la{" "}
              <Link href="/privacidad">política de privacidad</Link>.
            </p>
          </section>

          <section>
            <h2>Enlaces útiles</h2>
            <ul>
              <li>
                <Link href="/sobre">Sobre el proyecto</Link>
              </li>
              <li>
                <Link href="/novedades">Novedades y cambios recientes</Link>
              </li>
              <li>
                <Link href="/guia">Guías: dónde ver deportes</Link>
              </li>
            </ul>
          </section>

          <p className="qvh-legal-back">
            <Link href="/">← Volver al inicio</Link>
          </p>
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
