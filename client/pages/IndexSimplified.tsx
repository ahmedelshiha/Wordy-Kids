import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { JungleWordLibrary } from "@/components/JungleWordLibrarySimplified";
import { EnhancedChildLogin } from "@/components/EnhancedChildLogin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Users,
  HelpCircle,
  Crown,
  Sparkles,
  TreePine,
  Leaf,
} from "lucide-react";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { toast } from "@/hooks/use-toast";

const IndexSimplified: React.FC = () => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<"library" | "menu">("library");

  // Auto-redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !isGuest) {
      setShowLogin(true);
    }
  }, [isAuthenticated, isGuest]);

  const handleBackToMenu = useCallback(() => {
    setCurrentView("menu");
  }, []);

  const handleStartAdventure = useCallback(() => {
    setCurrentView("library");
  }, []);

  const handleParentDashboard = useCallback(() => {
    navigate("/parent-dashboard");
  }, [navigate]);

  const handleSettings = useCallback(() => {
    // Could navigate to settings page or show settings modal
    toast({
      title: "⚙️ Settings",
      description: "Settings feature coming soon!",
      duration: 2000,
    });
  }, []);

  const handleHelp = useCallback(() => {
    // Could navigate to help page or show help modal
    toast({
      title: "❓ Help",
      description: "Help & tutorials coming soon!",
      duration: 2000,
    });
  }, []);

  // Show login if not authenticated
  if (showLogin && !isAuthenticated && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <EnhancedChildLogin
          onLogin={() => setShowLogin(false)}
          onSkip={() => setShowLogin(false)}
        />
      </div>
    );
  }

  // Main menu view
  if (currentView === "menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🌴
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-bold text-green-800">
                Jungle Word Library
              </h1>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🦁
              </motion.div>
            </div>
            
            {user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-4"
              >
                <span className="text-lg text-green-700">Welcome back,</span>
                <Badge variant="outline" className="text-green-800 border-green-300">
                  <Crown className="w-4 h-4 mr-1" />
                  {user.name || "Adventure Explorer"}
                </Badge>
              </motion.div>
            )}
          </motion.div>

          {/* Main Menu Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {/* Start Adventure Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-green-200 hover:border-green-400">
              <CardContent 
                className="p-6 text-center"
                onClick={handleStartAdventure}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-4"
                >
                  <div className="text-6xl mb-4 group-hover:animate-bounce">🌿</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    Start Word Adventure
                  </h3>
                  <p className="text-green-600 text-sm">
                    Explore amazing words in the magical jungle!
                  </p>
                </motion.div>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <TreePine className="w-4 h-4 mr-2" />
                  Begin Journey
                </Button>
              </CardContent>
            </Card>

            {/* Parent Dashboard Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-blue-200 hover:border-blue-400">
              <CardContent 
                className="p-6 text-center"
                onClick={handleParentDashboard}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-4"
                >
                  <div className="text-6xl mb-4 group-hover:animate-pulse">👨‍👩‍👧‍👦</div>
                  <h3 className="text-xl font-bold text-blue-800 mb-2">
                    Parent Dashboard
                  </h3>
                  <p className="text-blue-600 text-sm">
                    Track progress and manage family settings
                  </p>
                </motion.div>
                <Button variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Users className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-200 hover:border-purple-400">
              <CardContent 
                className="p-6 text-center"
                onClick={handleSettings}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-4"
                >
                  <div className="text-6xl mb-4 group-hover:animate-spin">⚙️</div>
                  <h3 className="text-xl font-bold text-purple-800 mb-2">
                    Settings
                  </h3>
                  <p className="text-purple-600 text-sm">
                    Customize your learning experience
                  </p>
                </motion.div>
                <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-orange-200 hover:border-orange-400 md:col-span-2 lg:col-span-1">
              <CardContent 
                className="p-6 text-center"
                onClick={handleHelp}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="mb-4"
                >
                  <div className="text-6xl mb-4 group-hover:animate-bounce">❓</div>
                  <h3 className="text-xl font-bold text-orange-800 mb-2">
                    Help & Tutorials
                  </h3>
                  <p className="text-orange-600 text-sm">
                    Learn how to use the jungle library
                  </p>
                </motion.div>
                <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Get Help
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats (if authenticated) */}
          {isAuthenticated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 max-w-md mx-auto"
            >
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-600">Ready for adventure!</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Leaf className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Jungle Explorer</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Jungle Word Library view
  return (
    <ErrorBoundary
      fallbackType="parent"
      componentName="JungleWordLibrary"
    >
      <JungleWordLibrary 
        onBack={handleBackToMenu}
        userProfile={{
          name: user?.name,
          age: user?.age,
          interests: user?.interests || ["animals", "nature", "adventure"],
        }}
        enableAdvancedFeatures={true}
        showMobileOptimizations={true}
        gameMode="exploration"
      />
    </ErrorBoundary>
  );
};

export default IndexSimplified;
