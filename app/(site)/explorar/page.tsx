import type { Metadata } from "next"
import Link from "next/link"
import { ExplorarClient } from "@/app/components/ExplorarClient"
import { Logo } from "@/app/components/Logo"
import { SiteFooter } from "@/app/components/SiteFooter"
import { pageMetadata } from "@/app/lib/seo"
import "@/app/category-groups.css"

export const metadata: Metadata = pageMetadata(
  "/explorar",
  "Explorar categorías — grupos neon",
  "Descubre deportes, motor, e-sports, cine y TV con el panel de grupos neon de queveohoy.es.",
  ["explorar tv", "filtros agenda", "categorías deportes"]
)

export default function ExplorarPage() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <Link href="/" className="fh-btn fh-btn-ghost fh-btn-sm">
            Volver a la agenda
          </Link>
        </div>
      </nav>
      <main id="main-content" className="fh-content">
        <div className="fh-container qvh-explorar-wrap">
          <ExplorarClient />
        </div>
        <SiteFooter />
      </main>
    </div>
  )
}
