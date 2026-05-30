import type { ReactNode } from "react"

type PageMainProps = {
  children: ReactNode
  className?: string
}

/** Landmark principal con id fijo para skip link (WCAG 2.4.1). */
export function PageMain({ children, className }: PageMainProps) {
  return (
    <main id="main-content" className={className}>
      {children}
    </main>
  )
}
