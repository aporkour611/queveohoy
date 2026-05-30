"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import {
  consumeHomeFeedWeekIntent,
  HOME_FEED_ACTIVATE_EVENT,
  prefetchHomeFeedWeek,
} from "@/app/lib/home-feed-intent";

const HomeFeed = dynamic(
  () => import("./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed> & {
  /** Si true, hidrata en cuanto el hilo principal esté libre (feed vacío / error SSR). */
  eager?: boolean;
};

/** PSI mobile: hidrata solo con interacción (+ red de seguridad). Desktop: ~1,2s. */
const HYDRATION_IDLE_DESKTOP_MS = 1_200;
const HYDRATION_TOUCH_SAFETY_MS = 8_000;
const HYDRATION_EAGER_MS = 150;

function isTouchPreferred(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  return coarse || narrow;
}

/** Hidrata el feed tras interacción o timeout corto; «Semana completa» en shell SSR activa al instante. */
export function HomeFeedGate({ eager = false, ...props }: HomeFeedProps) {
  const [ready, setReady] = useState(false);
  const [initialWeekView, setInitialWeekView] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const activate = (weekView = false) => {
      if (cancelled || ready) return;
      if (weekView) setInitialWeekView(true);
      setReady(true);
    };

    let fallback: number | undefined;
    if (eager) {
      fallback = window.setTimeout(() => activate(false), HYDRATION_EAGER_MS);
    } else if (isTouchPreferred()) {
      fallback = window.setTimeout(
        () => activate(false),
        HYDRATION_TOUCH_SAFETY_MS
      );
    } else {
      fallback = window.setTimeout(() => activate(false), HYDRATION_IDLE_DESKTOP_MS);
    }

    const onInteract = () => activate(false);
    const onActivateFeed = () => activate(consumeHomeFeedWeekIntent());

    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("touchstart", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });
    window.addEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);

    const idleHandle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(
            () => {
              prefetchHomeFeedWeek();
            },
            { timeout: 2_500 }
          )
        : null;
    const idleFallback =
      idleHandle === null ? window.setTimeout(prefetchHomeFeedWeek, 2_500) : null;

    return () => {
      cancelled = true;
      if (fallback !== undefined) window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (idleFallback !== null) {
        window.clearTimeout(idleFallback);
      }
    };
  }, [ready, eager]);

  if (!ready) return null;

  return <HomeFeed {...props} initialWeekView={initialWeekView} />;
}
