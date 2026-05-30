import type { Metadata } from "next"
import "./embed.css"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="qvh-embed-body">{children}</div>
}
