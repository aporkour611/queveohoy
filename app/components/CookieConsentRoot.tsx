"use client";

import { CookieConsentPrompts } from "./CookieConsentPrompts";

/** @deprecated Usar `{children}` + `<CookieConsentPrompts />` */
export function CookieConsentRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CookieConsentPrompts />
    </>
  );
}
