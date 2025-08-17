import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

/**
 * Safe tooltip wrapper that doesn't create nested TooltipProviders
 * Use this instead of wrapping individual components with TooltipProvider
 */
export interface SafeTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  disabled?: boolean;
}

export function SafeTooltip({ 
  children, 
  content, 
  side = "top", 
  className,
  disabled = false 
}: SafeTooltipProps) {
  if (disabled) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
