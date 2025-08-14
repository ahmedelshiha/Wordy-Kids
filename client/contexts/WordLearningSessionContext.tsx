import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useSessionPersistence, SessionData } from '@/hooks/useSessionPersistence';

interface WordLearningSessionContextType {
  // Session data
  sessionData: SessionData;
  updateSession: (updates: Partial<SessionData>) => void;
  clearSession: () => void;
  isSessionValid: boolean;
  
  // Convenience methods
  saveProgress: (progress: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    currentWordIndex: number;
  }) => void;
  
  restoreProgress: () => {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    currentWordIndex: number;
  };
  
  saveLearningState: (state: {
    activeTab: string;
    selectedCategory: string;
    learningMode: 'cards' | 'matching' | 'selector';
    currentDashboardWords: any[];
  }) => void;
  
  saveQuizState: (state: {
    showQuiz: boolean;
    selectedQuizType: 'quick' | 'standard' | 'challenge' | 'picture' | 'spelling' | 'speed';
    gameMode: boolean;
  }) => void;
  
  saveUserProfile: (profile: any) => void;
  
  getSessionStats: () => {
    totalWordsLearned: number;
    totalTimeSpent: number;
    sessionsCompleted: number;
    accuracy: number;
  };
}

const WordLearningSessionContext = createContext<WordLearningSessionContextType | null>(null);

export function WordLearningSessionProvider({ children }: { children: React.ReactNode }) {
  const initialSessionData = {
    currentProfile: null,
    isLoggedIn: false,
    activeTab: 'dashboard',
    selectedCategory: '',
    learningMode: 'selector' as const,
    currentWordIndex: 0,
    rememberedWords: [],
    forgottenWords: [],
    excludedWordIds: [],
    currentDashboardWords: [],
    sessionNumber: 1,
    dashboardSessionNumber: 1,
    userWordHistory: {},
    showQuiz: false,
    selectedQuizType: 'standard' as const,
    gameMode: false,
    backgroundAnimationsEnabled: true,
    lastUpdated: Date.now(),
    sessionStartTime: Date.now()
  };

  const { sessionData, updateSession, clearSession, isSessionValid } = useSessionPersistence(
    initialSessionData,
    {
      key: 'wordy-learning-session',
      debounceMs: 300, // Faster debounce for better UX
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      version: '1.0'
    }
  );

  // Auto-save progress every 30 seconds if there's activity
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData.rememberedWords.length > 0 || sessionData.forgottenWords.length > 0) {
        updateSession({
          lastUpdated: Date.now()
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionData.rememberedWords.length, sessionData.forgottenWords.length, updateSession]);

  // Page visibility API to save when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Save immediately when tab becomes hidden
        updateSession({
          lastUpdated: Date.now()
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateSession]);

  const saveProgress = useCallback((progress: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    currentWordIndex: number;
  }) => {
    updateSession({
      rememberedWords: Array.from(progress.rememberedWords),
      forgottenWords: Array.from(progress.forgottenWords),
      currentWordIndex: progress.currentWordIndex,
      lastUpdated: Date.now()
    });
  }, [updateSession]);

  const restoreProgress = useCallback(() => {
    return {
      rememberedWords: new Set(sessionData.rememberedWords || []),
      forgottenWords: new Set(sessionData.forgottenWords || []),
      currentWordIndex: sessionData.currentWordIndex || 0
    };
  }, [sessionData]);

  const saveLearningState = useCallback((state: {
    activeTab: string;
    selectedCategory: string;
    learningMode: 'cards' | 'matching' | 'selector';
    currentDashboardWords: any[];
  }) => {
    updateSession({
      activeTab: state.activeTab,
      selectedCategory: state.selectedCategory,
      learningMode: state.learningMode,
      currentDashboardWords: state.currentDashboardWords,
      lastUpdated: Date.now()
    });
  }, [updateSession]);

  const saveQuizState = useCallback((state: {
    showQuiz: boolean;
    selectedQuizType: 'quick' | 'standard' | 'challenge' | 'picture' | 'spelling' | 'speed';
    gameMode: boolean;
  }) => {
    updateSession({
      showQuiz: state.showQuiz,
      selectedQuizType: state.selectedQuizType,
      gameMode: state.gameMode,
      lastUpdated: Date.now()
    });
  }, [updateSession]);

  const saveUserProfile = useCallback((profile: any) => {
    updateSession({
      currentProfile: profile,
      isLoggedIn: !!profile,
      lastUpdated: Date.now()
    });
  }, [updateSession]);

  const getSessionStats = useCallback(() => {
    const totalWordsLearned = sessionData.rememberedWords.length;
    const totalTimeSpent = Math.round((Date.now() - sessionData.sessionStartTime) / 1000 / 60); // minutes
    const sessionsCompleted = sessionData.sessionNumber - 1;
    const totalAttempts = sessionData.rememberedWords.length + sessionData.forgottenWords.length;
    const accuracy = totalAttempts > 0 ? Math.round((sessionData.rememberedWords.length / totalAttempts) * 100) : 0;

    return {
      totalWordsLearned,
      totalTimeSpent,
      sessionsCompleted,
      accuracy
    };
  }, [sessionData]);

  const contextValue: WordLearningSessionContextType = {
    sessionData,
    updateSession,
    clearSession,
    isSessionValid,
    saveProgress,
    restoreProgress,
    saveLearningState,
    saveQuizState,
    saveUserProfile,
    getSessionStats
  };

  return (
    <WordLearningSessionContext.Provider value={contextValue}>
      {children}
    </WordLearningSessionContext.Provider>
  );
}

export function useWordLearningSession() {
  const context = useContext(WordLearningSessionContext);
  if (!context) {
    throw new Error('useWordLearningSession must be used within a WordLearningSessionProvider');
  }
  return context;
}

// Helper hook for session restoration notification
export function useSessionRestoration() {
  const { sessionData } = useWordLearningSession();
  
  const hasStoredProgress = React.useMemo(() => {
    return (
      sessionData.rememberedWords.length > 0 ||
      sessionData.forgottenWords.length > 0 ||
      sessionData.selectedCategory !== '' ||
      sessionData.currentWordIndex > 0
    );
  }, [sessionData]);

  const getRestoreMessage = React.useCallback(() => {
    if (!hasStoredProgress) return null;

    const wordsLearned = sessionData.rememberedWords.length;
    const category = sessionData.selectedCategory;
    const timeDiff = Math.round((Date.now() - sessionData.lastUpdated) / 1000 / 60); // minutes

    let message = "Welcome back! ";
    
    if (wordsLearned > 0) {
      message += `You've learned ${wordsLearned} word${wordsLearned !== 1 ? 's' : ''}`;
      if (category) {
        message += ` in ${category}`;
      }
      message += ". ";
    }
    
    if (timeDiff < 60) {
      message += `Your last session was ${timeDiff} minute${timeDiff !== 1 ? 's' : ''} ago.`;
    } else if (timeDiff < 24 * 60) {
      const hours = Math.round(timeDiff / 60);
      message += `Your last session was ${hours} hour${hours !== 1 ? 's' : ''} ago.`;
    } else {
      const days = Math.round(timeDiff / 60 / 24);
      message += `Your last session was ${days} day${days !== 1 ? 's' : ''} ago.`;
    }

    message += " Would you like to continue where you left off?";
    
    return message;
  }, [hasStoredProgress, sessionData]);

  return {
    hasStoredProgress,
    getRestoreMessage
  };
}
