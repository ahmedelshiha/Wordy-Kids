import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  type: "child" | "parent" | "guest";
  isGuest: boolean;
  createdAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (profile: UserProfile) => void;
  loginAsGuest: () => void;
  logout: () => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        // Check for guest session
        const guestSession = localStorage.getItem("wordAdventureGuestSession");
        if (guestSession === "active") {
          setUser({
            id: "guest-user",
            name: "Guest Explorer",
            type: "guest",
            isGuest: true,
          });
          setIsLoading(false);
          return;
        }

        // Check for logged in user session
        const currentUser = localStorage.getItem("wordAdventureCurrentUser");
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          setUser({
            ...userData,
            isGuest: false,
          });
        }
      } catch (error) {
        console.error("Error checking existing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const login = (profile: UserProfile) => {
    const userProfile = {
      ...profile,
      isGuest: false,
    };
    setUser(userProfile);
    localStorage.setItem(
      "wordAdventureCurrentUser",
      JSON.stringify(userProfile),
    );
    localStorage.removeItem("wordAdventureGuestSession");
  };

  const loginAsGuest = () => {
    const guestProfile: UserProfile = {
      id: "guest-user",
      name: "Guest Explorer",
      type: "guest",
      isGuest: true,
    };
    setUser(guestProfile);
    localStorage.setItem("wordAdventureGuestSession", "active");
    localStorage.removeItem("wordAdventureCurrentUser");
  };

  const clearSession = () => {
    // Clear all authentication-related localStorage
    localStorage.removeItem("wordAdventureCurrentUser");
    localStorage.removeItem("wordAdventureGuestSession");
    localStorage.removeItem("rememberedEmail");

    // Clear user learning progress for guests (keep for registered users)
    if (user?.isGuest) {
      localStorage.removeItem("wordAdventureProgress");
      localStorage.removeItem("wordAdventureSession");
      localStorage.removeItem("childStats");
      localStorage.removeItem("learningStats");
    }

    // Clear navigation history only when explicitly logging out
    localStorage.removeItem("wordAdventure_navigationHistory");
  };

  const logout = () => {
    // Clear session data first
    clearSession();
    setUser(null);

    // For logout navigation, we'll rely on the components themselves to handle redirects
    // This avoids router hook dependencies in the auth provider

    // Check if we're on an app route and need to redirect
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
    const isAppRoute = [
      "/app",
      "/admin",
      "/profile",
      "/word-card-demo",
      "/word-garden-demo",
    ].includes(currentPath);

    if (isAppRoute && typeof window !== "undefined") {
      // Use native navigation for logout to avoid router dependencies
      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
    isLoading,
    login,
    loginAsGuest,
    logout,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
