// Core types for the new Jungle Adventure Word Explorer

export interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  imageUrl?: string;
  rarity?: "common" | "rare" | "epic" | "legendary";
  tags?: string[];
  dateAdded?: Date;
  lastReviewed?: Date;
}

export interface JungleCharacter {
  emoji: string;
  name: string;
  color: string;
  personality: string;
  favoriteWords?: string[];
  specialAbility?: string;
  backstory?: string;
}

export interface Category {
  id: string;
  name: string;
  character: JungleCharacter;
  wordCount: number;
  description: string;
  unlocked: boolean;
  progress: number; // 0-100
  badge?: string;
}

export interface UserProgress {
  totalWordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  gems: number;
  level: number;
  xp: number;
  badges: string[];
  achievements: Achievement[];
  preferences: UserPreferences;
  stats: LearningStats;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "words" | "streaks" | "exploration" | "mastery" | "special";
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface UserPreferences {
  audioEnabled: boolean;
  autoPlay: boolean;
  showDefinitions: boolean;
  showExamples: boolean;
  showFunFacts: boolean;
  fontSize: "normal" | "large" | "extra-large";
  theme: "jungle" | "ocean" | "space" | "garden";
  animationsEnabled: boolean;
  reducedMotion: boolean;
  voiceSpeed: number;
  hapticFeedback: boolean;
}

export interface LearningStats {
  totalTimeSpent: number; // in minutes
  averageAccuracy: number;
  wordsPerSession: number;
  favoriteDifficulty: "easy" | "medium" | "hard";
  favoriteCategory: string;
  strongAreas: string[];
  improvementAreas: string[];
  dailyGoal: number;
  weeklyProgress: number;
}

export interface WordSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  category: string;
  wordsReviewed: number;
  wordsLearned: number;
  accuracy: number;
  timeSpent: number;
  achievements: string[];
  difficulty: "easy" | "medium" | "hard";
  sessionType: "exploration" | "review" | "challenge" | "quiz";
}

export interface LearningGoal {
  id: string;
  type: "daily" | "weekly" | "monthly" | "custom";
  target: number;
  current: number;
  metric: "words" | "time" | "categories" | "streak";
  description: string;
  reward?: string;
  deadline?: Date;
  completed: boolean;
}

// Character definitions for different categories
export const JUNGLE_CHARACTERS: Record<string, JungleCharacter> = {
  food: {
    emoji: "🐵",
    name: "Mango the Monkey",
    color: "from-orange-400 to-orange-600",
    personality: "Energetic and always hungry for knowledge!",
    specialAbility: "Can smell delicious words from miles away",
    backstory: "Mango loves swinging through fruit trees and discovering tasty words!",
  },
  animals: {
    emoji: "🦁",
    name: "Leo the Lion",
    color: "from-yellow-400 to-amber-600",
    personality: "Brave and protective of all jungle friends",
    specialAbility: "Roars with excitement when you learn animal words",
    backstory: "Leo is the king of the jungle and knows every animal's story!",
  },
  nature: {
    emoji: "🦋",
    name: "Flutter the Butterfly",
    color: "from-blue-400 to-cyan-600",
    personality: "Graceful and loves beautiful things",
    specialAbility: "Creates colorful word clouds when you master nature words",
    backstory: "Flutter dances through flowers and spreads the magic of nature words!",
  },
  objects: {
    emoji: "🐼",
    name: "Panda Pete",
    color: "from-gray-400 to-gray-600",
    personality: "Careful and thoughtful about everyday things",
    specialAbility: "Organizes objects by teaching their special uses",
    backstory: "Pete loves organizing his bamboo collection and teaching about useful objects!",
  },
  body: {
    emoji: "🐸",
    name: "Freddy the Frog",
    color: "from-green-400 to-emerald-600",
    personality: "Bouncy and health-conscious",
    specialAbility: "Jumps with joy when you learn body parts",
    backstory: "Freddy hops around the pond teaching about staying healthy and strong!",
  },
  clothes: {
    emoji: "🦜",
    name: "Polly the Parrot",
    color: "from-purple-400 to-violet-600",
    personality: "Colorful and fashion-forward",
    specialAbility: "Shows off different outfits for every clothing word",
    backstory: "Polly loves trying on different colored feathers and teaching about fashion!",
  },
  family: {
    emoji: "🐻",
    name: "Buddy the Bear",
    color: "from-brown-400 to-yellow-600",
    personality: "Warm and caring about relationships",
    specialAbility: "Gives big hugs when you learn family words",
    backstory: "Buddy has a big family in the forest and loves teaching about love and care!",
  },
  feelings: {
    emoji: "🦊",
    name: "Felix the Fox",
    color: "from-red-400 to-pink-600",
    personality: "Smart and emotionally intelligent",
    specialAbility: "Changes colors to match different emotions",
    backstory: "Felix is very wise and helps everyone understand their feelings better!",
  },
  colors: {
    emoji: "🌈",
    name: "Rainbow",
    color: "from-pink-400 to-purple-600",
    personality: "Bright and cheerful",
    specialAbility: "Paints the sky with beautiful colors for each word",
    backstory: "Rainbow appears after jungle rain storms to teach about all the colors!",
  },
  numbers: {
    emoji: "🐨",
    name: "Count Koala",
    color: "from-indigo-400 to-blue-600",
    personality: "Mathematical and precise",
    specialAbility: "Counts eucalyptus leaves to demonstrate numbers",
    backstory: "Count Koala loves hanging upside down and teaching math through nature!",
  },
};

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-word",
    name: "First Steps",
    description: "Learn your very first word!",
    emoji: "🌱",
    category: "words",
    requirement: 1,
    progress: 0,
    unlocked: false,
    rarity: "common",
  },
  {
    id: "word-collector",
    name: "Word Collector",
    description: "Learn 10 amazing words",
    emoji: "📚",
    category: "words",
    requirement: 10,
    progress: 0,
    unlocked: false,
    rarity: "common",
  },
  {
    id: "word-master",
    name: "Word Master",
    description: "Master 25 words like a pro!",
    emoji: "🎯",
    category: "words",
    requirement: 25,
    progress: 0,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "vocabulary-hero",
    name: "Vocabulary Hero",
    description: "Learn 50 words and become a hero!",
    emoji: "🦸",
    category: "words",
    requirement: 50,
    progress: 0,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "streak-starter",
    name: "Streak Starter",
    description: "Learn words for 3 days in a row",
    emoji: "🔥",
    category: "streaks",
    requirement: 3,
    progress: 0,
    unlocked: false,
    rarity: "common",
  },
  {
    id: "streak-master",
    name: "Streak Master",
    description: "Amazing! 7 days learning streak",
    emoji: "⚡",
    category: "streaks",
    requirement: 7,
    progress: 0,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "jungle-explorer",
    name: "Jungle Explorer",
    description: "Explore all categories in the jungle",
    emoji: "🗺️",
    category: "exploration",
    requirement: 10, // number of categories
    progress: 0,
    unlocked: false,
    rarity: "epic",
  },
  {
    id: "animal-expert",
    name: "Animal Expert",
    description: "Master all animal words with Leo!",
    emoji: "🦁",
    category: "mastery",
    requirement: 100, // percentage of category mastery
    progress: 0,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "food-lover",
    name: "Food Lover",
    description: "Learn all food words with Mango!",
    emoji: "🍎",
    category: "mastery",
    requirement: 100,
    progress: 0,
    unlocked: false,
    rarity: "rare",
  },
  {
    id: "rainbow-master",
    name: "Rainbow Master",
    description: "Complete the rainbow of learning!",
    emoji: "🌈",
    category: "special",
    requirement: 100,
    progress: 0,
    unlocked: false,
    rarity: "legendary",
  },
];

// Default user preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  audioEnabled: true,
  autoPlay: false,
  showDefinitions: false,
  showExamples: true,
  showFunFacts: true,
  fontSize: "normal",
  theme: "jungle",
  animationsEnabled: true,
  reducedMotion: false,
  voiceSpeed: 1.0,
  hapticFeedback: true,
};

// Learning goals templates
export const LEARNING_GOAL_TEMPLATES: Omit<LearningGoal, "id" | "current" | "completed">[] = [
  {
    type: "daily",
    target: 5,
    metric: "words",
    description: "Learn 5 new words today",
    reward: "🌟 Daily Star Badge",
  },
  {
    type: "weekly",
    target: 25,
    metric: "words",
    description: "Learn 25 words this week",
    reward: "🏆 Weekly Champion Trophy",
  },
  {
    type: "daily",
    target: 15,
    metric: "time",
    description: "Spend 15 minutes exploring words",
    reward: "⏰ Time Explorer Badge",
  },
  {
    type: "weekly",
    target: 3,
    metric: "categories",
    description: "Explore 3 different categories",
    reward: "🗺️ Category Explorer Badge",
  },
];

// Utility functions
export const getCharacterForCategory = (categoryId: string): JungleCharacter => {
  return JUNGLE_CHARACTERS[categoryId] || JUNGLE_CHARACTERS.nature;
};

export const calculateLevel = (totalWordsLearned: number): number => {
  return Math.floor(totalWordsLearned / 10) + 1;
};

export const calculateXP = (totalWordsLearned: number): number => {
  return totalWordsLearned * 10;
};

export const getNextLevelRequirement = (currentLevel: number): number => {
  return currentLevel * 10;
};

export const calculateProgress = (current: number, target: number): number => {
  return Math.min(Math.round((current / target) * 100), 100);
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "common": return "text-gray-600";
    case "rare": return "text-blue-600";
    case "epic": return "text-purple-600";
    case "legendary": return "text-yellow-600";
    default: return "text-gray-600";
  }
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case "easy": return "text-green-600 bg-green-50";
    case "medium": return "text-yellow-600 bg-yellow-50";
    case "hard": return "text-red-600 bg-red-50";
    default: return "text-gray-600 bg-gray-50";
  }
};
