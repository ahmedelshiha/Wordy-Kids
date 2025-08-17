import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AIProgressContainerProps {
  dailyGoal: {
    completed: number;
    target: number;
  };
  sessionStats: {
    wordsRemembered: number;
    wordsForgotten: number;
  };
  confidenceLevel: number; // 0-1 decimal
  currentWordIndex: number; // Current word position
  sessionSize: number; // Total session size (e.g., 10)
  sessionProgress: number; // Progress percentage (0-100)
  realTimeEncouragement?: string; // Optional AI message
  showWordName?: boolean; // Controls when to show encouragement
  className?: string; // Optional additional styling
}

export function AIProgressContainer({
  dailyGoal,
  sessionStats,
  confidenceLevel,
  currentWordIndex,
  sessionSize,
  sessionProgress,
  realTimeEncouragement,
  showWordName = false,
  className,
}: AIProgressContainerProps) {
  return (
    <div className={cn(className)}>
      {/* AI Progress Card Container */}
      <div className="mb-3 bg-white p-2 sm:p-4 rounded-lg sm:rounded-2xl shadow-sm border border-gray-100">
        {/* Compact header with inline progress */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-lg sm:text-xl">🧠🎯</span>
            <h2 className="text-sm sm:text-lg font-bold text-gray-800">
              AI Progress
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-lg sm:text-xl">🚀</span>
            <span className="font-medium text-gray-700 text-sm sm:text-base">
              {dailyGoal.completed}/{dailyGoal.target}
            </span>
            <span className="font-bold text-gray-800 text-sm sm:text-base">
              ({Math.round((dailyGoal.completed / dailyGoal.target) * 100)}
              %)
            </span>
          </div>
        </div>

        {/* Ultra-compact progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1 sm:h-2 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 sm:h-2 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round((dailyGoal.completed / dailyGoal.target) * 100)}%`,
            }}
          />
        </div>

        {/* Compact stats in single row */}
        <div className="flex items-center justify-between text-sm gap-1">
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded flex-1 justify-center">
            <span className="text-lg">😊</span>
            <span className="font-medium text-sm">
              {sessionStats.wordsRemembered}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded flex-1 justify-center">
            <span className="text-lg">💪</span>
            <span className="font-medium text-sm">
              {sessionStats.wordsForgotten}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded flex-1 justify-center">
            <span className="text-lg">🎯</span>
            <span className="font-medium text-sm">
              {Math.round(confidenceLevel * 100)}%
            </span>
          </div>
          <div className="text-purple-600 font-medium text-xs hidden sm:block">
            🌟 AI: Great!
          </div>
        </div>

        {/* Session progress - Ultra compact */}
        <div className="mt-1 text-center text-xs text-gray-500">
          <span>
            {currentWordIndex + 1}/{sessionSize}
          </span>
          {sessionProgress >= 100 && <span className="ml-1">🎉</span>}
        </div>
      </div>

      {/* Real-time AI encouragement */}
      <AnimatePresence>
        {realTimeEncouragement && !showWordName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200 mb-4"
          >
            <div className="text-sm font-medium text-green-800 flex items-center justify-center gap-2">
              <Brain className="w-4 h-4" />
              {realTimeEncouragement}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
