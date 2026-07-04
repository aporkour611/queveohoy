"use client";

import { LayoutClientShell } from "./LayoutClientShell";

/** @deprecated Usar `{children}` + `<LayoutClientShell />` */
export function CookieConsentRoot({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LayoutClientShell />
    </>
  );
}
