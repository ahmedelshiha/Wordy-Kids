import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Create the root only once
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Check if root has already been created
let root: any = (rootElement as any)._reactRoot;
if (!root) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
}

root.render(<App />);
