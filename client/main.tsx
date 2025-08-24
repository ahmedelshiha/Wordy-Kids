import React from "react";
import { createRoot } from "react-dom/client";

// Inline simple component for testing
const TestApp = () => {
  return React.createElement('div', {
    style: { padding: '20px', fontFamily: 'Arial' }
  }, [
    React.createElement('h1', { key: 'h1' }, 'React Test'),
    React.createElement('p', { key: 'p1' }, 'React is mounting!'),
    React.createElement('p', { key: 'p2' }, `Time: ${new Date().toLocaleTimeString()}`)
  ]);
};

// Create the root
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(React.createElement(TestApp));
