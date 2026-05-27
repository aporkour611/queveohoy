import { siteUrl } from "./seo";

function firstNonEmpty(...values: Array<string | undefined>) {
  for (const raw of values) {
    const value = raw?.trim();
    if (value) return value;
  }
  return null;
}

export function getVapidPublicKey(): string | null {
  return firstNonEmpty(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PUBLIC_KEY
  );
}

export function getVapidPrivateKey(): string | null {
  return firstNonEmpty(process.env.VAPID_PRIVATE_KEY);
}

export function getVapidSubject(): string {
  return (
    firstNonEmpty(process.env.VAPID_SUBJECT) ??
    `mailto:hola@${new URL(siteUrl).hostname}`
  );
}

export function isPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && getVapidPrivateKey());
}
