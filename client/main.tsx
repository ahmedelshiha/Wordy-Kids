import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// 🎨 Register Builder.io components
import { registerJungleKidNavComponent } from "./lib/builder-io-components";

// Initialize Builder.io component registration
registerJungleKidNavComponent();

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root without caching to avoid React context issues
const root = createRoot(rootElement);
root.render(<App />);
