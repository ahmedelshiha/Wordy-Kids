import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * ProgressVine - Jungle-themed progress bar styled as a growing vine
 * Includes milestone markers as leaves with accessibility support
 * Respects reduced-motion preferences
 */

const progressVineVariants = cva(
  [
    "relative w-full bg-wood-200 overflow-hidden",
    "transition-soft",
  ],
  {
    variants: {
      size: {
        sm: "h-2 rounded-sm",
        md: "h-3 rounded-md",
        lg: "h-4 rounded-lg",
        xl: "h-6 rounded-xl",
      },
      variant: {
        default: [
          "bg-wood-200",
          "[&_.progress-vine-fill]:bg-jungle-500",
          "[&_.progress-vine-fill]:bg-gradient-to-r [&_.progress-vine-fill]:from-jungle-400 [&_.progress-vine-fill]:to-jungle-600",
        ],
        colorful: [
          "bg-wood-200", 
          "[&_.progress-vine-fill]:bg-gradient-to-r [&_.progress-vine-fill]:from-jungle-400 [&_.progress-vine-fill]:via-banana-400 [&_.progress-vine-fill]:to-sky-400",
        ],
        adventure: [
          "bg-wood-200",
          "[&_.progress-vine-fill]:bg-gradient-to-r [&_.progress-vine-fill]:from-berry-400 [&_.progress-vine-fill]:via-jungle-400 [&_.progress-vine-fill]:to-banana-400",
        ],
        success: [
          "bg-wood-200",
          "[&_.progress-vine-fill]:bg-success",
        ],
        warning: [
          "bg-wood-200", 
          "[&_.progress-vine-fill]:bg-warning",
        ],
        danger: [
          "bg-wood-200",
          "[&_.progress-vine-fill]:bg-danger",
        ],
      },
      texture: {
        smooth: "",
        bark: [
          "bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJoc2wodmFyKC0tY29sb3Itd29vZC0yMDApKSIvPiA8cGF0aCBkPSJNMCAwTDIwIDIwTTIwIDBMMCAyMCIgc3Ryb2tlPSJoc2wodmFyKC0tY29sb3Itd29vZC0zMDApIC8gMC4zKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')]",
          "[&_.progress-vine-fill]:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJoc2wodmFyKC0tY29sb3ItanVuZ2xlLTUwMCkpIi8+IDxwYXRoIGQ9Ik0wIDVMMjAgMTVNMTAgMEwxMCAyMCIgc3Ryb2tlPSJoc2wodmFyKC0tY29sb3ItanVuZ2xlLTYwMCkgLyAwLjQpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4')]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
      texture: "smooth",
    },
  },
);

const progressVineFillVariants = cva([
  "progress-vine-fill h-full transition-all duration-slow ease-out",
  "relative overflow-hidden",
  "motion-safe:anim-progress",
  "transform-origin-left",
]);

const progressVineLeafVariants = cva([
  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
  "text-jungle-600 transition-soft",
  "motion-safe:anim-float",
  "z-10",
], {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm", 
      lg: "text-base",
      xl: "text-lg",
    },
    state: {
      upcoming: "opacity-30 text-wood-400",
      current: "opacity-100 text-jungle-500 motion-safe:anim-wiggle",
      completed: "opacity-100 text-success",
    },
  },
  defaultVariants: {
    size: "md",
    state: "upcoming",
  },
});

export interface Milestone {
  id: string;
  position: number; // 0-100 percentage
  label: string;
  icon?: string;
  completed?: boolean;
  current?: boolean;
}

export interface ProgressVineProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressVineVariants> {
  value: number; // 0-100
  max?: number;
  milestones?: Milestone[];
  showPercentage?: boolean;
  label?: string;
  description?: string;
  animated?: boolean;
}

const ProgressVine = React.forwardRef<HTMLDivElement, ProgressVineProps>(
  (
    {
      className,
      size,
      variant,
      texture,
      value = 0,
      max = 100,
      milestones = [],
      showPercentage = false,
      label,
      description,
      animated = true,
      ...props
    },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const [displayValue, setDisplayValue] = React.useState(0);

    // Animate value changes if animated is true
    React.useEffect(() => {
      if (!animated) {
        setDisplayValue(percentage);
        return;
      }

      const startValue = displayValue;
      const difference = percentage - startValue;
      const duration = 1000; // 1 second
      const steps = 60; // 60fps
      const stepValue = difference / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const newValue = startValue + (stepValue * currentStep);

        if (currentStep >= steps) {
          setDisplayValue(percentage);
          clearInterval(timer);
        } else {
          setDisplayValue(newValue);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [percentage, animated, displayValue]);

    // Accessibility attributes
    const progressId = React.useId();
    const labelId = `${progressId}-label`;
    const descriptionId = `${progressId}-description`;

    return (
      <div className="space-y-2">
        {/* Label and percentage */}
        {(label || showPercentage) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <label id={labelId} className="font-medium text-text">
                {label}
              </label>
            )}
            {showPercentage && (
              <span className="text-text-muted font-semibold">
                {Math.round(displayValue)}%
              </span>
            )}
          </div>
        )}

        {/* Progress vine container */}
        <div
          ref={ref}
          className={cn(progressVineVariants({ size, variant, texture, className }))}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          aria-live="polite"
          {...props}
        >
          {/* Progress fill (the growing vine) */}
          <div
            className={cn(progressVineFillVariants())}
            style={{
              width: `${displayValue}%`,
              transformOrigin: 'left',
            }}
          >
            {/* Animated shimmer effect on fill */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent anim-shimmer" />
          </div>

          {/* Milestone leaves */}
          {milestones.map((milestone) => {
            const leafState = milestone.completed 
              ? 'completed' 
              : milestone.current 
                ? 'current' 
                : 'upcoming';

            return (
              <div
                key={milestone.id}
                className={cn(
                  progressVineLeafVariants({ size, state: leafState }),
                )}
                style={{ left: `${milestone.position}%` }}
                title={milestone.label}
                aria-label={`Milestone: ${milestone.label} at ${milestone.position}%`}
              >
                {milestone.icon || '🍃'}
              </div>
            );
          })}
        </div>

        {/* Description */}
        {description && (
          <p id={descriptionId} className="text-xs text-text-muted">
            {description}
          </p>
        )}
      </div>
    );
  },
);

ProgressVine.displayName = "ProgressVine";

export { ProgressVine, progressVineVariants };

/* ========================================
 * USAGE EXAMPLES
 * ======================================== */

/*
// Basic progress vine
<ProgressVine 
  value={75} 
  label="Learning Progress"
  showPercentage={true}
  description="Keep going! You're doing great!"
/>

// Progress with milestones
<ProgressVine
  value={60}
  variant="colorful"
  size="lg"
  texture="bark"
  label="Jungle Adventure Progress" 
  milestones={[
    { id: "start", position: 0, label: "Start", icon: "🌱", completed: true },
    { id: "quarter", position: 25, label: "First Steps", icon: "🌿", completed: true },
    { id: "half", position: 50, label: "Halfway There", icon: "🍃", completed: true },
    { id: "three-quarter", position: 75, label: "Almost Done", icon: "🌳", current: true },
    { id: "complete", position: 100, label: "Adventure Complete", icon: "🏆" },
  ]}
  showPercentage={true}
  animated={true}
/>

// Simple success progress
<ProgressVine
  value={100}
  variant="success" 
  size="sm"
  label="Words Mastered"
  description="All words in this category completed!"
/>

// Adventure-themed progress
<ProgressVine
  value={42}
  variant="adventure"
  size="xl"
  texture="bark"
  label="🌟 Magical Quest Progress"
  milestones={[
    { id: "forest", position: 20, label: "Enchanted Forest", icon: "🌲", completed: true },
    { id: "river", position: 40, label: "Crystal River", icon: "💎", completed: true },
    { id: "mountain", position: 60, label: "Mystic Mountain", icon: "⛰��", current: true },
    { id: "castle", position: 80, label: "Magic Castle", icon: "🏰" },
    { id: "treasure", position: 100, label: "Hidden Treasure", icon: "💰" },
  ]}
  showPercentage={true}
  description="Explore magical locations and discover hidden treasures!"
/>

// Warning state for practice needed
<ProgressVine
  value={25}
  variant="warning"
  size="md"
  label="Practice Needed"
  description="Some words need more practice to grow stronger."
  milestones={[
    { id: "review", position: 50, label: "Review Complete", icon: "📚" },
    { id: "practice", position: 100, label: "Practice Complete", icon: "✅" },
  ]}
/>
*/
