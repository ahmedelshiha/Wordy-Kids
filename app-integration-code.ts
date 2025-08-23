// client/App.tsx - Integration code to add to your existing App component

import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { builder } from '@builder.io/react'

// Import the Builder.io components
import { BuilderPageWrapper, EducationalPageWrapper, MarketingPageWrapper } from './components/BuilderPageWrapper'
import { initializeBuilderRegistry } from './lib/builder-registry'

// Your existing components
import { LoginForm } from './pages/LoginForm'
import { SignUp } from './pages/SignUp'
import { MainAppPage } from './pages/MainAppPage'
import { AdminPage } from './pages/AdminPage'

const App: React.FC = () => {
  useEffect(() => {
    // Initialize Builder.io with your public key
    builder.init(import.meta.env.VITE_BUILDER_PUBLIC_KEY || 'YOUR_BUILDER_PUBLIC_KEY')
    
    // Initialize the component registry
    initializeBuilderRegistry()
    
    console.log('Builder.io initialized with educational components')
  }, [])

  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/app" element={<MainAppPage />} />
        <Route path="/admin" element={<AdminPage />} />
        
        {/* New Builder.io routes for dynamic content */}
        
        {/* Educational content pages - child-focused */}
        <Route 
          path="/learn/:lesson" 
          element={
            <EducationalPageWrapper 
              model="educational-lesson"
              childAge={6}
              learningLevel="beginner"
              fallbackContent={
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Lesson Coming Soon!</h2>
                  <p>This educational content is being prepared.</p>
                </div>
              }
            />
          } 
        />
        
        {/* Dynamic learning activities */}
        <Route 
          path="/activities/:activity" 
          element={
            <EducationalPageWrapper 
              model="learning-activity"
              fallbackContent={
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold mb-4">Activity Loading...</h2>
                  <p>Get ready for a fun learning adventure!</p>
                </div>
              }
            />
          } 
        />
        
        {/* Marketing and parent-facing pages */}
        <Route 
          path="/about" 
          element={
            <MarketingPageWrapper 
              model="marketing-page"
            />
          } 
        />
        
        <Route 
          path="/pricing" 
          element={
            <MarketingPageWrapper 
              model="marketing-page"
            />
          } 
        />
        
        <Route 
          path="/parents" 
          element={
            <MarketingPageWrapper 
              model="parent-info-page"
            />
          } 
        />
        
        {/* General Builder.io pages - catch-all for any Builder content */}
        <Route 
          path="/builder/:slug" 
          element={<BuilderPageWrapper model="page" />} 
        />
        
        {/* Fallback Builder.io integration for any unmatched routes */}
        <Route 
          path="*" 
          element={
            <BuilderPageWrapper 
              model="page"
              urlPath={window.location.pathname}
            >
              <div className="text-center p-12">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Page Not Found</h1>
                <p className="text-gray-600">This page doesn't exist yet.</p>
              </div>
            </BuilderPageWrapper>
          } 
        />

        {/* Your existing demo routes remain unchanged */}
        {/* ... all your existing demo routes ... */}
      </Routes>
    </Router>
  )
}

export default App