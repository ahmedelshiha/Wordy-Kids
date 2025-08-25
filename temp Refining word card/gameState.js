// Game state management for Jungle Word Adventure
// Handles player progress, rewards, and achievements

class GameState {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.jungleGems = 0;
    this.sparkleSeeds = 0;
    this.masteredWords = new Set();
    this.favoriteWords = new Set();
    this.explorerBadges = new Set();
    this.unlockedCategories = new Set(['animals', 'nature', 'food']); // Start with basic categories
    this.currentCategory = 'animals';
    this.sessionStartTime = Date.now();
    this.totalPlayTime = 0;
    this.wordsReviewedToday = 0;
    this.lastPlayDate = null;
    
    // Load saved state
    this.loadState();
  }

  // Save state to localStorage
  saveState() {
    const state = {
      score: this.score,
      streak: this.streak,
      maxStreak: this.maxStreak,
      jungleGems: this.jungleGems,
      sparkleSeeds: this.sparkleSeeds,
      masteredWords: Array.from(this.masteredWords),
      favoriteWords: Array.from(this.favoriteWords),
      explorerBadges: Array.from(this.explorerBadges),
      unlockedCategories: Array.from(this.unlockedCategories),
      currentCategory: this.currentCategory,
      totalPlayTime: this.totalPlayTime,
      wordsReviewedToday: this.wordsReviewedToday,
      lastPlayDate: this.lastPlayDate
    };
    
    localStorage.setItem('jungleWordAdventure_gameState', JSON.stringify(state));
  }

  // Load state from localStorage
  loadState() {
    try {
      const savedState = localStorage.getItem('jungleWordAdventure_gameState');
      if (savedState) {
        const state = JSON.parse(savedState);
        
        this.score = state.score || 0;
        this.streak = state.streak || 0;
        this.maxStreak = state.maxStreak || 0;
        this.jungleGems = state.jungleGems || 0;
        this.sparkleSeeds = state.sparkleSeeds || 0;
        this.masteredWords = new Set(state.masteredWords || []);
        this.favoriteWords = new Set(state.favoriteWords || []);
        this.explorerBadges = new Set(state.explorerBadges || []);
        this.unlockedCategories = new Set(state.unlockedCategories || ['animals', 'nature', 'food']);
        this.currentCategory = state.currentCategory || 'animals';
        this.totalPlayTime = state.totalPlayTime || 0;
        this.wordsReviewedToday = state.wordsReviewedToday || 0;
        this.lastPlayDate = state.lastPlayDate;
        
        // Reset daily counter if it's a new day
        const today = new Date().toDateString();
        if (this.lastPlayDate !== today) {
          this.wordsReviewedToday = 0;
          this.lastPlayDate = today;
        }
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    }
  }

  // Add points to score
  addScore(points) {
    this.score += points;
    this.saveState();
    return this.score;
  }

  // Increment streak
  incrementStreak() {
    this.streak += 1;
    if (this.streak > this.maxStreak) {
      this.maxStreak = this.streak;
    }
    this.saveState();
    return this.streak;
  }

  // Reset streak
  resetStreak() {
    this.streak = 0;
    this.saveState();
  }

  // Add jungle gems
  addJungleGems(amount = 1) {
    this.jungleGems += amount;
    this.saveState();
    return this.jungleGems;
  }

  // Add sparkle seeds
  addSparkleSeeds(amount = 1) {
    this.sparkleSeeds += amount;
    this.saveState();
    return this.sparkleSeeds;
  }

  // Master a word
  masterWord(wordId) {
    if (!this.masteredWords.has(wordId)) {
      this.masteredWords.add(wordId);
      this.addScore(25);
      this.addJungleGems(1);
      this.incrementStreak();
      this.checkForBadges();
      this.saveState();
      return true; // New mastery
    }
    return false; // Already mastered
  }

  // Add word to favorites
  toggleFavorite(wordId) {
    if (this.favoriteWords.has(wordId)) {
      this.favoriteWords.delete(wordId);
    } else {
      this.favoriteWords.add(wordId);
      this.addScore(5);
    }
    this.saveState();
    return this.favoriteWords.has(wordId);
  }

  // Review a word (for tracking progress)
  reviewWord(wordId, correct = true) {
    this.wordsReviewedToday += 1;
    
    if (correct) {
      this.addScore(10);
      this.incrementStreak();
    } else {
      this.resetStreak();
    }
    
    this.checkForBadges();
    this.saveState();
  }

  // Unlock a category
  unlockCategory(categoryId) {
    if (!this.unlockedCategories.has(categoryId)) {
      this.unlockedCategories.add(categoryId);
      this.addScore(50);
      this.addSparkleSeeds(3);
      this.saveState();
      return true; // Newly unlocked
    }
    return false; // Already unlocked
  }

  // Check and award badges
  checkForBadges() {
    const newBadges = [];

    // First Word Finder
    if (this.masteredWords.size >= 1 && !this.explorerBadges.has('first_word')) {
      this.explorerBadges.add('first_word');
      newBadges.push('first_word');
    }

    // Word Master (10 words)
    if (this.masteredWords.size >= 10 && !this.explorerBadges.has('word_master')) {
      this.explorerBadges.add('word_master');
      newBadges.push('word_master');
    }

    // Jungle Explorer (25 words)
    if (this.masteredWords.size >= 25 && !this.explorerBadges.has('jungle_explorer')) {
      this.explorerBadges.add('jungle_explorer');
      newBadges.push('jungle_explorer');
    }

    // Streak Master (10 streak)
    if (this.streak >= 10 && !this.explorerBadges.has('streak_master')) {
      this.explorerBadges.add('streak_master');
      newBadges.push('streak_master');
    }

    // Daily Adventurer (20 words in one day)
    if (this.wordsReviewedToday >= 20 && !this.explorerBadges.has('daily_adventurer')) {
      this.explorerBadges.add('daily_adventurer');
      newBadges.push('daily_adventurer');
    }

    // Category Conqueror (complete a category)
    // This would be checked when all words in a category are mastered

    if (newBadges.length > 0) {
      this.saveState();
    }

    return newBadges;
  }

  // Get badge information
  getBadgeInfo(badgeId) {
    const badges = {
      first_word: {
        name: "First Word Finder",
        description: "Mastered your first jungle word!",
        emoji: "🌟",
        color: "from-yellow-300 to-orange-400"
      },
      word_master: {
        name: "Word Master",
        description: "Mastered 10 jungle words!",
        emoji: "🏆",
        color: "from-gold-300 to-yellow-400"
      },
      jungle_explorer: {
        name: "Jungle Explorer",
        description: "Mastered 25 jungle words!",
        emoji: "🗺️",
        color: "from-green-300 to-emerald-400"
      },
      streak_master: {
        name: "Streak Master",
        description: "Achieved a 10-word streak!",
        emoji: "🔥",
        color: "from-red-300 to-orange-400"
      },
      daily_adventurer: {
        name: "Daily Adventurer",
        description: "Reviewed 20 words in one day!",
        emoji: "📅",
        color: "from-blue-300 to-purple-400"
      },
      category_conqueror: {
        name: "Category Conqueror",
        description: "Completed an entire category!",
        emoji: "👑",
        color: "from-purple-300 to-pink-400"
      }
    };
    
    return badges[badgeId] || null;
  }

  // Get progress statistics
  getStats() {
    return {
      score: this.score,
      streak: this.streak,
      maxStreak: this.maxStreak,
      jungleGems: this.jungleGems,
      sparkleSeeds: this.sparkleSeeds,
      masteredWordsCount: this.masteredWords.size,
      favoriteWordsCount: this.favoriteWords.size,
      badgesCount: this.explorerBadges.size,
      unlockedCategoriesCount: this.unlockedCategories.size,
      wordsReviewedToday: this.wordsReviewedToday,
      totalPlayTime: this.totalPlayTime + (Date.now() - this.sessionStartTime)
    };
  }

  // Update play time
  updatePlayTime() {
    const sessionTime = Date.now() - this.sessionStartTime;
    this.totalPlayTime += sessionTime;
    this.sessionStartTime = Date.now();
    this.saveState();
  }

  // Reset all progress (for testing or fresh start)
  resetProgress() {
    this.score = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.jungleGems = 0;
    this.sparkleSeeds = 0;
    this.masteredWords.clear();
    this.favoriteWords.clear();
    this.explorerBadges.clear();
    this.unlockedCategories = new Set(['animals', 'nature', 'food']);
    this.currentCategory = 'animals';
    this.totalPlayTime = 0;
    this.wordsReviewedToday = 0;
    this.lastPlayDate = null;
    this.saveState();
  }

  // Check if category is unlocked
  isCategoryUnlocked(categoryId) {
    return this.unlockedCategories.has(categoryId);
  }

  // Check if word is mastered
  isWordMastered(wordId) {
    return this.masteredWords.has(wordId);
  }

  // Check if word is favorited
  isWordFavorited(wordId) {
    return this.favoriteWords.has(wordId);
  }

  // Check if badge is earned
  hasBadge(badgeId) {
    return this.explorerBadges.has(badgeId);
  }
}

// Create and export singleton instance
export const gameState = new GameState();
export default gameState;

