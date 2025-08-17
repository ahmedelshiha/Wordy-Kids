import React, { Suspense, lazy, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Brain, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isAIEnabled } from "@/lib/aiSettings";

// Lazy load AI components only when needed
const AIEnhancedWordLearning = lazy(() =>
  import("./AIEnhancedWordLearning").then((module) => ({
    default: module.AIEnhancedWordLearning,
  })),
);

const AIEnhancedInteractiveDashboardWordCard = lazy(() =>
  import("./AIEnhancedInteractiveDashboardWordCard").then((module) => ({
    default: module.AIEnhancedInteractiveDashboardWordCard,
  })),
);

const EnhancedAISettings = lazy(() =>
  import("./EnhancedAISettings").then((module) => ({
    default: module.EnhancedAISettings,
  })),
);

// Preload AI components when hovering over AI controls
let aiComponentsPreloaded = false;

export const preloadAIComponents = () => {
  if (!aiComponentsPreloaded) {
    aiComponentsPreloaded = true;
    import("./AIEnhancedWordLearning");
    import("./AIEnhancedInteractiveDashboardWordCard");
    import("./EnhancedAISettings");
  }
};

// Loading skeleton for AI components
function AILoadingSkeleton({
  variant = "card",
}: {
  variant?: "card" | "settings" | "compact";
}) {
  if (variant === "settings") {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-lg">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <Brain className="w-8 h-8 text-blue-300" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Error boundary for AI components
class AIErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onRetry?: () => void;
  },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AI Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="w-full border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="font-semibold text-red-800 mb-2">
              AI Component Error
            </h3>
            <p className="text-sm text-red-600 mb-4">
              The AI component encountered an issue. You can continue using
              basic features.
            </p>
            {this.props.onRetry && (
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onRetry?.();
                }}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Props interfaces
interface LazyAIComponentProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  loadingVariant?: "card" | "settings" | "compact";
  className?: string;
  onLoadError?: (error: Error) => void;
  enablePreload?: boolean;
}

// Main lazy loading wrapper
export function LazyAIComponent({
  children,
  fallback,
  loadingVariant = "card",
  className,
  onLoadError,
  enablePreload = true,
}: LazyAIComponentProps) {
  const [isAIEnabledState, setIsAIEnabledState] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const aiEnabled = isAIEnabled();
    setIsAIEnabledState(aiEnabled);

    // Only load AI components if AI is enabled
    if (aiEnabled) {
      setShouldLoad(true);
    }
  }, []);

  // Don't load AI components if AI is disabled
  if (!isAIEnabledState) {
    return fallback || null;
  }

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={enablePreload ? preloadAIComponents : undefined}
    >
      <AIErrorBoundary onRetry={() => setShouldLoad(true)}>
        <Suspense
          fallback={
            <div className="w-full">
              <AILoadingSkeleton variant={loadingVariant} />
            </div>
          }
        >
          {shouldLoad && children}
        </Suspense>
      </AIErrorBoundary>
    </div>
  );
}

// Specific lazy wrappers for each AI component
export function LazyAIEnhancedWordLearning(props: any) {
  return (
    <LazyAIComponent loadingVariant="card">
      <AIEnhancedWordLearning {...props} />
    </LazyAIComponent>
  );
}

export function LazyAIEnhancedInteractiveDashboardWordCard(props: any) {
  return (
    <LazyAIComponent loadingVariant="card">
      <AIEnhancedInteractiveDashboardWordCard {...props} />
    </LazyAIComponent>
  );
}

export function LazyEnhancedAISettings(props: any) {
  return (
    <LazyAIComponent loadingVariant="settings">
      <EnhancedAISettings {...props} />
    </LazyAIComponent>
  );
}

// Performance monitoring hook
export function useAIPerformance() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    errorCount: 0,
    successfulLoads: 0,
    lastLoadTime: null as Date | null,
  });

  const recordLoad = (loadTime: number, success: boolean) => {
    setMetrics((prev) => ({
      ...prev,
      loadTime: success ? loadTime : prev.loadTime,
      errorCount: success ? prev.errorCount : prev.errorCount + 1,
      successfulLoads: success
        ? prev.successfulLoads + 1
        : prev.successfulLoads,
      lastLoadTime: new Date(),
    }));
  };

  return { metrics, recordLoad };
}

// Intersection observer for lazy loading
export function useInViewLazyLoad(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Only load once
        }
      },
      { threshold },
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isInView] as const;
}

// Smart preloading based on user behavior
export function useSmartPreload() {
  const [hasPreloaded, setHasPreloaded] = useState(false);

  useEffect(() => {
    const preloadTimer = setTimeout(() => {
      if (isAIEnabled() && !hasPreloaded) {
        preloadAIComponents();
        setHasPreloaded(true);
      }
    }, 2000); // Preload after 2 seconds of page load

    return () => clearTimeout(preloadTimer);
  }, [hasPreloaded]);

  const handleUserInteraction = () => {
    if (!hasPreloaded && isAIEnabled()) {
      preloadAIComponents();
      setHasPreloaded(true);
    }
  };

  return handleUserInteraction;
}

// Resource hints for better performance
export function AIResourceHints() {
  useEffect(() => {
    if (isAIEnabled()) {
      // Add resource hints for AI-related resources
      const preloadLinks = ["/api/ai-recommendations", "/api/ai-analytics"];

      preloadLinks.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = href;
        document.head.appendChild(link);
      });
    }
  }, []);

  return null;
}

// Conditional rendering for AI features
export function ConditionalAI({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [aiEnabled, setAiEnabled] = useState(false);

  useEffect(() => {
    setAiEnabled(isAIEnabled());

    // Listen for AI setting changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "aiEnhancementEnabled") {
        setAiEnabled(JSON.parse(e.newValue || "false"));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return aiEnabled ? <>{children}</> : <>{fallback}</>;
}
