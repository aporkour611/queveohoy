"use client";

import type { ComponentProps } from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  consumeHomeFeedWeekIntent,
  HOME_FEED_ACTIVATE_EVENT,
  markHomeFeedWeekIntent,
} from "@/app/lib/home-feed-intent";
import { readWeekViewFromSearch, WEEK_VIEW_PARAM } from "@/app/lib/filter-url";
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
  const [initialWeekView, setInitialWeekView] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (readWeekViewFromSearch(window.location.search)) {
      markHomeFeedWeekIntent()
      setInitialWeekView(true)
      params.delete(WEEK_VIEW_PARAM)
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`
      window.history.replaceState(null, "", next)
    }

    const onActivateFeed = () => {
      if (consumeHomeFeedWeekIntent()) setInitialWeekView(true);
    };

    window.addEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
    return () => window.removeEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
  }, []);

  return (
    <HomeResetProvider>
      <EventDrawerProvider>
        <HomeFeed {...props} initialWeekView={initialWeekView} />
      </EventDrawerProvider>
    </HomeResetProvider>
  );
}
