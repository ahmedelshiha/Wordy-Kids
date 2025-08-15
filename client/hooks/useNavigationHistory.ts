import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface NavigationEntry {
  pathname: string;
  search: string;
  state?: any;
  timestamp: number;
}

interface NavigationHistoryOptions {
  maxHistorySize?: number;
  excludePaths?: string[];
  storageKey?: string;
}

interface NavigationHistoryReturn {
  canGoBack: boolean;
  goBack: () => void;
  clearHistory: () => void;
  history: NavigationEntry[];
  previousPath: string | null;
  getCurrentPath: () => string;
  isFirstVisit: boolean;
}

const DEFAULT_EXCLUDED_PATHS = ["/", "/login", "/signup"];
const STORAGE_KEY = "wordAdventure_navigationHistory";
const MAX_HISTORY_SIZE = 10;

export const useNavigationHistory = (
  options: NavigationHistoryOptions = {},
): NavigationHistoryReturn => {
  const {
    maxHistorySize = MAX_HISTORY_SIZE,
    excludePaths = DEFAULT_EXCLUDED_PATHS,
    storageKey = STORAGE_KEY,
  } = options;

  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = useState<NavigationEntry[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const isInitialLoad = useRef(true);
  const lastLocationRef = useRef<string>("");

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(storageKey);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
          setIsFirstVisit(parsedHistory.length === 0);
        }
      }
    } catch (error) {
      console.warn("Failed to load navigation history:", error);
    }
  }, [storageKey]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(history));
      } catch (error) {
        console.warn("Failed to save navigation history:", error);
      }
    }
  }, [history, storageKey]);

  // Track location changes
  useEffect(() => {
    const currentPath = location.pathname + location.search;

    // Skip initial load to avoid duplicating the first entry
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      lastLocationRef.current = currentPath;
      return;
    }

    // Skip if it's the same path as the last one
    if (lastLocationRef.current === currentPath) {
      return;
    }

    // Skip excluded paths
    if (excludePaths.includes(location.pathname)) {
      lastLocationRef.current = currentPath;
      return;
    }

    const newEntry: NavigationEntry = {
      pathname: location.pathname,
      search: location.search,
      state: location.state,
      timestamp: Date.now(),
    };

    setHistory((prevHistory) => {
      // Remove any existing entry for this path to avoid duplicates
      const filteredHistory = prevHistory.filter(
        (entry) => entry.pathname + entry.search !== currentPath,
      );

      // Add new entry and keep within size limit
      const newHistory = [...filteredHistory, newEntry];
      return newHistory.slice(-maxHistorySize);
    });

    setIsFirstVisit(false);
    lastLocationRef.current = currentPath;
  }, [location, excludePaths, maxHistorySize]);

  const canGoBack = history.length > 0;

  const previousPath =
    history.length > 0
      ? history[history.length - 1].pathname +
        history[history.length - 1].search
      : null;

  const goBack = useCallback(() => {
    if (history.length === 0) {
      // No history available, go to default app route
      navigate("/app", { replace: true });
      return;
    }

    // Get the most recent entry
    const lastEntry = history[history.length - 1];

    // Remove the last entry from history
    setHistory((prevHistory) => prevHistory.slice(0, -1));

    // Navigate to the previous location
    navigate(lastEntry.pathname + lastEntry.search, {
      state: lastEntry.state,
      replace: true,
    });
  }, [history, navigate]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setIsFirstVisit(true);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.warn("Failed to clear navigation history:", error);
    }
  }, [storageKey]);

  const getCurrentPath = useCallback(() => {
    return location.pathname + location.search;
  }, [location]);

  return {
    canGoBack,
    goBack,
    clearHistory,
    history,
    previousPath,
    getCurrentPath,
    isFirstVisit,
  };
};
