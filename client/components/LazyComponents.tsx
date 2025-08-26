import React, { Suspense, lazy } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, TreePine, Users, Settings } from "lucide-react";

// Lazy load heavy components to improve initial page load
export const LazyJungleWordLibrary = lazy(() =>
  import("./JungleWordLibrarySimplified").then((module) => ({
    default: module.JungleWordLibrary,
  })),
);

export const LazyJungleAdventureParentDashboard = lazy(() =>
  import("./JungleAdventureParentDashboard").then((module) => ({
    default: module.JungleAdventureParentDashboard,
  })),
);

export const LazyParentDashboard = lazy(() =>
  import("../pages/ParentDashboard").then((module) => ({
    default: module.default,
  })),
);

export const LazyEnhancedJungleQuizAdventure = lazy(() =>
  import("./games/EnhancedJungleQuizAdventure").then((module) => ({
    default: module.EnhancedJungleQuizAdventure,
  })),
);

export const LazyGameHub = lazy(() =>
  import("./games/GameHub").then((module) => ({
    default: module.GameHub,
  })),
);

export const LazyInteractiveJungleMap = lazy(() =>
  import("./InteractiveJungleMap").then((module) => ({
    default: module.InteractiveJungleMap,
  })),
);

export const LazyFamilyAchievementsTimeline = lazy(() =>
  import("./FamilyAchievementsTimeline").then((module) => ({
    default: module.FamilyAchievementsTimeline,
  })),
);

// Loading fallback components with branded jungle theme
interface LoadingFallbackProps {
  type?: "library" | "dashboard" | "game" | "generic";
  message?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  type = "generic",
  message,
}) => {
  const getLoadingContent = () => {
    switch (type) {
      case "library":
        return {
          icon: <TreePine className="w-8 h-8 text-green-600" />,
          title: "Loading Jungle Library",
          description: message || "Preparing your word adventure...",
          emoji: "🌿",
        };
      case "dashboard":
        return {
          icon: <Users className="w-8 h-8 text-blue-600" />,
          title: "Loading Parent Dashboard",
          description: message || "Gathering family progress...",
          emoji: "👨‍👩‍👧‍👦",
        };
      case "game":
        return {
          icon: <Settings className="w-8 h-8 text-purple-600" />,
          title: "Loading Game",
          description: message || "Starting jungle adventure...",
          emoji: "🎮",
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 text-gray-600 animate-spin" />,
          title: "Loading",
          description: message || "Getting everything ready...",
          emoji: "⏳",
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4 animate-bounce">{content.emoji}</div>
            <div className="flex justify-center mb-4">{content.icon}</div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {content.title}
          </h2>

          <p className="text-gray-600 mb-6">{content.description}</p>

          <Progress value={65} className="w-full h-2 mb-4" />

          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading components...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced loading fallback with error boundary
interface EnhancedSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  type?: "library" | "dashboard" | "game" | "generic";
  message?: string;
}

export const EnhancedSuspense: React.FC<EnhancedSuspenseProps> = ({
  children,
  fallback,
  type = "generic",
  message,
}) => {
  return (
    <Suspense
      fallback={fallback || <LoadingFallback type={type} message={message} />}
    >
      {children}
    </Suspense>
  );
};

// Preload utilities for performance optimization
export const preloadComponents = {
  jungleLibrary: () => import("./JungleWordLibrarySimplified"),
  parentDashboard: () => import("./JungleAdventureParentDashboard"),
  quizAdventure: () => import("./games/EnhancedJungleQuizAdventure"),
  gameHub: () => import("./games/GameHub"),
  jungleMap: () => import("./InteractiveJungleMap"),
  achievementsTimeline: () => import("./FamilyAchievementsTimeline"),
};

// Preload critical components on user interaction
export const preloadCriticalComponents = () => {
  // Preload most likely to be needed components
  preloadComponents.jungleLibrary();
  preloadComponents.parentDashboard();
};

// Preload on mouseover/focus for instant navigation
export const usePreloadOnHover = (
  componentName: keyof typeof preloadComponents,
) => {
  const handlePreload = () => {
    preloadComponents[componentName]().catch(() => {
      // Silently fail if preload fails
    });
  };

  return {
    onMouseEnter: handlePreload,
    onFocus: handlePreload,
  };
};

// Resource hints for browsers
export const ResourceHints: React.FC = () => {
  React.useEffect(() => {
    // Add resource hints for critical assets
    const addResourceHint = (href: string, rel: string, as?: string) => {
      const link = document.createElement("link");
      link.rel = rel;
      link.href = href;
      if (as) link.as = as;
      document.head.appendChild(link);
    };

    // Preload critical jungle sounds
    addResourceHint("/sounds/jungle-birds.mp3", "preload", "audio");
    addResourceHint("/sounds/ui/voice-preview.mp3", "preload", "audio");

    // Prefetch likely navigation targets
    addResourceHint("/jungle-library", "prefetch");
    addResourceHint("/parent-dashboard", "prefetch");

    // DNS prefetch for external resources
    addResourceHint("//fonts.googleapis.com", "dns-prefetch");
    addResourceHint("//cdn.builder.io", "dns-prefetch");
  }, []);

  return null;
};

export default {
  LazyJungleWordLibrary,
  LazyJungleAdventureParentDashboard,
  LazyEnhancedJungleQuizAdventure,
  LazyGameHub,
  LazyInteractiveJungleMap,
  LazyFamilyAchievementsTimeline,
  LoadingFallback,
  EnhancedSuspense,
  preloadComponents,
  preloadCriticalComponents,
  usePreloadOnHover,
  ResourceHints,
};
