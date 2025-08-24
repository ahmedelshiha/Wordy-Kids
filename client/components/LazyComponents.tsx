import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy game components
export const LazyEnhancedJungleQuizAdventure = React.lazy(() => 
  import('./games/EnhancedJungleQuizAdventure').then(module => ({
    default: module.EnhancedJungleQuizAdventure
  }))
);

export const LazyEnhancedJungleQuizAdventureDesktop = React.lazy(() =>
  import('./games/EnhancedJungleQuizAdventureDesktop').then(module => ({
    default: module.EnhancedJungleQuizAdventureDesktop
  }))
);

export const LazyWordGarden = React.lazy(() =>
  import('./games/WordGarden').then(module => ({
    default: module.default
  }))
);

export const LazyAdminDashboard = React.lazy(() =>
  import('./AdminDashboard').then(module => ({
    default: module.default
  }))
);

export const LazyAdvancedAnalyticsDashboard = React.lazy(() =>
  import('./AdvancedAnalyticsDashboard').then(module => ({
    default: module.default
  }))
);

export const LazyJungleAdventureSidebar = React.lazy(() =>
  import('./JungleAdventureSidebar').then(module => ({
    default: module.JungleAdventureSidebar
  }))
);

// Loading skeleton for game components
const GameLoadingSkeleton: React.FC = () => (
  <Card className="w-full max-w-4xl mx-auto">
    <CardContent className="p-6">
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        
        {/* Game area skeleton */}
        <Skeleton className="h-64 w-full rounded-lg" />
        
        {/* Controls skeleton */}
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-12 w-24 rounded-lg" />
          <Skeleton className="h-12 w-24 rounded-lg" />
          <Skeleton className="h-12 w-24 rounded-lg" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dashboard loading skeleton
const DashboardLoadingSkeleton: React.FC = () => (
  <div className="space-y-6 p-6">
    {/* Stats grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

// Sidebar loading skeleton
const SidebarLoadingSkeleton: React.FC = () => (
  <div className="w-full h-full p-4 space-y-4">
    <Skeleton className="h-16 w-full rounded-lg" />
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
    <Skeleton className="h-24 w-full rounded-lg" />
  </div>
);

// HOC for adding lazy loading with appropriate skeleton
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  LoadingSkeleton: React.ComponentType = GameLoadingSkeleton
) => {
  return React.memo((props: P) => (
    <Suspense fallback={<LoadingSkeleton />}>
      <LazyComponent {...props} />
    </Suspense>
  ));
};

// Pre-configured lazy components with skeletons
export const LazyGameWithSkeleton = withLazyLoading(LazyEnhancedJungleQuizAdventure, GameLoadingSkeleton);
export const LazyGameDesktopWithSkeleton = withLazyLoading(LazyEnhancedJungleQuizAdventureDesktop, GameLoadingSkeleton);
export const LazyWordGardenWithSkeleton = withLazyLoading(LazyWordGarden, GameLoadingSkeleton);
export const LazyAdminWithSkeleton = withLazyLoading(LazyAdminDashboard, DashboardLoadingSkeleton);
export const LazyAnalyticsWithSkeleton = withLazyLoading(LazyAdvancedAnalyticsDashboard, DashboardLoadingSkeleton);
export const LazySidebarWithSkeleton = withLazyLoading(LazyJungleAdventureSidebar, SidebarLoadingSkeleton);

// Preload components when user hovers over navigation
export const preloadComponents = {
  game: () => import('./games/EnhancedJungleQuizAdventure'),
  gameDesktop: () => import('./games/EnhancedJungleQuizAdventureDesktop'),
  wordGarden: () => import('./games/WordGarden'),
  admin: () => import('./AdminDashboard'),
  analytics: () => import('./AdvancedAnalyticsDashboard'),
  sidebar: () => import('./JungleAdventureSidebar')
};

// Preload hook for eager loading on user interaction
export const usePreloadComponents = () => {
  const preload = React.useCallback((components: (keyof typeof preloadComponents)[]) => {
    components.forEach(component => {
      preloadComponents[component]().catch(err => {
        console.warn(`Failed to preload ${component}:`, err);
      });
    });
  }, []);

  return preload;
};
