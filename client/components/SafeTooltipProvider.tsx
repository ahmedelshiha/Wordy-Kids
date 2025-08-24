import React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

interface SafeTooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
}

/**
 * Safe wrapper for Radix UI TooltipProvider that handles React context issues
 */
export const SafeTooltipProvider: React.FC<SafeTooltipProviderProps> = ({
  children,
  delayDuration = 300,
  skipDelayDuration = 300,
  disableHoverableContent = false,
}) => {
  // Check if React context is available before rendering
  if (typeof React.useState !== "function") {
    console.warn(
      "React context not available, rendering children without tooltip provider",
    );
    return <>{children}</>;
  }

  try {
    return (
      <TooltipPrimitive.Provider
        delayDuration={delayDuration}
        skipDelayDuration={skipDelayDuration}
        disableHoverableContent={disableHoverableContent}
      >
        {children}
      </TooltipPrimitive.Provider>
    );
  } catch (error) {
    console.error("TooltipProvider error:", error);
    // Fallback to rendering children without tooltip provider
    return <>{children}</>;
  }
};

export default SafeTooltipProvider;
