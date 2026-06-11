import {
  DEFAULT_PUSH_TOPICS,
  normalizePushTopics,
  type PushTopicId,
} from "./push-preferences";
import {
  notifyPushConsentChange,
  PUSH_TOPICS_KEY,
  readStoredPushEndpoint,
  writePushConsent,
  writeStoredPushEndpoint,
} from "./push-consent";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function readLocalPushTopics(): PushTopicId[] {
  if (typeof window === "undefined") return [...DEFAULT_PUSH_TOPICS];

  try {
    const raw = localStorage.getItem(PUSH_TOPICS_KEY);
    if (!raw) return [...DEFAULT_PUSH_TOPICS];
    return normalizePushTopics(JSON.parse(raw));
  } catch {
    return [...DEFAULT_PUSH_TOPICS];
  }
}

export function writeLocalPushTopics(topics: PushTopicId[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PUSH_TOPICS_KEY, JSON.stringify(topics));
  } catch {}
}

async function fetchVapidPublicKey(): Promise<string | null> {
  const res = await fetch("/api/push/vapid", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    configured?: boolean;
    publicKey?: string | null;
  };
  return data.configured && data.publicKey ? data.publicKey : null;
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });

  await navigator.serviceWorker.ready;
  return registration;
}

export const PUSH_FAVORITES_ONLY_KEY = "qvh-push-favorites-only";

export function readLocalPushFavoritesOnly(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(PUSH_FAVORITES_ONLY_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeLocalPushFavoritesOnly(enabled: boolean): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(PUSH_FAVORITES_ONLY_KEY, enabled ? "1" : "0");
  } catch {}
}

async function buildSubscribeBody(
  endpoint: string,
  keys: { p256dh: string; auth: string },
  topics: PushTopicId[],
  options?: { userId?: string | null; favoritesOnly?: boolean }
): Promise<Record<string, unknown>> {
  const favoritesOnly =
    options?.favoritesOnly ?? readLocalPushFavoritesOnly();

  const body: Record<string, unknown> = {
    endpoint,
    keys,
    topics,
    userAgent: navigator.userAgent,
    favoritesOnly,
  };

  if (options?.userId) {
    body.userId = options.userId;
  }

  return body;
}

export async function subscribeToPush(
  topics: PushTopicId[] = readLocalPushTopics(),
  options?: { userId?: string | null; favoritesOnly?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { ok: false, error: "Tu navegador no admite notificaciones push" };
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { ok: false, error: "Permiso de notificaciones denegado" };
  }

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) {
    return { ok: false, error: "Avisos no disponibles todavía en el servidor" };
  }

  const registration = await registerPushServiceWorker();
  if (!registration) {
    return { ok: false, error: "No se pudo registrar el service worker" };
  }

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));

  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { ok: false, error: "Suscripción push incompleta" };
  }

  const normalizedTopics = normalizePushTopics(topics);
  writeLocalPushTopics(normalizedTopics);

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      await buildSubscribeBody(
        endpoint,
        { p256dh, auth },
        normalizedTopics,
        options
      )
    ),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Error al guardar la suscripción" };
  }

  writeStoredPushEndpoint(endpoint);
  writePushConsent("subscribed");
  notifyPushConsentChange();
  return { ok: true };
}

export async function updatePushTopics(
  topics: PushTopicId[],
  options?: { userId?: string | null; favoritesOnly?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const endpoint = readStoredPushEndpoint();
  if (!endpoint) {
    return subscribeToPush(topics);
  }

  const normalizedTopics = normalizePushTopics(topics);
  writeLocalPushTopics(normalizedTopics);

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      await buildSubscribeBody(
        endpoint,
        await readCurrentPushKeys(),
        normalizedTopics,
        options
      )
    ),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "No se pudieron guardar las preferencias" };
  }

  notifyPushConsentChange();
  return { ok: true };
}

async function readCurrentPushKeys(): Promise<{ p256dh: string; auth: string }> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const json = subscription?.toJSON();
  return {
    p256dh: json?.keys?.p256dh ?? "",
    auth: json?.keys?.auth ?? "",
  };
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const endpoint = subscription?.endpoint ?? readStoredPushEndpoint();

    if (endpoint) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      });
    }

    await subscription?.unsubscribe();
  } catch {}

  writeStoredPushEndpoint(null);
  writePushConsent("dismissed");
  notifyPushConsentChange();
}

export function dismissPushPrompt(): void {
  writePushConsent("dismissed");
  notifyPushConsentChange();
}

export async function isPushSubscribedLocally(): Promise<boolean> {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

export type RemotePushPreferences = {
  configured?: boolean;
  hasSubscription: boolean;
  favoritesOnly: boolean;
  topics: PushTopicId[];
  platforms?: Array<"web" | "expo">;
  updatedAt?: string | null;
};

export async function fetchRemotePushPreferences(): Promise<RemotePushPreferences | null> {
  try {
    const res = await fetch("/api/push/subscribe", {
      credentials: "include",
      cache: "no-store",
    });
    if (res.status === 401) return null;
    if (!res.ok) return null;
    return (await res.json()) as RemotePushPreferences;
  } catch {
    return null;
  }
}

export function applyRemotePushPreferencesLocally(
  prefs: RemotePushPreferences
): void {
  writeLocalPushFavoritesOnly(prefs.favoritesOnly);
  writeLocalPushTopics(prefs.topics);
}
