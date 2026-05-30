import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "../../components/Logo";
import { pageMetadata } from "../../lib/seo";

export const metadata: Metadata = pageMetadata(
  "/aviso-legal",
  "Aviso legal",
  "Información legal y condiciones de uso de queveohoy.es."
);

export default function AvisoLegalPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="qvh-legal-page">
        <div className="fh-container">
          <h1>Aviso legal</h1>
          <p className="qvh-legal-updated">Última actualización: 1 de junio de 2026</p>

          <section>
            <h2>Titular del sitio</h2>
            <p>
              El dominio queveohoy.es es un proyecto informativo sobre eventos
              deportivos, e-sports y entretenimiento en televisión y plataformas
              de streaming en España. Para consultas legales o de contenido
              puedes escribir a{" "}
              <a href="mailto:contacto@queveohoy.es">contacto@queveohoy.es</a>.
            </p>
          </section>

          <section>
            <h2>Objeto y condiciones de uso</h2>
            <p>
              El acceso y uso de este sitio implica la aceptación de las
              presentes condiciones. La información publicada (horarios, canales,
              plataformas) se ofrece con carácter orientativo y puede variar por
              decisiones de terceros emisoras o proveedores de datos.
            </p>
            <p>
              El usuario se compromete a un uso lícito del sitio, sin intentar
              alterar su funcionamiento, extraer datos de forma masiva no
              autorizada ni utilizar los contenidos con fines contrarios a la ley.
            </p>
          </section>

          <section>
            <h2>Propiedad intelectual</h2>
            <p>
              Los textos editoriales, diseño y código propio de queveohoy.es están
              protegidos por la normativa aplicable. Escudos, logotipos de
              competiciones, posters y marcas de terceros pertenecen a sus
              titulares y se muestran con fines informativos.
            </p>
          </section>

          <section>
            <h2>Responsabilidad</h2>
            <p>
              Trabajamos para mantener la agenda actualizada, pero no garantizamos
              la ausencia de errores en horarios o canales. No nos hacemos
              responsables de daños derivados del uso de la información publicada
              ni de enlaces a sitios externos.
            </p>
          </section>

          <section>
            <h2>Enlaces externos</h2>
            <p>
              El sitio puede incluir enlaces a páginas de terceros. No controlamos
              su contenido ni sus políticas de privacidad.
            </p>
          </section>

          <section>
            <h2>Legislación aplicable</h2>
            <p>
              Estas condiciones se rigen por la legislación española. Para
              conflictos, las partes se someten a los juzgados y tribunales que
              correspondan según la normativa de consumidores y usuarios.
            </p>
          </section>

          <section>
            <h2>Privacidad y cookies</h2>
            <p>
              Consulta la{" "}
              <Link href="/privacidad">política de privacidad</Link> y la{" "}
              <Link href="/cookies">política de cookies</Link> para conocer cómo
              tratamos tus datos y preferencias.
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
