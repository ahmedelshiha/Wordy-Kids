/**
 * Session Manager for integrating daily goal and time limit settings
 * Handles session tracking, goal monitoring, and time limit enforcement
 */

import { getCurrentAudioSettings } from "@/components/JungleAdventureSettingsPanelV2";
import { EnhancedAchievementTracker } from "./enhancedAchievementTracker";

export interface SessionSettings {
  dailyGoal: number;
  timeLimitMin: number;
  speechRate: number;
  voice: string;
}

export interface SessionState {
  startTime: Date;
  currentSessionCards: number;
  dailyCards: number;
  dailyTarget: number;
  timeRemaining: number; // in minutes, 0 = no limit
  isTimeUpWarningShown: boolean;
  sessionActive: boolean;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionState: SessionState | null = null;
  private timeUpdateInterval: NodeJS.Timeout | null = null;
  private goalCheckCallbacks: ((state: SessionState) => void)[] = [];
  private timeWarningCallbacks: ((state: SessionState) => void)[] = [];

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Start a new learning session with current settings
   */
  public startSession(): SessionState {
    const settings = this.getCurrentSettings();
    const dailyCards = this.getTodayCardsCount();

    this.sessionState = {
      startTime: new Date(),
      currentSessionCards: 0,
      dailyCards,
      dailyTarget: settings.dailyGoal,
      timeRemaining: settings.timeLimitMin,
      isTimeUpWarningShown: false,
      sessionActive: true,
    };

    // Start time tracking if there's a time limit
    if (settings.timeLimitMin > 0) {
      this.startTimeTracking();
    }

    console.log("📚 Session started:", this.sessionState);
    return this.sessionState;
  }

  /**
   * End the current session
   */
  public endSession(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }

    if (this.sessionState) {
      const totalCards = this.sessionState.currentSessionCards;
      const sessionDuration = Date.now() - this.sessionState.startTime.getTime();
      
      // Update daily progress
      this.updateDailyProgress(totalCards);
      
      // Track achievement progress
      if (totalCards > 0) {
        EnhancedAchievementTracker.trackActivity({
          type: "sessionComplete",
          score: totalCards,
        });
      }

      console.log("📚 Session ended:", {
        cardsCompleted: totalCards,
        durationMs: sessionDuration,
        dailyProgress: this.sessionState.dailyCards + totalCards,
        dailyGoal: this.sessionState.dailyTarget,
      });

      this.sessionState = null;
    }
  }

  /**
   * Record a completed card in the current session
   */
  public recordCardCompleted(): void {
    if (!this.sessionState || !this.sessionState.sessionActive) return;

    this.sessionState.currentSessionCards++;
    this.sessionState.dailyCards++;

    // Check if daily goal reached
    if (this.sessionState.dailyCards >= this.sessionState.dailyTarget) {
      this.notifyGoalReached();
    }

    console.log("✅ Card completed. Progress:", {
      sessionCards: this.sessionState.currentSessionCards,
      dailyCards: this.sessionState.dailyCards,
      dailyGoal: this.sessionState.dailyTarget,
    });
  }

  /**
   * Get current session state
   */
  public getSessionState(): SessionState | null {
    return this.sessionState;
  }

  /**
   * Check if daily goal is reached
   */
  public isDailyGoalReached(): boolean {
    if (!this.sessionState) return false;
    return this.sessionState.dailyCards >= this.sessionState.dailyTarget;
  }

  /**
   * Check if time limit is approaching (last 2 minutes)
   */
  public isTimeApproaching(): boolean {
    if (!this.sessionState || this.sessionState.timeRemaining === 0) return false;
    return this.sessionState.timeRemaining <= 2 && this.sessionState.timeRemaining > 0;
  }

  /**
   * Check if time is up
   */
  public isTimeUp(): boolean {
    if (!this.sessionState || this.sessionState.timeRemaining === 0) return false;
    return this.sessionState.timeRemaining <= 0;
  }

  /**
   * Get progress toward daily goal (0-1)
   */
  public getDailyProgress(): number {
    if (!this.sessionState) return 0;
    return Math.min(1, this.sessionState.dailyCards / this.sessionState.dailyTarget);
  }

  /**
   * Register callback for goal achievement
   */
  public onGoalReached(callback: (state: SessionState) => void): void {
    this.goalCheckCallbacks.push(callback);
  }

  /**
   * Register callback for time warnings
   */
  public onTimeWarning(callback: (state: SessionState) => void): void {
    this.timeWarningCallbacks.push(callback);
  }

  /**
   * Get current settings from the settings panel
   */
  private getCurrentSettings(): SessionSettings {
    const audioSettings = getCurrentAudioSettings();
    
    // Get other settings from localStorage
    const settingsStr = localStorage.getItem("jungleAdventureSettings");
    const settings = settingsStr ? JSON.parse(settingsStr) : {};
    
    return {
      dailyGoal: settings.dailyGoal || 10,
      timeLimitMin: settings.timeLimitMin || 0,
      speechRate: audioSettings.speechRate,
      voice: audioSettings.voice,
    };
  }

  /**
   * Get today's card count from localStorage
   */
  private getTodayCardsCount(): number {
    const today = new Date().toDateString();
    const dailyProgressStr = localStorage.getItem("jungleDailyProgress");
    const dailyProgress = dailyProgressStr ? JSON.parse(dailyProgressStr) : {};
    
    return dailyProgress[today] || 0;
  }

  /**
   * Update daily progress in localStorage
   */
  private updateDailyProgress(additionalCards: number): void {
    const today = new Date().toDateString();
    const dailyProgressStr = localStorage.getItem("jungleDailyProgress");
    const dailyProgress = dailyProgressStr ? JSON.parse(dailyProgressStr) : {};
    
    dailyProgress[today] = (dailyProgress[today] || 0) + additionalCards;
    localStorage.setItem("jungleDailyProgress", JSON.stringify(dailyProgress));

    // Track daily goal achievement
    const settings = this.getCurrentSettings();
    if (dailyProgress[today] >= settings.dailyGoal) {
      EnhancedAchievementTracker.trackActivity({
        type: "dailyGoal",
      });
    }
  }

  /**
   * Start time tracking interval
   */
  private startTimeTracking(): void {
    this.timeUpdateInterval = setInterval(() => {
      if (!this.sessionState || this.sessionState.timeRemaining === 0) return;

      this.sessionState.timeRemaining = Math.max(0, this.sessionState.timeRemaining - 1/60); // Decrease by 1 second

      // Show warning at 2 minutes
      if (this.isTimeApproaching() && !this.sessionState.isTimeUpWarningShown) {
        this.sessionState.isTimeUpWarningShown = true;
        this.notifyTimeWarning();
      }

      // End session when time is up
      if (this.isTimeUp()) {
        this.sessionState.sessionActive = false;
        this.notifyTimeUp();
      }
    }, 1000); // Update every second
  }

  /**
   * Notify goal reached
   */
  private notifyGoalReached(): void {
    if (!this.sessionState) return;
    this.goalCheckCallbacks.forEach(callback => {
      try {
        callback(this.sessionState!);
      } catch (error) {
        console.error("Error in goal reached callback:", error);
      }
    });
  }

  /**
   * Notify time warning
   */
  private notifyTimeWarning(): void {
    if (!this.sessionState) return;
    this.timeWarningCallbacks.forEach(callback => {
      try {
        callback(this.sessionState!);
      } catch (error) {
        console.error("Error in time warning callback:", error);
      }
    });
  }

  /**
   * Notify time up
   */
  private notifyTimeUp(): void {
    if (!this.sessionState) return;
    console.log("⏰ Time limit reached!");
    this.timeWarningCallbacks.forEach(callback => {
      try {
        callback(this.sessionState!);
      } catch (error) {
        console.error("Error in time up callback:", error);
      }
    });
  }

  /**
   * Clean up old daily progress entries (keep last 30 days)
   */
  public static cleanupOldProgress(): void {
    const dailyProgressStr = localStorage.getItem("jungleDailyProgress");
    if (!dailyProgressStr) return;

    const dailyProgress = JSON.parse(dailyProgressStr);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    Object.keys(dailyProgress).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date < thirtyDaysAgo) {
        delete dailyProgress[dateStr];
      }
    });

    localStorage.setItem("jungleDailyProgress", JSON.stringify(dailyProgress));
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Clean up old progress on load
SessionManager.cleanupOldProgress();
