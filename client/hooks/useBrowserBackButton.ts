import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationHistory } from "./useNavigationHistory";

interface BackButtonOptions {
  preventDefaultBack?: boolean;
  fallbackRoute?: string;
  onBackAttempt?: () => void;
  enabledRoutes?: string[];
  customBackHandler?: () => boolean; // Return true to prevent default back behavior
}

interface BackButtonReturn {
  handleBack: () => void;
  isBackEnabled: boolean;
  addHistoryEntry: () => void;
}

export const useBrowserBackButton = (
  options: BackButtonOptions = {},
): BackButtonReturn => {
  const {
    preventDefaultBack = true,
    fallbackRoute = "/app",
    onBackAttempt,
    enabledRoutes = [
      "/app",
      "/admin",
      "/profile",
      "/word-card-demo",
      "/word-garden-demo",
    ],
    customBackHandler,
  } = options;

  const navigate = useNavigate();
  const location = useLocation();
  const { canGoBack, goBack, previousPath } = useNavigationHistory();

  const hasHandledInitialEntry = useRef(false);
  const currentRoute = location.pathname;
  const isEnabledRoute = enabledRoutes.includes(currentRoute);

  // Add a history entry to ensure there's always something to go back to
  const addHistoryEntry = useCallback(() => {
    if (!hasHandledInitialEntry.current) {
      // Push current state to browser history so back button works
      window.history.pushState({ navigatedFromApp: true }, "");
      hasHandledInitialEntry.current = true;
    }
  }, []);

  // Handle browser back button
  const handleBack = useCallback(() => {
    // Call custom handler if provided
    if (customBackHandler && customBackHandler()) {
      return; // Custom handler handled the back action
    }

    // Call onBackAttempt callback if provided
    if (onBackAttempt) {
      onBackAttempt();
    }

    // Use our navigation history if available
    if (canGoBack && previousPath) {
      console.log("Using navigation history to go back to:", previousPath);
      goBack();
      return;
    }

    // Fallback to default route
    console.log("No navigation history, falling back to:", fallbackRoute);
    navigate(fallbackRoute, { replace: true });
  }, [
    customBackHandler,
    onBackAttempt,
    canGoBack,
    previousPath,
    goBack,
    navigate,
    fallbackRoute,
  ]);

  // Listen for browser back button on enabled routes
  useEffect(() => {
    if (!isEnabledRoute) return;

    const handlePopState = (event: PopStateEvent) => {
      if (preventDefaultBack) {
        // Prevent the browser's default back behavior
        event.preventDefault();

        // Push a new state to counteract the back navigation
        window.history.pushState({ navigatedFromApp: true }, "");

        // Handle the back action with our custom logic
        handleBack();
      }
    };

    // Add history entry on mount for enabled routes
    addHistoryEntry();

    // Listen for popstate events (back/forward button)
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isEnabledRoute, preventDefaultBack, handleBack, addHistoryEntry]);

  // Mobile-specific back button handling
  useEffect(() => {
    if (!isEnabledRoute) return;

    const handleMobileBack = (event: BeforeUnloadEvent) => {
      // On mobile browsers, we can also handle the beforeunload event
      // This helps catch when users try to leave the app
      if (canGoBack) {
        event.preventDefault();
        handleBack();
        return "";
      }
    };

    // Handle Android back button via keyboard event
    const handleKeyDown = (event: KeyboardEvent) => {
      // Android back button often triggers ESC key
      if (event.key === "Escape" && window.innerWidth <= 768) {
        event.preventDefault();
        handleBack();
      }
    };

    // Add event listeners for mobile back handling
    window.addEventListener("beforeunload", handleMobileBack);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleMobileBack);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabledRoute, canGoBack, handleBack]);

  // Detect hash changes (another way mobile back can be triggered)
  useEffect(() => {
    if (!isEnabledRoute) return;

    const handleHashChange = () => {
      // If hash changed but we're still on the same route, it might be a back attempt
      if (window.location.hash === "" && location.pathname === currentRoute) {
        handleBack();
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [isEnabledRoute, currentRoute, location.pathname, handleBack]);

  return {
    handleBack,
    isBackEnabled: canGoBack,
    addHistoryEntry,
  };
};

// Utility hook for pages that want to add custom back button UI
export const useCustomBackButton = (onBack?: () => void) => {
  const { handleBack } = useBrowserBackButton({
    customBackHandler: () => {
      if (onBack) {
        onBack();
        return true; // Prevent default handling
      }
      return false; // Allow default handling
    },
  });

  return { handleBack };
};
