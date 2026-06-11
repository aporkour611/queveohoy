import type { Metadata } from "next"
import Link from "next/link"
import "@/app/explorar.css"
import { Logo } from "../../components/Logo"

import { PageMain } from "../../components/PageMain";
import { SiteFooter } from "../../components/SiteFooter"
import { MAIN_CATEGORY_GROUPS } from "../../lib/filter-groups-design"
import { PRODUCT_VERSION } from "../../lib/product-version"
import { pageMetadata, siteUrl } from "../../lib/seo"
import { getPartnerRateLimit } from "../../lib/partner-api"
import {
  PUBLIC_API_MINOR_VERSION,
  PUBLIC_API_RATE_LIMIT,
  PUBLIC_API_V2_VERSION,
  PUBLIC_API_VERSION,
} from "../../lib/public-api"

export const metadata: Metadata = pageMetadata(
  "/desarrolladores",
  "API y widget para desarrolladores",
  "API pública read-only, widgets embed y design system neon de queveohoy.es para medios y partners.",
  ["api queveohoy", "widget tv", "agenda deportiva api"]
)

/** Regenerar tras cada deploy. */
export const revalidate = 0

export default function DesarrolladoresPage() {
  const feedExample = `${siteUrl}/api/v1/feed`
  const weekFeedExample = `${siteUrl}/api/v1/feed/week`
  const categoriesExample = `${siteUrl}/api/v1/feed?categories=futbol,formula1&limit=10`
  const v2FeedExample = `${siteUrl}/api/v2/feed`
  const embedTonight = `${siteUrl}/embed/esta-noche`
  const embedCategories = `${siteUrl}/embed/categorias`
  const feedMetaExample = `${siteUrl}/api/feed-meta`
  const widgetFavoriteExample = `${siteUrl}/api/v1/widget/next-favorite`

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
      <PageMain className="fh-content">
        <div className="qvh-legal-page fh-container">
          <h1>Desarrolladores</h1>
          <p className="qvh-legal-updated">
            Plataforma v{PRODUCT_VERSION} · API v{PUBLIC_API_VERSION} (ext.{" "}
            {PUBLIC_API_MINOR_VERSION}) · v{PUBLIC_API_V2_VERSION} con ETag
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
                <code>GET /api/v1/feed/week</code> — ventana semanal completa (7
                días Madrid). Incluye <code>scope: &quot;week&quot;</code>.
              </li>
              <li>
                <code>GET /api/v1/feed?categories=...</code> — filtro por
                categorías (v1.1). IDs separados por coma:{" "}
                <code>futbol</code>, <code>formula1</code>, <code>tv-reality</code>, etc.
              </li>
              <li>
                <code>GET /api/v2/feed</code> — feed v{PUBLIC_API_V2_VERSION} con{" "}
                cabecera <code>ETag</code> y respuesta <code>304</code> si envías{" "}
                <code>If-None-Match</code>. Mismos query params que v1.
              </li>
              <li>
                <code>GET /api/v1/search?q=...</code> — búsqueda por texto (mín. 2
                caracteres).
              </li>
              <li>
                <code>GET /api/v1/events/[id]</code> — detalle de un evento por ID.
              </li>
              <li>
                <code>GET /api/health</code> — estado del servicio y versión.
              </li>
              <li>
                <code>GET /api/feed-meta</code> — frescura del feed, conteo de
                eventos y <code>weekCount</code> (ventana semanal). Incluye{" "}
                <code>todayCount</code> (eventos de hoy en Madrid).
              </li>
            </ul>
            <p>
              Límite: {PUBLIC_API_RATE_LIMIT} peticiones/minuto por IP (v1 y v2
              sin clave). Cita <strong>queveohoy.es</strong> al reutilizar los
              datos.
            </p>
            <pre className="qvh-dev-code">
              <code>{`curl "${feedExample}"\ncurl "${weekFeedExample}"\ncurl "${feedMetaExample}"\ncurl "${categoriesExample}"\ncurl -I "${v2FeedExample}"`}</code>
            </pre>
          </section>

          <section>
            <h2>Widget app — próximo favorito</h2>
            <p>
              Apps nativas con sesión Supabase: devuelve el favorito más próximo
              en el tiempo (Madrid). Sin token → <code>401</code>.
            </p>
            <ul>
              <li>
                <code>GET /api/v1/widget/next-favorite</code> — cabecera{" "}
                <code>Authorization: Bearer &lt;access_token&gt;</code>
              </li>
            </ul>
            <pre className="qvh-dev-code">
              <code>{`curl -H "Authorization: Bearer TU_TOKEN" "${widgetFavoriteExample}"`}</code>
            </pre>
          </section>

          <section>
            <h2>API v2 — partners</h2>
            <p>
              Medios y apps con clave acordada: cabecera{" "}
              <code>X-API-Key</code> o <code>Authorization: Bearer</code>.
              Límite {getPartnerRateLimit()} peticiones/minuto por partner.
              Contacto:{" "}
              <Link href="/contacto">/contacto</Link>.
            </p>
            <pre className="qvh-dev-code">
              <code>{`curl -H "X-API-Key: TU_CLAVE" "${v2FeedExample}?limit=20"`}</code>
            </pre>
            <p className="text-sm text-neutral-400">
              Respuesta incluye <code>partner</code>, <code>rateLimit</code>,{" "}
              <code>etag</code> y <code>304</code> con <code>If-None-Match</code>.
              Clave inválida → <code>401</code>.
            </p>
            <p className="text-sm text-neutral-400">
              Webhook Pro: <code>secreto:Etiqueta|https://tu-webhook</code> en{" "}
              <code>PARTNER_API_KEYS</code> — POST firmado HMAC tras cada cron (
              evento <code>feed.updated</code>).
            </p>
          </section>

          <section>
            <h2>Widgets embed</h2>
            <p>
              Incrusta prime time o accesos rápidos a categorías en tu web con
              iframes.
            </p>
            <h3>Qué ver esta noche</h3>
            <pre className="qvh-dev-code">
              <code>{`<iframe
  src="${embedTonight}"
  title="Qué ver esta noche — queveohoy.es"
  width="420"
  height="520"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>`}</code>
            </pre>
            <h3>Categorías (v12)</h3>
            <pre className="qvh-dev-code">
              <code>{`<iframe
  src="${embedCategories}"
  title="Categorías — queveohoy.es"
  width="420"
  height="360"
  loading="lazy"
></iframe>`}</code>
            </pre>
            <p>
              Vista previa:{" "}
              <Link href="/embed/esta-noche" target="_blank" rel="noopener">
                esta noche
              </Link>
              {" · "}
              <Link href="/embed/categorias" target="_blank" rel="noopener">
                categorías
              </Link>
            </p>
          </section>

          <section>
            <h2>Design system — grupos neon (v10+)</h2>
            <p>
              Taxonomía visual para filtros y explorador. Tokens por grupo en{" "}
              <code>app/lib/filter-groups-design.ts</code>.
            </p>
            <ul className="qvh-dev-token-list">
              {MAIN_CATEGORY_GROUPS.map((group) => (
                <li key={group.id}>
                  <span
                    className="qvh-dev-token-swatch"
                    style={{ background: group.accent }}
                    aria-hidden
                  />
                  <strong>{group.title}</strong> — accent{" "}
                  <code>{group.accent}</code>, watermark «{group.watermark}»
                </li>
              ))}
            </ul>
            <p>
              Explorador interactivo:{" "}
              <Link href="/explorar">/explorar</Link>. Deep link de filtros:{" "}
              <code>/?filtros=futbol,tenis</code>. Vista semanal:{" "}
              <code>/?week=1</code> o combinado{" "}
              <code>/?week=1&filtros=futbol</code>.
            </p>
          </section>

          <section>
            <h2>Operaciones y rendimiento</h2>
            <p>
              Gate PSI post-deploy (LCP ≤3 s). Por defecto warning; activar modo
              bloqueante con variable GitHub{" "}
              <code>PERF_GATE_BLOCKING=1</code>.
            </p>
            <p>
              Guía:{" "}
              <a href="https://github.com/aporkour611/queveohoy/blob/main/docs/DEPLOY-PERF-GATE.md">
                docs/DEPLOY-PERF-GATE.md
              </a>
            </p>
          </section>

          <section>
            <h2>Documentación</h2>
            <p>
              Especificación completa en{" "}
              <a href="https://github.com/aporkour611/queveohoy/blob/main/docs/API.md">
                docs/API.md
              </a>
              , roadmaps v11/v12 y{" "}
              <a href="https://github.com/aporkour611/queveohoy/blob/main/docs/ORGANIZACION.md">
                organización del equipo
              </a>
              .
            </p>
          </section>
        </div>
        <SiteFooter />
      </PageMain>
    </div>
  )
}
