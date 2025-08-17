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

  // Initialize navigation references as null
  const navigate = React.useRef<any>(null);
  const location = React.useRef<any>({ pathname: "/" });

  // Use a separate effect to safely capture navigation hooks
  React.useEffect(() => {
    try {
      // Access these after the component has mounted and router context is available
      const navigateHook = useNavigate();
      const locationHook = useLocation();
      navigate.current = navigateHook;
      location.current = locationHook;
    } catch (error) {
      // Router hooks not available - this is okay during initial render
      console.debug("Router hooks not available during AuthProvider initialization");
    }
  });

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
    // Store current path before logout to avoid redirecting authenticated users back to app
    const currentPath = location.current?.pathname || "/";
    const isAppRoute = [
      "/app",
      "/admin",
      "/profile",
      "/word-card-demo",
      "/word-garden-demo",
    ].includes(currentPath);

    clearSession();
    setUser(null);

    if (navigate.current && typeof navigate.current === "function") {
      // If user was on an app route, redirect to login, otherwise stay on current page
      if (isAppRoute) {
        navigate.current("/", { replace: true });
      }
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
