import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";
import { useMobileDevice, triggerHapticFeedback } from "@/hooks/use-mobile-device";

interface EnhancedSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showTooltip?: boolean;
  tooltipFormatter?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "jungle" | "success" | "warning";
  hapticFeedback?: boolean;
}

const EnhancedSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  EnhancedSliderProps
>(({ 
  className, 
  showTooltip = true, 
  tooltipFormatter,
  size = "md",
  variant = "jungle",
  hapticFeedback = true,
  onValueChange,
  ...props 
}, ref) => {
  const { isMobile, hasHaptic } = useMobileDevice();
  const [isDragging, setIsDragging] = React.useState(false);
  const [currentValue, setCurrentValue] = React.useState(props.value?.[0] || props.defaultValue?.[0] || 0);

  // Size variants
  const sizeClasses = {
    sm: {
      track: "h-2",
      thumb: "h-4 w-4",
      container: isMobile ? "h-8" : "h-6"
    },
    md: {
      track: "h-3",
      thumb: "h-6 w-6",
      container: isMobile ? "h-10" : "h-8"
    },
    lg: {
      track: "h-4",
      thumb: "h-8 w-8",
      container: isMobile ? "h-12" : "h-10"
    }
  };

  // Color variants
  const variantClasses = {
    default: {
      track: "bg-secondary",
      range: "bg-primary",
      thumb: "border-primary bg-background"
    },
    jungle: {
      track: "bg-green-100",
      range: "bg-gradient-to-r from-green-500 to-green-600",
      thumb: "border-green-500 bg-white shadow-green-200"
    },
    success: {
      track: "bg-emerald-100",
      range: "bg-gradient-to-r from-emerald-500 to-emerald-600",
      thumb: "border-emerald-500 bg-white shadow-emerald-200"
    },
    warning: {
      track: "bg-amber-100",
      range: "bg-gradient-to-r from-amber-500 to-amber-600",
      thumb: "border-amber-500 bg-white shadow-amber-200"
    }
  };

  const sizeConfig = sizeClasses[size];
  const colorConfig = variantClasses[variant];

  const handleValueChange = (value: number[]) => {
    const newValue = value[0];
    setCurrentValue(newValue);
    
    // Trigger haptic feedback on mobile
    if (hapticFeedback && hasHaptic && isMobile) {
      triggerHapticFeedback("light");
    }
    
    onValueChange?.(value);
  };

  const formatTooltip = (value: number) => {
    if (tooltipFormatter) {
      return tooltipFormatter(value);
    }
    return String(value);
  };

  return (
    <div className={cn("relative", sizeConfig.container, className)}>
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          "group cursor-pointer",
          props.disabled && "cursor-not-allowed opacity-50"
        )}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        {...props}
      >
        {/* Track */}
        <SliderPrimitive.Track 
          className={cn(
            "relative w-full grow overflow-hidden rounded-full transition-all duration-200",
            sizeConfig.track,
            colorConfig.track,
            "group-hover:shadow-sm",
            isDragging && "shadow-md scale-y-110"
          )}
        >
          {/* Range */}
          <SliderPrimitive.Range
            className={cn(
              "absolute h-full transition-all duration-300 ease-out",
              colorConfig.range,
              "transform-gpu", // Hardware acceleration
              isDragging && "shadow-lg transition-shadow duration-100"
            )}
          />
        </SliderPrimitive.Track>

        {/* Thumb */}
        <SliderPrimitive.Thumb
          className={cn(
            "block rounded-full border-2 ring-offset-background transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2",
            "focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:animate-pulse",
            "disabled:pointer-events-none disabled:opacity-50",
            "hover:scale-110 active:scale-125",
            "shadow-lg hover:shadow-xl active:shadow-2xl",
            "transform-gpu will-change-transform", // Hardware acceleration for smooth animations
            sizeConfig.thumb,
            colorConfig.thumb,
            isDragging && "scale-125 shadow-2xl ring-4 ring-offset-2 animate-none",
            // Enhanced focus styles by variant
            variant === "jungle" && "focus-visible:ring-green-400 focus:ring-green-400",
            variant === "success" && "focus-visible:ring-emerald-400 focus:ring-emerald-400",
            variant === "warning" && "focus-visible:ring-amber-400 focus:ring-amber-400",
            variant === "default" && "focus-visible:ring-blue-400 focus:ring-blue-400"
          )}
        />

        {/* Tooltip */}
        {showTooltip && isDragging && (
          <div 
            className={cn(
              "absolute -top-12 left-1/2 transform -translate-x-1/2",
              "bg-gray-900 text-white text-xs px-2 py-1 rounded",
              "shadow-lg z-10 pointer-events-none",
              "animate-in fade-in-0 zoom-in-95 duration-200"
            )}
            style={{
              left: `${((currentValue - (props.min || 0)) / ((props.max || 100) - (props.min || 0))) * 100}%`
            }}
          >
            {formatTooltip(currentValue)}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900" />
          </div>
        )}
      </SliderPrimitive.Root>

      {/* Mobile: Show current value below */}
      {isMobile && showTooltip && (
        <div className="text-xs text-center text-muted-foreground mt-1">
          {formatTooltip(currentValue)}
        </div>
      )}
    </div>
  );
});

EnhancedSlider.displayName = "EnhancedSlider";

export { EnhancedSlider };
export type { EnhancedSliderProps };
