import {
  HOME_FEED_WEEK_PREFETCH_URL,
  PUBLIC_WEEK_FEED_PREFETCH_URL,
} from "@/app/lib/home-feed-intent"

/** `<link rel="prefetch">` del feed semanal (CDN + navegador). */
export function HomeWeekPrefetchHead() {
  return (
    <>
      <link
        rel="prefetch"
        href={HOME_FEED_WEEK_PREFETCH_URL}
        as="fetch"
        crossOrigin="anonymous"
      />
      <link
        rel="prefetch"
        href={PUBLIC_WEEK_FEED_PREFETCH_URL}
        as="fetch"
        crossOrigin="anonymous"
      />
    </>
  )
}
