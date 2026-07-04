import "../feed-bundle.css"
import { FeedCriticalStyle } from "../components/FeedCriticalStyle"
import { LayoutClientShell } from "../components/LayoutClientShell"
import { HomeLcpPreload } from "../components/HomeLcpPreload"
import { WeekViewUrlBootstrap } from "../components/WeekViewUrlBootstrap"
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp"
import { getMadridTodayKey } from "../lib/seo-date"
import {
  isUfcWeekEditorialWindow,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "../lib/ufc-week"

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const todayKey = getMadridTodayKey()
  const ufcEditorial = isUfcWeekEditorialWindow(todayKey)
  const lcpEntries = ufcEditorial
    ? []
    : resolveHomeLcpPreloadEntries([], todayKey)

  return (
    <>
      {ufcEditorial ? (
        <link
          rel="preload"
          as="image"
          href={UFC_CASABLANCA_FIGHTER_IMAGES.topuria}
          fetchPriority="high"
        />
      ) : (
        <HomeLcpPreload entries={lcpEntries} />
      )}
      <WeekViewUrlBootstrap />
      <FeedCriticalStyle />
      {children}
      <LayoutClientShell />
    </>
  )
}
