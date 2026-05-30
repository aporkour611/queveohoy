import type { Metadata } from "next"
import Link from "next/link"
import { AssistantPanel } from "../../components/AssistantPanel"
import { Logo } from "../../components/Logo"
import { SiteFooter } from "../../components/SiteFooter"
import { pageMetadata } from "../../lib/seo"

export const metadata: Metadata = pageMetadata(
  "/asistente",
  "Asistente ¿Qué veo? — queveohoy.es",
  "Pregunta qué ver esta noche en TV, streaming y deportes. Recomendaciones con datos reales de la agenda española.",
  ["asistente tv", "qué veo hoy", "recomendaciones streaming"]
)

export default function AsistentePage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <Link href="/" className="fh-nav-link">
            Volver a la agenda
          </Link>
        </div>
      </nav>
      <main id="main-content" className="fh-content">
        <div className="fh-container qvh-assistant-page">
          <AssistantPanel />
        </div>
        <SiteFooter />
      </main>
    </div>
  )
}
