// client/hooks/useOptimizedStorage.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { localStorageManager } from '../lib/localStorageManager';

// Hook for storing and retrieving data with automatic optimization
export function useOptimizedStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    expiry?: number;
    priority?: 'high' | 'medium' | 'low';
    syncAcrossTabs?: boolean;
    compress?: boolean;
  } = {}
): [T, (value: T) => void, { loading: boolean; error: string | null }] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const syncRef = useRef(options.syncAcrossTabs || false);

  // Load initial value
  useEffect(() => {
    try {
      const storedValue = localStorageManager.getItem<T>(key, defaultValue);
      setValue(storedValue || defaultValue);
      setError(null);
    } catch (err) {
      setError(`Failed to load ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, defaultValue]);

  // Set up cross-tab synchronization
  useEffect(() => {
    if (!syncRef.current) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === localStorageManager.getPrefixedKey(key) && e.newValue) {
        try {
          const newValue = localStorageManager.getItem<T>(key, defaultValue);
          if (newValue !== null) {
            setValue(newValue);
          }
        } catch (err) {
          console.error('Failed to sync storage change:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue]);

  const setStoredValue = useCallback((newValue: T) => {
    try {
      const success = localStorageManager.setItem(key, newValue, {
        expiry: options.expiry,
        priority: options.priority,
        compress: options.compress
      });

      if (success) {
        setValue(newValue);
        setError(null);
      } else {
        setError('Failed to store value - storage may be full');
      }
    } catch (err) {
      setError(`Failed to store ${key}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [key, options.expiry, options.priority, options.compress]);

  return [value, setStoredValue, { loading, error }];
}

// Hook for managing user progress data
export function useUserProgress(userId: string) {
  const progressKey = `user_progress_${userId}`;
  
  const [progress, setProgress, { loading, error }] = useOptimizedStorage(
    progressKey,
    {
      level: 1,
      experience: 0,
      wordsLearned: [],
      achievements: [],
      streakDays: 0,
      lastPlayed: null as string | null,
      totalPlayTime: 0,
      favoriteWords: [],
      difficultyPreference: 'medium' as 'easy' | 'medium' | 'hard',
      soundEnabled: true,
      parentalControls: {
        timeLimit: 60, // minutes
        allowedCategories: ['animals', 'colors', 'shapes', 'numbers']
      }
    },
    {
      priority: 'high',
      expiry: 365 * 24 * 60 * 60 * 1000, // 1 year
      syncAcrossTabs: true,
      compress: true
    }
  );

  const updateProgress = useCallback((updates: Partial<typeof progress>) => {
    setProgress(prev => ({
      ...prev,
      ...updates,
      lastPlayed: new Date().toISOString()
    }));
  }, [setProgress]);

  const addWordLearned = useCallback((word: string, difficulty: number) => {
    setProgress(prev => ({
      ...prev,
      wordsLearned: [...prev.wordsLearned.filter(w => w.word !== word), {
        word,
        difficulty,
        learnedAt: new Date().toISOString(),
        reviewCount: 1
      }],
      experience: prev.experience + (difficulty * 10),
      lastPlayed: new Date().toISOString()
    }));
  }, [setProgress]);

  const addAchievement = useCallback((achievement: string) => {
    setProgress(prev => {
      if (prev.achievements.includes(achievement)) return prev;
      
      return {
        ...prev,
        achievements: [...prev.achievements, achievement],
        experience: prev.experience + 50,
        lastPlayed: new Date().toISOString()
      };
    });
  }, [setProgress]);

  return {
    progress,
    updateProgress,
    addWordLearned,
    addAchievement,
    loading,
    error
  };
}

// Hook for managing game settings
export function useGameSettings() {
  const [settings, setSettings, { loading, error }] = useOptimizedStorage(
    'game_settings',
    {
      volume: 0.8,
      soundEffects: true,
      music: true,
      animations: true,
      theme: 'jungle' as 'jungle' | 'ocean' | 'space' | 'farm',
      language: 'en',
      autoAdvance: false,
      showHints: true,
      difficulty: 'medium' as 'easy' | 'medium' | 'hard',
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      highContrast: false,
      reducedMotion: false
    },
    {
      priority: 'high',
      syncAcrossTabs: true,
      expiry: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
  );

  const updateSetting = useCallback(<K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, [setSettings]);

  return {
    settings,
    updateSetting,
    setSettings,
    loading,
    error
  };
}

// Hook for managing cached word data
export function useWordCache() {
  const [wordCache, setWordCache] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(false);

  const getCachedWord = useCallback(async (wordId: string) => {
    // Check memory cache first
    if (wordCache.has(wordId)) {
      return wordCache.get(wordId);
    }

    // Check localStorage cache
    const cached = localStorageManager.getItem<any>(`word_${wordId}`);
    if (cached) {
      wordCache.set(wordId, cached);
      return cached;
    }

    return null;
  }, [wordCache]);

  const cacheWord = useCallback((wordId: string, wordData: any) => {
    // Store in memory cache
    setWordCache(prev => new Map(prev).set(wordId, wordData));

    // Store in localStorage with low priority (can be cleaned up)
    localStorageManager.setItem(`word_${wordId}`, wordData, {
      priority: 'low',
      expiry: 24 * 60 * 60 * 1000, // 24 hours
      compress: true
    });
  }, []);

  const clearWordCache = useCallback(() => {
    setWordCache(new Map());
    
    // Clear from localStorage
    const stats = localStorageManager.getStats();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('word_')) {
        localStorageManager.removeItem(key.replace('wordy_kids_v1_', ''));
      }
    }
  }, []);

  return {
    getCachedWord,
    cacheWord,
    clearWordCache,
    cacheSize: wordCache.size,
    loading
  };
}

// Hook for storage health monitoring
export function useStorageHealth() {
  const [healthReport, setHealthReport] = useState(localStorageManager.getHealthReport());
  const [lastCheck, setLastCheck] = useState(Date.now());

  const refreshHealth = useCallback(() => {
    setHealthReport(localStorageManager.getHealthReport());
    setLastCheck(Date.now());
  }, []);

  const runCleanup = useCallback(async () => {