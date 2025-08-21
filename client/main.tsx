import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 🎨 Register Builder.io components (optional - only if Builder.io is available)
import { registerJungleKidNavComponent } from "./lib/builder-io-components";

// Initialize Builder.io component registration (gracefully handles missing dependency)
try {
  registerJungleKidNavComponent();
} catch (error) {
  console.log(
    "ℹ️ Builder.io registration skipped:",
    error?.message || "Unknown error",
  );
}

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root without caching to avoid React context issues
const root = createRoot(rootElement);
root.render(<App />);
