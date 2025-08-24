import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * JunglePanel - Full-bleed container with immersive background layers
 * Supports parallax effects with accessibility-first design
 * Automatically respects reduced-motion and save-data preferences
 */

const junglePanelVariants = cva(
  // Base styles
  [
    "relative w-full overflow-hidden",
    "hardware-accelerate", // Performance optimization
  ],
  {
    variants: {
      background: {
        none: "",
        primary: "bg-grad-jungle",
        secondary: "bg-grad-adventure", 
        hero: "bg-grad-hero",
        warm: "bg-grad-warm",
        cool: "bg-grad-cool",
        surface: "bg-surface",
        "surface-2": "bg-surface-2",
        "surface-3": "bg-surface-3",
      },
      padding: {
        none: "",
        sm: "py-8 px-4",
        md: "py-12 px-4 md:py-16 md:px-6",
        lg: "py-16 px-4 md:py-20 md:px-6 lg:py-24 lg:px-8",
        xl: "py-20 px-4 md:py-28 md:px-6 lg:py-32 lg:px-8",
      },
      minHeight: {
        none: "",
        screen: "min-h-screen",
        "screen-75": "min-h-[75vh]", 
        "screen-50": "min-h-[50vh]",
        "screen-25": "min-h-[25vh]",
        content: "min-h-fit",
      },
      parallaxDepth: {
        0: "", // No parallax - respects reduced motion
        1: "motion-safe:anim-parallax-slow",  // Subtle parallax
        2: "motion-safe:anim-parallax-medium", // Medium parallax
        3: "motion-safe:anim-parallax-fast",   // Fast parallax
      },
      pattern: {
        none: "",
        subtle: [
          "before:absolute before:inset-0",
          "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGNpcmNsZSBjeD0iNCIgY3k9IjQiIHI9IjEuNSIgZmlsbD0iaHNsKHZhcigtLWNvbG9yLWp1bmdsZS0zMDApIC8gMC4wOCkiLz4gPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iaHNsKHZhcigtLWNvbG9yLWJhbmFuYS0zMDApIC8gMC4wNSkiLz4gPGNpcmNsZSBjeD0iMzYiIGN5PSIzNiIgcj0iMS41IiBmaWxsPSJoc2wodmFyKC0tY29sb3Itc2t5LTMwMCkgLyAwLjA2KSIvPjwvc3ZnPg==')] before:opacity-60",
          "before:pointer-events-none",
          "save-data:before:hidden", // Hide pattern for save-data
        ],
        leaves: [
          "before:absolute before:inset-0",
          "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPHBhdGggZD0iTTIwIDEwQzE1IDEwIDEwIDE1IDEwIDIwQzEwIDI1IDEzIDI5IDE3IDMxQzE4IDMxLjUgMTkgMzIgMjAgMzJDMjEgMzIgMjIgMzEuNSAyMyAzMUMyNyAyOSAzMCAyNSAzMCAyMEMzMCAxNSAyNSAxMCAyMCAxMFoiIGZpbGw9ImhzbCh2YXIoLS1jb2xvci1qdW5nbGUtMjAwKSAvIDAuMTIpIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAyMCAyMCkiLz4gPHBhdGggZD0iTTYwIDUwQzU1IDUwIDUwIDU1IDUwIDYwQzUwIDY1IDUzIDY5IDU3IDcxQzU4IDcxLjUgNTkgNzIgNjAgNzJDNjEgNzIgNjIgNzEuNSA2MyA3MUM2NyA2OSA3MCA2NSA3MCA2MEM3MCA1NSA2NSA1MCA2MCA1MFoiIGZpbGw9ImhzbCh2YXIoLS1jb2xvci1qdW5nbGUtMzAwKSAvIDAuMDgpIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTAgNjAgNjApIi8+PC9zdmc+')] before:opacity-40",
          "before:pointer-events-none motion-safe:before:anim-sway",
          "save-data:before:hidden", // Hide pattern for save-data
        ],
        vines: [
          "before:absolute before:inset-0",
          "before:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+IDxwYXRoIGQ9Ik0xMCAyMEM0MCAyMCA2MCA0MCA4MCA0MEM5MCA0MCA5MCA1MCA4MCA1MEM2MCA1MCA0MCA3MCAyMCA3MEMxMCA3MCAxMCA2MCAyMCA2MEMyMCA0MCAzMCAzMCAzMCAyMEMyMCAyMCAxMCAyMCAxMCAyMFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iaHNsKHZhcigtLWNvbG9yLWp1bmdsZS00MDApIC8gMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=')] before:opacity-30",
          "before:pointer-events-none",
          "save-data:before:hidden", // Hide pattern for save-data
        ],
      },
      safeArea: {
        none: "",
        top: "safe-top",
        bottom: "safe-bottom", 
        both: "safe-top safe-bottom",
        all: "safe-top safe-bottom safe-left safe-right",
      },
    },
    defaultVariants: {
      background: "none",
      padding: "md",
      minHeight: "none",
      parallaxDepth: 0,
      pattern: "none",
      safeArea: "none",
    },
  },
);

const junglePanelContentVariants = cva([
  "relative z-10", // Above background patterns
  "mx-auto max-w-7xl",
]);

const junglePanelBackgroundVariants = cva([
  "absolute inset-0 -z-10",
  "overflow-hidden",
], {
  variants: {
    layer: {
      1: "opacity-20 motion-safe:anim-parallax-slow",
      2: "opacity-30 motion-safe:anim-parallax-medium", 
      3: "opacity-40 motion-safe:anim-parallax-fast",
    },
  },
});

export interface JunglePanelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof junglePanelVariants> {
  backgroundLayers?: React.ReactNode[];
  containerProps?: React.HTMLAttributes<HTMLDivElement>;
}

export interface JunglePanelContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof junglePanelContentVariants> {}

export interface JunglePanelBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof junglePanelBackgroundVariants> {}

const JunglePanel = React.forwardRef<HTMLDivElement, JunglePanelProps>(
  (
    {
      className,
      background,
      padding,
      minHeight,
      parallaxDepth,
      pattern,
      safeArea,
      backgroundLayers = [],
      containerProps,
      children,
      ...props
    },
    ref,
  ) => {
    // Automatically disable parallax on mobile and for reduced motion
    const [isMobile, setIsMobile] = React.useState(false);
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

    React.useEffect(() => {
      // Detect mobile
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);

      // Detect reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      setPrefersReducedMotion(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleMotionChange);

      return () => {
        window.removeEventListener('resize', checkMobile);
        mediaQuery.removeEventListener('change', handleMotionChange);
      };
    }, []);

    // Override parallax depth if motion should be reduced
    const effectiveParallaxDepth = (isMobile || prefersReducedMotion) ? 0 : parallaxDepth;

    return (
      <section
        ref={ref}
        className={cn(
          junglePanelVariants({
            background,
            padding,
            minHeight,
            parallaxDepth: effectiveParallaxDepth,
            pattern,
            safeArea,
            className,
          }),
        )}
        {...props}
      >
        {/* Background layers for parallax effect */}
        {backgroundLayers.map((layer, index) => (
          <JunglePanelBackground
            key={index}
            layer={(index + 1) as 1 | 2 | 3}
            className={isMobile || prefersReducedMotion ? "anim-none" : ""}
          >
            {layer}
          </JunglePanelBackground>
        ))}

        {/* Main content container */}
        <JunglePanelContent {...containerProps}>
          {children}
        </JunglePanelContent>
      </section>
    );
  },
);
JunglePanel.displayName = "JunglePanel";

const JunglePanelContent = React.forwardRef<HTMLDivElement, JunglePanelContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(junglePanelContentVariants({ className }))}
      {...props}
    />
  ),
);
JunglePanelContent.displayName = "JunglePanelContent";

const JunglePanelBackground = React.forwardRef<HTMLDivElement, JunglePanelBackgroundProps>(
  ({ className, layer, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(junglePanelBackgroundVariants({ layer, className }))}
      {...props}
    />
  ),
);
JunglePanelBackground.displayName = "JunglePanelBackground";

export {
  JunglePanel,
  JunglePanelContent,
  JunglePanelBackground,
  junglePanelVariants,
};

/* ========================================
 * USAGE EXAMPLES
 * ======================================== */

/*
// Basic hero section
<JunglePanel 
  background="hero" 
  padding="xl" 
  minHeight="screen"
  pattern="subtle"
  safeArea="both"
>
  <div className="text-center text-text-inverse">
    <h1 className="text-h1-fluid font-bold mb-6">
      Welcome to Jungle Adventure!
    </h1>
    <p className="text-lg mb-8 max-w-2xl mx-auto">
      Embark on an exciting journey through words and language.
    </p>
    <AdventureButton intent="secondary" size="lg" roundness="full">
      Start Your Adventure
    </AdventureButton>
  </div>
</JunglePanel>

// Section with parallax background layers
<JunglePanel
  background="primary"
  padding="lg" 
  parallaxDepth={2}
  pattern="leaves"
  backgroundLayers={[
    <img src="/jungle-layer-1.svg" alt="" className="w-full h-full object-cover" />,
    <img src="/jungle-layer-2.svg" alt="" className="w-full h-full object-cover" />,
  ]}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
    <div>
      <h2 className="text-h2-fluid font-bold text-jungle-700 mb-4">
        Learn Through Play
      </h2>
      <p className="text-text-secondary mb-6">
        Our immersive jungle environment makes learning vocabulary fun and engaging.
      </p>
      <AdventureButton intent="jungle" size="md">
        Explore Features
      </AdventureButton>
    </div>
    <JungleCard tone="adventure" size="lg" interactive>
      <JungleCardContent>
        <div className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold mb-2">Interactive Learning</h3>
          <p className="text-text-muted">Engage with words in a magical environment.</p>
        </div>
      </JungleCardContent>
    </JungleCard>
  </div>
</JunglePanel>

// Simple content section
<JunglePanel background="surface-2" padding="md" pattern="subtle">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-h2-fluid font-bold text-center mb-8">
      Why Choose Jungle Adventure?
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <JungleCard key={index} tone="default" size="md" elevation="medium">
          <JungleCardHeader>
            <JungleCardIcon>
              {feature.icon}
            </JungleCardIcon>
            <JungleCardTitle>{feature.title}</JungleCardTitle>
          </JungleCardHeader>
          <JungleCardContent>
            <p>{feature.description}</p>
          </JungleCardContent>
        </JungleCard>
      ))}
    </div>
  </div>
</JunglePanel>

// Footer section
<JunglePanel 
  background="cool" 
  padding="lg" 
  pattern="vines"
  safeArea="bottom"
>
  <div className="text-center">
    <h3 className="text-h3-fluid font-bold text-jungle-700 mb-4">
      Ready for Your Jungle Adventure?
    </h3>
    <p className="text-text-secondary mb-8 max-w-2xl mx-auto">
      Join thousands of young explorers discovering the magic of words.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <AdventureButton intent="primary" size="lg">
        Get Started Free
      </AdventureButton>
      <AdventureButton intent="outline" size="lg">
        Learn More
      </AdventureButton>
    </div>
  </div>
</JunglePanel>
*/
