import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {
          scope: "/",
        },
      );

      console.log(
        "[App] Service Worker registered successfully:",
        registration,
      );

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          console.log("[App] New Service Worker found, installing...");

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New content is available, notify user
                console.log("[App] New content available, reloading...");

                // Show update notification (could be enhanced with a toast)
                if (confirm("New version available! Reload to update?")) {
                  newWorker.postMessage({ type: "SKIP_WAITING" });
                  window.location.reload();
                }
              } else {
                // Content is cached for the first time
                console.log("[App] Content cached for offline use");
              }
            }
          });
        }
      });

      // Handle controller change (after update)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log("[App] Service Worker controller changed, reloading...");
        window.location.reload();
      });

      // Register for background sync when online
      if ("sync" in window.ServiceWorkerRegistration.prototype) {
        window.addEventListener("online", () => {
          console.log("[App] Back online, triggering background sync");
          registration.sync.register("jungle-game-sync").catch(console.error);
          registration.sync.register("analytics-sync").catch(console.error);
        });
      }
    } catch (error) {
      console.error("[App] Service Worker registration failed:", error);
    }
  });
} else {
  console.warn("[App] Service Worker not supported in this browser");
}

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root without caching to avoid React context issues
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
