import type { Metadata } from "next"
import Link from "next/link"
import { Logo } from "../../components/Logo"
import { SiteFooter } from "../../components/SiteFooter"
import { PRODUCT_VERSION } from "../../lib/product-version"
import { pageMetadata, siteUrl } from "../../lib/seo"
import {
  PUBLIC_API_RATE_LIMIT,
  PUBLIC_API_VERSION,
} from "../../lib/public-api"

export const metadata: Metadata = pageMetadata(
  "/desarrolladores",
  "API y widget para desarrolladores",
  "API pública read-only y widget embed «Qué ver esta noche» de queveohoy.es para medios y partners.",
  ["api queveohoy", "widget tv", "agenda deportiva api"]
)

/** Regenerar tras cada deploy (docs API v4). */
export const revalidate = 0

export default function DesarrolladoresPage() {
  const feedExample = `${siteUrl}/api/v1/feed`
  const embedExample = `${siteUrl}/embed/esta-noche`

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <main className="fh-content">
        <div className="qvh-legal-page fh-container">
          <h1>Desarrolladores</h1>
          <p className="qvh-legal-updated">
            Plataforma v{PRODUCT_VERSION} · API v{PUBLIC_API_VERSION}
          </p>

          <section>
            <h2>API pública (read-only)</h2>
            <p>
              Endpoint estable para integrar la agenda de queveohoy.es en apps,
              medios o dashboards. Respuesta JSON con CORS abierto en GET.
            </p>
            <ul>
              <li>
                <code>GET /api/v1/feed</code> — eventos del día (Madrid). Opcional{" "}
                <code>?date=YYYY-MM-DD</code>, <code>?limit=50</code>,{" "}
                <code>?cursor=...</code>.
              </li>
              <li>
                <code>GET /api/v1/search?q=...</code> — búsqueda por texto (mín. 2
                caracteres).
              </li>
              <li>
                <code>GET /api/v1/events/[id]</code> — detalle de un evento por ID.
              </li>
            </ul>
            <p>
              Límite: {PUBLIC_API_RATE_LIMIT} peticiones/minuto por IP. Cita{" "}
              <strong>queveohoy.es</strong> al reutilizar los datos.
            </p>
            <pre className="qvh-dev-code">
              <code>{`curl "${feedExample}"`}</code>
            </pre>
          </section>

          <section>
            <h2>Widget «Qué ver esta noche»</h2>
            <p>
              Incrusta la selección de prime time (desde las 18:00 h) en tu web
              con un iframe. El widget enlaza de vuelta a la agenda completa.
            </p>
            <pre className="qvh-dev-code">
              <code>{`<iframe
  src="${embedExample}"
  title="Qué ver esta noche — queveohoy.es"
  width="420"
  height="520"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>`}</code>
            </pre>
            <p>
              Vista previa:{" "}
              <Link href="/embed/esta-noche" target="_blank" rel="noopener">
                abrir widget
              </Link>
            </p>
          </section>

          <section>
            <h2>Documentación</h2>
            <p>
              Especificación completa en{" "}
              <a href="https://github.com/aporkour611/queveohoy/blob/main/docs/API.md">
                docs/API.md
              </a>{" "}
              del repositorio.
            </p>
          </section>
        </div>
        <SiteFooter />
      </main>
    </div>
  )
}
