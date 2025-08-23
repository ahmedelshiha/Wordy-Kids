import React, { useEffect, useState } from "react";
import "./global.css";

// Builder.io initialization
import { builder } from "@builder.io/react";
import "./components/builder-registry";

// Asset management system
import { AssetManager, AudioManager } from "./lib/assetManager";

// LocalStorage optimization system
import { localStorageManager } from "./lib/localStorageManager";

// Builder.io integration
import { builder } from "@builder.io/react";
import { BuilderPageWrapper, EducationalPageWrapper, MarketingPageWrapper } from "./components/BuilderPageWrapper";
import { initializeBuilderRegistry } from "./lib/builder-registry";

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
import MainAppPage from "./pages/App";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import WordGardenDemo from "./pages/WordGardenDemo";
import { EnhancedWordCardDemo } from "./components/EnhancedWordCardDemo";
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
import StorageOptimizationDemo from "./pages/StorageOptimizationDemo";
import BuilderPageWrapper from "./components/BuilderPageWrapper";

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

      // Initialize Builder.io with API key
      const builderKey = import.meta.env.VITE_PUBLIC_BUILDER_KEY;
      if (builderKey && builderKey !== "__BUILDER_PUBLIC_KEY__") {
        builder.init(builderKey);
        initializeBuilderRegistry();
        console.log("✅ Builder.io initialized with educational components");
      } else {
        console.warn(
          "⚠�� Builder.io API key not set. Please add VITE_PUBLIC_BUILDER_KEY to your .env file",
        );
      }

      // Initialize localStorage Optimization System
      try {
        console.log("🗄️ Initializing localStorage optimization system...");
        // The localStorageManager is automatically initialized when imported
        // Run initial cleanup and health check
        const healthReport = localStorageManager.getHealthReport();
        console.log("📊 Storage Health:", healthReport.status);

        if (
          healthReport.status === "warning" ||
          healthReport.status === "critical"
        ) {
          console.warn("⚠️ Storage issues detected:", healthReport.issues);
          // Auto-cleanup if storage is in poor health
          localStorageManager.cleanup(true);
        }

        console.log("✅ LocalStorage optimization system initialized");
      } catch (error) {
        console.warn(
          "⚠️ LocalStorage optimization system initialization failed:",
          error,
        );
      }

      // Initialize Asset Management System
      const initializeAssets = async () => {
        try {
          console.log("🔍 Validating assets...");

          // Check all assets on app startup
          const validation = await AssetManager.validateAllAssets();

          if (validation.missing.length > 0) {
            console.warn("⚠️ Missing assets:", validation.missing);
          }

          if (Object.keys(validation.mappings).length > 0) {
            console.log("🔄 Asset mappings applied:", validation.mappings);
          }

          // Preload critical assets
          await AssetManager.preloadCriticalAssets();

          // Preload common sounds
          await AudioManager.preloadCommonSounds();

          console.log("✅ Asset system initialized successfully");
        } catch (error) {
          console.warn("⚠️ Asset system initialization failed:", error);
          // Don't block app startup if asset system fails
        }
      };

      // Initialize assets asynchronously to not block app startup
      initializeAssets();

      // Migrate legacy settings to unified jungle settings
      migrateLegacySettings();
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
                            fallbackType="kid"
                            componentName="MainAppPage"
                          >
                            <MainAppPage />
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
                      <Route
                        path="/word-card-demo"
                        element={<EnhancedWordCardDemo />}
                      />
                      <Route
                        path="/word-garden-demo"
                        element={<WordGardenDemo />}
                      />
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
                      <Route
                        path="/ai-system-test"
                        element={<AISystemTest />}
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
                      <Route
                        path="/storage-optimization-demo"
                        element={<StorageOptimizationDemo />}
                      />
                      <Route
                        path="/StorageOptimizationDemo"
                        element={<StorageOptimizationDemo />}
                      />

                      {/* Builder.io Educational Content Routes */}
                      <Route
                        path="/learn/:lesson"
                        element={
                          <EducationalPageWrapper
                            model="educational-lesson"
                            childAge={6}
                            learningLevel="beginner"
                            fallbackContent={
                              <div className="p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">🎓 Lesson Coming Soon!</h2>
                                <p className="text-gray-600">This educational content is being prepared for you.</p>
                                <div className="mt-4 text-4xl">📚</div>
                              </div>
                            }
                          />
                        }
                      />

                      <Route
                        path="/activities/:activity"
                        element={
                          <EducationalPageWrapper
                            model="learning-activity"
                            fallbackContent={
                              <div className="p-8 text-center">
                                <h2 className="text-2xl font-bold mb-4">🎮 Activity Loading...</h2>
                                <p className="text-gray-600">Get ready for a fun learning adventure!</p>
                                <div className="mt-4 text-4xl">🌟</div>
                              </div>
                            }
                          />
                        }
                      />

                      <Route
                        path="/about"
                        element={<MarketingPageWrapper model="marketing-page" />}
                      />

                      <Route
                        path="/pricing"
                        element={<MarketingPageWrapper model="marketing-page" />}
                      />

                      <Route
                        path="/parents"
                        element={<MarketingPageWrapper model="parent-info-page" />}
                      />

                      {/* Builder.io Dynamic Pages */}
                      <Route
                        path="/page/*"
                        element={<BuilderPageWrapper model="page" />}
                      />
                      <Route
                        path="/lesson/*"
                        element={<EducationalPageWrapper model="educational-lesson" />}
                      />
                      <Route
                        path="/game/*"
                        element={<EducationalPageWrapper model="learning-activity" />}
                      />
                      <Route
                        path="/builder/:slug"
                        element={<BuilderPageWrapper model="page" />}
                      />

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
