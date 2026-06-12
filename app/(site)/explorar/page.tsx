import type { Metadata } from "next"
import Link from "next/link"
import { ExplorarClient } from "@/app/components/ExplorarClient"
import { ExplorarWeekWarm } from "@/app/components/ExplorarWeekWarm"
import { HomeWeekPrefetchDeferred } from "@/app/components/HomeWeekPrefetchDeferred"
import { Logo } from "@/app/components/Logo"
import { SiteFooter } from "@/app/components/SiteFooter"
import { getWeekViewFeedEventsForPage } from "@/app/lib/events-feed-server"
import { pageMetadata } from "@/app/lib/seo"
import "@/app/category-groups.css"
import "@/app/explorar.css"

export const revalidate = 900

export const metadata: Metadata = pageMetadata(
  "/explorar",
  "Explorar categorías — grupos neon",
  "Descubre deportes, motor, e-sports, cine y TV con el panel de grupos neon de queveohoy.es.",
  ["explorar tv", "filtros agenda", "categorías deportes"]
)

export default async function ExplorarPage() {
  const { events } = await getWeekViewFeedEventsForPage()

  return (
    <>
      <HomeWeekPrefetchDeferred />
      <ExplorarWeekWarm />
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
          <ExplorarClient weekEventCount={events.length} />
        </div>
        <SiteFooter />
      </main>
    </div>
    </>
  )
}
