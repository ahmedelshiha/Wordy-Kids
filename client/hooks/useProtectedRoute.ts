import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteOptions {
  requireAuth?: boolean;
  redirectTo?: string;
  allowGuest?: boolean;
}

export const useProtectedRoute = (options: ProtectedRouteOptions = {}) => {
  const { requireAuth = true, redirectTo = "/", allowGuest = true } = options;

  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't do anything while auth is loading
    if (isLoading) return;

    // If authentication is required and user is not authenticated
    if (requireAuth && !isAuthenticated) {
      // Store current location to return to after login
      const currentPath = location.pathname + location.search;
      const searchParams = new URLSearchParams();

      if (currentPath !== "/" && currentPath !== redirectTo) {
        searchParams.set("returnTo", currentPath);
      }

      const redirectUrl =
        redirectTo +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");
      navigate(redirectUrl, {
        replace: true,
        state: { from: currentPath },
      });
      return;
    }

    // If guests are not allowed and user is a guest
    if (!allowGuest && isGuest) {
      navigate(redirectTo, { replace: true });
      return;
    }
  }, [
    isAuthenticated,
    isGuest,
    isLoading,
    requireAuth,
    allowGuest,
    redirectTo,
    navigate,
    location,
  ]);

  return {
    isAuthenticated,
    isGuest,
    isLoading,
    canAccess: isLoading ? false : requireAuth ? isAuthenticated : true,
  };
};

// Utility hook for components that need to redirect to login with return path
export const useLoginRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToLogin = (returnTo?: string) => {
    const currentPath = returnTo || location.pathname + location.search;
    const searchParams = new URLSearchParams();

    if (currentPath !== "/" && currentPath !== "/login") {
      searchParams.set("returnTo", currentPath);
    }

    const redirectUrl =
      "/" + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    navigate(redirectUrl, {
      replace: true,
      state: { from: currentPath },
    });
  };

  return { redirectToLogin };
};
