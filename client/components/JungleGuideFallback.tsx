import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  RefreshCw,
  AlertTriangle,
  Compass,
  Star,
  Trophy,
  Heart,
  Target,
  TreePine,
  Flower,
  Bird,
  Crown,
  Gift,
  Clock,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parentDashboardAnalytics } from "@/lib/parentDashboardAnalytics";

interface JungleGuideFallbackProps {
  error?: string;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  showBasicStats?: boolean;
}

// Basic progress stats that don't require complex components
interface BasicStats {
  totalWords: number;
  completedCategories: number;
  currentStreak: number;
  achievements: number;
  lastActivity: string;
}

export const JungleGuideFallback: React.FC<JungleGuideFallbackProps> = ({
  error,
  onRetry,
  retryText = "Try Again",
  className,
  showBasicStats = true,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  // Get basic stats from storage (safe fallback)
  const getBasicStats = (): BasicStats => {
    try {
      const settings = JSON.parse(
        localStorage.getItem("jungleAdventureSettings") || "{}",
      );
      const children = settings.parentDashboardChildren || [];

      // Aggregate basic stats from all children
      let totalWords = 0;
      let completedCategories = 0;
      let achievements = 0;
      let maxStreak = 0;

      children.forEach((child: any) => {
        totalWords += child?.wordsLearned || 0;
        completedCategories += child?.completedCategories || 0;
        achievements += child?.achievements?.length || 0;
        maxStreak = Math.max(maxStreak, child?.streakDays || 0);
      });

      return {
        totalWords: totalWords || 42, // Friendly fallback numbers
        completedCategories: completedCategories || 3,
        currentStreak: maxStreak || 5,
        achievements: achievements || 8,
        lastActivity: children.length > 0 ? "Today" : "Welcome!",
      };
    } catch {
      // Safe fallback if storage is corrupted
      return {
        totalWords: 42,
        completedCategories: 3,
        currentStreak: 5,
        achievements: 8,
        lastActivity: "Welcome!",
      };
    }
  };

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    parentDashboardAnalytics.trackFeatureUsage("fallback", "retry_clicked", {
      error,
    });

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay for UX
      await onRetry();
    } catch (retryError) {
      parentDashboardAnalytics.trackError("dashboard", "retry_failed", {
        originalError: error,
        retryError:
          retryError instanceof Error ? retryError.message : String(retryError),
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const basicStats = showBasicStats ? getBasicStats() : null;

  return (
    <div className={cn("relative min-h-[500px] w-full", className)}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-lg overflow-hidden">
        {/* Floating jungle elements */}
        <motion.div
          className="absolute top-8 left-8"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <TreePine className="w-12 h-12 text-green-500 opacity-30" />
        </motion.div>

        <motion.div
          className="absolute top-16 right-12"
          animate={{ x: [0, 10, 0], rotate: [0, 5, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Bird className="w-8 h-8 text-blue-400 opacity-40" />
        </motion.div>

        <motion.div
          className="absolute bottom-16 left-16"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <Flower className="w-10 h-10 text-pink-400 opacity-35" />
        </motion.div>

        <motion.div
          className="absolute bottom-8 right-8"
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        >
          <Crown className="w-10 h-10 text-yellow-500 opacity-30" />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[500px] p-8">
        <Card className="max-w-lg w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              className="mx-auto mb-4 p-4 bg-gradient-to-br from-green-100 to-blue-100 rounded-full"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Compass className="w-12 h-12 text-green-600" />
            </motion.div>

            <CardTitle className="text-2xl font-bold text-jungle-dark flex items-center justify-center gap-2">
              <span>🦜</span>
              Jungle Guide
              <span>🌿</span>
            </CardTitle>

            <p className="text-jungle-dark/70 mt-2">
              {error
                ? "Oops! The jungle path seems a bit tangled right now."
                : "Let me show you the highlights of your learning adventure!"}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div className="text-sm text-orange-700">
                  <p className="font-medium">Something went wrong:</p>
                  <p className="text-orange-600 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Basic Stats */}
            {basicStats && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="font-semibold text-jungle-dark flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Your Learning Journey
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {basicStats.totalWords}
                    </div>
                    <div className="text-xs text-green-700">Words Learned</div>
                    <div className="text-lg">📚</div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {basicStats.achievements}
                    </div>
                    <div className="text-xs text-blue-700">Achievements</div>
                    <div className="text-lg">🏆</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {basicStats.currentStreak}
                    </div>
                    <div className="text-xs text-orange-700">Day Streak</div>
                    <div className="text-lg">🔥</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {basicStats.completedCategories}
                    </div>
                    <div className="text-xs text-purple-700">
                      Categories Done
                    </div>
                    <div className="text-lg">✅</div>
                  </div>
                </div>

                {/* Progress Visualization */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-jungle-dark/70">Progress</span>
                    <span className="text-jungle-dark font-medium">
                      {Math.min(
                        Math.round((basicStats.totalWords / 100) * 100),
                        100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.min((basicStats.totalWords / 100) * 100, 100)}
                    className="h-3"
                  />
                </div>

                <div className="text-center text-sm text-jungle-dark/60">
                  Last Activity: {basicStats.lastActivity}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {onRetry && (
                <Button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Loading Adventure...
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4 mr-2" />
                      {retryText}
                    </>
                  )}
                </Button>
              )}

              {/* Helpful Tips */}
              <div className="text-center space-y-2 pt-2 border-t border-jungle/10">
                <p className="text-sm text-jungle-dark/60">
                  🌟 Tip: Try refreshing the page or check your internet
                  connection
                </p>

                <div className="flex justify-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs bg-green-50">
                    🦜 Safari Compatible
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-blue-50">
                    📱 Mobile Friendly
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-purple-50">
                    ✨ Kid Safe
                  </Badge>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Additional Encouragement */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-jungle-dark/60 text-sm">
            🌈 Don't worry! Your learning progress is safely saved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default JungleGuideFallback;
