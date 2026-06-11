"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { buildWeekViewHomeUrl } from "@/app/lib/filter-url"
import { markHomeFeedWeekIntent } from "@/app/lib/home-feed-intent"

type Props = {
  children: ReactNode
}

/** CTA hub → home semana con intent en sessionStorage. */
export function HubWeekCtaLink({ children }: Props) {
  return (
    <Link
      href={buildWeekViewHomeUrl()}
      prefetch
      onClick={() => markHomeFeedWeekIntent()}
    >
      {children}
    </Link>
  )
}
