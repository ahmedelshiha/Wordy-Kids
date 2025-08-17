import * as React from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { CardContent } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Card } from "./card";
import { Alert, AlertDescription } from "./alert";
import { Brain, BarChart3, Settings, AlertTriangle } from "lucide-react";
import { AICardContentProps } from "./ai-card-types";

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
}, ref) => {

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

  return (
    <CardContent ref={ref} className={cn(className)} {...props}>
      {/* Comprehensive AI Control Header */}
      {enableAIHeader && (
        <Card className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border border-blue-200/60 mb-4">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* AI Status Indicator with Confidence */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Brain
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        aiStatus === "active" ? "text-blue-600" : "text-gray-400",
                        aiStatus === "loading" && "animate-pulse"
                      )}
                    />
                    {aiStatus === "active" && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse" />
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={aiStatus === "active" ? "default" : "secondary"}
                      className={cn(
                        "text-xs px-2 py-1",
                        aiStatus === "active" && "bg-green-100 text-green-800 border-green-300"
                      )}
                    >
                      {aiStatus === "active" && "Active"}
                      {aiStatus === "loading" && "Loading..."}
                      {aiStatus === "error" && "Error"}
                      {aiStatus === "inactive" && "Inactive"}
                    </Badge>
                    
                    {/* Confidence Level Badge */}
                    {aiStatus === "active" && (
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-300">
                        Medium ({Math.round(confidenceLevel * 100)}%)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                {aiStatus === "active" && showQuickStats && (
                  <div className="hidden sm:flex items-center gap-4 text-xs">
                    {/* Session Progress Counter */}
                    <div className="text-center">
                      <div className="font-semibold text-blue-600">
                        {sessionStats.totalWords || sessionStats.wordsLearned || 0}/{SESSION_SIZE}
                      </div>
                      <div className="text-gray-600">Progress</div>
                    </div>
                    
                    {/* Accuracy Percentage */}
                    <div className="text-center">
                      <div className="font-semibold text-green-600">
                        {sessionStats.accuracy}%
                      </div>
                      <div className="text-gray-600">Accuracy</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Difficulty Adjustment Badge */}
                {difficultyAdjustment !== "maintain" && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-1 bg-orange-50 text-orange-700 border-orange-300"
                  >
                    {difficultyAdjustment === "increase" ? "⬆️ Harder" : "⬇️ Easier"}
                  </Badge>
                )}

                {/* 📊 Chart Icon - Stats/insights button */}
                {setShowAIInsights && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleInsightsToggle}
                    className="h-8 px-2"
                    aria-label="View AI insights"
                  >
                    📊
                  </Button>
                )}

                {/* Settings Button */}
                {setShowAISettings && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSettingsToggle}
                    className="h-8 px-2"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Settings</span>
                  </Button>
                )}

                {/* AI On - Blue toggle button (top-right style) */}
                <Button
                  variant={globalAIEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={handleAIToggle}
                  className={cn(
                    "h-8 px-3",
                    globalAIEnabled
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "border-blue-300 text-blue-600 hover:bg-blue-50",
                  )}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  <span className="text-xs">
                    {globalAIEnabled ? "AI On" : "AI Off"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Error Alert */}
            {showErrorAlert && aiStatus === "error" && aiErrorMessage && (
              <Alert className="mt-3 border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-sm">
                  <strong>AI Issue:</strong> {aiErrorMessage}
                  {onRetryAI && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={onRetryAI}
                      className="ml-2 p-0 h-auto text-red-700 underline"
                    >
                      Retry
                    </Button>
                  )}
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
});

AICardContent.displayName = "AICardContent";

// Export component and types
export { AICardContent as default };
export type { ExtendedAICardContentProps };
