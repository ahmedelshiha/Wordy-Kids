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
const DYNAMIC_CACHE = "jungle-word-library-dynamic-v2";
const SOUNDS_CACHE = "jungle-sounds-v1";
const GAME_STATE_CACHE = "jungle-game-state-v1";

// Install event - cache static assets and jungle sounds
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install event");

  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log("[ServiceWorker] Caching static assets");
        return cache.addAll(
          STATIC_ASSETS.map((url) => new Request(url, { cache: "reload" })),
        );
      }),

      // Cache jungle sounds for offline play
      caches
        .open(SOUNDS_CACHE)
        .then((cache) => {
          console.log("[ServiceWorker] Caching jungle sounds");
          return cache.addAll(
            JUNGLE_SOUNDS.map((url) => new Request(url, { cache: "reload" })),
          );
        })
        .catch((error) => {
          console.warn(
            "[ServiceWorker] Some jungle sounds could not be cached:",
            error,
          );
          // Don't fail the entire install if some sounds are missing
        }),
    ])
      .then(() => {
        console.log("[ServiceWorker] All assets cached successfully");
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error("[ServiceWorker] Error during installation:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate event");

  const currentCaches = [
    CACHE_NAME,
    DYNAMIC_CACHE,
    SOUNDS_CACHE,
    GAME_STATE_CACHE,
  ];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
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
  if (isJungleSound(request.url)) {
    // Cache-first strategy for jungle sounds (critical for offline play)
    event.respondWith(cacheFirstSounds(request));
  } else if (isStaticAsset(request.url)) {
    // Cache-first strategy for static assets
    event.respondWith(cacheFirst(request));
  } else if (isGameStateRequest(request.url)) {
    // Special handling for game state (always try cache first for performance)
    event.respondWith(gameStateCacheFirst(request));
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

// Cache-first strategy for jungle sounds
async function cacheFirstSounds(request) {
  try {
    const cachedResponse = await caches.match(request, {
      cacheName: SOUNDS_CACHE,
    });
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(SOUNDS_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Sound cache error:", error);
    // Return a silent audio response as fallback
    return new Response(new ArrayBuffer(0), {
      status: 200,
      headers: { "Content-Type": "audio/mpeg" },
    });
  }
}

// Game state cache-first strategy
async function gameStateCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request, {
      cacheName: GAME_STATE_CACHE,
    });
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(GAME_STATE_CACHE);
      await cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Game state cache error:", error);
    // Return empty game state as fallback
    return new Response(
      JSON.stringify({ error: "Offline game state unavailable" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

// Helper functions
function isJungleSound(url) {
  return (
    url.includes("/sounds/") &&
    (url.includes(".mp3") || url.includes(".wav") || url.includes(".ogg"))
  );
}

function isGameStateRequest(url) {
  return (
    url.includes("jungle_word_library_game_state") ||
    url.includes("jungle_analytics") ||
    url.includes("/api/game-state") ||
    url.includes("/api/progress")
  );
}

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
    event.waitUntil(processOfflineQueue());
  } else if (event.tag === "jungle-game-sync") {
    event.waitUntil(syncJungleGameData());
  } else if (event.tag === "analytics-sync") {
    event.waitUntil(syncAnalyticsData());
  }
});

// Process offline queue for jungle library actions
async function processOfflineQueue() {
  console.log("[ServiceWorker] Processing offline queue");

  try {
    // Sync any queued game progress
    await syncJungleGameData();

    // Sync any queued analytics events
    await syncAnalyticsData();

    console.log("[ServiceWorker] Offline queue processed successfully");
  } catch (error) {
    console.error("[ServiceWorker] Error processing offline queue:", error);
  }
}

// Sync jungle game data when back online
async function syncJungleGameData() {
  console.log("[ServiceWorker] Syncing jungle game data");

  try {
    // Get offline game state from localStorage
    const gameState = await getStoredGameState();

    if (gameState && gameState.needsSync) {
      // Attempt to sync with server
      const response = await fetch("/api/sync-game-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gameState),
      });

      if (response.ok) {
        console.log("[ServiceWorker] Game state synced successfully");
        // Mark as synced in local storage
        await markGameStateSynced();
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Error syncing game data:", error);
  }
}

// Sync analytics data when back online
async function syncAnalyticsData() {
  console.log("[ServiceWorker] Syncing analytics data");

  try {
    // Get offline analytics events
    const analyticsEvents = await getStoredAnalyticsEvents();

    if (analyticsEvents && analyticsEvents.length > 0) {
      // Attempt to sync with analytics service
      const response = await fetch("/api/sync-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: analyticsEvents }),
      });

      if (response.ok) {
        console.log("[ServiceWorker] Analytics synced successfully");
        // Clear synced events from local storage
        await clearSyncedAnalytics();
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Error syncing analytics:", error);
  }
}

// Helper functions for offline data management
async function getStoredGameState() {
  // This would integrate with the actual localStorage structure
  // For now, return a placeholder
  return null;
}

async function markGameStateSynced() {
  // Mark game state as synced in localStorage
  console.log("[ServiceWorker] Marking game state as synced");
}

async function getStoredAnalyticsEvents() {
  // Get analytics events that need syncing
  return [];
}

async function clearSyncedAnalytics() {
  // Clear synced analytics events
  console.log("[ServiceWorker] Clearing synced analytics");
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
