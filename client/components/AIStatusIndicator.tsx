import React from "react";
import { cn } from "@/lib/utils";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AIStatus = "active" | "loading" | "error" | "disabled" | "fallback";

export interface AIStatusIndicatorProps {
  status: AIStatus;
  confidence?: number;
  error?: string;
  onRetry?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  showConfidence?: boolean;
}

const statusConfig = {
  active: {
    icon: Brain,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    label: "AI Active",
    description: "AI system is working optimally",
  },
  loading: {
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    label: "AI Loading",
    description: "AI system is initializing...",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    label: "AI Error",
    description: "AI system encountered an issue",
  },
  disabled: {
    icon: WifiOff,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    label: "AI Disabled",
    description: "AI features are turned off",
  },
  fallback: {
    icon: Wifi,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    label: "Fallback Mode",
    description: "Using basic features while AI recovers",
  },
};

const sizeConfig = {
  sm: {
    icon: "w-3 h-3",
    container: "px-2 py-1",
    text: "text-xs",
    badge: "text-xs px-1.5 py-0.5",
  },
  md: {
    icon: "w-4 h-4",
    container: "px-3 py-2",
    text: "text-sm",
    badge: "text-xs px-2 py-1",
  },
  lg: {
    icon: "w-5 h-5",
    container: "px-4 py-3",
    text: "text-base",
    badge: "text-sm px-3 py-1.5",
  },
};

export function AIStatusIndicator({
  status,
  confidence,
  error,
  onRetry,
  className,
  size = "md",
  showText = true,
  showConfidence = false,
}: AIStatusIndicatorProps) {
  const config = statusConfig[status];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return "bg-green-500";
    if (conf >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "High";
    if (conf >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg border transition-all duration-200",
              config.bgColor,
              config.borderColor,
              sizes.container,
              className,
            )}
          >
            {/* Status Icon */}
            <Icon
              className={cn(
                sizes.icon,
                config.color,
                status === "loading" && "animate-spin",
              )}
            />

            {/* Status Text */}
            {showText && (
              <span className={cn("font-medium", config.color, sizes.text)}>
                {config.label}
              </span>
            )}

            {/* Confidence Badge */}
            {showConfidence &&
              confidence !== undefined &&
              status === "active" && (
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-1",
                    sizes.badge,
                    getConfidenceColor(confidence),
                    "text-white",
                  )}
                >
                  {getConfidenceLabel(confidence)} (
                  {Math.round(confidence * 100)}%)
                </Badge>
              )}

            {/* Retry Button for Errors */}
            {status === "error" && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className={cn("h-auto p-1", sizes.text)}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{config.description}</p>
            {error && status === "error" && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            {confidence !== undefined && status === "active" && (
              <p className="text-xs">
                AI Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
            {onRetry && status === "error" && (
              <p className="text-xs text-blue-600">Click retry to reconnect</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for mobile/small spaces
export function AIStatusDot({
  status,
  className,
}: {
  status: AIStatus;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              status === "active" && "bg-green-500",
              status === "loading" && "bg-blue-500 animate-pulse",
              status === "error" && "bg-red-500",
              status === "disabled" && "bg-gray-400",
              status === "fallback" && "bg-yellow-500",
              className,
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Enhanced status with detailed metrics
export function AIStatusCard({
  status,
  confidence,
  error,
  onRetry,
  metrics,
  className,
}: AIStatusIndicatorProps & {
  metrics?: {
    wordsRecommended?: number;
    sessionsTracked?: number;
    accuracyImprovement?: number;
  };
}) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200",
        config.bgColor,
        config.borderColor,
        className,
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              "w-5 h-5",
              config.color,
              status === "loading" && "animate-spin",
            )}
          />
          <div>
            <h3 className={cn("font-semibold", config.color)}>
              {config.label}
            </h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>

        {status === "error" && onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {/* Error Details */}
      {error && status === "error" && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* AI Metrics */}
      {status === "active" && metrics && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          {confidence !== undefined && (
            <div>
              <span className="text-gray-600">Confidence:</span>
              <span className={cn("ml-2 font-medium", config.color)}>
                {Math.round(confidence * 100)}%
              </span>
            </div>
          )}
          {metrics.wordsRecommended !== undefined && (
            <div>
              <span className="text-gray-600">Words:</span>
              <span className={cn("ml-2 font-medium", config.color)}>
                {metrics.wordsRecommended}
              </span>
            </div>
          )}
          {metrics.sessionsTracked !== undefined && (
            <div>
              <span className="text-gray-600">Sessions:</span>
              <span className={cn("ml-2 font-medium", config.color)}>
                {metrics.sessionsTracked}
              </span>
            </div>
          )}
          {metrics.accuracyImprovement !== undefined && (
            <div>
              <span className="text-gray-600">Improvement:</span>
              <span className={cn("ml-2 font-medium", config.color)}>
                +{metrics.accuracyImprovement}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
