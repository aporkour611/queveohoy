"use client"

import type { ComponentProps } from "react"
import { FeedHydrationGate } from "./FeedHydrationGate"
import { FilterCssIntentBridge } from "./FilterCssIntentBridge"
import { FeedDeferredStyles } from "./FeedDeferredStyles"
import { HomeWeekPrefetchDeferred } from "./HomeWeekPrefetchDeferred"

type Props = {
  hydration: ComponentProps<typeof FeedHydrationGate>
}

/** Capa cliente fuera del chunk de page.js (evita 3794 en `<head>`). */
export function HomeFeedClientLayer({ hydration }: Props) {
  return (
    <>
      <HomeWeekPrefetchDeferred />
      <FilterCssIntentBridge />
      <FeedHydrationGate {...hydration} />
      <FeedDeferredStyles />
    </>
  )
}
