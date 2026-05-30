"use client";

import dynamic from "next/dynamic";
import type { EventRow } from "./types";

const HomeFeedGate = dynamic(
  () => import("./HomeFeedGate").then((mod) => mod.HomeFeedGate),
  { ssr: false, loading: () => null }
);

const FeedFreshnessSlot = dynamic(
  () => import("./FeedFreshnessSlot").then((mod) => mod.FeedFreshnessSlot),
  { ssr: false, loading: () => null }
);

const TonightForYouPersonalizer = dynamic(
  () =>
    import("./TonightForYouPersonalizer").then(
      (mod) => mod.TonightForYouPersonalizer
    ),
  { ssr: false, loading: () => null }
);

const DestacadosEnhancerSlot = dynamic(
  () =>
    import("./DestacadosEnhancerSlot").then((mod) => mod.DestacadosEnhancerSlot),
  { ssr: false, loading: () => null }
);

type DestacadosRowProps = {
  title: string;
  subtitle: string;
  items: EventRow[];
  ariaLabel: string;
  className?: string;
};

export type FeedClientRootsProps = {
  initialEvents: EventRow[];
  initialDestacadosEvents: EventRow[];
  initialError: string | null;
  serverDayHeaderDate: string | null;
  initialEventCount: number;
  tonightEvents: EventRow[];
  todayKey: string;
  destacadosEnhancer: DestacadosRowProps | null;
};

/** Carga pesada — solo tras import() desde FeedHydrationBootstrap. */
export function FeedClientRootsInner({
  initialEvents,
  initialDestacadosEvents,
  initialError,
  serverDayHeaderDate,
  initialEventCount,
  tonightEvents,
  todayKey,
  destacadosEnhancer,
}: FeedClientRootsProps) {
  return (
    <>
      {destacadosEnhancer ? <DestacadosEnhancerSlot {...destacadosEnhancer} /> : null}
      <TonightForYouPersonalizer events={tonightEvents} todayKey={todayKey} />
      <FeedFreshnessSlot initialEventCount={initialEventCount} />
      <HomeFeedGate
        initialEvents={initialEvents}
        initialDestacadosEvents={initialDestacadosEvents}
        initialError={initialError}
        serverDayHeaderDate={serverDayHeaderDate}
      />
    </>
  );
}
