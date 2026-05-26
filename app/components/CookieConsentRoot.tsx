"use client";

import type { ReactNode } from "react";
import { CookieConsentBanner } from "./CookieConsentBanner";

export function CookieConsentRoot({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentBanner />
    </>
  );
}
