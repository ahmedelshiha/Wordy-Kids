// client/main.tsx - Add this import to your existing main.tsx file

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

// CRITICAL: Import Builder.io registry at startup
import './lib/builder-registry'

// Your existing main.tsx code...
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)