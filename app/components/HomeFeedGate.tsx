"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import {
  consumeHomeFeedWeekIntent,
  dispatchHomeFeedActivate,
  HOME_FEED_ACTIVATE_EVENT,
  markHomeFeedWeekIntent,
  prefetchHomeFeedWeek,
} from "@/app/lib/home-feed-intent";
import { subscribeInteractionGate } from "@/app/lib/interaction-gate";
import { EventDrawerProvider } from "./EventDrawerProvider";
import { HomeResetProvider } from "./HomeResetContext";

const HomeFeed = dynamic(
  () =>
    import(/* webpackPrefetch: false */ "./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false, loading: () => null }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed> & {
  /** Si true, hidrata en cuanto el hilo principal esté libre (feed vacío / error SSR). */
  eager?: boolean;
};

/** Hidrata el feed solo con interacción (mobile) o idle corto (desktop). Sin scroll — PSI lo dispara. */
export function HomeFeedGate({ eager = false, ...props }: HomeFeedProps) {
  const [ready, setReady] = useState(false);
  const [initialWeekView, setInitialWeekView] = useState(false);

  useEffect(() => {
    if (ready) return;

    const activate = (weekView = false) => {
      if (weekView) setInitialWeekView(true);
      setReady(true);
    };

    const onActivateFeed = () => activate(consumeHomeFeedWeekIntent());

    const handleWeekIntent = () => {
      markHomeFeedWeekIntent();
      prefetchHomeFeedWeek();
      dispatchHomeFeedActivate();
    };

    const shell = document.getElementById("feed-controls-ssr");
    const handleShellPointer = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-qvh-week-view]")) return;
      event.preventDefault();
      handleWeekIntent();
    };

    shell?.addEventListener("click", handleShellPointer);
    shell?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handleShellPointer(event);
    });

    window.addEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);

    const cleanupGate = subscribeInteractionGate({
      eager,
      desktopIdleMs: 1_200,
      onActivate: () => activate(false),
    });

    return () => {
      cleanupGate();
      window.removeEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
      shell?.removeEventListener("click", handleShellPointer);
    };
  }, [ready, eager]);

  if (!ready) return null;

  return (
    <HomeResetProvider>
      <EventDrawerProvider>
        <HomeFeed {...props} initialWeekView={initialWeekView} />
      </EventDrawerProvider>
    </HomeResetProvider>
  );
}
