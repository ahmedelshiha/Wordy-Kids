import React, { useEffect } from "react";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
import { useBrowserBackButton } from "@/hooks/useBrowserBackButton";
import { useAuth } from "@/hooks/useAuth";

interface NavigationGuardProps {
  children: React.ReactNode;
}

/**
 * NavigationGuard component that provides consistent back button handling
 * and navigation history management across the app
 */
export const NavigationGuard: React.FC<NavigationGuardProps> = ({ children }) => {
  const { isAuthenticated, isGuest } = useAuth();
  const { clearHistory } = useNavigationHistory();

  // Initialize back button handling
  useBrowserBackButton({
    fallbackRoute: isAuthenticated ? "/app" : "/",
    enabledRoutes: ["/app", "/admin", "/profile", "/word-card-demo", "/word-garden-demo"],
    onBackAttempt: () => {
      console.log("Global back button handler activated");
    },
  });

  // Clear navigation history when user authentication status changes
  useEffect(() => {
    // This ensures that when a user logs out and logs back in,
    // they don't have access to the previous user's navigation history
    if (!isAuthenticated) {
      clearHistory();
    }
  }, [isAuthenticated, clearHistory]);

  return <>{children}</>;
};
