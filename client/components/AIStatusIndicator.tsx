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
    description: "AI system encountered an error",
  },
  disabled: {
    icon: WifiOff,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-200",
    label: "AI Disabled",
    description: "AI features are disabled",
  },
  fallback: {
    icon: Wifi,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    label: "AI Fallback",
    description: "Using standard mode instead of AI",
  },
};

const sizeConfig = {
  sm: {
    container: "px-2 py-1",
    icon: "w-3 h-3",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-1.5",
    icon: "w-4 h-4",
    text: "text-sm",
  },
  lg: {
    container: "px-4 py-2",
    icon: "w-5 h-5",
    text: "text-base",
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

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "High";
    if (conf >= 0.6) return "Medium";
    return "Low";
  };

  return (
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
            {showConfidence && confidence !== undefined && status === "active" && (
              <Badge
                variant="outline"
                className={cn("text-xs", config.color, config.borderColor)}
              >
                {Math.round(confidence * 100)}%
              </Badge>
            )}

            {/* Retry Button for Error State */}
            {status === "error" && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className={cn("h-auto p-1", config.color)}
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="font-semibold">{config.label}</div>
            <div className="text-muted-foreground">{config.description}</div>
            {confidence !== undefined && status === "active" && (
              <div className="mt-1">
                Confidence: {getConfidenceLabel(confidence)} (
                {Math.round(confidence * 100)}%)
              </div>
            )}
            {error && status === "error" && (
              <div className="mt-1 text-red-400">{error}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
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
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "w-3 h-3 rounded-full border-2 transition-all duration-200",
              config.bgColor,
              config.borderColor,
              className,
            )}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
  );
}
