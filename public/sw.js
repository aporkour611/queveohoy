const CACHE = "qvh-shell-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icons/app-icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") {
        const fallback = await caches.match("/");
        if (fallback) return fallback;
      }
      throw new Error("offline");
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {
    title: "Qué veo hoy",
    body: "Tienes un evento destacado pronto.",
    url: "/",
    tag: "qvh-event",
  };

  try {
    payload = { ...payload, ...(event.data?.json() ?? {}) };
  } catch {}

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/app-icon-192.png",
      badge: "/icons/app-icon-192.png",
      tag: payload.tag,
      data: { url: payload.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.openWindow(new URL(target, self.location.origin).href)
  );
});
