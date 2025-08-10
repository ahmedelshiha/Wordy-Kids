// Forgotten Words Adventure - Core Data Model

export interface WordAdventureStatus {
  word_id: string;
  status: "healthy" | "forgotten" | "rescue_priority" | "rescued" | "mastered";
  health: number; // 0-100, decreases when forgotten
  last_seen: Date;
  forget_count: number;
  next_review_date: Date;
  rescue_attempts: number;
  mastery_level: number; // 0-100
  location: MapLocation;
  companion_unlocked?: boolean;
}

export interface MapLocation {
  zone:
    | "word_forest"
    | "memory_castle"
    | "vocabulary_village"
    | "knowledge_kingdom";
  x: number; // Position on map
  y: number;
  difficulty_tier: "easy" | "medium" | "hard" | "expert";
}

export interface WordHero {
  id: string;
  name: string;
  level: number;
  experience: number;
  coins: number;
  rescued_words_count: number;
  current_skin: string;
  unlocked_skins: string[];
  badges: Badge[];
  daily_mission_progress: DailyMission;
  power_ups: PowerUp[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  earned_date: Date;
  criteria: BadgeCriteria;
}

export interface BadgeCriteria {
  type: "words_rescued" | "streak_days" | "perfect_games" | "speed_record";
  threshold: number;
  current_progress: number;
}

export interface DailyMission {
  date: Date;
  missions: Mission[];
  completed_count: number;
  reward_claimed: boolean;
}

export interface Mission {
  id: string;
  type: "rescue_words" | "play_games" | "perfect_score" | "speed_challenge";
  title: string;
  description: string;
  target: number;
  current_progress: number;
  completed: boolean;
  reward_coins: number;
  reward_xp: number;
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: "time_freeze" | "double_hints" | "health_boost" | "auto_complete";
  duration: number; // in seconds
  uses_remaining: number;
  icon: string;
}

export interface RescueGame {
  id: string;
  name: string;
  type: "flashcard_duel" | "word_match_race" | "letter_builder" | "word_chase";
  difficulty: "easy" | "medium" | "hard";
  description: string;
  icon: string;
  estimated_time: number; // in seconds
  rewards: GameRewards;
}

export interface GameRewards {
  base_xp: number;
  base_coins: number;
  health_restore: number;
  bonus_multiplier: number;
}

export interface RescueGameResult {
  game_id: string;
  word_id: string;
  success: boolean;
  score: number;
  time_taken: number;
  perfect_score: boolean;
  xp_earned: number;
  coins_earned: number;
  health_restored: number;
  power_ups_used: string[];
}

export interface AdventureEvent {
  id: string;
  name: string;
  description: string;
  type: "word_storm" | "rescue_rush" | "master_challenge";
  start_date: Date;
  end_date: Date;
  active: boolean;
  special_rules: EventRules;
  rewards: EventRewards;
}

export interface EventRules {
  health_decay_multiplier?: number;
  xp_multiplier?: number;
  special_game_mode?: string;
  limited_attempts?: number;
}

export interface EventRewards {
  special_badge?: Badge;
  exclusive_skin?: string;
  bonus_coins?: number;
  rare_power_ups?: PowerUp[];
}

// Game Configuration
export const GAME_CONFIG = {
  HEALTH_THRESHOLDS: {
    HEALTHY: 80,
    WARNING: 50,
    RESCUE_PRIORITY: 30,
    CRITICAL: 10,
  },
  XP_REWARDS: {
    WORD_RESCUED: 50,
    PERFECT_GAME: 25,
    SPEED_BONUS: 15,
    STREAK_BONUS: 10,
  },
  COIN_REWARDS: {
    WORD_RESCUED: 10,
    PERFECT_GAME: 5,
    DAILY_MISSION: 20,
    LEVEL_UP: 50,
  },
  LEVEL_REQUIREMENTS: {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 1000,
    // Progressive scaling
  },
  HEALTH_DECAY: {
    DAILY: 5,
    ON_MISTAKE: 15,
    ON_SKIP: 10,
  },
  HEALTH_RESTORE: {
    SUCCESSFUL_RESCUE: 30,
    PERFECT_GAME: 50,
    POWER_UP_BOOST: 25,
  },
} as const;

// Adventure Game Types
export type AdventureGameType =
  | "flashcard_duel"
  | "word_match_race"
  | "letter_builder"
  | "word_chase";
export type WordStatus =
  | "healthy"
  | "forgotten"
  | "rescue_priority"
  | "rescued"
  | "mastered";
export type MapZone =
  | "word_forest"
  | "memory_castle"
  | "vocabulary_village"
  | "knowledge_kingdom";
export type BadgeType =
  | "memory_master"
  | "word_saver"
  | "vocabulary_champion"
  | "speed_runner"
  | "perfectionist";

// Helper functions for game logic
export const calculateWordHealth = (status: WordAdventureStatus): number => {
  const daysSinceLastSeen = Math.floor(
    (Date.now() - status.last_seen.getTime()) / (1000 * 60 * 60 * 24),
  );

  let healthDecay = daysSinceLastSeen * GAME_CONFIG.HEALTH_DECAY.DAILY;
  healthDecay += status.forget_count * GAME_CONFIG.HEALTH_DECAY.ON_MISTAKE;

  return Math.max(0, status.health - healthDecay);
};

export const determineWordStatus = (health: number): WordStatus => {
  if (health >= GAME_CONFIG.HEALTH_THRESHOLDS.HEALTHY) return "healthy";
  if (health >= GAME_CONFIG.HEALTH_THRESHOLDS.WARNING) return "forgotten";
  if (health >= GAME_CONFIG.HEALTH_THRESHOLDS.RESCUE_PRIORITY)
    return "rescue_priority";
  return "rescue_priority";
};

export const calculateXPReward = (gameResult: RescueGameResult): number => {
  let xp = GAME_CONFIG.XP_REWARDS.WORD_RESCUED;

  if (gameResult.perfect_score) {
    xp += GAME_CONFIG.XP_REWARDS.PERFECT_GAME;
  }

  if (gameResult.time_taken < 30) {
    // Speed bonus for quick completion
    xp += GAME_CONFIG.XP_REWARDS.SPEED_BONUS;
  }

  return xp;
};

export const calculateNextReviewDate = (
  currentHealth: number,
  masteryLevel: number,
  forgetCount: number,
): Date => {
  // Spaced repetition algorithm
  let baseDays = 1;

  if (masteryLevel > 80) baseDays = 7;
  else if (masteryLevel > 60) baseDays = 5;
  else if (masteryLevel > 40) baseDays = 3;
  else if (masteryLevel > 20) baseDays = 2;

  // Adjust based on forget count
  const adjustedDays = Math.max(1, baseDays - forgetCount);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + adjustedDays);

  return nextReview;
};
