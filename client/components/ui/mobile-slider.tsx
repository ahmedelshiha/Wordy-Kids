import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const MobileSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      // Enhanced mobile styling
      "h-12 py-4", // Larger touch area
      "cursor-pointer",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-secondary">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb 
      className={cn(
        "block h-7 w-7 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        // Enhanced mobile thumb
        "shadow-lg border-white",
        "active:scale-110 transition-transform duration-150",
        "focus:ring-4 focus:ring-blue-200",
        // Ensure minimum touch target
        "min-h-[44px] min-w-[44px] cursor-grab active:cursor-grabbing",
        // Better visual feedback
        "hover:scale-105"
      )} 
    />
  </SliderPrimitive.Root>
))
MobileSlider.displayName = SliderPrimitive.Root.displayName

export { MobileSlider }
