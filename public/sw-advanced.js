// Advanced Service Worker for Wordy Kids
// Provides offline functionality, intelligent caching, and background sync

const CACHE_NAME = "wordy-kids-v3.0.0";
const CACHE_VERSION = "3.0.0";

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
  // Core app shell - cache first, update in background
  APP_SHELL: "cache-first",
  // Static assets - cache first with long TTL
  STATIC_ASSETS: "cache-first",
  // API responses - network first with cache fallback
  API_DATA: "network-first",
  // Audio files - cache first with streaming support
  AUDIO_FILES: "cache-first",
  // Images - cache with WebP optimization
  IMAGES: "cache-first",
};

// Cache configuration
const CACHE_CONFIG = {
  maxAge: {
    appShell: 7 * 24 * 60 * 60 * 1000, // 7 days
    staticAssets: 30 * 24 * 60 * 60 * 1000, // 30 days
    apiData: 60 * 60 * 1000, // 1 hour
    audioFiles: 7 * 24 * 60 * 60 * 1000, // 7 days
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  maxEntries: {
    appShell: 50,
    staticAssets: 200,
    apiData: 100,
    audioFiles: 100,
    images: 150,
  },
};

// Define what to cache
const CACHE_PATTERNS = {
  appShell: [
    "/",
    "/app",
    "/login",
    "/signup",
    "/static/js/bundle.js",
    "/static/css/main.css",
    "/manifest.json",
  ],
  staticAssets: [
    /\/static\/.+/,
    /\.(?:js|css|html|json)$/,
    /\/images\/.+/,
    /\/textures\/.+/,
  ],
  apiData: [/\/api\/.+/],
  audioFiles: [
    /\/sounds\/.+\.mp3$/,
    /\/sounds\/.+\.wav$/,
    /\/sounds\/.+\.ogg$/,
  ],
  images: [/\.(png|jpg|jpeg|gif|webp|svg)$/, /\/images\/.+/],
};

// Background sync queue for offline actions
let syncQueue = [];

// Install event - cache core resources
self.addEventListener("install", (event) => {
  console.log("SW: Installing service worker");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Cache core app shell
        await cache.addAll(CACHE_PATTERNS.appShell);

        // Preload critical audio files
        const criticalAudio = [
          "/sounds/cat.mp3",
          "/sounds/dog.mp3",
          "/sounds/elephant.mp3",
          "/sounds/lion.mp3",
        ];

        await Promise.allSettled(
          criticalAudio.map((url) =>
            fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((err) => console.warn("Failed to cache audio:", url, err)),
          ),
        );

        console.log("SW: Core resources cached successfully");

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error("SW: Installation failed:", error);
      }
    })(),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating service worker");

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(
              (name) => name !== CACHE_NAME && name.startsWith("wordy-kids-"),
            )
            .map((name) => {
              console.log("SW: Deleting old cache:", name);
              return caches.delete(name);
            }),
        );

        // Claim all clients
        await self.clients.claim();

        console.log("SW: Activation complete");
      } catch (error) {
        console.error("SW: Activation failed:", error);
      }
    })(),
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests for caching
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith("http")) {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Main request handler with intelligent caching
async function handleRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    // Determine cache strategy based on request type
    if (matchesPattern(pathname, CACHE_PATTERNS.audioFiles)) {
      return await handleAudioRequest(request);
    }

    if (matchesPattern(pathname, CACHE_PATTERNS.images)) {
      return await handleImageRequest(request);
    }

    if (matchesPattern(pathname, CACHE_PATTERNS.apiData)) {
      return await handleApiRequest(request);
    }

    if (
      matchesPattern(pathname, CACHE_PATTERNS.staticAssets) ||
      CACHE_PATTERNS.appShell.includes(pathname)
    ) {
      return await handleStaticRequest(request);
    }

    // Default: network with cache fallback
    return await networkWithCacheFallback(request);
  } catch (error) {
    console.error("SW: Request handling failed:", error);
    return await getOfflineFallback(request);
  }
}

// Audio request handler with streaming support
async function handleAudioRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cached audio is still valid
    const cacheTime = getCacheTimestamp(cachedResponse);
    if (Date.now() - cacheTime < CACHE_CONFIG.maxAge.audioFiles) {
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache the audio file
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      return networkResponse;
    }
  } catch (error) {
    console.warn("SW: Network request failed for audio:", request.url);
  }

  // Return cached version if available
  if (cachedResponse) {
    return cachedResponse;
  }

  throw new Error("Audio not available offline");
}

// Image request handler with WebP optimization
async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // Check if browser supports WebP and try to fetch WebP version
    const acceptsWebP = request.headers.get("Accept")?.includes("image/webp");
    let imageRequest = request;

    if (acceptsWebP && !request.url.includes(".webp")) {
      const webpUrl = request.url.replace(/\.(jpg|jpeg|png)$/, ".webp");
      try {
        const webpResponse = await fetch(webpUrl);
        if (webpResponse.ok) {
          await cache.put(request, webpResponse.clone());
          return webpResponse;
        }
      } catch (webpError) {
        // Fallback to original format
      }
    }

    const networkResponse = await fetch(imageRequest);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.warn("SW: Network request failed for image:", request.url);
  }

  if (cachedResponse) {
    return cachedResponse;
  }

  // Return placeholder image for offline state
  return new Response(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="14" fill="#999">Image unavailable offline</text></svg>',
    {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "no-cache",
      },
    },
  );
}

// API request handler with intelligent caching
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request, {
      timeout: 5000, // 5 second timeout
    });

    if (networkResponse.ok) {
      // Cache successful API responses
      const responseClone = networkResponse.clone();
      await cache.put(request, responseClone);
      return networkResponse;
    }
  } catch (error) {
    console.warn("SW: API request failed:", request.url, error);
  }

  // Fallback to cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Add offline header
    const response = cachedResponse.clone();
    response.headers.set("X-Served-By", "sw-cache");
    return response;
  }

  // Return offline API response
  return new Response(
    JSON.stringify({
      error: "Offline",
      message: "This request is not available offline",
      offline: true,
    }),
    {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "X-Served-By": "sw-offline",
      },
    },
  );
}

// Static assets handler
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    updateCacheInBackground(request, cache);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.warn("SW: Static request failed:", request.url);
  }

  throw new Error("Static asset not available");
}

// Network with cache fallback
async function networkWithCacheFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.warn("SW: Network request failed:", request.url);
  }

  // Try cache fallback
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  return await getOfflineFallback(request);
}

// Background cache updates
async function updateCacheInBackground(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse);
    }
  } catch (error) {
    // Ignore background update failures
  }
}

// Offline fallback responses
async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // HTML pages - return offline page
  if (request.headers.get("Accept")?.includes("text/html")) {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match("/offline.html");
    return (
      offlinePage ||
      new Response(
        `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Wordy Kids</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8f9fa; }
            .offline-container { max-width: 400px; margin: 0 auto; }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 10px; }
            p { color: #666; margin-bottom: 30px; }
            button { background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">🌐</div>
            <h1>You're offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
        {
          headers: { "Content-Type": "text/html" },
        },
      )
    );
  }

  // Return 503 for other requests
  return new Response("Service Unavailable", {
    status: 503,
    statusText: "Service Unavailable",
  });
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(processSyncQueue());
  }
});

// Process queued actions when back online
async function processSyncQueue() {
  console.log("SW: Processing sync queue");

  while (syncQueue.length > 0) {
    const action = syncQueue.shift();

    try {
      await processAction(action);
      console.log("SW: Sync action completed:", action.type);
    } catch (error) {
      console.error("SW: Sync action failed:", action.type, error);
      // Re-queue failed actions
      syncQueue.push(action);
      break;
    }
  }
}

// Process individual sync actions
async function processAction(action) {
  switch (action.type) {
    case "word-progress":
      return await syncWordProgress(action.data);
    case "user-settings":
      return await syncUserSettings(action.data);
    case "achievement-unlock":
      return await syncAchievementUnlock(action.data);
    default:
      console.warn("SW: Unknown sync action type:", action.type);
  }
}

// Specific sync handlers
async function syncWordProgress(data) {
  const response = await fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to sync word progress");
  }
}

async function syncUserSettings(data) {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to sync user settings");
  }
}

async function syncAchievementUnlock(data) {
  const response = await fetch("/api/achievements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to sync achievement unlock");
  }
}

// Message handling for communication with main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "QUEUE_SYNC_ACTION":
      syncQueue.push(data);
      // Register for background sync
      self.registration.sync
        .register("background-sync")
        .catch((err) =>
          console.warn("SW: Background sync registration failed:", err),
        );
      break;

    case "GET_CACHE_STATUS":
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({ type: "CACHE_STATUS", data: status });
      });
      break;

    case "CLEAR_CACHE":
      clearAppCache().then(() => {
        event.ports[0].postMessage({ type: "CACHE_CLEARED" });
      });
      break;

    case "PRELOAD_RESOURCES":
      preloadResources(data.resources).then(() => {
        event.ports[0].postMessage({ type: "RESOURCES_PRELOADED" });
      });
      break;
  }
});

// Cache management utilities
async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();

  const status = {
    cacheSize: keys.length,
    cacheVersion: CACHE_VERSION,
    lastUpdated: Date.now(),
    offlineReady: keys.some((key) =>
      CACHE_PATTERNS.appShell.includes(new URL(key.url).pathname),
    ),
  };

  return status;
}

async function clearAppCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter((name) => name.startsWith("wordy-kids-"))
      .map((name) => caches.delete(name)),
  );
}

async function preloadResources(resources) {
  const cache = await caches.open(CACHE_NAME);

  await Promise.allSettled(
    resources.map(async (resource) => {
      try {
        const response = await fetch(resource);
        if (response.ok) {
          await cache.put(resource, response);
        }
      } catch (error) {
        console.warn("SW: Failed to preload resource:", resource, error);
      }
    }),
  );
}

// Helper functions
function matchesPattern(pathname, patterns) {
  if (Array.isArray(patterns)) {
    return patterns.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(pathname);
      }
      return pathname === pattern;
    });
  }

  if (patterns instanceof RegExp) {
    return patterns.test(pathname);
  }

  return pathname === patterns;
}

function getCacheTimestamp(response) {
  const dateHeader = response.headers.get("date");
  return dateHeader ? new Date(dateHeader).getTime() : 0;
}

console.log("SW: Advanced service worker loaded");
