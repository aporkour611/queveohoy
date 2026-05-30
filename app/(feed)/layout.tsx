import "../feed-bundle.css"
import { EventDrawerProvider } from "../components/EventDrawerProvider"
import { FeedCriticalStyle } from "../components/FeedCriticalStyle"

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <EventDrawerProvider>
      <FeedCriticalStyle />
      {children}
    </EventDrawerProvider>
  )
}
