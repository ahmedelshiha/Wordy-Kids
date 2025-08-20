/**
 * Unified Storage Utility for Jungle Adventure Settings
 * Manages all jungle adventure data under a single key for consistency
 */

export interface JungleAdventureSettings {
  // Map & Timeline Data
  mapMarkers?: any[];
  timelineEvents?: any[];
  
  // User Settings
  backgroundAnimations?: boolean;
  accessibilitySettings?: {
    highContrastMode?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
  };
  soundscape?: string;
  voiceCharacter?: string;
  soundEnabled?: boolean;
  uiInteractionSounds?: boolean;
  voiceNarration?: boolean;
  hapticFeedback?: boolean;
  
  // Parent Dashboard Data
  parentDashboardChildren?: any[];
  categoryProgress?: Record<string, number>;
  systematicProgress?: {
    reading?: number;
    vocabulary?: number;
    comprehension?: number;
  };
  
  // Analytics & Progress
  childProgress?: Record<string, any>;
  achievements?: any[];
  milestones?: any[];
  learningStats?: Record<string, any>;
  
  // Metadata
  lastUpdated?: string;
  version?: string;
}

const STORAGE_KEY = "jungleAdventureSettings";
const CURRENT_VERSION = "1.0.0";

export class JungleAdventureStorage {
  /**
   * Get all jungle adventure settings
   */
  static getSettings(): JungleAdventureSettings {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { version: CURRENT_VERSION };
      
      const settings = JSON.parse(stored);
      return {
        version: CURRENT_VERSION,
        ...settings,
      };
    } catch (error) {
      console.warn("Failed to parse jungle adventure settings:", error);
      return { version: CURRENT_VERSION };
    }
  }

  /**
   * Update specific settings while preserving others
   */
  static updateSettings(updates: Partial<JungleAdventureSettings>): void {
    try {
      const current = this.getSettings();
      const updated = {
        ...current,
        ...updates,
        lastUpdated: new Date().toISOString(),
        version: CURRENT_VERSION,
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update jungle adventure settings:", error);
    }
  }

  /**
   * Get specific setting value with fallback
   */
  static getSetting<T>(key: keyof JungleAdventureSettings, fallback: T): T {
    const settings = this.getSettings();
    return (settings[key] as T) ?? fallback;
  }

  /**
   * Set specific setting value
   */
  static setSetting<T>(key: keyof JungleAdventureSettings, value: T): void {
    this.updateSettings({ [key]: value });
  }

  /**
   * Get map markers data
   */
  static getMapMarkers(): any[] {
    return this.getSetting("mapMarkers", []);
  }

  /**
   * Update map markers data
   */
  static updateMapMarkers(markers: any[]): void {
    this.setSetting("mapMarkers", markers);
  }

  /**
   * Get timeline events data
   */
  static getTimelineEvents(): any[] {
    return this.getSetting("timelineEvents", []);
  }

  /**
   * Add new timeline event
   */
  static addTimelineEvent(event: any): void {
    const events = this.getTimelineEvents();
    events.unshift(event); // Add to beginning (most recent first)
    this.setSetting("timelineEvents", events);
  }

  /**
   * Get parent dashboard children data
   */
  static getParentDashboardChildren(): any[] {
    return this.getSetting("parentDashboardChildren", []);
  }

  /**
   * Update parent dashboard children data
   */
  static updateParentDashboardChildren(children: any[]): void {
    this.setSetting("parentDashboardChildren", children);
  }

  /**
   * Get child progress for specific child
   */
  static getChildProgress(childId: string): any {
    const allProgress = this.getSetting("childProgress", {});
    return allProgress[childId] || {};
  }

  /**
   * Update child progress
   */
  static updateChildProgress(childId: string, progress: any): void {
    const allProgress = this.getSetting("childProgress", {});
    allProgress[childId] = { ...allProgress[childId], ...progress };
    this.setSetting("childProgress", allProgress);
  }

  /**
   * Get category progress
   */
  static getCategoryProgress(): Record<string, number> {
    return this.getSetting("categoryProgress", {});
  }

  /**
   * Update category progress
   */
  static updateCategoryProgress(category: string, progress: number): void {
    const current = this.getCategoryProgress();
    current[category] = progress;
    this.setSetting("categoryProgress", current);
  }

  /**
   * Clear all data (for testing or reset)
   */
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Export all data as JSON
   */
  static exportData(): string {
    const settings = this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import data from JSON
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.updateSettings(data);
      return true;
    } catch (error) {
      console.error("Failed to import jungle adventure data:", error);
      return false;
    }
  }

  /**
   * Get analytics summary
   */
  static getAnalyticsSummary(): {
    totalTimeSpent: number;
    averageAccuracy: number;
    totalAchievements: number;
    currentStreak: number;
  } {
    const timelineEvents = this.getTimelineEvents();
    const mapMarkers = this.getMapMarkers();
    
    let totalTimeSpent = 0;
    let totalAccuracy = 0;
    let accuracyCount = 0;
    
    // Calculate from timeline events
    timelineEvents.forEach((event: any) => {
      if (event.analytics) {
        totalTimeSpent += event.analytics.timeSpent || 0;
        if (event.analytics.accuracyScore) {
          totalAccuracy += event.analytics.accuracyScore;
          accuracyCount++;
        }
      }
    });
    
    // Calculate from map markers
    mapMarkers.forEach((marker: any) => {
      if (marker.analytics) {
        totalTimeSpent += marker.analytics.timeSpent || 0;
        if (marker.analytics.accuracyScore) {
          totalAccuracy += marker.analytics.accuracyScore;
          accuracyCount++;
        }
      }
    });
    
    return {
      totalTimeSpent,
      averageAccuracy: accuracyCount > 0 ? Math.round(totalAccuracy / accuracyCount) : 0,
      totalAchievements: timelineEvents.filter((e: any) => e.type === "achievement").length,
      currentStreak: Math.max(...timelineEvents.map((e: any) => e.analytics?.streak || 0), 0),
    };
  }
}

export default JungleAdventureStorage;
