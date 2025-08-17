import React from "react";
import { createRoot } from "react-dom/client";

// Simple debug component to test React setup
function DebugApp() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Debug Test</h1>
      <p>If you can see this and the counter works, React is functioning properly.</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Count: {count}
      </button>
      <div style={{ marginTop: '20px', color: 'green' }}>
        ✅ React hooks (useState) working properly
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Simple root creation without caching
const root = createRoot(rootElement);
root.render(<DebugApp />);
