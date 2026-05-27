import { STORAGE_KEY } from "./filter-config";

export const COOKIE_CONSENT_KEY = "qvh-cookie-consent";

export type CookieConsentChoice = "accepted" | "rejected";

export function readCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (value === "accepted" || value === "rejected") return value;
  } catch {}

  return null;
}

export function writeCookieConsent(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {}
}

export function hasPreferenceConsent(): boolean {
  return readCookieConsent() === "accepted";
}

export function clearPreferenceStorage(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export const COOKIE_CONSENT_EVENT = "qvh-cookie-consent-change";

export function notifyCookieConsentChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}
