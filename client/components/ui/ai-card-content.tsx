import * as React from "react";
import { cn } from "@/lib/utils";
import { CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card } from "./card";
import { Alert, AlertDescription } from "./alert";
import { Brain, BarChart3, Settings, AlertTriangle } from "lucide-react";
import { AICardContentProps } from "./ai-card-types";
import { useMobileTouch, useIsMobile } from "@/hooks/use-mobile-touch";

// Extended props to match the comprehensive AI header requirements
interface ExtendedAICardContentProps extends AICardContentProps {
  // AI Status and Control
  aiStatus?: "loading" | "active" | "error" | "inactive";
  globalAIEnabled?: boolean;
  onToggleGlobalAI?: () => void;
  onRetryAI?: () => void;
  aiErrorMessage?: string;

  // Settings
  showAISettings?: boolean;
  setShowAISettings?: (show: boolean) => void;

  // Session Management
  SESSION_SIZE?: number;

  // Enhanced display options
  showQuickStats?: boolean;
  showErrorAlert?: boolean;
}

export const AICardContent = React.forwardRef<
  HTMLDivElement,
  ExtendedAICardContentProps
>(
  (
    {
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
      // Extended props
      aiStatus = "inactive",
      globalAIEnabled = false,
      onToggleGlobalAI,
      onRetryAI,
      aiErrorMessage,
      showAISettings = false,
      setShowAISettings,
      SESSION_SIZE = 20,
      showQuickStats = true,
      showErrorAlert = true,
      ...props
    },
    ref,
  ) => {
    // AI Session Handler
    const handleAIToggle = React.useCallback(() => {
      if (onToggleGlobalAI) {
        onToggleGlobalAI();
      }
    }, [onToggleGlobalAI]);

    // AI Insights Toggle Handler
    const handleInsightsToggle = React.useCallback(() => {
      if (setShowAIInsights) {
        setShowAIInsights(!showAIInsights);
      }
    }, [showAIInsights, setShowAIInsights]);

    // AI Settings Toggle Handler
    const handleSettingsToggle = React.useCallback(() => {
      if (setShowAISettings) {
        setShowAISettings(!showAISettings);
      }
    }, [showAISettings, setShowAISettings]);

    // Safe accuracy calculation to prevent NaN
    const safeAccuracy = React.useMemo(() => {
      if (typeof sessionStats.accuracy === 'number' && !isNaN(sessionStats.accuracy)) {
        return sessionStats.accuracy;
      }
      return 0;
    }, [sessionStats.accuracy]);

    return (
      <CardContent ref={ref} className={cn("ai-card-mobile", className)} {...props}>
        {/* Comprehensive AI Control Header - Mobile Enhanced */}
        {enableAIHeader && (
          <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/60 mb-3 sm:mb-4">
            <CardContent className="card-content p-2 sm:p-3 md:p-4">
              <div className="header-controls flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  {/* AI Status Indicator with Confidence - Mobile Optimized */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="relative">
                      <Brain
                        className={cn(
                          "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300",
                          aiStatus === "active"
                            ? "text-blue-600"
                            : "text-gray-400",
                          aiStatus === "loading" && "animate-pulse",
                        )}
                      />
                      {aiStatus === "active" && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 rounded-full shadow-lg animate-pulse" />
                      )}
                    </div>

                    {/* Status Badge - Mobile Responsive */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <Badge
                        variant={
                          aiStatus === "active" ? "default" : "secondary"
                        }
                        className={cn(
                          "text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 whitespace-nowrap",
                          aiStatus === "active" &&
                            "bg-green-100 text-green-800 border-green-300",
                        )}
                      >
                        {aiStatus === "active" && "Active"}
                        {aiStatus === "loading" && "Loading..."}
                        {aiStatus === "error" && "Error"}
                        {aiStatus === "inactive" && "Inactive"}
                      </Badge>

                      {/* Confidence Level Badge - Hidden on smallest screens */}
                      {aiStatus === "active" && (
                        <Badge
                          variant="outline"
                          className="hidden xs:inline-flex text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-50 text-blue-700 border-blue-300 whitespace-nowrap"
                        >
                          {Math.round(confidenceLevel * 100)}%
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats - Enhanced Mobile Display */}
                  {aiStatus === "active" && showQuickStats && (
                    <div className="hidden sm:flex items-center gap-3 md:gap-4 text-xs">
                      {/* Session Progress Counter */}
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 text-xs sm:text-sm">
                          {sessionStats.totalWords ||
                            sessionStats.wordsLearned ||
                            0}
                          /{SESSION_SIZE}
                        </div>
                        <div className="text-gray-600 text-xs">Progress</div>
                      </div>

                      {/* Accuracy Percentage - Fixed NaN issue */}
                      <div className="text-center">
                        <div className="font-semibold text-green-600 text-xs sm:text-sm">
                          {safeAccuracy}%
                        </div>
                        <div className="text-gray-600 text-xs">Accuracy</div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Quick Stats - Compact version for small screens */}
                  {aiStatus === "active" && showQuickStats && (
                    <div className="flex sm:hidden items-center gap-2 text-xs overflow-hidden">
                      <Badge variant="outline" className="px-1 py-0.5 text-xs shrink-0">
                        {sessionStats.totalWords || sessionStats.wordsLearned || 0}/{SESSION_SIZE}
                      </Badge>
                      <Badge variant="outline" className="px-1 py-0.5 text-xs shrink-0">
                        {safeAccuracy}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="controls-row flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  {/* Difficulty Adjustment Badge - Mobile Responsive */}
                  {difficultyAdjustment !== "maintain" && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-50 text-orange-700 border-orange-300 whitespace-nowrap"
                    >
                      <span className="sm:hidden">
                        {difficultyAdjustment === "increase" ? "⬆️" : "⬇️"}
                      </span>
                      <span className="hidden sm:inline">
                        {difficultyAdjustment === "increase"
                          ? "⬆️ Harder"
                          : "⬇️ Easier"}
                      </span>
                    </Badge>
                  )}

                  {/* 📊 Chart Icon - Stats/insights button - Mobile Enhanced */}
                  {setShowAIInsights && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleInsightsToggle}
                      className="h-7 w-7 sm:h-8 sm:w-8 p-0 sm:px-2 touch-manipulation"
                      aria-label="View AI insights"
                    >
                      <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  )}

                  {/* Settings Button - Mobile Enhanced */}
                  {setShowAISettings && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSettingsToggle}
                      className="h-7 sm:h-8 px-1.5 sm:px-2 touch-manipulation"
                    >
                      <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                      <span className="hidden sm:inline text-xs">Settings</span>
                    </Button>
                  )}

                  {/* AI On - Blue toggle button - Mobile Enhanced */}
                  <Button
                    variant={globalAIEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={handleAIToggle}
                    className={cn(
                      "h-7 sm:h-8 px-2 sm:px-3 touch-manipulation",
                      globalAIEnabled
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-blue-300 text-blue-600 hover:bg-blue-50",
                    )}
                  >
                    <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="text-xs sm:text-sm">
                      <span className="sm:hidden">{globalAIEnabled ? "On" : "Off"}</span>
                      <span className="hidden sm:inline">{globalAIEnabled ? "AI On" : "AI Off"}</span>
                    </span>
                  </Button>
                </div>
              </div>

              {/* Error Alert - Mobile Enhanced */}
              {showErrorAlert && aiStatus === "error" && aiErrorMessage && (
                <Alert className="mt-3 border-red-200 bg-red-50">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span>
                        <strong>AI Issue:</strong> {aiErrorMessage}
                      </span>
                      {onRetryAI && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={onRetryAI}
                          className="p-0 h-auto text-red-700 underline self-start sm:ml-2"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Original children content */}
        {children}
      </CardContent>
    );
  },
);

AICardContent.displayName = "AICardContent";

// Export component and types
export { AICardContent as default };
export type { ExtendedAICardContentProps };
