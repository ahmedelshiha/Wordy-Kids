import type { EnhancedAchievement } from "./enhancedAchievementSystem";

interface QueuedAchievement {
  id: string;
  achievement: EnhancedAchievement;
  timestamp: number;
}

class AchievementPopupQueue {
  private queue: QueuedAchievement[] = [];
  private isDisplaying: boolean = false;
  private currentDisplayCallback: (() => void) | null = null;
  private onShowPopup: ((achievement: EnhancedAchievement) => void) | null = null;

  constructor() {
    this.bindEventListeners();
  }

  /**
   * Bind to achievement system events
   */
  private bindEventListeners(): void {
    // Listen for milestone unlocked events from Enhanced Achievement System
    window.addEventListener("milestoneUnlocked", (event: any) => {
      const { achievement } = event.detail;
      this.addToQueue(achievement);
    });

    // Also listen for manual achievement triggers
    window.addEventListener("achievementUnlocked", (event: any) => {
      const { achievement } = event.detail;
      this.addToQueue(achievement);
    });
  }

  /**
   * Add achievement to display queue
   */
  public addToQueue(achievement: EnhancedAchievement): void {
    // Prevent duplicate achievements in queue
    if (this.queue.find(item => item.achievement.id === achievement.id)) {
      console.log(`Achievement ${achievement.id} already in queue, skipping`);
      return;
    }

    const queuedItem: QueuedAchievement = {
      id: achievement.id,
      achievement,
      timestamp: Date.now()
    };

    this.queue.push(queuedItem);
    console.log(`🎯 Achievement queued: ${achievement.name} (Queue length: ${this.queue.length})`);

    // Start processing if not already displaying
    if (!this.isDisplaying) {
      this.processQueue();
    }
  }

  /**
   * Process the achievement queue (show one at a time)
   */
  private async processQueue(): Promise<void> {
    if (this.isDisplaying || this.queue.length === 0) {
      return;
    }

    this.isDisplaying = true;

    while (this.queue.length > 0) {
      const queuedItem = this.queue.shift();
      if (!queuedItem) break;

      console.log(`🎊 Displaying achievement: ${queuedItem.achievement.name}`);
      
      // Show the popup
      await this.displayAchievement(queuedItem.achievement);
      
      // Wait a brief moment between achievements
      if (this.queue.length > 0) {
        await this.delay(500);
      }
    }

    this.isDisplaying = false;
  }

  /**
   * Display a single achievement popup
   */
  private displayAchievement(achievement: EnhancedAchievement): Promise<void> {
    return new Promise((resolve) => {
      this.currentDisplayCallback = resolve;

      // Trigger popup display through callback
      if (this.onShowPopup) {
        this.onShowPopup(achievement);
      }

      // Auto-resolve after popup duration + buffer time
      setTimeout(() => {
        if (this.currentDisplayCallback === resolve) {
          this.currentDisplayCallback = null;
          resolve();
        }
      }, 4000); // 3s popup + 1s buffer
    });
  }

  /**
   * Called when popup closes
   */
  public onPopupClose(): void {
    if (this.currentDisplayCallback) {
      this.currentDisplayCallback();
      this.currentDisplayCallback = null;
    }
  }

  /**
   * Set the callback for showing popups
   */
  public setPopupDisplayCallback(callback: (achievement: EnhancedAchievement) => void): void {
    this.onShowPopup = callback;
  }

  /**
   * Clear the queue (useful for testing or interruptions)
   */
  public clearQueue(): void {
    this.queue = [];
    this.isDisplaying = false;
    if (this.currentDisplayCallback) {
      this.currentDisplayCallback();
      this.currentDisplayCallback = null;
    }
    console.log("🧹 Achievement queue cleared");
  }

  /**
   * Get current queue status
   */
  public getQueueStatus(): {
    queueLength: number;
    isDisplaying: boolean;
    nextAchievement?: EnhancedAchievement;
  } {
    return {
      queueLength: this.queue.length,
      isDisplaying: this.isDisplaying,
      nextAchievement: this.queue[0]?.achievement
    };
  }

  /**
   * Manually trigger an achievement (for testing)
   */
  public triggerTestAchievement(): void {
    const testAchievement: EnhancedAchievement = {
      id: "test_achievement",
      name: "Test Explorer!",
      description: "You found the test achievement!",
      icon: "🧪",
      category: "exploration",
      difficulty: "bronze",
      requirements: {
        type: "test",
        threshold: 1
      },
      currentProgress: 1,
      unlocked: true,
      dateUnlocked: new Date(),
      reward: {
        type: "badge",
        item: "Test Badge",
        value: 10,
        rarity: "common"
      },
      jungleTheme: {
        glowColor: "#4CAF50",
        particleEffect: "leaves",
        celebrationSound: "cheer",
        backgroundGradient: "linear-gradient(135deg, #2e7d32, #4caf50)"
      }
    };

    this.addToQueue(testAchievement);
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get analytics on queue performance
   */
  public getAnalytics(): {
    totalProcessed: number;
    averageDisplayTime: number;
    queueWaitTimes: number[];
  } {
    // This would track analytics in a real implementation
    return {
      totalProcessed: 0,
      averageDisplayTime: 3000,
      queueWaitTimes: []
    };
  }
}

// Create singleton instance
export const achievementPopupQueue = new AchievementPopupQueue();

// Export for testing and direct access
export { AchievementPopupQueue };
