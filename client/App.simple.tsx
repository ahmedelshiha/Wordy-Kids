import React from "react";

const SimpleApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Simple App Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default SimpleApp;
