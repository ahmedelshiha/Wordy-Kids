import * as React from "react";
import { cn } from "@/lib/utils";
import { CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Brain, BarChart3 } from "lucide-react";
import { AICardContentProps } from "./ai-card-types";

export const AICardContent = React.forwardRef<
  HTMLDivElement,
  AICardContentProps
>(({ 
  className,
  children,
  aiState,
  aiActions,
  showAIInsights = false,
  setShowAIInsights,
  confidenceLevel = 0.6,
  difficultyAdjustment = "maintain",
  sessionWords = [],
  sessionStats = { accuracy: 0, wordsLearned: 0, totalWords: 0 },
  showMobileAI = true,
  showDesktopAI = true,
  headerClassName,
  enableAIHeader = true,
  ...props 
}, ref) => {

  // AI Session Handler
  const handleAIToggle = React.useCallback(() => {
    if (aiState.isSessionActive) {
      // End current AI session
      aiActions.endSession({ completed: false });
    } else {
      // Start AI session with current words
      if (sessionWords.length === 0) {
        console.warn("Cannot start AI session: no words available");
        return;
      }
      
      aiActions.startSession({
        words: sessionWords.slice(0, 10),
        confidence: Math.min(
          0.9,
          Math.max(0.4, (sessionStats.accuracy / 100) * 0.8 + 0.3)
        ),
        reasoning: ["Starting new AI session"],
        expectedOutcomes: {
          learningVelocity: 0.7,
          retentionPrediction: 0.8,
          engagementScore: 0.85,
          difficultyFit: 0.75,
        },
        alternativeStrategies: ["adaptive"],
        adaptiveInstructions: {
          encouragementFrequency: 0.6,
          hintStrategy: "moderate",
          errorHandling: "immediate",
        },
      });
    }
  }, [aiState.isSessionActive, aiActions, sessionWords, sessionStats]);

  // AI Insights Toggle Handler
  const handleInsightsToggle = React.useCallback(() => {
    if (setShowAIInsights) {
      setShowAIInsights(!showAIInsights);
    }
  }, [showAIInsights, setShowAIInsights]);

  return (
    <CardContent ref={ref} className={cn(className)} {...props}>
      {/* AI Header - Only render if enabled */}
      {enableAIHeader && (
        <div
          className={cn(
            "rounded-lg mb-2 shadow-sm border transition-all duration-500",
            aiState.isSessionActive
              ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white border-blue-300"
              : "bg-blue-50 text-gray-800 border-blue-200",
            headerClassName
          )}
        >
          {/* Mobile Layout: Ultra Compact */}
          {showMobileAI && (
            <div className="md:hidden p-1.5">
              <div className="flex items-center justify-between gap-2">
                {/* Left: Enhanced AI Status */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <Brain
                      className={cn(
                        "w-5 h-5 transition-all",
                        aiState.isSessionActive
                          ? "text-white"
                          : "text-blue-600",
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-sm font-medium truncate flex items-center gap-1">
                      🤖{" "}
                      {aiState.isSessionActive ? "AI Active!" : "AI Helper"}
                      {aiState.isSessionActive && (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-xs opacity-75 bg-white/20 px-1.5 py-0.5 rounded-full ml-1">
                            {Math.round(confidenceLevel * 100)}% 📊
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Right: AI Enhancement Toggles + Chart Icon */}
                <div className="flex items-center gap-1">
                  {/* Chart icon for mobile */}
                  {setShowAIInsights && (
                    <Button
                      onClick={handleInsightsToggle}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-2 rounded-lg transition-all h-7 w-7",
                        aiState.isSessionActive
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-white/50 hover:bg-white text-blue-600",
                      )}
                      aria-label="View stats"
                    >
                      <BarChart3 className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    onClick={handleAIToggle}
                    size="sm"
                    className={cn(
                      "relative px-2 py-1 h-6 rounded-full text-xs font-bold shadow-md transition-all duration-300 transform hover:scale-105 active:scale-95 flex-shrink-0",
                      aiState.isSessionActive
                        ? "bg-red-500 hover:bg-red-600 text-white border border-red-300 shadow-red-300/30"
                        : "bg-green-500 hover:bg-green-600 text-white border border-green-300 shadow-green-300/30",
                    )}
                  >
                    <div className="relative z-10 flex items-center justify-center gap-1">
                      {aiState.isSessionActive ? (
                        <>
                          <span className="text-xs">🔴</span>
                          <span className="text-xs font-bold text-white">OFF</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs">🟢</span>
                          <span className="text-xs font-bold text-white">ON</span>
                        </>
                      )}
                    </div>
                    {aiState.isSessionActive && (
                      <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop Layout: Full Features */}
          {showDesktopAI && (
            <div className="hidden md:block p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Brain
                      className={cn(
                        "w-8 h-8 drop-shadow-lg transition-all duration-300",
                        aiState.isSessionActive
                          ? "text-white"
                          : "text-blue-600",
                      )}
                    />
                    {aiState.isSessionActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full shadow-lg" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold">
                        🤖{" "}
                        {aiState.isSessionActive
                          ? "AI Active!"
                          : "AI Smart Helper"}
                      </span>
                      {aiState.isSessionActive && (
                        <>
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
                            {Math.round(confidenceLevel * 100)}% 📊
                          </span>
                        </>
                      )}
                      <Button
                        onClick={handleAIToggle}
                        size="sm"
                        className={cn(
                          "relative ml-2 px-4 py-2 h-9 rounded-full text-sm font-bold shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95",
                          aiState.isSessionActive
                            ? "bg-red-500 hover:bg-red-600 text-white border-2 border-red-300 shadow-red-300/40"
                            : "bg-green-500 hover:bg-green-600 text-white border-2 border-green-300 shadow-green-300/40",
                        )}
                      >
                        <div className="relative z-10 flex items-center justify-center gap-2">
                          {aiState.isSessionActive ? (
                            <>
                              <span className="text-lg">🔴</span>
                              <span className="text-sm font-bold text-white">AI STOP</span>
                            </>
                          ) : (
                            <>
                              <span className="text-lg">🟢</span>
                              <span className="text-sm font-bold text-white">AI START</span>
                            </>
                          )}
                        </div>
                        {aiState.isSessionActive && (
                          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-3 opacity-90">
                      {aiState.isSessionActive && (
                        <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Controls */}
                <div className="flex items-center gap-2">
                  {difficultyAdjustment !== "maintain" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-1",
                        aiState.isSessionActive
                          ? "bg-white/20 text-white border-white/30"
                          : "bg-white border-blue-300",
                      )}
                    >
                      {difficultyAdjustment === "increase"
                        ? "⬆️ Harder"
                        : "⬇️ Easier"}
                    </Badge>
                  )}
                  {setShowAIInsights && (
                    <Button
                      onClick={handleInsightsToggle}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        aiState.isSessionActive
                          ? "bg-white/20 hover:bg-white/30 text-white"
                          : "bg-white/50 hover:bg-white text-blue-600",
                      )}
                      aria-label="View stats"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Original children content */}
      {children}
    </CardContent>
  );
});

AICardContent.displayName = "AICardContent";

// Export component and types
export { AICardContent as default };
export type { AICardContentProps } from "./ai-card-types";
