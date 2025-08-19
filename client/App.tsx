import React, { useEffect, useState } from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import SignUp from "./pages/SignUp";
import AppPage from "./pages/App";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import WordGardenDemo from "./pages/WordGardenDemo";
import { EnhancedWordCardDemo } from "./components/EnhancedWordCardDemo";
import { EnhancedMagicalMenuDemo } from "./components/EnhancedMagicalMenuDemo";
import {
  WordDatabaseNotifications,
  CompactWordDatabaseNotifications,
} from "./components/WordDatabaseNotifications";
import { WordAdventureDemo } from "./pages/WordAdventureDemo";
import { WordAdventureTest } from "./pages/WordAdventureTest";
import AIIntegrationDemo from "./pages/AIIntegrationDemo";
import AIWordRecommendationDemo from "./pages/AIWordRecommendationDemo";
import AISystemTest from "./pages/AISystemTest";
import { NavigationGuard } from "./components/NavigationGuard";
import SpeechDiagnostics from "./components/SpeechDiagnostics";

const queryClient = new QueryClient();

const App = () => {
  const [isClient, setIsClient] = useState(() => {
    // Initialize based on whether we're in browser
    return typeof window !== "undefined";
  });

  useEffect(() => {
    // Ensure we're properly hydrated on the client
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  // Always render on client side, but show loading during hydration
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <WordDatabaseNotifications />
        <CompactWordDatabaseNotifications />
        <BrowserRouter>
          <AuthProvider>
            <NavigationGuard>
              <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/app" element={<AppPage />} />
                <Route path="/profile" element={<Login />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route
                  path="/word-card-demo"
                  element={<EnhancedWordCardDemo />}
                />
                <Route path="/word-garden-demo" element={<WordGardenDemo />} />
                <Route
                  path="/word-adventure-demo"
                  element={<WordAdventureDemo />}
                />
                <Route
                  path="/WordAdventureDemo"
                  element={<WordAdventureDemo />}
                />
                <Route
                  path="/word-adventure-test"
                  element={<WordAdventureTest />}
                />
                <Route
                  path="/WordAdventureTest"
                  element={<WordAdventureTest />}
                />
                <Route
                  path="/speech-diagnostics"
                  element={<SpeechDiagnostics />}
                />
                <Route
                  path="/ai-integration-demo"
                  element={<AIIntegrationDemo />}
                />
                <Route
                  path="/AIIntegrationDemo"
                  element={<AIIntegrationDemo />}
                />
                <Route
                  path="/ai-word-recommendation-demo"
                  element={<AIWordRecommendationDemo />}
                />
                <Route
                  path="/AIWordRecommendationDemo"
                  element={<AIWordRecommendationDemo />}
                />
                <Route path="/ai-system-test" element={<AISystemTest />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </NavigationGuard>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
