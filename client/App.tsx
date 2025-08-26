import React, { useEffect, useState } from "react";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import Login from "./pages/Login";
import LoginForm from "./pages/LoginForm";
import SignUp from "./pages/SignUp";
import MainAppPage from "./pages/App";
import IndexSimplified from "./pages/IndexSimplified";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import WordGardenDemo from "./pages/WordGardenDemo";
import {
  LazyJungleWordLibrary,
  LazyParentDashboard,
  EnhancedSuspense,
  ResourceHints,
  preloadComponents
} from "./components/LazyComponents";
import { JungleAdventureWordCardDemo } from "./pages/JungleAdventureWordCardDemo";
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
import { LightweightAchievementProvider } from "./components/LightweightAchievementProvider";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { ErrorBoundaryTest } from "./components/ErrorBoundaryTest";
import MobileSettingsDemo from "./pages/MobileSettingsDemo";
import SettingsPanelV2Demo from "./pages/SettingsPanelV2Demo";
import IconNavTest from "./pages/IconNavTest";

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

      // Migrate legacy settings to unified jungle settings
      migrateLegacySettings();

      // Preload critical components for better performance
      try {
        preloadComponents.jungleLibrary?.();
        preloadComponents.parentDashboard?.();
      } catch (error) {
        console.warn("Failed to preload components:", error);
      }
    }
  }, []);

  // Migration utility to unify storage keys
  const migrateLegacySettings = () => {
    const legacyKeys = [
      "backgroundAnimations",
      "accessibilitySettings",
      "soundscape",
      "voiceCharacter",
      "soundEnabled",
      "uiInteractionSounds",
      "voiceNarration",
      "hapticFeedback",
      "highContrastMode",
      "largeText",
      "reducedMotion",
      "parentDashboardSettings",
      "parentDashboardChildren",
      "categoryProgress",
      "systematic_progress_reading",
      "systematic_progress_vocabulary",
      "systematic_progress_comprehension",
    ];
    const jungleKey = "jungleAdventureSettings";

    // Only migrate if jungle settings don't exist yet
    if (!localStorage.getItem(jungleKey)) {
      const newSettings: any = {};

      legacyKeys.forEach((key) => {
        const val = localStorage.getItem(key);
        if (val) {
          try {
            newSettings[key] = JSON.parse(val);
          } catch {
            newSettings[key] = val; // Keep as string if not JSON
          }
          // Clean up legacy key
          localStorage.removeItem(key);
        }
      });

      // Save unified settings
      if (Object.keys(newSettings).length > 0) {
        localStorage.setItem(jungleKey, JSON.stringify(newSettings));
        console.log("✅ Migrated legacy settings to unified jungle storage");
      }
    }
  };

  // Always render on client side, but show loading during hydration
  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallbackType="parent" componentName="App">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ResourceHints />
          <Toaster />
          <Sonner />
          <WordDatabaseNotifications />
          <CompactWordDatabaseNotifications />
          <BrowserRouter>
            <AuthProvider>
              <LightweightAchievementProvider>
                <NavigationGuard>
                  <ErrorBoundary fallbackType="parent" componentName="Routes">
                    <Routes>
                      <Route path="/" element={<LoginForm />} />
                      <Route path="/login" element={<LoginForm />} />
                      <Route path="/signup" element={<SignUp />} />
                      <Route
                        path="/app"
                        element={
                          <ErrorBoundary
                            fallbackType="parent"
                            componentName="IndexSimplified"
                          >
                            <IndexSimplified />
                          </ErrorBoundary>
                        }
                      />
                      <Route path="/profile" element={<Login />} />
                      <Route
                        path="/admin"
                        element={
                          <ErrorBoundary
                            fallbackType="parent"
                            componentName="AdminPage"
                          >
                            <AdminPage />
                          </ErrorBoundary>
                        }
                      />
                      {/* Production Routes */}
                      <Route
                        path="/jungle-library"
                        element={
                          <ErrorBoundary
                            fallbackType="parent"
                            componentName="JungleWordLibrary"
                          >
                            <EnhancedSuspense componentName="JungleWordLibrary">
                              <LazyJungleWordLibrary
                                enableAdvancedFeatures={true}
                                showMobileOptimizations={true}
                              />
                            </EnhancedSuspense>
                          </ErrorBoundary>
                        }
                      />

                      <Route
                        path="/parent-dashboard"
                        element={
                          <ErrorBoundary
                            fallbackType="parent"
                            componentName="ParentDashboard"
                          >
                            <EnhancedSuspense componentName="ParentDashboard">
                              <LazyParentDashboard />
                            </EnhancedSuspense>
                          </ErrorBoundary>
                        }
                      />

                      {/* Legacy App Route - Backup */}
                      <Route
                        path="/app-legacy"
                        element={
                          <ErrorBoundary
                            fallbackType="kid"
                            componentName="MainAppPage"
                          >
                            <MainAppPage />
                          </ErrorBoundary>
                        }
                      />

                      {/* Essential Diagnostic Routes */}
                      <Route
                        path="/speech-diagnostics"
                        element={<SpeechDiagnostics />}
                      />
                      <Route
                        path="/jungle-adventure-word-card-demo"
                        element={<JungleAdventureWordCardDemo />}
                      />
                      <Route
                        path="/error-boundary-test"
                        element={<ErrorBoundaryTest />}
                      />
                      <Route
                        path="/mobile-settings-demo"
                        element={<MobileSettingsDemo />}
                      />
                      <Route
                        path="/settings-panel-v2-demo"
                        element={<SettingsPanelV2Demo />}
                      />
                      <Route path="/icon-nav-test" element={<IconNavTest />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </NavigationGuard>
              </LightweightAchievementProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
