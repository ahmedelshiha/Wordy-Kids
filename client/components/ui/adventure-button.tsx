import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * AdventureButton - Jungle Adventure themed button component
 * Built with accessibility-first design and motion-safe animations
 * Supports reduced-motion and high-contrast preferences
 */

const adventureButtonVariants = cva(
  // Base styles using design tokens
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-display font-semibold text-sm leading-tight",
    "rounded-lg shadow-soft border-0",
    "transition-soft motion-safe",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-jungle-500",
    "disabled:pointer-events-none disabled:opacity-50",
    "touch-manipulation", // Better mobile interaction
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Hardware acceleration for smooth animations
    "will-change-transform backface-hidden",
  ],
  {
    variants: {
      intent: {
        // Primary jungle theme
        primary: [
          "bg-jungle-500 text-text-inverse",
          "hover:bg-jungle-600 hover:shadow-float hover:scale-[1.02]",
          "active:bg-jungle-700 active:scale-[0.98]",
          "motion-safe:anim-hover-lift",
        ],
        // Banana yellow secondary
        secondary: [
          "bg-banana-500 text-text border border-banana-600/20",
          "hover:bg-banana-600 hover:shadow-float hover:scale-[1.02]",
          "active:bg-banana-600 active:scale-[0.98]",
          "motion-safe:anim-hover-lift",
        ],
        // Sky blue accent
        accent: [
          "bg-sky-500 text-text-inverse",
          "hover:bg-sky-600 hover:shadow-float hover:scale-[1.02]",
          "active:bg-sky-700 active:scale-[0.98]",
          "motion-safe:anim-hover-lift",
        ],
        // Berry fun variant
        fun: [
          "bg-berry-500 text-text-inverse",
          "hover:bg-berry-600 hover:shadow-float hover:scale-[1.02]",
          "active:bg-berry-700 active:scale-[0.98]",
          "motion-safe:anim-hover-lift",
        ],
        // Wood natural variant
        natural: [
          "bg-wood-500 text-text-inverse",
          "hover:bg-wood-600 hover:shadow-float hover:scale-[1.02]",
          "active:bg-wood-700 active:scale-[0.98]",
          "motion-safe:anim-hover-lift",
        ],
        // Ghost variant with jungle accent
        ghost: [
          "bg-transparent text-jungle-600 border border-jungle-300",
          "hover:bg-jungle-100 hover:text-jungle-700 hover:border-jungle-400",
          "active:bg-jungle-200",
        ],
        // Outline variant
        outline: [
          "bg-surface border-2 border-jungle-500 text-jungle-600",
          "hover:bg-jungle-500 hover:text-text-inverse hover:shadow-jungle",
          "active:bg-jungle-600",
        ],
        // Success state
        success: [
          "bg-success text-text-inverse",
          "hover:bg-success/90 hover:shadow-float",
          "active:bg-success/80",
        ],
        // Warning state
        warning: [
          "bg-warning text-text",
          "hover:bg-warning/90 hover:shadow-float",
          "active:bg-warning/80",
        ],
        // Danger state
        danger: [
          "bg-danger text-text-inverse",
          "hover:bg-danger/90 hover:shadow-float",
          "active:bg-danger/80",
        ],
      },
      size: {
        xs: "h-btn-h-xs px-3 text-xs rounded-md",
        sm: "h-btn-h-sm px-4 text-sm rounded-md",
        md: "h-btn-h-md px-6 text-sm",
        lg: "h-btn-h-lg px-8 text-base",
        xl: "h-btn-h-xl px-10 text-lg",
        icon: "h-btn-h-md w-btn-h-md p-0",
        "icon-sm": "h-btn-h-sm w-btn-h-sm p-0",
        "icon-lg": "h-btn-h-lg w-btn-h-lg p-0",
      },
      roundness: {
        default: "",
        full: "rounded-full",
        square: "rounded-md",
      },
      glow: {
        none: "",
        soft: "shadow-glow",
        jungle: "shadow-jungle",
      },
      animation: {
        none: "",
        subtle: "motion-safe:anim-breath",
        float: "motion-safe:anim-float",
        wiggle: "motion-safe:hover:anim-wiggle",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
      roundness: "default",
      glow: "none",
      animation: "none",
    },
  },
);

export interface AdventureButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof adventureButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const AdventureButton = React.forwardRef<
  HTMLButtonElement,
  AdventureButtonProps
>(
  (
    {
      className,
      intent,
      size,
      roundness,
      glow,
      animation,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          adventureButtonVariants({
            intent,
            size,
            roundness,
            glow,
            animation,
            className,
          }),
        )}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  },
);

AdventureButton.displayName = "AdventureButton";

export { AdventureButton, adventureButtonVariants };
export type { AdventureButtonProps };

/* ========================================
 * USAGE EXAMPLES
 * ======================================== */

/*
// Basic usage
<AdventureButton intent="primary" size="md">
  Start Adventure
</AdventureButton>

// With icons
<AdventureButton 
  intent="secondary" 
  size="lg"
  leftIcon={<MapIcon />}
  rightIcon={<ArrowRightIcon />}
>
  Explore Jungle
</AdventureButton>

// Loading state
<AdventureButton 
  intent="primary" 
  loading={true}
>
  Loading...
</AdventureButton>

// Fun animated button
<AdventureButton 
  intent="fun" 
  size="lg"
  roundness="full"
  glow="jungle"
  animation="float"
>
  🎉 Celebrate!
</AdventureButton>

// Icon-only button
<AdventureButton 
  intent="ghost" 
  size="icon"
  aria-label="Settings"
>
  <SettingsIcon />
</AdventureButton>

// Outline success button
<AdventureButton 
  intent="outline" 
  size="sm"
  glow="soft"
>
  ✅ Complete
</AdventureButton>
*/
