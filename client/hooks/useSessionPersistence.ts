import { useEffect, useRef, useCallback, useState } from "react";
import {
  WordHistory,
  SystematicWordSelection,
} from "@/lib/enhancedWordSelection";
import { DashboardWordSession } from "@/lib/dashboardWordGenerator";
import { ChildWordStats } from "@shared/api";

interface LearningProgress {
  wordsLearned: number;
  wordsRemembered: number;
  sessionCount: number;
  accuracy: number;
}

interface SessionData {
  // Navigation and UI state
  activeTab: string;
  currentWordIndex: number;
  selectedCategory: string;
  learningMode: "cards" | "matching" | "selector";
  userRole: "child" | "parent";

  // Progress tracking
  forgottenWords: number[];
  rememberedWords: number[];
  excludedWordIds: number[];
  currentProgress: LearningProgress;
  dailySessionCount: number;

  // Profile and user data
  currentProfile: any;
  childStats: ChildWordStats | null;
  currentSessionId: string | null;

  // Learning states
  learningGoals: any[];
  currentDashboardWords: any[];
  customWords: any[];
  practiceWords: any[];

  // Advanced learning data
  userWordHistory: Array<[number, WordHistory]>;
  sessionNumber: number;
  lastSystematicSelection: SystematicWordSelection | null;
  dashboardSession: DashboardWordSession | null;
  dashboardSessionNumber: number;

  // UI flags
  showQuiz: boolean;
  selectedQuizType:
    | "quick"
    | "standard"
    | "challenge"
    | "picture"
    | "spelling"
    | "speed";
  showMatchingGame: boolean;
  gameMode: boolean;
  showPracticeGame: boolean;

  // Timestamps
  lastSaved: number;
  sessionStartTime: number;
  totalTimeSpent: number;
}

interface UseSessionPersistenceOptions {
  autoSaveInterval?: number;
  maxStorageSize?: number;
  compressionEnabled?: boolean;
  enableBackgroundSync?: boolean;
}

interface SessionPersistenceReturn {
  saveSession: (data: Partial<SessionData>) => void;
  loadSession: () => SessionData | null;
  clearSession: () => void;
  isSessionActive: boolean;
  lastSavedTime: number | null;
  sessionAge: number;
  compressedSize: number;
  enableAutoSave: (enabled: boolean) => void;
  forceSync: () => void;
}

const SESSION_STORAGE_KEY = "wordAdventure_sessionData";
const SESSION_BACKUP_KEY = "wordAdventure_sessionBackup";
const AUTO_SAVE_DEFAULT_INTERVAL = 5000; // 5 seconds
const MAX_STORAGE_SIZE = 1024 * 1024; // 1MB
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

export const useSessionPersistence = (
  options: UseSessionPersistenceOptions = {},
): SessionPersistenceReturn => {
  const {
    autoSaveInterval = AUTO_SAVE_DEFAULT_INTERVAL,
    maxStorageSize = MAX_STORAGE_SIZE,
    compressionEnabled = true,
    enableBackgroundSync = true,
  } = options;

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const [sessionAge, setSessionAge] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<Partial<SessionData> | null>(null);
  const isTabVisibleRef = useRef(true);
  const sessionStartTimeRef = useRef(Date.now());

  // Compression utilities
  const compressData = useCallback(
    (data: any): string => {
      if (!compressionEnabled) return JSON.stringify(data);

      try {
        // Simple compression using JSON stringification with reduced precision
        const jsonString = JSON.stringify(data, (key, value) => {
          if (typeof value === "number" && !Number.isInteger(value)) {
            return Math.round(value * 100) / 100; // Reduce decimal precision
          }
          return value;
        });

        return jsonString;
      } catch (error) {
        console.warn("Compression failed, using regular JSON:", error);
        return JSON.stringify(data);
      }
    },
    [compressionEnabled],
  );

  const decompressData = useCallback((compressedData: string): any => {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error("Failed to decompress session data:", error);
      return null;
    }
  }, []);

  // Storage utilities with size management
  const saveToStorage = useCallback(
    (key: string, data: SessionData) => {
      try {
        const compressed = compressData(data);
        const size = new Blob([compressed]).size;

        setCompressedSize(size);

        if (size > maxStorageSize) {
          console.warn("Session data exceeds maximum size, compacting...");
          // Remove less critical data to fit in storage
          const compactData = {
            ...data,
            userWordHistory: data.userWordHistory.slice(-50), // Keep only recent history
            currentDashboardWords: data.currentDashboardWords.slice(0, 20), // Limit words
            customWords: data.customWords.slice(-20), // Keep recent custom words
          };

          const compactCompressed = compressData(compactData);
          localStorage.setItem(key, compactCompressed);
        } else {
          localStorage.setItem(key, compressed);
        }

        setLastSavedTime(Date.now());
        setIsSessionActive(true);
      } catch (error) {
        console.error("Failed to save session data:", error);
        // Try saving to backup location
        try {
          const minimalData = {
            activeTab: data.activeTab,
            currentProgress: data.currentProgress,
            selectedCategory: data.selectedCategory,
            forgottenWords: data.forgottenWords,
            rememberedWords: data.rememberedWords,
            lastSaved: Date.now(),
          };
          localStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(minimalData));
        } catch (backupError) {
          console.error("Failed to save backup session data:", backupError);
        }
      }
    },
    [compressData, maxStorageSize],
  );

  const loadFromStorage = useCallback(
    (key: string): SessionData | null => {
      try {
        const saved = localStorage.getItem(key);
        if (!saved) return null;

        const data = decompressData(saved);
        if (!data) return null;

        // Check if session is still valid
        const sessionAge = Date.now() - (data.lastSaved || 0);
        if (sessionAge > SESSION_TIMEOUT) {
          console.log("Session expired, clearing old data");
          localStorage.removeItem(key);
          return null;
        }

        setSessionAge(sessionAge);
        setIsSessionActive(true);
        return data;
      } catch (error) {
        console.error("Failed to load session data:", error);

        // Try loading from backup
        try {
          const backup = localStorage.getItem(SESSION_BACKUP_KEY);
          if (backup) {
            const backupData = JSON.parse(backup);
            console.log("Loaded from backup session data");
            return backupData;
          }
        } catch (backupError) {
          console.error("Failed to load backup session data:", backupError);
        }

        return null;
      }
    },
    [decompressData],
  );

  // Session management functions
  const saveSession = useCallback(
    (data: Partial<SessionData>) => {
      const existingData =
        loadFromStorage(SESSION_STORAGE_KEY) || ({} as SessionData);

      const updatedData: SessionData = {
        ...existingData,
        ...data,
        lastSaved: Date.now(),
        sessionStartTime: sessionStartTimeRef.current,
        totalTimeSpent:
          (existingData.totalTimeSpent || 0) +
          (Date.now() -
            (existingData.lastSaved || sessionStartTimeRef.current)),
      };

      // Convert Map to Array for storage
      if (data.userWordHistory && data.userWordHistory instanceof Map) {
        updatedData.userWordHistory = Array.from(
          data.userWordHistory.entries(),
        );
      }

      // Convert Set to Array for storage
      if (data.forgottenWords && data.forgottenWords instanceof Set) {
        updatedData.forgottenWords = Array.from(data.forgottenWords);
      }
      if (data.rememberedWords && data.rememberedWords instanceof Set) {
        updatedData.rememberedWords = Array.from(data.rememberedWords);
      }
      if (data.excludedWordIds && data.excludedWordIds instanceof Set) {
        updatedData.excludedWordIds = Array.from(data.excludedWordIds);
      }

      saveToStorage(SESSION_STORAGE_KEY, updatedData);

      // Store pending data for background sync
      pendingDataRef.current = data;
    },
    [loadFromStorage, saveToStorage],
  );

  const loadSession = useCallback((): SessionData | null => {
    const data = loadFromStorage(SESSION_STORAGE_KEY);
    if (!data) return null;

    // Convert Array back to Map/Set
    if (data.userWordHistory && Array.isArray(data.userWordHistory)) {
      // Return as Map for consumption
      (data as any).userWordHistoryMap = new Map(data.userWordHistory);
    }
    if (data.forgottenWords && Array.isArray(data.forgottenWords)) {
      (data as any).forgottenWordsSet = new Set(data.forgottenWords);
    }
    if (data.rememberedWords && Array.isArray(data.rememberedWords)) {
      (data as any).rememberedWordsSet = new Set(data.rememberedWords);
    }
    if (data.excludedWordIds && Array.isArray(data.excludedWordIds)) {
      (data as any).excludedWordIdsSet = new Set(data.excludedWordIds);
    }

    return data;
  }, [loadFromStorage]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_BACKUP_KEY);
    setIsSessionActive(false);
    setLastSavedTime(null);
    setSessionAge(0);
    setCompressedSize(0);
    pendingDataRef.current = null;
  }, []);

  const forceSync = useCallback(() => {
    if (pendingDataRef.current) {
      saveSession(pendingDataRef.current);
      pendingDataRef.current = null;
    }
  }, [saveSession]);

  const enableAutoSave = useCallback((enabled: boolean) => {
    setAutoSaveEnabled(enabled);
  }, []);

  // Background auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !enableBackgroundSync) return;

    const startAutoSave = () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }

      autoSaveIntervalRef.current = setInterval(() => {
        if (pendingDataRef.current && isTabVisibleRef.current) {
          forceSync();
        }
      }, autoSaveInterval);
    };

    startAutoSave();

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveEnabled, enableBackgroundSync, autoSaveInterval, forceSync]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisibleRef.current = !document.hidden;

      if (document.hidden) {
        // Tab became hidden - force save current data
        forceSync();
      } else {
        // Tab became visible - could reload session data if needed
        const currentSession = loadSession();
        if (currentSession) {
          setSessionAge(Date.now() - (currentSession.lastSaved || 0));
        }
      }
    };

    const handleBeforeUnload = () => {
      // Force save before page unload
      forceSync();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache, reload session
        const currentSession = loadSession();
        if (currentSession) {
          setSessionAge(Date.now() - (currentSession.lastSaved || 0));
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [forceSync, loadSession]);

  // Storage event listener for cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY && event.newValue) {
        // Another tab updated the session data
        const updatedData = decompressData(event.newValue);
        if (updatedData) {
          setLastSavedTime(updatedData.lastSaved || null);
          setSessionAge(Date.now() - (updatedData.lastSaved || 0));
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [decompressData]);

  // Initialize session state
  useEffect(() => {
    const existingSession = loadSession();
    if (existingSession) {
      setSessionAge(Date.now() - (existingSession.lastSaved || 0));
      setIsSessionActive(true);
    }
  }, [loadSession]);

  return {
    saveSession,
    loadSession,
    clearSession,
    isSessionActive,
    lastSavedTime,
    sessionAge,
    compressedSize,
    enableAutoSave,
    forceSync,
  };
};

export type {
  SessionData,
  LearningProgress,
  UseSessionPersistenceOptions,
  SessionPersistenceReturn,
};
