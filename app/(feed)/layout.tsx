import "../feed-bundle.css"
import { FeedCriticalStyle } from "../components/FeedCriticalStyle"

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <FeedCriticalStyle />
      {children}
    </>
  )
}
