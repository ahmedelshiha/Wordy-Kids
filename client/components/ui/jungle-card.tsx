import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * JungleCard - Immersive jungle-themed card component
 * Built with accessibility and performance in mind
 * Supports interactive states and semantic tone variants
 */

const jungleCardVariants = cva(
  // Base styles using design tokens
  [
    "relative overflow-hidden",
    "bg-surface border border-border-light",
    "transition-soft motion-safe",
    "focus-within:outline-none focus-within:ring-2 focus-within:ring-jungle-500 focus-within:ring-offset-2",
    // Performance optimizations
    "hardware-accelerate",
  ],
  {
    variants: {
      tone: {
        default: [
          "border-border-light bg-surface",
          "shadow-soft",
        ],
        success: [
          "border-success/30 bg-success-light/20",
          "shadow-soft",
          "[&_.jungle-card-icon]:text-success",
        ],
        warning: [
          "border-warning/30 bg-warning-light/20", 
          "shadow-soft",
          "[&_.jungle-card-icon]:text-warning",
        ],
        danger: [
          "border-danger/30 bg-danger-light/20",
          "shadow-soft", 
          "[&_.jungle-card-icon]:text-danger",
        ],
        info: [
          "border-sky-300/30 bg-sky-100/20",
          "shadow-soft",
          "[&_.jungle-card-icon]:text-sky-600",
        ],
        jungle: [
          "border-jungle-300/30 bg-jungle-100/20",
          "shadow-jungle",
          "[&_.jungle-card-icon]:text-jungle-600",
        ],
        adventure: [
          "bg-gradient-to-br from-jungle-100/50 to-sky-100/50",
          "border-jungle-200",
          "shadow-glow",
          "[&_.jungle-card-icon]:text-jungle-500",
        ],
        magical: [
          "bg-gradient-to-br from-berry-100/30 to-banana-100/30",
          "border-berry-200/50",
          "shadow-soft",
          "[&_.jungle-card-icon]:text-berry-500",
        ],
      },
      size: {
        sm: "p-card-sm rounded-md",
        md: "p-card rounded-lg", 
        lg: "p-card-lg rounded-xl",
        xl: "p-8 rounded-2xl",
      },
      interactive: {
        false: "",
        true: [
          "cursor-pointer",
          "hover:shadow-float hover:scale-[1.01]",
          "active:scale-[0.99]",
          "motion-safe:anim-hover-lift",
        ],
      },
      elevation: {
        flat: "shadow-none",
        low: "shadow-sm",
        medium: "shadow-md",
        high: "shadow-lg",
        floating: "shadow-xl",
      },
      pattern: {
        none: "",
        subtle: [
          "before:absolute before:inset-0",
          "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9ImhzbCh2YXIoLS1jb2xvci1qdW5nbGUtMzAwKSAvIDAuMDUpIi8+PC9zdmc+')] before:opacity-30",
          "before:pointer-events-none",
        ],
        leaves: [
          "before:absolute before:inset-0",
          "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHBhdGggZD0iTTIwIDJDMTUuNTggMiAxMiA1LjU4IDEyIDEwQzEyIDEyLjggMTMuNjcgMTUuMTYgMTYgMTYuNEMxNi42IDE2LjcgMTcuMyAxNi44IDE4IDE2LjhDMTguNyAxNi44IDE5LjQgMTYuNyAyMCAxNi40QzIyLjMzIDE1LjE2IDI0IDEyLjggMjQgMTBDMjQgNS41OCAyMC40MiAyIDIwIDJaIiBmaWxsPSJoc2wodmFyKC0tY29sb3ItanVuZ2xlLTIwMCkgLyAwLjA4KSIvPjwvc3ZnPg==')] before:opacity-20",
          "before:pointer-events-none",
        ],
      },
    },
    defaultVariants: {
      tone: "default",
      size: "md",
      interactive: false,
      elevation: "medium",
      pattern: "none",
    },
  },
);

const jungleCardHeaderVariants = cva([
  "flex flex-col space-y-1.5",
  "pb-4 mb-4",
  "border-b border-border-light/50",
]);

const jungleCardTitleVariants = cva([
  "font-display font-semibold leading-snug tracking-tight",
  "text-text",
], {
  variants: {
    size: {
      sm: "text-base",
      md: "text-lg",
      lg: "text-xl", 
      xl: "text-2xl",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const jungleCardDescriptionVariants = cva([
  "text-sm text-text-muted leading-normal",
]);

const jungleCardContentVariants = cva([
  "text-text leading-normal",
]);

const jungleCardFooterVariants = cva([
  "flex items-center gap-3",
  "pt-4 mt-4",
  "border-t border-border-light/50",
]);

export interface JungleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof jungleCardVariants> {
  asChild?: boolean;
}

export interface JungleCardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof jungleCardHeaderVariants> {}

export interface JungleCardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof jungleCardTitleVariants> {}

export interface JungleCardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof jungleCardDescriptionVariants> {}

export interface JungleCardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof jungleCardContentVariants> {}

export interface JungleCardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof jungleCardFooterVariants> {}

const JungleCard = React.forwardRef<HTMLDivElement, JungleCardProps>(
  ({ className, tone, size, interactive, elevation, pattern, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        jungleCardVariants({
          tone,
          size,
          interactive,
          elevation,
          pattern,
          className,
        }),
      )}
      {...props}
    />
  ),
);
JungleCard.displayName = "JungleCard";

const JungleCardHeader = React.forwardRef<HTMLDivElement, JungleCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(jungleCardHeaderVariants({ className }))}
      {...props}
    />
  ),
);
JungleCardHeader.displayName = "JungleCardHeader";

const JungleCardTitle = React.forwardRef<HTMLParagraphElement, JungleCardTitleProps>(
  ({ className, size, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(jungleCardTitleVariants({ size, className }))}
      {...props}
    />
  ),
);
JungleCardTitle.displayName = "JungleCardTitle";

const JungleCardDescription = React.forwardRef<HTMLParagraphElement, JungleCardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(jungleCardDescriptionVariants({ className }))}
      {...props}
    />
  ),
);
JungleCardDescription.displayName = "JungleCardDescription";

const JungleCardContent = React.forwardRef<HTMLDivElement, JungleCardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(jungleCardContentVariants({ className }))}
      {...props}
    />
  ),
);
JungleCardContent.displayName = "JungleCardContent";

const JungleCardFooter = React.forwardRef<HTMLDivElement, JungleCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(jungleCardFooterVariants({ className }))}
      {...props}
    />
  ),
);
JungleCardFooter.displayName = "JungleCardFooter";

// Icon wrapper for semantic styling
const JungleCardIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("jungle-card-icon flex-shrink-0", className)}
      {...props}
    />
  ),
);
JungleCardIcon.displayName = "JungleCardIcon";

export {
  JungleCard,
  JungleCardHeader,
  JungleCardFooter,
  JungleCardTitle,
  JungleCardDescription,
  JungleCardContent,
  JungleCardIcon,
  jungleCardVariants,
};

/* ========================================
 * USAGE EXAMPLES
 * ======================================== */

/*
// Basic card
<JungleCard tone="default" size="md">
  <JungleCardHeader>
    <JungleCardTitle>Adventure Awaits</JungleCardTitle>
    <JungleCardDescription>
      Explore the magical world of words
    </JungleCardDescription>
  </JungleCardHeader>
  <JungleCardContent>
    <p>Your jungle learning journey starts here!</p>
  </JungleCardContent>
  <JungleCardFooter>
    <AdventureButton intent="primary" size="sm">
      Start Learning
    </AdventureButton>
  </JungleCardFooter>
</JungleCard>

// Interactive success card with icon
<JungleCard 
  tone="success" 
  size="lg" 
  interactive={true}
  elevation="high"
  pattern="subtle"
>
  <JungleCardHeader>
    <div className="flex items-center gap-3">
      <JungleCardIcon>
        <CheckCircleIcon className="w-6 h-6" />
      </JungleCardIcon>
      <JungleCardTitle size="lg">Well Done!</JungleCardTitle>
    </div>
    <JungleCardDescription>
      You've completed all words in this category.
    </JungleCardDescription>
  </JungleCardHeader>
  <JungleCardContent>
    <div className="space-y-2">
      <div className="text-success font-semibold">🎉 Achievement Unlocked</div>
      <p className="text-sm">Words mastered: 25/25</p>
    </div>
  </JungleCardContent>
</JungleCard>

// Magical adventure card
<JungleCard 
  tone="magical" 
  size="xl" 
  interactive={true}
  elevation="floating"
  pattern="leaves"
>
  <JungleCardHeader>
    <JungleCardTitle size="xl">🌟 Magical Quest</JungleCardTitle>
    <JungleCardDescription>
      Embark on an enchanted word adventure
    </JungleCardDescription>
  </JungleCardHeader>
  <JungleCardContent>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-berry-600">50</div>
        <div className="text-sm text-text-muted">Magic Words</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-banana-600">3</div>
        <div className="text-sm text-text-muted">Levels</div>
      </div>
    </div>
  </JungleCardContent>
  <JungleCardFooter>
    <AdventureButton intent="fun" size="lg" roundness="full">
      Begin Quest
    </AdventureButton>
  </JungleCardFooter>
</JungleCard>

// Warning card
<JungleCard tone="warning" size="sm" elevation="low">
  <JungleCardHeader>
    <div className="flex items-center gap-2">
      <JungleCardIcon>
        <AlertTriangleIcon className="w-5 h-5" />
      </JungleCardIcon>
      <JungleCardTitle size="sm">Practice Needed</JungleCardTitle>
    </div>
  </JungleCardHeader>
  <JungleCardContent>
    <p className="text-sm">Some words need more practice to master.</p>
  </JungleCardContent>
</JungleCard>
*/
