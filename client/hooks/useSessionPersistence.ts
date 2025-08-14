import { useState, useEffect, useCallback, useRef } from "react";

export interface SessionData {
  // User profile
  currentProfile: any;
  isLoggedIn: boolean;

  // Learning state
  activeTab: string;
  selectedCategory: string;
  learningMode: "cards" | "matching" | "selector";
  currentWordIndex: number;

  // Progress tracking
  rememberedWords: number[];
  forgottenWords: number[];
  excludedWordIds: number[];
  currentDashboardWords: any[];

  // Session management
  sessionNumber: number;
  dashboardSessionNumber: number;
  userWordHistory: Record<number, any>;

  // Game state
  showQuiz: boolean;
  selectedQuizType:
    | "quick"
    | "standard"
    | "challenge"
    | "picture"
    | "spelling"
    | "speed";
  gameMode: boolean;

  // Settings
  backgroundAnimationsEnabled: boolean;

  // Timestamps
  lastUpdated: number;
  sessionStartTime: number;
}

interface UseSessionPersistenceOptions {
  key?: string;
  debounceMs?: number;
  maxAge?: number; // in milliseconds
  version?: string;
}

export function useSessionPersistence(
  initialData: Partial<SessionData>,
  options: UseSessionPersistenceOptions = {},
) {
  const {
    key = "wordy-session",
    debounceMs = 500,
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    version = "1.0",
  } = options;

  const [sessionData, setSessionData] = useState<SessionData>(() => {
    return loadSessionData(key, initialData, maxAge, version);
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<number>(0);

  // Debounced save function
  const debouncedSave = useCallback(
    (data: SessionData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          const dataToSave = {
            ...data,
            lastUpdated: Date.now(),
            version,
          };

          localStorage.setItem(key, JSON.stringify(dataToSave));
          lastSaveRef.current = Date.now();

          // Dispatch custom event for cross-tab synchronization
          window.dispatchEvent(
            new CustomEvent("sessionSaved", {
              detail: { key, data: dataToSave },
            }),
          );

          console.log("Session saved successfully", {
            timestamp: new Date().toISOString(),
            wordsRemembered: data.rememberedWords.length,
            wordsForgotten: data.forgottenWords.length,
          });
        } catch (error) {
          console.error("Failed to save session data:", error);
        }
      }, debounceMs);
    },
    [key, debounceMs, version],
  );

  // Update session data and trigger save
  const updateSession = useCallback(
    (updates: Partial<SessionData>) => {
      setSessionData((prevData) => {
        const newData = {
          ...prevData,
          ...updates,
          lastUpdated: Date.now(),
        };

        debouncedSave(newData);
        return newData;
      });
    },
    [debouncedSave],
  );

  // Clear session data
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(key);

      const initialSession = createInitialSessionData(initialData);
      setSessionData(initialSession);

      window.dispatchEvent(
        new CustomEvent("sessionCleared", { detail: { key } }),
      );
      console.log("Session cleared successfully");
    } catch (error) {
      console.error("Failed to clear session data:", error);
    }
  }, [key, initialData]);

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          if (
            isValidSessionData(newData, version) &&
            newData.lastUpdated > lastSaveRef.current
          ) {
            setSessionData(newData);
          }
        } catch (error) {
          console.error("Failed to sync session data from storage:", error);
        }
      }
    };

    const handleCustomSessionEvent = (event: CustomEvent) => {
      if (
        event.detail.key === key &&
        event.detail.data.lastUpdated > lastSaveRef.current
      ) {
        setSessionData(event.detail.data);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "sessionSaved",
      handleCustomSessionEvent as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "sessionSaved",
        handleCustomSessionEvent as EventListener,
      );
    };
  }, [key, version]);

  // Auto-save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);

        // Immediate save on page unload
        try {
          const dataToSave = {
            ...sessionData,
            lastUpdated: Date.now(),
            version,
          };
          localStorage.setItem(key, JSON.stringify(dataToSave));
        } catch (error) {
          console.error("Failed to save session on unload:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [key, sessionData, version]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessionData,
    updateSession,
    clearSession,
    isSessionValid: isValidSessionData(sessionData, version),
  };
}

// Helper functions
function createInitialSessionData(
  initialData: Partial<SessionData>,
): SessionData {
  return {
    currentProfile: null,
    isLoggedIn: false,
    activeTab: "dashboard",
    selectedCategory: "",
    learningMode: "selector",
    currentWordIndex: 0,
    rememberedWords: [],
    forgottenWords: [],
    excludedWordIds: [],
    currentDashboardWords: [],
    sessionNumber: 1,
    dashboardSessionNumber: 1,
    userWordHistory: {},
    showQuiz: false,
    selectedQuizType: "standard",
    gameMode: false,
    backgroundAnimationsEnabled: true,
    lastUpdated: Date.now(),
    sessionStartTime: Date.now(),
    ...initialData,
  };
}

function loadSessionData(
  key: string,
  initialData: Partial<SessionData>,
  maxAge: number,
  version: string,
): SessionData {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return createInitialSessionData(initialData);
    }

    const parsed = JSON.parse(stored);

    // Check if session is expired
    if (Date.now() - parsed.lastUpdated > maxAge) {
      console.log("Session expired, creating new session");
      localStorage.removeItem(key);
      return createInitialSessionData(initialData);
    }

    // Check version compatibility
    if (!isValidSessionData(parsed, version)) {
      console.log("Session version mismatch, creating new session");
      localStorage.removeItem(key);
      return createInitialSessionData(initialData);
    }

    console.log("Session restored successfully", {
      age: Math.round((Date.now() - parsed.lastUpdated) / 1000 / 60),
      wordsRemembered: parsed.rememberedWords?.length || 0,
      wordsForgotten: parsed.forgottenWords?.length || 0,
    });

    return {
      ...createInitialSessionData(initialData),
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load session data:", error);
    return createInitialSessionData(initialData);
  }
}

function isValidSessionData(data: any, expectedVersion: string): boolean {
  if (!data || typeof data !== "object") return false;

  // Check for required properties
  const requiredProps = [
    "activeTab",
    "selectedCategory",
    "learningMode",
    "rememberedWords",
    "forgottenWords",
    "lastUpdated",
  ];

  for (const prop of requiredProps) {
    if (!(prop in data)) {
      console.warn(`Missing required session property: ${prop}`);
      return false;
    }
  }

  // Check version (allow for backwards compatibility)
  if (data.version && data.version !== expectedVersion) {
    const [major] = expectedVersion.split(".");
    const [dataMajor] = (data.version || "0.0").split(".");

    if (major !== dataMajor) {
      console.warn(
        `Incompatible session version: ${data.version}, expected: ${expectedVersion}`,
      );
      return false;
    }
  }

  return true;
}

// Export utility functions for use elsewhere
export const sessionUtils = {
  getSessionSize: (key: string = "wordy-session") => {
    try {
      const data = localStorage.getItem(key);
      return data ? new Blob([data]).size : 0;
    } catch {
      return 0;
    }
  },

  exportSession: (key: string = "wordy-session") => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wordy-session-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export session:", error);
    }
  },

  importSession: (
    file: File,
    key: string = "wordy-session",
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (isValidSessionData(data, "1.0")) {
            localStorage.setItem(key, JSON.stringify(data));
            resolve(true);
          } else {
            resolve(false);
          }
        } catch {
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  },
};
