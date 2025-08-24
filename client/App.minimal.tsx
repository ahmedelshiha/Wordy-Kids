import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Simple components for testing
const Home = () => (
  <div style={{ padding: '20px' }}>
    <h1>App is Working!</h1>
    <p>React Router is functional</p>
    <p>Current time: {new Date().toLocaleTimeString()}</p>
  </div>
);

const NotFound = () => (
  <div style={{ padding: '20px' }}>
    <h1>404 - Page Not Found</h1>
  </div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/health" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
