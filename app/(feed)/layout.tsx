import "../feed-bundle.css"
import { FeedCriticalStyle } from "../components/FeedCriticalStyle"
import { FeedDeferredStyles } from "../components/FeedDeferredStyles"

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <FeedCriticalStyle />
      <FeedDeferredStyles />
      {children}
    </>
  )
}
