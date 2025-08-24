import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.simple";

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root with React 18 best practices
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
