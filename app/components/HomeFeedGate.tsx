"use client";

import type { ComponentProps } from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  consumeHomeFeedWeekIntent,
  HOME_FEED_ACTIVATE_EVENT,
  markHomeFeedWeekIntent,
} from "@/app/lib/home-feed-intent";
import {
  readWeekViewFromSearch,
  stripWeekViewFromSearch,
} from "@/app/lib/filter-url";
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate";
import { EventDrawerProvider } from "./EventDrawerProvider";
import { HomeResetProvider } from "./HomeResetContext";

const HomeFeed = dynamic(
  () =>
    import(/* webpackPrefetch: false */ "./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false, loading: () => null }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed>;

/** Montado solo tras FeedClientRoots — sin gate duplicado. */
export function HomeFeedGate(props: HomeFeedProps) {
  const deferHeavy = shouldDeferHeavyClient();
  const [initialWeekView, setInitialWeekView] = useState(false);

  useEffect(() => {
    if (deferHeavy) return;
    let weekFromUrl = false

    if (readWeekViewFromSearch(window.location.search)) {
      markHomeFeedWeekIntent()
      weekFromUrl = true
      const remainder = stripWeekViewFromSearch(window.location.search)
      const next = `${window.location.pathname}${remainder ? `?${remainder}` : ""}${window.location.hash}`
      window.history.replaceState(null, "", next)
    }

    const onActivateFeed = () => {
      if (consumeHomeFeedWeekIntent()) setInitialWeekView(true)
    }

    window.addEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed)

    if (weekFromUrl) {
      queueMicrotask(onActivateFeed)
    }

    return () => window.removeEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
  }, [deferHeavy]);

  if (deferHeavy) return null;

  return (
    <HomeResetProvider>
      <EventDrawerProvider>
        <HomeFeed {...props} initialWeekView={initialWeekView} />
      </EventDrawerProvider>
    </HomeResetProvider>
  );
}
