/**
 * Jungle Adventure Collectibles System
 * Manages stickers, gems, and jungle fruits that kids can collect during their learning adventure
 */

import { JUNGLE_COLLECTIBLES, type JungleCollectible } from "./jungleAdventureEffects";

interface CollectedItem extends JungleCollectible {
  collectedAt: Date;
  count: number;
}

interface CollectiblesProgress {
  totalCollected: number;
  totalPoints: number;
  stickersCount: number;
  gemsCount: number;
  fruitsCount: number;
  rareItemsCount: number;
  legendaryItemsCount: number;
}

class CollectiblesManager {
  private storageKey = 'jungle_collectibles';
  private collectedItems: Map<string, CollectedItem> = new Map();
  private listeners: Array<(progress: CollectiblesProgress) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load collectibles from localStorage
   */
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.collectedItems = new Map(
          data.map((item: any) => [
            item.id,
            {
              ...item,
              collectedAt: new Date(item.collectedAt)
            }
          ])
        );
      }
    } catch (error) {
      console.warn('Failed to load collectibles from storage:', error);
    }
  }

  /**
   * Save collectibles to localStorage
   */
  private saveToStorage() {
    try {
      const data = Array.from(this.collectedItems.values());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save collectibles to storage:', error);
    }
  }

  /**
   * Add a collectible to the collection
   */
  public collectItem(collectible: JungleCollectible): boolean {
    const existing = this.collectedItems.get(collectible.id);
    
    if (existing) {
      // Increase count for duplicate collectibles
      existing.count += 1;
      existing.collectedAt = new Date();
    } else {
      // Add new collectible
      this.collectedItems.set(collectible.id, {
        ...collectible,
        collectedAt: new Date(),
        count: 1
      });
    }

    this.saveToStorage();
    this.notifyListeners();
    return !existing; // Return true if it's a new collectible
  }

  /**
   * Get all collected items
   */
  public getCollectedItems(): CollectedItem[] {
    return Array.from(this.collectedItems.values())
      .sort((a, b) => b.collectedAt.getTime() - a.collectedAt.getTime());
  }

  /**
   * Get collected items by type
   */
  public getItemsByType(type: 'sticker' | 'gem' | 'fruit'): CollectedItem[] {
    return this.getCollectedItems().filter(item => item.type === type);
  }

  /**
   * Get collected items by rarity
   */
  public getItemsByRarity(rarity: 'common' | 'rare' | 'legendary'): CollectedItem[] {
    return this.getCollectedItems().filter(item => item.rarity === rarity);
  }

  /**
   * Check if an item is collected
   */
  public hasItem(itemId: string): boolean {
    return this.collectedItems.has(itemId);
  }

  /**
   * Get item count
   */
  public getItemCount(itemId: string): number {
    return this.collectedItems.get(itemId)?.count || 0;
  }

  /**
   * Get overall collection progress
   */
  public getProgress(): CollectiblesProgress {
    const items = this.getCollectedItems();
    
    return {
      totalCollected: items.reduce((sum, item) => sum + item.count, 0),
      totalPoints: items.reduce((sum, item) => sum + (item.points * item.count), 0),
      stickersCount: items.filter(item => item.type === 'sticker').reduce((sum, item) => sum + item.count, 0),
      gemsCount: items.filter(item => item.type === 'gem').reduce((sum, item) => sum + item.count, 0),
      fruitsCount: items.filter(item => item.type === 'fruit').reduce((sum, item) => sum + item.count, 0),
      rareItemsCount: items.filter(item => item.rarity === 'rare').reduce((sum, item) => sum + item.count, 0),
      legendaryItemsCount: items.filter(item => item.rarity === 'legendary').reduce((sum, item) => sum + item.count, 0),
    };
  }

  /**
   * Get completion percentage for each category
   */
  public getCompletionStats() {
    const allItems = JUNGLE_COLLECTIBLES;
    const collected = this.getCollectedItems();
    
    const categories = {
      sticker: allItems.filter(item => item.type === 'sticker'),
      gem: allItems.filter(item => item.type === 'gem'),
      fruit: allItems.filter(item => item.type === 'fruit'),
    };

    const collectedByType = {
      sticker: collected.filter(item => item.type === 'sticker'),
      gem: collected.filter(item => item.type === 'gem'),
      fruit: collected.filter(item => item.type === 'fruit'),
    };

    return {
      stickers: {
        collected: collectedByType.sticker.length,
        total: categories.sticker.length,
        percentage: Math.round((collectedByType.sticker.length / categories.sticker.length) * 100)
      },
      gems: {
        collected: collectedByType.gem.length,
        total: categories.gem.length,
        percentage: Math.round((collectedByType.gem.length / categories.gem.length) * 100)
      },
      fruits: {
        collected: collectedByType.fruit.length,
        total: categories.fruit.length,
        percentage: Math.round((collectedByType.fruit.length / categories.fruit.length) * 100)
      },
      overall: {
        collected: collected.length,
        total: allItems.length,
        percentage: Math.round((collected.length / allItems.length) * 100)
      }
    };
  }

  /**
   * Get recent collectibles (last 5)
   */
  public getRecentItems(limit: number = 5): CollectedItem[] {
    return this.getCollectedItems().slice(0, limit);
  }

  /**
   * Get next milestone
   */
  public getNextMilestone(): { target: number; reward: string; progress: number } | null {
    const progress = this.getProgress();
    const milestones = [
      { count: 5, reward: "Jungle Explorer Badge! 🌿" },
      { count: 10, reward: "Animal Friend Certificate! 🐸" },
      { count: 25, reward: "Treasure Hunter Title! 💎" },
      { count: 50, reward: "Jungle Master Crown! 👑" },
      { count: 100, reward: "Legendary Adventurer Status! 🏆" },
    ];

    const nextMilestone = milestones.find(m => progress.totalCollected < m.count);
    if (!nextMilestone) return null;

    return {
      target: nextMilestone.count,
      reward: nextMilestone.reward,
      progress: progress.totalCollected
    };
  }

  /**
   * Clear all collectibles (for testing or reset)
   */
  public clearCollection() {
    this.collectedItems.clear();
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Subscribe to collectibles changes
   */
  public subscribe(listener: (progress: CollectiblesProgress) => void) {
    this.listeners.push(listener);
    // Immediately call with current progress
    listener(this.getProgress());
  }

  /**
   * Unsubscribe from collectibles changes
   */
  public unsubscribe(listener: (progress: CollectiblesProgress) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners() {
    const progress = this.getProgress();
    this.listeners.forEach(listener => listener(progress));
  }

  /**
   * Generate achievement badges based on collection
   */
  public getAchievementBadges(): Array<{ title: string; emoji: string; description: string; unlocked: boolean }> {
    const progress = this.getProgress();
    const stats = this.getCompletionStats();

    return [
      {
        title: "First Steps",
        emoji: "🌱",
        description: "Collect your first item",
        unlocked: progress.totalCollected >= 1
      },
      {
        title: "Sticker Collector",
        emoji: "🎨",
        description: "Collect all animal stickers",
        unlocked: stats.stickers.percentage === 100
      },
      {
        title: "Gem Hunter",
        emoji: "💎",
        description: "Find all precious gems",
        unlocked: stats.gems.percentage === 100
      },
      {
        title: "Fruit Gatherer",
        emoji: "🥭",
        description: "Collect all magical fruits",
        unlocked: stats.fruits.percentage === 100
      },
      {
        title: "Rare Finder",
        emoji: "🔮",
        description: "Collect 5 rare items",
        unlocked: progress.rareItemsCount >= 5
      },
      {
        title: "Legend Seeker",
        emoji: "👑",
        description: "Find a legendary item",
        unlocked: progress.legendaryItemsCount >= 1
      },
      {
        title: "Completionist",
        emoji: "🏆",
        description: "Collect every single item",
        unlocked: stats.overall.percentage === 100
      },
      {
        title: "Dedicated Collector",
        emoji: "⭐",
        description: "Collect 50 total items",
        unlocked: progress.totalCollected >= 50
      }
    ];
  }

  /**
   * Export collection data for sharing or backup
   */
  public exportCollection() {
    return {
      items: this.getCollectedItems(),
      progress: this.getProgress(),
      stats: this.getCompletionStats(),
      achievements: this.getAchievementBadges().filter(a => a.unlocked),
      exportDate: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const collectiblesManager = new CollectiblesManager();

// Utility functions to get collectibles data without React hooks
export function getCollectiblesData() {
  return {
    progress: collectiblesManager.getProgress(),
    collectItem: (item: JungleCollectible) => collectiblesManager.collectItem(item),
    getCollectedItems: () => collectiblesManager.getCollectedItems(),
    getRecentItems: (limit?: number) => collectiblesManager.getRecentItems(limit),
    getCompletionStats: () => collectiblesManager.getCompletionStats(),
    getAchievementBadges: () => collectiblesManager.getAchievementBadges(),
    getNextMilestone: () => collectiblesManager.getNextMilestone(),
    hasItem: (itemId: string) => collectiblesManager.hasItem(itemId),
    getItemCount: (itemId: string) => collectiblesManager.getItemCount(itemId),
    clearCollection: () => collectiblesManager.clearCollection(),
  };
}

// Utility functions
export function formatCollectibleRarity(rarity: 'common' | 'rare' | 'legendary'): string {
  const rarityLabels = {
    common: 'Common',
    rare: 'Rare ✨',
    legendary: 'Legendary 🌟'
  };
  return rarityLabels[rarity];
}

export function getCollectibleRarityColor(rarity: 'common' | 'rare' | 'legendary'): string {
  const rarityColors = {
    common: 'from-green-400 to-green-600',
    rare: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600'
  };
  return rarityColors[rarity];
}
