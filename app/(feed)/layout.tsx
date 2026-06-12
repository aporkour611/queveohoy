import "../feed-bundle.css"
import { FeedCriticalStyle } from "../components/FeedCriticalStyle"
import { FeedDeferredStyles } from "../components/FeedDeferredStyles"
import { WeekViewUrlBootstrap } from "../components/WeekViewUrlBootstrap"
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
  const ufcEditorial = isUfcWeekEditorialWindow(getMadridTodayKey())

  return (
    <>
      {ufcEditorial ? (
        <link
          rel="preload"
          as="image"
          href={UFC_CASABLANCA_FIGHTER_IMAGES.topuria}
          fetchPriority="high"
        />
      ) : null}
      <WeekViewUrlBootstrap />
      <FeedCriticalStyle />
      <FeedDeferredStyles />
      {children}
    </>
  )
}
