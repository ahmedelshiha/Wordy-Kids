import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const enhancedBadgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Jungle Adventure Variants
        jungle: "border-transparent bg-gradient-to-r from-jungle-green to-jungle-light text-white hover:from-jungle-dark hover:to-jungle-green shadow-lg hover:shadow-xl transform hover:scale-105",
        safari: "border-transparent bg-gradient-to-r from-sunshine-yellow to-sunshine-light text-jungle-dark hover:from-sunshine-dark hover:to-sunshine-yellow shadow-lg hover:shadow-xl transform hover:scale-105",
        explorer: "border-transparent bg-gradient-to-r from-sky-blue to-sky-light text-white hover:from-sky-dark hover:to-sky-blue shadow-lg hover:shadow-xl transform hover:scale-105",
        adventure: "border-transparent bg-gradient-to-r from-playful-purple to-coral-red text-white hover:opacity-90 shadow-lg hover:shadow-xl transform hover:scale-105",
        // Achievement Rarity Variants
        bronze: "border-2 border-amber-400 bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg animate-gentle-bounce",
        silver: "border-2 border-gray-400 bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg animate-gentle-float",
        gold: "border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-xl animate-jungle-glow",
        diamond: "border-2 border-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-2xl animate-jungle-sparkle",
        legendary: "border-2 border-purple-400 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white shadow-2xl animate-jungle-celebration",
        // Activity Variants
        learning: "border-transparent bg-gradient-to-r from-educational-blue to-educational-purple text-white hover:scale-105 transition-transform",
        streak: "border-transparent bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 transition-transform animate-pulse",
        quiz: "border-transparent bg-gradient-to-r from-educational-green to-educational-blue text-white hover:scale-105 transition-transform",
        exploration: "border-transparent bg-gradient-to-r from-educational-purple to-educational-pink text-white hover:scale-105 transition-transform",
        // Progress Variants
        completed: "border-transparent bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg",
        inProgress: "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md animate-pulse",
        locked: "border-2 border-dashed border-gray-300 bg-gray-100 text-gray-500",
        // Special Variants
        newUnlock: "border-2 border-yellow-400 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl animate-bounce",
        perfectScore: "border-2 border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl animate-jungle-sparkle",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
        adventure: "px-4 py-2 text-sm font-bold",
      },
      glow: {
        none: "",
        soft: "filter drop-shadow(0 0 8px currentColor) opacity-90",
        bright: "filter drop-shadow(0 0 12px currentColor)",
        intense: "filter drop-shadow(0 0 16px currentColor) brightness(110%)",
      },
      animation: {
        none: "",
        pulse: "animate-pulse",
        bounce: "animate-bounce",
        sparkle: "animate-jungle-sparkle",
        float: "animate-jungle-float",
        glow: "animate-jungle-glow",
        celebration: "animate-jungle-celebration",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
      animation: "none",
    },
  },
);

export interface EnhancedBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof enhancedBadgeVariants> {
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  gradient?: boolean;
  sparkle?: boolean;
  jungle?: boolean;
  achievement?: boolean;
  progress?: number; // 0-100 for progress badges
  tooltip?: string;
}

const EnhancedBadge = React.forwardRef<HTMLDivElement, EnhancedBadgeProps>(
  (
    {
      className,
      variant,
      size,
      glow,
      animation,
      icon,
      rightIcon,
      gradient,
      sparkle,
      jungle,
      achievement,
      progress,
      tooltip,
      children,
      ...props
    },
    ref,
  ) => {
    const badgeClasses = cn(
      enhancedBadgeVariants({ variant, size, glow, animation }),
      // Add jungle theme classes if enabled
      jungle && "jungle-adventure-badge",
      // Add achievement classes if it's an achievement badge
      achievement && "achievement-badge",
      // Add gradient effect
      gradient && "bg-gradient-to-r",
      // Add sparkle effect
      sparkle && "jungle-sparkle-effect",
      className,
    );

    const content = (
      <div className={badgeClasses} title={tooltip} {...props} ref={ref}>
        {/* Sparkle particles for special badges */}
        {sparkle && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-1 h-1 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-200"></div>
            <div className="absolute bottom-0 left-1 w-1 h-1 bg-white rounded-full animate-ping animation-delay-400"></div>
          </div>
        )}

        {/* Progress bar for progress badges */}
        {typeof progress === "number" && (
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/20 transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 flex items-center gap-1">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </div>

        {/* Jungle adventure border effect */}
        {jungle && (
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
        )}
      </div>
    );

    return content;
  },
);

EnhancedBadge.displayName = "EnhancedBadge";

// Predefined jungle adventure badges
export const JungleBadges = {
  Explorer: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="explorer"
      icon="🗺️"
      jungle
      sparkle
      tooltip="Adventure Explorer Badge"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  SafariGuide: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="safari"
      icon="🦁"
      jungle
      animation="float"
      tooltip="Safari Guide Badge"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  JungleHero: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="jungle"
      icon="🌿"
      jungle
      animation="glow"
      tooltip="Jungle Hero Badge"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  AdventureMaster: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="adventure"
      icon="👑"
      jungle
      sparkle
      animation="celebration"
      tooltip="Adventure Master Badge"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  // Achievement rarity badges
  Bronze: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="bronze"
      icon="🥉"
      achievement
      tooltip="Bronze Achievement"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  Silver: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="silver"
      icon="🥈"
      achievement
      animation="float"
      tooltip="Silver Achievement"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  Gold: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="gold"
      icon="🥇"
      achievement
      animation="glow"
      tooltip="Gold Achievement"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  Diamond: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="diamond"
      icon="💎"
      achievement
      sparkle
      animation="sparkle"
      tooltip="Diamond Achievement"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  Legendary: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="legendary"
      icon="⭐"
      achievement
      sparkle
      animation="celebration"
      glow="bright"
      tooltip="Legendary Achievement"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  // Progress badges
  Progress: ({ progress = 0, children, ...props }: EnhancedBadgeProps) => (
    <EnhancedBadge
      variant="inProgress"
      progress={progress}
      tooltip={`Progress: ${progress}%`}
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  Completed: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="completed"
      icon="✅"
      tooltip="Completed!"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  NewUnlock: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="newUnlock"
      icon="🎉"
      sparkle
      animation="bounce"
      glow="bright"
      tooltip="Newly Unlocked!"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
  
  PerfectScore: ({ children, ...props }: Omit<EnhancedBadgeProps, "variant">) => (
    <EnhancedBadge
      variant="perfectScore"
      icon="✨"
      sparkle
      animation="sparkle"
      glow="intense"
      tooltip="Perfect Score!"
      {...props}
    >
      {children}
    </EnhancedBadge>
  ),
};

export { EnhancedBadge, enhancedBadgeVariants };
export default EnhancedBadge;
