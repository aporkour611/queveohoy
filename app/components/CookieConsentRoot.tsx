"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const CookieConsentBanner = dynamic(
  () =>
    import("./CookieConsentBanner").then((mod) => mod.CookieConsentBanner),
  { ssr: false }
);

export function CookieConsentRoot({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  );
}
