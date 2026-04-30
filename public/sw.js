// Service Worker for Web Push notifications (Android fallback)
// Declarative Web Push (iOS Safari 18.4+) handles notifications natively via the manifest.
// This service worker handles the legacy push event for Chrome/Android.

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let title;
  let options = {};
  let defaultActionUrl = "/";
  // Map from action name to action URL for notificationclick handling
  const actionUrls = {};

  // Try to parse as application/notification+json (Declarative Web Push format)
  try {
    const payload = event.data.json();
    title = payload.title;
    defaultActionUrl = payload.default_action_url || "/";

    // Build action URL map from the payload actions
    if (payload.options?.actions) {
      for (const action of payload.options.actions) {
        if (action.action && action.url) {
          actionUrls[action.action] = action.url;
        }
      }
    }

    options = {
      body: payload.options?.body,
      icon: payload.options?.icon || "/img/icon-192.png",
      badge: payload.options?.badge || "/img/icon-192.png",
      data: {
        ...(payload.options?.data || {}),
        defaultActionUrl,
        actionUrls,
      },
      actions: payload.options?.actions,
      tag: payload.options?.tag,
      requireInteraction: payload.options?.requireInteraction,
    };
  } catch {
    // Fallback: treat as plain text
    title = event.data.text();
  }

  if (!title) return;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const defaultActionUrl =
    event.notification.data?.defaultActionUrl || "/";
  const actionUrls = event.notification.data?.actionUrls || {};
  const actionUrl = event.action
    ? actionUrls[event.action] || defaultActionUrl
    : defaultActionUrl;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url === actionUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});

