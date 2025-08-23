import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// CRITICAL: Import Builder.io registry at startup
import "./lib/builder-registry";

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root without caching to avoid React context issues
const root = createRoot(rootElement);
root.render(<App />);
