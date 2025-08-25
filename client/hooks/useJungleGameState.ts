import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

// Types and interfaces
interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  requirement: number;
  category: "mastery" | "streak" | "exploration" | "social" | "time";
  rarity: "common" | "rare" | "epic" | "legendary";
  unlockedAt?: Date;
}

interface GameSession {
  startTime: Date;
  duration: number;
  wordsReviewed: number;
  wordsLearned: number;
  categoriesExplored: Set<string>;
  achievementsUnlocked: string[];
  maxStreak: number;
  totalScore: number;
}

interface PlayerStats {
  totalScore: number;
  currentStreak: number;
  maxStreak: number;
  jungleGems: number;
  sparkleSeeds: number;
  masteredWordsCount: number;
  favoriteWordsCount: number;
  achievementsCount: number;
  totalPlayTime: number;
  wordsReviewedToday: number;
  categoriesUnlocked: number;
  averageAccuracy: number;
  lastPlayDate: string;
  level: number;
  experience: number;
}

interface GameState {
  score: number;
  streak: number;
  maxStreak: number;
  jungleGems: number;
  sparkleSeeds: number;
  experience: number;
  level: number;
  masteredWords: Set<number>;
  favoriteWords: Set<number>;
  explorerBadges: Set<string>;
  unlockedCategories: Set<string>;
  achievements: Achievement[];
  currentCategory: string;
  sessionStartTime: Date;
  totalPlayTime: number;
  wordsReviewedToday: number;
  dailyGoal: number;
  weeklyGoal: number;
  lastPlayDate: string;
  difficultyPreference: "easy" | "medium" | "hard" | "adaptive";
  soundEnabled: boolean;
  parentalControls: {
    timeLimit: number;
    bedtimeMode: boolean;
    allowSharing: boolean;
  };
}

const STORAGE_KEY = "jungle_word_library_game_state";
const ANALYTICS_KEY = "jungle_word_library_analytics";

// Default achievements configuration
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-word",
    name: "First Word Explorer",
    description: "Mastered your first jungle word!",
    emoji: "🌟",
    color: "from-yellow-400 to-orange-500",
    requirement: 1,
    category: "mastery",
    rarity: "common"
  },
  {
    id: "word-master",
    name: "Word Master",
    description: "Mastered 10 jungle words!",
    emoji: "🏆",
    color: "from-gold-400 to-yellow-500",
    requirement: 10,
    category: "mastery",
    rarity: "rare"
  },
  {
    id: "jungle-explorer",
    name: "Jungle Explorer",
    description: "Mastered 25 jungle words!",
    emoji: "🗺️",
    color: "from-green-400 to-emerald-500",
    requirement: 25,
    category: "mastery",
    rarity: "epic"
  },
  {
    id: "word-champion",
    name: "Word Champion",
    description: "Mastered 50 jungle words!",
    emoji: "👑",
    color: "from-purple-400 to-pink-500",
    requirement: 50,
    category: "mastery",
    rarity: "legendary"
  },
  {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Achieved a 5-word streak!",
    emoji: "🔥",
    color: "from-red-400 to-orange-500",
    requirement: 5,
    category: "streak",
    rarity: "common"
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Achieved a 10-word streak!",
    emoji: "⚡",
    color: "from-blue-400 to-purple-500",
    requirement: 10,
    category: "streak",
    rarity: "rare"
  },
  {
    id: "daily-adventurer",
    name: "Daily Adventurer",
    description: "Reviewed 20 words in one day!",
    emoji: "📅",
    color: "from-indigo-400 to-blue-500",
    requirement: 20,
    category: "time",
    rarity: "rare"
  },
  {
    id: "category-animals",
    name: "Animal Expert",
    description: "Completed the Animals category!",
    emoji: "🦁",
    color: "from-orange-400 to-red-500",
    requirement: 1,
    category: "exploration",
    rarity: "epic"
  },
  {
    id: "category-nature",
    name: "Nature Guardian",
    description: "Completed the Nature category!",
    emoji: "🌳",
    color: "from-green-400 to-emerald-500",
    requirement: 1,
    category: "exploration",
    rarity: "epic"
  },
  {
    id: "gem-collector",
    name: "Gem Collector",
    description: "Collected 100 jungle gems!",
    emoji: "💎",
    color: "from-cyan-400 to-blue-500",
    requirement: 100,
    category: "exploration",
    rarity: "legendary"
  }
];

// Initial game state
const getInitialGameState = (): GameState => ({
  score: 0,
  streak: 0,
  maxStreak: 0,
  jungleGems: 0,
  sparkleSeeds: 0,
  experience: 0,
  level: 1,
  masteredWords: new Set(),
  favoriteWords: new Set(),
  explorerBadges: new Set(),
  unlockedCategories: new Set(["animals", "nature", "food"]),
  achievements: DEFAULT_ACHIEVEMENTS,
  currentCategory: "animals",
  sessionStartTime: new Date(),
  totalPlayTime: 0,
  wordsReviewedToday: 0,
  dailyGoal: 10,
  weeklyGoal: 50,
  lastPlayDate: new Date().toDateString(),
  difficultyPreference: "adaptive",
  soundEnabled: true,
  parentalControls: {
    timeLimit: 30, // minutes
    bedtimeMode: false,
    allowSharing: true
  }
});

export const useJungleGameState = () => {
  // State management
  const [gameState, setGameState] = useState<GameState>(getInitialGameState());
  const [currentSession, setCurrentSession] = useState<GameSession>({
    startTime: new Date(),
    duration: 0,
    wordsReviewed: 0,
    wordsLearned: 0,
    categoriesExplored: new Set(),
    achievementsUnlocked: [],
    maxStreak: 0,
    totalScore: 0
  });

  const sessionIntervalRef = useRef<NodeJS.Timeout>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load saved state on initialization
  useEffect(() => {
    loadGameState();
    startSession();

    // Auto-save every 30 seconds
    const autoSaveInterval = setInterval(() => {
      saveGameState();
    }, 30000);

    // Update session duration every second
    sessionIntervalRef.current = setInterval(() => {
      setCurrentSession(prev => ({
        ...prev,
        duration: Date.now() - prev.startTime.getTime()
      }));
    }, 1000);

    return () => {
      clearInterval(autoSaveInterval);
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveGameState();
    };
  }, []);

  // Load game state from localStorage
  const loadGameState = useCallback(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        
        // Convert Sets back from arrays
        const loadedState: GameState = {
          ...parsed,
          masteredWords: new Set(parsed.masteredWords || []),
          favoriteWords: new Set(parsed.favoriteWords || []),
          explorerBadges: new Set(parsed.explorerBadges || []),
          unlockedCategories: new Set(parsed.unlockedCategories || ["animals", "nature", "food"]),
          achievements: parsed.achievements || DEFAULT_ACHIEVEMENTS,
          sessionStartTime: new Date()
        };

        // Reset daily counter if it's a new day
        const today = new Date().toDateString();
        if (loadedState.lastPlayDate !== today) {
          loadedState.wordsReviewedToday = 0;
          loadedState.lastPlayDate = today;
        }

        setGameState(loadedState);
      }
    } catch (error) {
      console.error("Error loading game state:", error);
      setGameState(getInitialGameState());
    }
  }, []);

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const stateToSave = {
        ...gameState,
        masteredWords: Array.from(gameState.masteredWords),
        favoriteWords: Array.from(gameState.favoriteWords),
        explorerBadges: Array.from(gameState.explorerBadges),
        unlockedCategories: Array.from(gameState.unlockedCategories),
        totalPlayTime: gameState.totalPlayTime + currentSession.duration,
        sessionStartTime: undefined // Don't save session start time
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      
      // Also save analytics data
      const analyticsData = {
        lastSaved: new Date().toISOString(),
        sessionCount: (parseInt(localStorage.getItem(`${ANALYTICS_KEY}_sessions`) || "0") + 1),
        totalWords: gameState.masteredWords.size,
        totalTime: stateToSave.totalPlayTime
      };
      
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analyticsData));
    } catch (error) {
      console.error("Error saving game state:", error);
    }
  }, [gameState, currentSession]);

  // Debounced save function
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(saveGameState, 1000);
  }, [saveGameState]);

  // Start new session
  const startSession = useCallback(() => {
    setCurrentSession({
      startTime: new Date(),
      duration: 0,
      wordsReviewed: 0,
      wordsLearned: 0,
      categoriesExplored: new Set(),
      achievementsUnlocked: [],
      maxStreak: 0,
      totalScore: 0
    });
  }, []);

  // Update score
  const updateScore = useCallback((points: number) => {
    setGameState(prev => ({
      ...prev,
      score: prev.score + points,
      experience: prev.experience + points
    }));

    setCurrentSession(prev => ({
      ...prev,
      totalScore: prev.totalScore + points
    }));

    debouncedSave();
    return gameState.score + points;
  }, [gameState.score, debouncedSave]);

  // Add jungle gems
  const addJungleGems = useCallback((amount: number = 1) => {
    setGameState(prev => ({
      ...prev,
      jungleGems: prev.jungleGems + amount
    }));

    debouncedSave();
    return gameState.jungleGems + amount;
  }, [gameState.jungleGems, debouncedSave]);

  // Add sparkle seeds
  const addSparkleSeeds = useCallback((amount: number = 1) => {
    setGameState(prev => ({
      ...prev,
      sparkleSeeds: prev.sparkleSeeds + amount
    }));

    debouncedSave();
    return gameState.sparkleSeeds + amount;
  }, [gameState.sparkleSeeds, debouncedSave]);

  // Update experience and level
  const addExperience = useCallback((exp: number) => {
    setGameState(prev => {
      const newExp = prev.experience + exp;
      const newLevel = Math.floor(newExp / 100) + 1; // Level up every 100 XP
      
      const leveledUp = newLevel > prev.level;
      
      if (leveledUp) {
        toast({
          title: "🎉 Level Up!",
          description: `You reached level ${newLevel}! Amazing work!`,
          duration: 3000
        });
      }

      return {
        ...prev,
        experience: newExp,
        level: newLevel
      };
    });

    debouncedSave();
  }, [debouncedSave]);

  // Master a word
  const masterWord = useCallback((wordId: number): boolean => {
    if (gameState.masteredWords.has(wordId)) {
      return false; // Already mastered
    }

    setGameState(prev => ({
      ...prev,
      masteredWords: new Set([...prev.masteredWords, wordId]),
      streak: prev.streak + 1,
      maxStreak: Math.max(prev.maxStreak, prev.streak + 1),
      wordsReviewedToday: prev.wordsReviewedToday + 1
    }));

    setCurrentSession(prev => ({
      ...prev,
      wordsLearned: prev.wordsLearned + 1,
      maxStreak: Math.max(prev.maxStreak, gameState.streak + 1)
    }));

    // Add rewards
    updateScore(25);
    addJungleGems(1);
    addExperience(20);

    debouncedSave();
    return true; // New mastery
  }, [gameState.masteredWords, gameState.streak, updateScore, addJungleGems, addExperience, debouncedSave]);

  // Toggle favorite word
  const toggleFavorite = useCallback((wordId: number): boolean => {
    const isFavorited = gameState.favoriteWords.has(wordId);
    
    setGameState(prev => {
      const newFavorites = new Set(prev.favoriteWords);
      if (isFavorited) {
        newFavorites.delete(wordId);
      } else {
        newFavorites.add(wordId);
        // Small reward for favoriting
        return {
          ...prev,
          favoriteWords: newFavorites,
          score: prev.score + 5,
          experience: prev.experience + 5
        };
      }
      return {
        ...prev,
        favoriteWords: newFavorites
      };
    });

    debouncedSave();
    return !isFavorited;
  }, [gameState.favoriteWords, debouncedSave]);

  // Review a word (for streak tracking)
  const reviewWord = useCallback((wordId: number, correct: boolean = true) => {
    setGameState(prev => ({
      ...prev,
      streak: correct ? prev.streak + 1 : 0,
      maxStreak: correct ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak,
      wordsReviewedToday: prev.wordsReviewedToday + 1
    }));

    setCurrentSession(prev => ({
      ...prev,
      wordsReviewed: prev.wordsReviewed + 1,
      maxStreak: correct ? Math.max(prev.maxStreak, gameState.streak + 1) : prev.maxStreak
    }));

    if (correct) {
      updateScore(10);
      addExperience(5);
    }

    debouncedSave();
  }, [gameState.streak, updateScore, addExperience, debouncedSave]);

  // Unlock achievement
  const unlockAchievement = useCallback((achievementId: string) => {
    if (gameState.explorerBadges.has(achievementId)) {
      return false; // Already unlocked
    }

    const achievement = gameState.achievements.find(a => a.id === achievementId);
    if (!achievement) {
      return false;
    }

    setGameState(prev => ({
      ...prev,
      explorerBadges: new Set([...prev.explorerBadges, achievementId]),
      achievements: prev.achievements.map(a =>
        a.id === achievementId ? { ...a, unlockedAt: new Date() } : a
      )
    }));

    setCurrentSession(prev => ({
      ...prev,
      achievementsUnlocked: [...prev.achievementsUnlocked, achievementId]
    }));

    // Achievement rewards based on rarity
    const rewards = {
      common: { score: 50, gems: 2, seeds: 1 },
      rare: { score: 100, gems: 5, seeds: 2 },
      epic: { score: 200, gems: 10, seeds: 5 },
      legendary: { score: 500, gems: 25, seeds: 10 }
    };

    const reward = rewards[achievement.rarity];
    updateScore(reward.score);
    addJungleGems(reward.gems);
    addSparkleSeeds(reward.seeds);
    addExperience(reward.score / 2);

    toast({
      title: "🏆 Achievement Unlocked!",
      description: `${achievement.emoji} ${achievement.name}`,
      duration: 4000
    });

    debouncedSave();
    return true;
  }, [gameState.explorerBadges, gameState.achievements, updateScore, addJungleGems, addSparkleSeeds, addExperience, debouncedSave]);

  // Unlock category
  const unlockCategory = useCallback((categoryId: string): boolean => {
    if (gameState.unlockedCategories.has(categoryId)) {
      return false; // Already unlocked
    }

    setGameState(prev => ({
      ...prev,
      unlockedCategories: new Set([...prev.unlockedCategories, categoryId])
    }));

    updateScore(100);
    addSparkleSeeds(5);
    addExperience(50);

    debouncedSave();
    return true;
  }, [gameState.unlockedCategories, updateScore, addSparkleSeeds, addExperience, debouncedSave]);

  // Get player statistics
  const getPlayerStats = useCallback((): PlayerStats => {
    const sessionDuration = Date.now() - currentSession.startTime.getTime();
    
    return {
      totalScore: gameState.score,
      currentStreak: gameState.streak,
      maxStreak: gameState.maxStreak,
      jungleGems: gameState.jungleGems,
      sparkleSeeds: gameState.sparkleSeeds,
      masteredWordsCount: gameState.masteredWords.size,
      favoriteWordsCount: gameState.favoriteWords.size,
      achievementsCount: gameState.explorerBadges.size,
      totalPlayTime: gameState.totalPlayTime + sessionDuration,
      wordsReviewedToday: gameState.wordsReviewedToday,
      categoriesUnlocked: gameState.unlockedCategories.size,
      averageAccuracy: currentSession.wordsReviewed > 0 ? 
        (currentSession.wordsLearned / currentSession.wordsReviewed) * 100 : 100,
      lastPlayDate: gameState.lastPlayDate,
      level: gameState.level,
      experience: gameState.experience
    };
  }, [gameState, currentSession]);

  // Reset progress (for testing or fresh start)
  const resetProgress = useCallback(() => {
    const initialState = getInitialGameState();
    setGameState(initialState);
    startSession();
    
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ANALYTICS_KEY);
    } catch (error) {
      console.error("Error clearing saved data:", error);
    }

    toast({
      title: "🔄 Progress Reset",
      description: "Your jungle adventure starts fresh!",
      duration: 2000
    });
  }, [startSession]);

  // Save progress manually
  const saveProgress = useCallback(() => {
    saveGameState();
    toast({
      title: "💾 Progress Saved",
      description: "Your jungle adventure is safe!",
      duration: 2000
    });
  }, [saveGameState]);

  // Check if achievement requirements are met
  const checkAchievementRequirements = useCallback(() => {
    const stats = getPlayerStats();
    const newAchievements: string[] = [];

    gameState.achievements.forEach(achievement => {
      if (gameState.explorerBadges.has(achievement.id)) return;

      let requirementMet = false;

      switch (achievement.category) {
        case "mastery":
          requirementMet = stats.masteredWordsCount >= achievement.requirement;
          break;
        case "streak":
          requirementMet = stats.currentStreak >= achievement.requirement;
          break;
        case "time":
          requirementMet = stats.wordsReviewedToday >= achievement.requirement;
          break;
        case "exploration":
          // Category-specific achievements handled separately
          break;
      }

      if (requirementMet) {
        newAchievements.push(achievement.id);
      }
    });

    return newAchievements;
  }, [gameState.achievements, gameState.explorerBadges, getPlayerStats]);

  return {
    // State
    gameState,
    currentSession,
    
    // Basic stats (for easy access)
    score: gameState.score,
    streak: gameState.streak,
    maxStreak: gameState.maxStreak,
    jungleGems: gameState.jungleGems,
    sparkleSeeds: gameState.sparkleSeeds,
    level: gameState.level,
    experience: gameState.experience,
    masteredWords: gameState.masteredWords,
    favoriteWords: gameState.favoriteWords,
    explorerBadges: gameState.explorerBadges,
    unlockedCategories: gameState.unlockedCategories,
    achievements: gameState.achievements,

    // Actions
    updateScore,
    addJungleGems,
    addSparkleSeeds,
    addExperience,
    masterWord,
    toggleFavorite,
    reviewWord,
    unlockAchievement,
    unlockCategory,

    // Utilities
    getPlayerStats,
    checkAchievementRequirements,
    saveProgress,
    resetProgress,
    loadGameState,
    saveGameState
  };
};

export default useJungleGameState;
