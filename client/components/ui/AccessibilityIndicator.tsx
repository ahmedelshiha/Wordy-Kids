/**
 * 🚫 Accessibility Indicator Component
 * Visual badge overlay for accessibility modes (e.g., reduced motion)
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { detectReducedMotion } from "@/lib/theme/animation";

interface AccessibilityIndicatorProps {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showReducedMotion?: boolean;
  showForcedMode?: boolean;
}

export const AccessibilityIndicator: React.FC<AccessibilityIndicatorProps> = ({
  className,
  position = "top-right",
  showReducedMotion = true,
  showForcedMode = false,
}) => {
  // Only show in development or when accessibility modes are active
  const isReducedMotion = detectReducedMotion();
  const isDevelopment = process.env.NODE_ENV === "development";

  // Don't show if no accessibility modes are active and not in development
  if (!isReducedMotion && !showForcedMode && !isDevelopment) {
    return null;
  }

  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  };

  const indicators = [];

  // System reduced motion preference
  if (isReducedMotion && showReducedMotion) {
    indicators.push({
      key: "reduced-motion",
      icon: "🚫",
      label: "Reduced Motion",
      description: "System preference detected",
      variant: "secondary" as const,
      priority: 1,
    });
  }

  // Forced reduced motion mode (for testing)
  if (showForcedMode) {
    indicators.push({
      key: "forced-motion",
      icon: "🔒",
      label: "Motion Locked",
      description: "Forced reduced motion for testing",
      variant: "destructive" as const,
      priority: 2,
    });
  }

  // Development accessibility testing mode
  if (isDevelopment && (isReducedMotion || showForcedMode)) {
    indicators.push({
      key: "dev-a11y",
      icon: "🧪",
      label: "A11y Test",
      description: "Accessibility testing active",
      variant: "outline" as const,
      priority: 3,
    });
  }

  if (indicators.length === 0) {
    return null;
  }

  // Sort by priority (lower number = higher priority)
  indicators.sort((a, b) => a.priority - b.priority);

  return (
    <div
      className={cn(
        "fixed z-50 pointer-events-none",
        positionClasses[position],
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Accessibility status indicators"
    >
      <div className="flex flex-col gap-2">
        {indicators.map((indicator) => (
          <Badge
            key={indicator.key}
            variant={indicator.variant}
            className={cn(
              "text-xs shadow-lg backdrop-blur-sm",
              "flex items-center gap-1 pointer-events-auto",
              indicator.variant === "destructive" && "animate-pulse",
            )}
            title={indicator.description}
          >
            <span className="text-sm">{indicator.icon}</span>
            <span className="font-medium">{indicator.label}</span>
          </Badge>
        ))}
      </div>
    </div>
  );
};

// 🎯 Specialized Reduced Motion Indicator
export const ReducedMotionIndicator: React.FC<{
  className?: string;
  forced?: boolean;
}> = ({ className, forced = false }) => (
  <AccessibilityIndicator
    className={className}
    position="top-right"
    showReducedMotion={true}
    showForcedMode={forced}
  />
);

// 🧪 Development Accessibility Testing Indicator
export const DevAccessibilityIndicator: React.FC<{
  className?: string;
  reducedMotion?: boolean;
  forcedMode?: boolean;
}> = ({ className, reducedMotion = true, forcedMode = false }) => {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <AccessibilityIndicator
      className={className}
      position="bottom-left"
      showReducedMotion={reducedMotion}
      showForcedMode={forcedMode}
    />
  );
};

export default AccessibilityIndicator;
