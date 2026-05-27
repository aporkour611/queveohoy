export const PUSH_CONSENT_KEY = "qvh-push-consent";
export const PUSH_TOPICS_KEY = "qvh-push-topics";
export const PUSH_ENDPOINT_KEY = "qvh-push-endpoint";

export type PushConsentChoice = "subscribed" | "dismissed";

export const PUSH_CONSENT_EVENT = "qvh-push-consent-change";

export function readPushConsent(): PushConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const value = localStorage.getItem(PUSH_CONSENT_KEY);
    if (value === "subscribed" || value === "dismissed") return value;
  } catch {}

  return null;
}

export function writePushConsent(choice: PushConsentChoice): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PUSH_CONSENT_KEY, choice);
  } catch {}
}

export function notifyPushConsentChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PUSH_CONSENT_EVENT));
}

export function readStoredPushEndpoint(): string | null {
  if (typeof window === "undefined") return null;

  try {
    return localStorage.getItem(PUSH_ENDPOINT_KEY);
  } catch {}

  return null;
}

export function writeStoredPushEndpoint(endpoint: string | null): void {
  if (typeof window === "undefined") return;

  try {
    if (endpoint) localStorage.setItem(PUSH_ENDPOINT_KEY, endpoint);
    else localStorage.removeItem(PUSH_ENDPOINT_KEY);
  } catch {}
}

export function clearPushLocalState(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(PUSH_CONSENT_KEY);
    localStorage.removeItem(PUSH_TOPICS_KEY);
    localStorage.removeItem(PUSH_ENDPOINT_KEY);
  } catch {}
}
