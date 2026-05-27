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
      icon: "/logo-queveohoy.png",
      badge: "/logo-queveohoy.png",
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
