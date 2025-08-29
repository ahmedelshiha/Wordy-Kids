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
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
  rarity?: "common" | "rare" | "epic" | "legendary" | "mythical";
  sound?: string;
  color?: string;
  habitat?: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  autoPlay: boolean;
  soundEnabled: boolean;
}

export interface WordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  onWordPracticeNeeded?: (wordId: number) => void;
  onWordShare?: (word: Word) => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  adventureLevel?: number;
  explorerBadges?: string[];
  isJungleQuest?: boolean;
  isWordMastered?: (wordId: number) => boolean;
  accessibilitySettings?: AccessibilitySettings;
  showAnimations?: boolean;
  autoPlay?: boolean;
}

export type DiscoveryMode = "learn" | "quiz" | "memory";
export type Rating = "easy" | "medium" | "hard";

export interface WordCardState {
  isFlipped: boolean;
  isPressed: boolean;
  mode: DiscoveryMode;
  quizRevealed: boolean;
  score: number;
  explorerXP: number;
  showLevelUp: boolean;
  showParticles: boolean;
  currentAnimation: string;
  showHint: boolean;
  hintText: string | null;
  hintsUsed: number;
  practiceNeeded: boolean;
  ratedAs: Rating | null;
  isPlaying: boolean;
}

export type WordCardAction =
  | { type: "FLIP_CARD" }
  | { type: "SET_PRESSED"; payload: boolean }
  | { type: "SET_MODE"; payload: DiscoveryMode }
  | { type: "SET_QUIZ_REVEALED"; payload: boolean }
  | { type: "ADD_SCORE"; payload: { delta: number; reason: string } }
  | { type: "ADD_XP"; payload: number }
  | { type: "SET_LEVEL_UP"; payload: boolean }
  | { type: "SET_PARTICLES"; payload: boolean }
  | { type: "SET_ANIMATION"; payload: string }
  | { type: "SET_HINT"; payload: { show: boolean; text?: string | null } }
  | { type: "INCREMENT_HINTS" }
  | { type: "SET_PRACTICE_NEEDED"; payload: boolean }
  | { type: "SET_RATED_AS"; payload: Rating | null }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "RESET_STATE" };

export interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  delay: number;
}

export interface WordProgressEvent {
  wordId: number;
  delta: number;
  reason: string;
  score: number;
}

export interface WordPracticeEvent {
  wordId: number;
}

