import { audioService } from './audioService';

// =====================================================
// POWER-UP SYSTEM
// =====================================================

export interface PowerUp {
  id: string;
  type: 'hint' | 'streak' | 'time' | 'gems' | 'shield' | 'double-points' | 'freeze-time' | 'auto-correct' | 'skip-question';
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number;
  maxUses: number;
  currentUses: number;
  cooldown: number; // in seconds
  lastUsed: number;
  duration: number; // effect duration in seconds
  isActive: boolean;
  effects: PowerUpEffect[];
}

export interface PowerUpEffect {
  type: 'score-multiplier' | 'time-bonus' | 'hint-reveal' | 'protection' | 'auto-answer' | 'skip';
  value: number;
  duration?: number;
}

export interface PowerUpManager {
  availablePowerUps: Map<string, PowerUp>;
  activePowerUps: Map<string, PowerUp>;
  powerUpHistory: PowerUpUsage[];
  gems: number;
  maxActiveSlots: number;
}

export interface PowerUpUsage {
  powerUpId: string;
  timestamp: number;
  effectiveness: number; // 0-1 based on impact
  context: string; // what situation it was used in
}

// =====================================================
// ACHIEVEMENT SYSTEM
// =====================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'progression' | 'skill' | 'exploration' | 'social' | 'special';
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-1
  isSecret: boolean;
  prerequisites: string[]; // Other achievement IDs required
}

export interface AchievementRequirement {
  type: 'score' | 'streak' | 'accuracy' | 'words-learned' | 'time-played' | 'perfect-games' | 'categories-explored' | 'consecutive-days';
  operation: 'greater-than' | 'less-than' | 'equal-to' | 'greater-equal' | 'less-equal';
  value: number;
  timeframe?: 'session' | 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface AchievementReward {
  type: 'gems' | 'power-up' | 'title' | 'avatar' | 'theme' | 'special-effect';
  value: string | number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

// =====================================================
// SCORING SYSTEM
// =====================================================

export interface ScoringConfig {
  basePoints: number;
  difficultyMultipliers: {
    easy: number;
    medium: number;
    hard: number;
  };
  timeBonus: {
    maxBonus: number;
    timeThreshold: number; // seconds
  };
  streakMultipliers: number[]; // multiplier for each streak level
  accuracyBonus: {
    perfect: number; // 100% accuracy
    excellent: number; // 90-99%
    good: number; // 80-89%
  };
  firstAttemptBonus: number;
  categoryBonus: number; // bonus for completing all words in category
  comboMultiplier: number; // multiplier for answer combos
}

export interface GameSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  maxStreak: number;
  totalScore: number;
  powerUpsUsed: PowerUpUsage[];
  achievementsUnlocked: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'adventure' | 'challenge' | 'zen' | 'blitz';
  playerLevel: number;
  experience: number;
}

// =====================================================
// POWER-UP IMPLEMENTATIONS
// =====================================================

export class PowerUpSystem {
  private static readonly POWER_UP_DEFINITIONS: Record<string, Omit<PowerUp, 'currentUses' | 'lastUsed' | 'isActive'>> = {
    'jungle-hint': {
      id: 'jungle-hint',
      type: 'hint',
      name: 'Jungle Whisper',
      description: 'Reveals the first letter of the correct answer',
      icon: '🌿',
      rarity: 'common',
      cost: 10,
      maxUses: 5,
      cooldown: 0,
      duration: 0,
      effects: [{ type: 'hint-reveal', value: 1 }]
    },
    'streak-multiplier': {
      id: 'streak-multiplier',
      type: 'streak',
      name: 'Lightning Strike',
      description: 'Doubles points for the next correct answer',
      icon: '⚡',
      rarity: 'rare',
      cost: 25,
      maxUses: 3,
      cooldown: 30,
      duration: 0,
      effects: [{ type: 'score-multiplier', value: 2 }]
    },
    'time-boost': {
      id: 'time-boost',
      type: 'time',
      name: 'Monkey Speed',
      description: 'Adds 10 seconds to the current question timer',
      icon: '🐒',
      rarity: 'common',
      cost: 15,
      maxUses: 5,
      cooldown: 0,
      duration: 0,
      effects: [{ type: 'time-bonus', value: 10 }]
    },
    'gem-doubler': {
      id: 'gem-doubler',
      type: 'gems',
      name: 'Treasure Hunter',
      description: 'Doubles gem rewards for 3 questions',
      icon: '💎',
      rarity: 'epic',
      cost: 50,
      maxUses: 2,
      cooldown: 60,
      duration: 180,
      effects: [{ type: 'score-multiplier', value: 2, duration: 180 }]
    },
    'shield': {
      id: 'shield',
      type: 'shield',
      name: 'Jungle Guardian',
      description: 'Protects from losing a life on the next wrong answer',
      icon: '🛡️',
      rarity: 'rare',
      cost: 35,
      maxUses: 2,
      cooldown: 45,
      duration: 0,
      effects: [{ type: 'protection', value: 1 }]
    },
    'freeze-time': {
      id: 'freeze-time',
      type: 'freeze-time',
      name: 'Time Crystal',
      description: 'Freezes the timer for 15 seconds',
      icon: '❄️',
      rarity: 'epic',
      cost: 75,
      maxUses: 1,
      cooldown: 120,
      duration: 15,
      effects: [{ type: 'time-bonus', value: 999, duration: 15 }]
    },
    'auto-correct': {
      id: 'auto-correct',
      type: 'auto-correct',
      name: 'Wise Owl',
      description: 'Automatically answers the next question correctly',
      icon: '🦉',
      rarity: 'legendary',
      cost: 100,
      maxUses: 1,
      cooldown: 300,
      duration: 0,
      effects: [{ type: 'auto-answer', value: 1 }]
    },
    'skip-question': {
      id: 'skip-question',
      type: 'skip-question',
      name: 'Jungle Vine',
      description: 'Skip the current question without penalty',
      icon: '🌿',
      rarity: 'rare',
      cost: 30,
      maxUses: 3,
      cooldown: 0,
      duration: 0,
      effects: [{ type: 'skip', value: 1 }]
    }
  };

  public static createPowerUp(id: string): PowerUp | null {
    const definition = this.POWER_UP_DEFINITIONS[id];
    if (!definition) return null;

    return {
      ...definition,
      currentUses: definition.maxUses,
      lastUsed: 0,
      isActive: false
    };
  }

  public static canUsePowerUp(powerUp: PowerUp, currentTime: number): boolean {
    if (powerUp.currentUses <= 0) return false;
    if (powerUp.isActive && powerUp.duration > 0) return false;
    if (currentTime - powerUp.lastUsed < powerUp.cooldown * 1000) return false;
    return true;
  }

  public static usePowerUp(powerUp: PowerUp, currentTime: number): PowerUp | null {
    if (!this.canUsePowerUp(powerUp, currentTime)) return null;

    const updatedPowerUp = {
      ...powerUp,
      currentUses: powerUp.currentUses - 1,
      lastUsed: currentTime,
      isActive: powerUp.duration > 0
    };

    // Trigger audio feedback
    audioService.playPowerUpSound?.() || audioService.playSuccessSound();

    return updatedPowerUp;
  }

  public static getRemainingCooldown(powerUp: PowerUp, currentTime: number): number {
    const timeSinceLastUse = currentTime - powerUp.lastUsed;
    const cooldownMs = powerUp.cooldown * 1000;
    return Math.max(0, cooldownMs - timeSinceLastUse);
  }
}

// =====================================================
// ACHIEVEMENT SYSTEM IMPLEMENTATION
// =====================================================

export class AchievementSystem {
  private static readonly ACHIEVEMENT_DEFINITIONS: Achievement[] = [
    {
      id: 'first-word',
      name: 'First Discovery',
      description: 'Learn your first word in the jungle',
      icon: '🌱',
      rarity: 'bronze',
      category: 'progression',
      requirements: [{ type: 'words-learned', operation: 'greater-equal', value: 1 }],
      rewards: [{ type: 'gems', value: 10 }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'streak-master',
      name: 'Lightning Explorer',
      description: 'Achieve a 10-answer streak',
      icon: '⚡',
      rarity: 'silver',
      category: 'skill',
      requirements: [{ type: 'streak', operation: 'greater-equal', value: 10 }],
      rewards: [{ type: 'gems', value: 25 }, { type: 'power-up', value: 'streak-multiplier' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: ['first-word']
    },
    {
      id: 'perfect-session',
      name: 'Flawless Victory',
      description: 'Complete a session with 100% accuracy',
      icon: '🏆',
      rarity: 'gold',
      category: 'skill',
      requirements: [{ type: 'accuracy', operation: 'equal-to', value: 100, timeframe: 'session' }],
      rewards: [{ type: 'gems', value: 50 }, { type: 'title', value: 'Perfectionist' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'speed-demon',
      name: 'Jungle Speedster',
      description: 'Answer 5 questions in under 15 seconds total',
      icon: '🏃',
      rarity: 'gold',
      category: 'skill',
      requirements: [{ type: 'time-played', operation: 'less-than', value: 15, timeframe: 'session' }],
      rewards: [{ type: 'gems', value: 40 }, { type: 'power-up', value: 'time-boost' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'category-explorer',
      name: 'Jungle Cartographer',
      description: 'Complete all words in 5 different categories',
      icon: '🗺️',
      rarity: 'platinum',
      category: 'exploration',
      requirements: [{ type: 'categories-explored', operation: 'greater-equal', value: 5 }],
      rewards: [{ type: 'gems', value: 100 }, { type: 'avatar', value: 'explorer-hat' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'treasure-hoarder',
      name: 'Gem Collector',
      description: 'Collect 1000 gems',
      icon: '💎',
      rarity: 'platinum',
      category: 'progression',
      requirements: [{ type: 'score', operation: 'greater-equal', value: 1000 }],
      rewards: [{ type: 'special-effect', value: 'golden-aura' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'week-warrior',
      name: 'Dedicated Adventurer',
      description: 'Play for 7 consecutive days',
      icon: '📅',
      rarity: 'gold',
      category: 'progression',
      requirements: [{ type: 'consecutive-days', operation: 'greater-equal', value: 7 }],
      rewards: [{ type: 'gems', value: 75 }, { type: 'theme', value: 'golden-jungle' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: []
    },
    {
      id: 'legendary-explorer',
      name: 'Jungle Legend',
      description: 'Reach level 10 in adventure mode',
      icon: '👑',
      rarity: 'diamond',
      category: 'progression',
      requirements: [{ type: 'score', operation: 'greater-equal', value: 10000 }],
      rewards: [{ type: 'title', value: 'Jungle Legend' }, { type: 'special-effect', value: 'crown-aura' }],
      isUnlocked: false,
      progress: 0,
      isSecret: false,
      prerequisites: ['category-explorer', 'treasure-hoarder']
    },
    {
      id: 'secret-master',
      name: 'Hidden Knowledge',
      description: 'Discover the secret of the ancient jungle',
      icon: '🔮',
      rarity: 'diamond',
      category: 'special',
      requirements: [{ type: 'perfect-games', operation: 'greater-equal', value: 10 }],
      rewards: [{ type: 'power-up', value: 'auto-correct', rarity: 'legendary' }],
      isUnlocked: false,
      progress: 0,
      isSecret: true,
      prerequisites: ['legendary-explorer']
    }
  ];

  public static checkAchievements(gameSession: GameSession, playerStats: any): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of this.ACHIEVEMENT_DEFINITIONS) {
      if (achievement.isUnlocked) continue;

      // Check prerequisites
      const prerequisitesMet = achievement.prerequisites.every(prereqId => 
        this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === prereqId)?.isUnlocked
      );
      if (!prerequisitesMet) continue;

      // Check requirements
      const requirementsMet = achievement.requirements.every(req => 
        this.checkRequirement(req, gameSession, playerStats)
      );

      if (requirementsMet) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 1;
        unlockedAchievements.push(achievement);

        // Apply rewards
        this.applyAchievementRewards(achievement.rewards);

        // Play achievement sound
        audioService.playAchievementSound?.() || audioService.playSuccessSound();
      } else {
        // Update progress
        achievement.progress = this.calculateProgress(achievement.requirements, gameSession, playerStats);
      }
    }

    return unlockedAchievements;
  }

  private static checkRequirement(req: AchievementRequirement, session: GameSession, stats: any): boolean {
    let actualValue = 0;

    switch (req.type) {
      case 'score':
        actualValue = session.totalScore;
        break;
      case 'streak':
        actualValue = session.maxStreak;
        break;
      case 'accuracy':
        actualValue = (session.correctAnswers / session.totalQuestions) * 100;
        break;
      case 'words-learned':
        actualValue = session.correctAnswers;
        break;
      case 'time-played':
        actualValue = session.endTime ? 
          (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
        break;
      case 'perfect-games':
        actualValue = stats.perfectGames || 0;
        break;
      case 'categories-explored':
        actualValue = stats.categoriesExplored?.size || 0;
        break;
      case 'consecutive-days':
        actualValue = stats.consecutiveDays || 0;
        break;
    }

    switch (req.operation) {
      case 'greater-than':
        return actualValue > req.value;
      case 'less-than':
        return actualValue < req.value;
      case 'equal-to':
        return actualValue === req.value;
      case 'greater-equal':
        return actualValue >= req.value;
      case 'less-equal':
        return actualValue <= req.value;
      default:
        return false;
    }
  }

  private static calculateProgress(requirements: AchievementRequirement[], session: GameSession, stats: any): number {
    if (requirements.length === 0) return 0;

    const progresses = requirements.map(req => {
      let actualValue = 0;
      
      // Same logic as checkRequirement but for progress calculation
      switch (req.type) {
        case 'score':
          actualValue = session.totalScore;
          break;
        case 'streak':
          actualValue = session.maxStreak;
          break;
        case 'accuracy':
          actualValue = (session.correctAnswers / session.totalQuestions) * 100;
          break;
        case 'words-learned':
          actualValue = session.correctAnswers;
          break;
        case 'categories-explored':
          actualValue = stats.categoriesExplored?.size || 0;
          break;
        case 'consecutive-days':
          actualValue = stats.consecutiveDays || 0;
          break;
        default:
          return 0;
      }

      return Math.min(actualValue / req.value, 1);
    });

    return progresses.reduce((sum, progress) => sum + progress, 0) / progresses.length;
  }

  private static applyAchievementRewards(rewards: AchievementReward[]): void {
    rewards.forEach(reward => {
      switch (reward.type) {
        case 'gems':
          // Add gems to player inventory
          console.log(`Awarded ${reward.value} gems`);
          break;
        case 'power-up':
          // Add power-up to player inventory
          console.log(`Awarded power-up: ${reward.value}`);
          break;
        case 'title':
          // Unlock title for player
          console.log(`Awarded title: ${reward.value}`);
          break;
        case 'avatar':
          // Unlock avatar item
          console.log(`Awarded avatar: ${reward.value}`);
          break;
        case 'theme':
          // Unlock theme
          console.log(`Awarded theme: ${reward.value}`);
          break;
        case 'special-effect':
          // Unlock special effect
          console.log(`Awarded special effect: ${reward.value}`);
          break;
      }
    });
  }

  public static getAvailableAchievements(): Achievement[] {
    return this.ACHIEVEMENT_DEFINITIONS.filter(a => !a.isSecret || a.isUnlocked);
  }

  public static getUnlockedAchievements(): Achievement[] {
    return this.ACHIEVEMENT_DEFINITIONS.filter(a => a.isUnlocked);
  }

  public static getAchievementProgress(id: string): Achievement | undefined {
    return this.ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
  }
}

// =====================================================
// ENHANCED SCORING SYSTEM
// =====================================================

export class ScoringSystem {
  private static readonly CONFIG: ScoringConfig = {
    basePoints: 100,
    difficultyMultipliers: {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5
    },
    timeBonus: {
      maxBonus: 50,
      timeThreshold: 5
    },
    streakMultipliers: [1, 1.1, 1.2, 1.3, 1.5, 1.7, 2.0, 2.5, 3.0, 4.0],
    accuracyBonus: {
      perfect: 500,
      excellent: 300,
      good: 150
    },
    firstAttemptBonus: 25,
    categoryBonus: 1000,
    comboMultiplier: 1.1
  };

  public static calculateQuestionScore(
    isCorrect: boolean,
    timeLeft: number,
    totalTime: number,
    streak: number,
    difficulty: 'easy' | 'medium' | 'hard',
    isFirstAttempt: boolean = true,
    activePowerUps: PowerUp[] = []
  ): number {
    if (!isCorrect) return 0;

    let score = this.CONFIG.basePoints;

    // Difficulty multiplier
    score *= this.CONFIG.difficultyMultipliers[difficulty];

    // Time bonus (faster answers get more points)
    if (timeLeft >= this.CONFIG.timeBonus.timeThreshold) {
      const timeBonus = Math.min(
        (timeLeft / totalTime) * this.CONFIG.timeBonus.maxBonus,
        this.CONFIG.timeBonus.maxBonus
      );
      score += timeBonus;
    }

    // Streak multiplier
    const streakIndex = Math.min(streak, this.CONFIG.streakMultipliers.length - 1);
    score *= this.CONFIG.streakMultipliers[streakIndex];

    // First attempt bonus
    if (isFirstAttempt) {
      score += this.CONFIG.firstAttemptBonus;
    }

    // Power-up multipliers
    activePowerUps.forEach(powerUp => {
      powerUp.effects.forEach(effect => {
        if (effect.type === 'score-multiplier') {
          score *= effect.value;
        }
      });
    });

    return Math.round(score);
  }

  public static calculateSessionBonus(session: GameSession): number {
    let bonus = 0;

    // Accuracy bonus
    const accuracy = (session.correctAnswers / session.totalQuestions) * 100;
    if (accuracy === 100) {
      bonus += this.CONFIG.accuracyBonus.perfect;
    } else if (accuracy >= 90) {
      bonus += this.CONFIG.accuracyBonus.excellent;
    } else if (accuracy >= 80) {
      bonus += this.CONFIG.accuracyBonus.good;
    }

    // Streak bonus (for maintaining high streaks)
    if (session.maxStreak >= 10) {
      bonus += session.maxStreak * 10;
    }

    return bonus;
  }

  public static calculateLevelProgress(currentXP: number, level: number): { 
    currentLevelXP: number; 
    nextLevelXP: number; 
    progress: number;
    canLevelUp: boolean;
  } {
    // Exponential XP curve: level^2 * 100
    const nextLevelXP = Math.pow(level + 1, 2) * 100;
    const currentLevelXP = Math.pow(level, 2) * 100;
    const progressXP = currentXP - currentLevelXP;
    const requiredXP = nextLevelXP - currentLevelXP;
    
    return {
      currentLevelXP: progressXP,
      nextLevelXP: requiredXP,
      progress: Math.min(progressXP / requiredXP, 1),
      canLevelUp: currentXP >= nextLevelXP
    };
  }
}

// =====================================================
// GAME SESSION MANAGER
// =====================================================

export class GameSessionManager {
  public static createSession(
    category: string,
    difficulty: 'easy' | 'medium' | 'hard',
    gameMode: 'adventure' | 'challenge' | 'zen' | 'blitz',
    playerLevel: number
  ): GameSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date(),
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      maxStreak: 0,
      totalScore: 0,
      powerUpsUsed: [],
      achievementsUnlocked: [],
      category,
      difficulty,
      gameMode,
      playerLevel,
      experience: 0
    };
  }

  public static updateSession(
    session: GameSession,
    isCorrect: boolean,
    questionScore: number,
    powerUpsUsed: PowerUpUsage[] = []
  ): GameSession {
    const updatedSession = { ...session };
    
    updatedSession.totalQuestions++;
    
    if (isCorrect) {
      updatedSession.correctAnswers++;
      updatedSession.currentStreak++;
      updatedSession.maxStreak = Math.max(updatedSession.maxStreak, updatedSession.currentStreak);
    } else {
      updatedSession.currentStreak = 0;
    }
    
    updatedSession.totalScore += questionScore;
    updatedSession.experience += isCorrect ? 25 : 5;
    updatedSession.powerUpsUsed.push(...powerUpsUsed);
    
    return updatedSession;
  }

  public static completeSession(session: GameSession): GameSession {
    const completedSession = { ...session };
    completedSession.endTime = new Date();
    
    // Add session completion bonus
    const sessionBonus = ScoringSystem.calculateSessionBonus(completedSession);
    completedSession.totalScore += sessionBonus;
    
    return completedSession;
  }

  public static getSessionStats(session: GameSession): {
    accuracy: number;
    averageScore: number;
    duration: number;
    questionsPerMinute: number;
    rank: string;
  } {
    const accuracy = session.totalQuestions > 0 ? 
      (session.correctAnswers / session.totalQuestions) * 100 : 0;
    
    const averageScore = session.totalQuestions > 0 ? 
      session.totalScore / session.totalQuestions : 0;
    
    const duration = session.endTime ? 
      (session.endTime.getTime() - session.startTime.getTime()) / 1000 : 0;
    
    const questionsPerMinute = duration > 0 ? 
      (session.totalQuestions / duration) * 60 : 0;
    
    // Determine rank based on performance
    let rank = 'Explorer';
    if (accuracy >= 95 && session.maxStreak >= 10) rank = 'Jungle Legend';
    else if (accuracy >= 90 && session.maxStreak >= 7) rank = 'Jungle Master';
    else if (accuracy >= 80 && session.maxStreak >= 5) rank = 'Jungle Ranger';
    else if (accuracy >= 70) rank = 'Jungle Scout';
    
    return {
      accuracy,
      averageScore,
      duration,
      questionsPerMinute,
      rank
    };
  }
}

export default {
  PowerUpSystem,
  AchievementSystem,
  ScoringSystem,
  GameSessionManager
};
