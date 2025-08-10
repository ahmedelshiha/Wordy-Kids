// Forgotten Words Adventure Service
import { 
  WordAdventureStatus, 
  WordHero, 
  RescueGameResult, 
  Mission,
  Badge,
  GAME_CONFIG,
  calculateWordHealth,
  determineWordStatus,
  calculateXPReward,
  calculateNextReviewDate,
  WordStatus,
  MapZone
} from '@shared/adventure';

class AdventureService {
  private storageKey = 'wordwise_adventure_data';
  private heroKey = 'wordwise_hero_data';
  
  // Initialize adventure data for a word
  initializeWordAdventure(wordId: string, initialHealth: number = 100): WordAdventureStatus {
    const now = new Date();
    return {
      word_id: wordId,
      status: 'healthy',
      health: initialHealth,
      last_seen: now,
      forget_count: 0,
      next_review_date: calculateNextReviewDate(initialHealth, 50, 0),
      rescue_attempts: 0,
      mastery_level: 0,
      location: this.assignWordLocation(wordId),
      companion_unlocked: false
    };
  }

  // Assign word to a zone based on difficulty/category
  private assignWordLocation(wordId: string): { zone: MapZone; x: number; y: number; difficulty_tier: 'easy' | 'medium' | 'hard' | 'expert' } {
    const zones: MapZone[] = ['word_forest', 'memory_castle', 'vocabulary_village', 'knowledge_kingdom'];
    const selectedZone = zones[Math.floor(Math.random() * zones.length)];
    
    return {
      zone: selectedZone,
      x: Math.floor(Math.random() * 800) + 100, // Random position on 1000px wide map
      y: Math.floor(Math.random() * 600) + 100, // Random position on 800px tall map
      difficulty_tier: 'easy' // Default, can be updated based on word difficulty
    };
  }

  // Track word interaction (correct/incorrect)
  trackWordInteraction(wordId: string, correct: boolean, hesitation: boolean = false): WordAdventureStatus {
    let wordStatus = this.getWordAdventureStatus(wordId);
    if (!wordStatus) {
      wordStatus = this.initializeWordAdventure(wordId);
    }

    const now = new Date();
    wordStatus.last_seen = now;

    if (!correct || hesitation) {
      // Word was forgotten or hesitated
      wordStatus.forget_count += 1;
      wordStatus.health -= GAME_CONFIG.HEALTH_DECAY.ON_MISTAKE;
      
      if (hesitation && correct) {
        wordStatus.health -= GAME_CONFIG.HEALTH_DECAY.ON_MISTAKE / 2; // Less penalty for hesitation
      }
    } else {
      // Correct answer, small health boost
      wordStatus.health = Math.min(100, wordStatus.health + 5);
      wordStatus.mastery_level = Math.min(100, wordStatus.mastery_level + 2);
    }

    // Ensure health doesn't go negative
    wordStatus.health = Math.max(0, wordStatus.health);

    // Update status based on health
    wordStatus.status = determineWordStatus(wordStatus.health);

    // Calculate next review date
    wordStatus.next_review_date = calculateNextReviewDate(
      wordStatus.health,
      wordStatus.mastery_level,
      wordStatus.forget_count
    );

    this.saveWordAdventureStatus(wordStatus);
    return wordStatus;
  }

  // Mark word as forgotten manually
  markWordForgotten(wordId: string): WordAdventureStatus {
    return this.trackWordInteraction(wordId, false, false);
  }

  // Get words that need rescue (low health)
  getWordsNeedingRescue(): WordAdventureStatus[] {
    const allWords = this.getAllWordStatuses();
    return allWords.filter(word => 
      word.health < GAME_CONFIG.HEALTH_THRESHOLDS.RESCUE_PRIORITY ||
      word.status === 'rescue_priority'
    ).sort((a, b) => a.health - b.health); // Most urgent first
  }

  // Get words due for review (spaced repetition)
  getWordsDueForReview(): WordAdventureStatus[] {
    const allWords = this.getAllWordStatuses();
    const now = new Date();
    
    return allWords.filter(word => 
      word.next_review_date <= now && 
      word.status !== 'rescue_priority'
    );
  }

  // Process rescue game result
  processRescueResult(gameResult: RescueGameResult): { 
    updatedWord: WordAdventureStatus; 
    hero: WordHero; 
    newBadges: Badge[] 
  } {
    const wordStatus = this.getWordAdventureStatus(gameResult.word_id);
    const hero = this.getWordHero();
    const newBadges: Badge[] = [];

    if (!wordStatus) {
      throw new Error('Word not found in adventure system');
    }

    wordStatus.rescue_attempts += 1;

    if (gameResult.success) {
      // Successful rescue
      wordStatus.health += gameResult.health_restored;
      wordStatus.health = Math.min(100, wordStatus.health);
      wordStatus.mastery_level += 10;
      wordStatus.mastery_level = Math.min(100, wordStatus.mastery_level);
      
      // Update status
      wordStatus.status = determineWordStatus(wordStatus.health);
      if (wordStatus.health >= GAME_CONFIG.HEALTH_THRESHOLDS.HEALTHY) {
        wordStatus.status = 'rescued';
        hero.rescued_words_count += 1;
        wordStatus.companion_unlocked = true;
      }

      // Award XP and coins
      hero.experience += gameResult.xp_earned;
      hero.coins += gameResult.coins_earned;

      // Check for level up
      const newLevel = this.calculateLevel(hero.experience);
      if (newLevel > hero.level) {
        hero.level = newLevel;
        hero.coins += GAME_CONFIG.COIN_REWARDS.LEVEL_UP;
      }

      // Check for new badges
      const earnedBadges = this.checkBadgeProgress(hero, gameResult);
      newBadges.push(...earnedBadges);

    } else {
      // Failed rescue
      wordStatus.health -= 10; // Small penalty for failed rescue
      wordStatus.health = Math.max(0, wordStatus.health);
    }

    // Update next review date
    wordStatus.next_review_date = calculateNextReviewDate(
      wordStatus.health,
      wordStatus.mastery_level,
      wordStatus.forget_count
    );

    this.saveWordAdventureStatus(wordStatus);
    this.saveWordHero(hero);

    return { updatedWord: wordStatus, hero, newBadges };
  }

  // Calculate hero level based on experience
  private calculateLevel(experience: number): number {
    const levels = Object.entries(GAME_CONFIG.LEVEL_REQUIREMENTS);
    let level = 1;
    
    for (const [levelNum, requiredXP] of levels) {
      if (experience >= requiredXP) {
        level = parseInt(levelNum);
      } else {
        break;
      }
    }
    
    return level;
  }

  // Check badge progress and award new badges
  private checkBadgeProgress(hero: WordHero, gameResult: RescueGameResult): Badge[] {
    const newBadges: Badge[] = [];

    // Words Rescued badge
    const rescueBadge = this.checkRescueBadge(hero.rescued_words_count);
    if (rescueBadge && !hero.badges.find(b => b.id === rescueBadge.id)) {
      newBadges.push(rescueBadge);
      hero.badges.push(rescueBadge);
    }

    // Perfect Game badge
    if (gameResult.perfect_score) {
      const perfectBadge = this.checkPerfectGameBadge(hero);
      if (perfectBadge && !hero.badges.find(b => b.id === perfectBadge.id)) {
        newBadges.push(perfectBadge);
        hero.badges.push(perfectBadge);
      }
    }

    return newBadges;
  }

  private checkRescueBadge(rescuedCount: number): Badge | null {
    const thresholds = [5, 10, 25, 50, 100];
    const tiers: ('bronze' | 'silver' | 'gold' | 'platinum')[] = ['bronze', 'silver', 'gold', 'platinum', 'platinum'];
    
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (rescuedCount >= thresholds[i]) {
        return {
          id: `word_saver_${thresholds[i]}`,
          name: `Word Saver ${tiers[i].charAt(0).toUpperCase() + tiers[i].slice(1)}`,
          description: `Rescued ${thresholds[i]} forgotten words!`,
          icon: '🛡️',
          tier: tiers[i],
          earned_date: new Date(),
          criteria: {
            type: 'words_rescued',
            threshold: thresholds[i],
            current_progress: rescuedCount
          }
        };
      }
    }
    return null;
  }

  private checkPerfectGameBadge(hero: WordHero): Badge | null {
    // Count perfect games from some tracking mechanism
    // For now, we'll use a simple implementation
    return {
      id: 'perfectionist_1',
      name: 'Perfectionist',
      description: 'Achieved a perfect score in a rescue game!',
      icon: '⭐',
      tier: 'bronze',
      earned_date: new Date(),
      criteria: {
        type: 'perfect_games',
        threshold: 1,
        current_progress: 1
      }
    };
  }

  // Generate daily missions
  generateDailyMissions(): Mission[] {
    const missions: Mission[] = [
      {
        id: 'daily_rescue_1',
        type: 'rescue_words',
        title: 'Word Hero Duty',
        description: 'Rescue 3 forgotten words today',
        target: 3,
        current_progress: 0,
        completed: false,
        reward_coins: 30,
        reward_xp: 50
      },
      {
        id: 'daily_games_1',
        type: 'play_games',
        title: 'Adventure Training',
        description: 'Complete 5 rescue mini-games',
        target: 5,
        current_progress: 0,
        completed: false,
        reward_coins: 20,
        reward_xp: 30
      },
      {
        id: 'daily_perfect_1',
        type: 'perfect_score',
        title: 'Master Rescuer',
        description: 'Achieve 1 perfect score in any game',
        target: 1,
        current_progress: 0,
        completed: false,
        reward_coins: 25,
        reward_xp: 40
      }
    ];

    return missions;
  }

  // Storage methods
  getWordAdventureStatus(wordId: string): WordAdventureStatus | null {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return null;
    
    const allStatuses: WordAdventureStatus[] = JSON.parse(data);
    return allStatuses.find(status => status.word_id === wordId) || null;
  }

  getAllWordStatuses(): WordAdventureStatus[] {
    const data = localStorage.getItem(this.storageKey);
    if (!data) return [];
    
    return JSON.parse(data).map((status: any) => ({
      ...status,
      last_seen: new Date(status.last_seen),
      next_review_date: new Date(status.next_review_date)
    }));
  }

  saveWordAdventureStatus(status: WordAdventureStatus): void {
    const allStatuses = this.getAllWordStatuses();
    const existingIndex = allStatuses.findIndex(s => s.word_id === status.word_id);
    
    if (existingIndex >= 0) {
      allStatuses[existingIndex] = status;
    } else {
      allStatuses.push(status);
    }
    
    localStorage.setItem(this.storageKey, JSON.stringify(allStatuses));
  }

  getWordHero(): WordHero {
    const data = localStorage.getItem(this.heroKey);
    if (!data) {
      const newHero: WordHero = {
        id: 'hero_1',
        name: 'Word Hero',
        level: 1,
        experience: 0,
        coins: 50, // Starting coins
        rescued_words_count: 0,
        current_skin: 'default',
        unlocked_skins: ['default'],
        badges: [],
        daily_mission_progress: {
          date: new Date(),
          missions: this.generateDailyMissions(),
          completed_count: 0,
          reward_claimed: false
        },
        power_ups: []
      };
      this.saveWordHero(newHero);
      return newHero;
    }
    
    const hero = JSON.parse(data);
    // Convert date strings back to Date objects
    hero.daily_mission_progress.date = new Date(hero.daily_mission_progress.date);
    hero.badges = hero.badges.map((badge: any) => ({
      ...badge,
      earned_date: new Date(badge.earned_date)
    }));
    
    return hero;
  }

  saveWordHero(hero: WordHero): void {
    localStorage.setItem(this.heroKey, JSON.stringify(hero));
  }

  // Update daily missions if it's a new day
  updateDailyMissions(): Mission[] {
    const hero = this.getWordHero();
    const today = new Date().toDateString();
    const missionDate = hero.daily_mission_progress.date.toDateString();
    
    if (today !== missionDate) {
      // New day, generate new missions
      hero.daily_mission_progress = {
        date: new Date(),
        missions: this.generateDailyMissions(),
        completed_count: 0,
        reward_claimed: false
      };
      this.saveWordHero(hero);
    }
    
    return hero.daily_mission_progress.missions;
  }

  // Health decay system (run periodically)
  processHealthDecay(): void {
    const allWords = this.getAllWordStatuses();
    const now = new Date();
    
    allWords.forEach(word => {
      const daysSinceLastSeen = Math.floor(
        (now.getTime() - word.last_seen.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastSeen > 0) {
        word.health = calculateWordHealth(word);
        word.status = determineWordStatus(word.health);
        this.saveWordAdventureStatus(word);
      }
    });
  }
}

export const adventureService = new AdventureService();
