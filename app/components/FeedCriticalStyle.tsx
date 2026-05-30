import { FEED_CRITICAL_CSS } from "../lib/feed-critical-css"

export function FeedCriticalStyle() {
  return <style dangerouslySetInnerHTML={{ __html: FEED_CRITICAL_CSS }} />
}
