// Jungle Word Library Service Worker
const CACHE_NAME = "jungle-word-library-v2";
const CACHE_VERSION = "2.0.0";

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  "/",
  "/app",
  "/jungle-library",
  "/parent-dashboard",
  "/manifest.json",
  "/favicon.svg",
  "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F6a9f823070a947fe81ec12398fd564c5?format=webp&width=192",
  "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F895928ec13444b41a48325b8bfd8cec2?format=webp&width=512",
];

// Jungle sounds to cache for offline play
const JUNGLE_SOUNDS = [
  "/sounds/jungle-birds.mp3",
  "/sounds/jungle-insects.mp3",
  "/sounds/jungle-rain.mp3",
  "/sounds/jungle-waterfall.mp3",
  "/sounds/jungle-wind.mp3",
  "/sounds/ui/settings-saved.mp3",
  "/sounds/ui/voice-preview.mp3",
  "/sounds/ui/settings-reset.mp3",
  "/sounds/mockingbird.mp3",
  "/sounds/rooster.mp3",
  "/sounds/owl.mp3",
  "/sounds/cricket.mp3",
];

// Network-first cache strategy for dynamic content
const DYNAMIC_CACHE = "wordy-kids-dynamic-v1";

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install event");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching static assets");
        return cache.addAll(
          STATIC_ASSETS.map((url) => new Request(url, { cache: "reload" })),
        );
      })
      .then(() => {
        console.log("[ServiceWorker] Static assets cached successfully");
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error("[ServiceWorker] Error caching static assets:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate event");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        console.log("[ServiceWorker] Cache cleanup complete");
        return self.clients.claim(); // Take control of all clients
      }),
  );
});

// Fetch event - implement caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests except for our CDN assets
  if (
    url.origin !== location.origin &&
    !url.hostname.includes("cdn.builder.io")
  ) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // Network-first strategy for API requests
    event.respondWith(networkFirst(request));
  } else {
    // Stale-while-revalidate for other requests
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Cache-first strategy
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Cache-first error:", error);
    return new Response("Offline content not available", { status: 503 });
  }
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[ServiceWorker] Network failed, trying cache:", error);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ error: "Network unavailable" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
  return (
    STATIC_ASSETS.some((asset) => url.includes(asset)) ||
    url.includes(".svg") ||
    url.includes(".png") ||
    url.includes(".jpg") ||
    url.includes(".webp") ||
    url.includes(".css") ||
    url.includes(".js") ||
    url.includes("cdn.builder.io")
  );
}

function isAPIRequest(url) {
  return url.includes("/api/") || url.includes("/api") || url.includes(".json");
}

// Handle background sync (for offline form submissions)
self.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync event:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle any queued offline actions
      processOfflineQueue(),
    );
  }
});

// Process offline queue (placeholder for future implementation)
async function processOfflineQueue() {
  console.log("[ServiceWorker] Processing offline queue");
  // Implementation for handling offline user actions
}

// Handle push notifications (placeholder for future implementation)
self.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push event received");

  const options = {
    body: event.data ? event.data.text() : "New content available!",
    icon: "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F6a9f823070a947fe81ec12398fd564c5?format=webp&width=192",
    badge:
      "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F6a9f823070a947fe81ec12398fd564c5?format=webp&width=96",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Explore",
        icon: "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F6a9f823070a947fe81ec12398fd564c5?format=webp&width=64",
      },
      {
        action: "close",
        title: "Close",
        icon: "https://cdn.builder.io/api/v1/image/assets%2Fbebe97bf37d04293b70e6f9372d99db4%2F6a9f823070a947fe81ec12398fd564c5?format=webp&width=64",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification("Wordy Kids", options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click received");

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"));
  }
});

// Log service worker updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("[ServiceWorker] Service Worker script loaded successfully");
