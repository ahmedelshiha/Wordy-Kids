/**
 * Feature Flags System for Jungle Word Library
 * Supports staged rollout, A/B testing, and rollback capabilities
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  enabledForUsers: string[]; // Specific user IDs
  enabledForRoles: string[]; // User roles (admin, tester, etc.)
  description: string;
  version: string;
  expiresAt?: Date;
}

export interface FeatureFlagConfig {
  [key: string]: FeatureFlag;
}

// Default feature flags configuration
const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  // Audio system enhancements
  enhancedAudio: {
    name: "enhancedAudio",
    enabled: true,
    rolloutPercentage: 100,
    enabledForUsers: [],
    enabledForRoles: ["admin", "tester"],
    description: "Enhanced audio system with new jungle sounds and preloading",
    version: "1.0.0",
  },

  // New animations and visual effects
  jungleAnimations: {
    name: "jungleAnimations",
    enabled: true,
    rolloutPercentage: 50, // 50% rollout
    enabledForUsers: [],
    enabledForRoles: ["admin", "tester"],
    description: "New jungle-themed animations and visual effects",
    version: "1.0.0",
  },

  // Advanced analytics tracking
  advancedAnalytics: {
    name: "advancedAnalytics",
    enabled: true,
    rolloutPercentage: 75, // 75% rollout
    enabledForUsers: [],
    enabledForRoles: ["admin"],
    description: "Enhanced analytics tracking for word mastery and engagement",
    version: "1.0.0",
  },

  // Parent dashboard features
  parentDashboard: {
    name: "parentDashboard",
    enabled: true,
    rolloutPercentage: 100,
    enabledForUsers: [],
    enabledForRoles: ["admin", "parent"],
    description: "New parent dashboard with child progress tracking",
    version: "1.0.0",
  },

  // Service worker and offline capabilities
  offlineMode: {
    name: "offlineMode",
    enabled: true,
    rolloutPercentage: 80, // 80% rollout
    enabledForUsers: [],
    enabledForRoles: ["admin", "tester"],
    description: "Offline mode with service worker caching",
    version: "1.0.0",
  },

  // Performance optimizations
  performanceOptimizations: {
    name: "performanceOptimizations",
    enabled: true,
    rolloutPercentage: 90, // 90% rollout
    enabledForUsers: [],
    enabledForRoles: ["admin"],
    description: "Lazy loading and performance improvements",
    version: "1.0.0",
  },

  // A/B testing for new word learning algorithm
  adaptiveLearning: {
    name: "adaptiveLearning",
    enabled: false,
    rolloutPercentage: 25, // 25% rollout for testing
    enabledForUsers: [],
    enabledForRoles: ["admin", "tester"],
    description: "AI-powered adaptive learning algorithm",
    version: "1.1.0",
  },

  // Beta features
  betaFeatures: {
    name: "betaFeatures",
    enabled: false,
    rolloutPercentage: 10, // 10% rollout
    enabledForUsers: [],
    enabledForRoles: ["admin", "beta-tester"],
    description: "Experimental beta features",
    version: "1.2.0",
  },
};

class FeatureFlagManager {
  private flags: FeatureFlagConfig;
  private userId: string | null = null;
  private userRole: string | null = null;
  private readonly STORAGE_KEY = "jungle_feature_flags";
  private readonly USER_BUCKET_KEY = "jungle_user_bucket";

  constructor() {
    this.flags = this.loadFlags();
    this.initializeUserBucket();
  }

  /**
   * Load feature flags from localStorage or use defaults
   */
  private loadFlags(): FeatureFlagConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new flags are included
        return { ...DEFAULT_FEATURE_FLAGS, ...parsed };
      }
    } catch (error) {
      console.warn("Failed to load feature flags from storage:", error);
    }
    return { ...DEFAULT_FEATURE_FLAGS };
  }

  /**
   * Save feature flags to localStorage
   */
  private saveFlags(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.flags));
    } catch (error) {
      console.warn("Failed to save feature flags to storage:", error);
    }
  }

  /**
   * Initialize or retrieve user bucket for consistent rollout
   */
  private initializeUserBucket(): void {
    try {
      let bucket = localStorage.getItem(this.USER_BUCKET_KEY);
      if (!bucket) {
        // Generate consistent bucket (0-99) based on session
        bucket = Math.floor(Math.random() * 100).toString();
        localStorage.setItem(this.USER_BUCKET_KEY, bucket);
      }
    } catch (error) {
      console.warn("Failed to initialize user bucket:", error);
    }
  }

  /**
   * Get user bucket for rollout percentage calculation
   */
  private getUserBucket(): number {
    try {
      const bucket = localStorage.getItem(this.USER_BUCKET_KEY);
      return bucket ? parseInt(bucket, 10) : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Set current user context
   */
  setUserContext(userId: string, userRole: string): void {
    this.userId = userId;
    this.userRole = userRole;
  }

  /**
   * Check if a feature flag is enabled for the current user
   */
  isEnabled(flagName: string): boolean {
    const flag = this.flags[flagName];
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found`);
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check if flag has expired
    if (flag.expiresAt && new Date() > flag.expiresAt) {
      return false;
    }

    // Check if user is specifically enabled
    if (this.userId && flag.enabledForUsers.includes(this.userId)) {
      return true;
    }

    // Check if user role is enabled
    if (this.userRole && flag.enabledForRoles.includes(this.userRole)) {
      return true;
    }

    // Check rollout percentage
    const userBucket = this.getUserBucket();
    return userBucket < flag.rolloutPercentage;
  }

  /**
   * Get feature flag configuration
   */
  getFlag(flagName: string): FeatureFlag | null {
    return this.flags[flagName] || null;
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): FeatureFlagConfig {
    return { ...this.flags };
  }

  /**
   * Update a feature flag (admin only)
   */
  updateFlag(flagName: string, updates: Partial<FeatureFlag>): void {
    if (!this.userRole || !["admin", "super-admin"].includes(this.userRole)) {
      console.warn("Unauthorized attempt to update feature flag");
      return;
    }

    if (this.flags[flagName]) {
      this.flags[flagName] = { ...this.flags[flagName], ...updates };
      this.saveFlags();
    }
  }

  /**
   * Reset feature flags to defaults
   */
  resetToDefaults(): void {
    this.flags = { ...DEFAULT_FEATURE_FLAGS };
    this.saveFlags();
  }

  /**
   * Enable gradual rollout for a feature
   */
  enableGradualRollout(flagName: string, targetPercentage: number, steps: number = 4): void {
    if (!this.userRole || !["admin"].includes(this.userRole)) {
      console.warn("Unauthorized attempt to enable gradual rollout");
      return;
    }

    const flag = this.flags[flagName];
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found`);
      return;
    }

    const stepSize = targetPercentage / steps;
    let currentStep = 0;

    const rolloutInterval = setInterval(() => {
      currentStep++;
      const newPercentage = Math.min(stepSize * currentStep, targetPercentage);
      
      this.updateFlag(flagName, { rolloutPercentage: newPercentage });
      
      console.log(`Gradual rollout: ${flagName} now at ${newPercentage}%`);
      
      if (currentStep >= steps) {
        clearInterval(rolloutInterval);
        console.log(`Gradual rollout complete: ${flagName} at ${targetPercentage}%`);
      }
    }, 60000); // 1 minute intervals
  }

  /**
   * Emergency rollback - disable a feature immediately
   */
  emergencyRollback(flagName: string): void {
    if (!this.userRole || !["admin", "super-admin"].includes(this.userRole)) {
      console.warn("Unauthorized attempt to perform emergency rollback");
      return;
    }

    this.updateFlag(flagName, { 
      enabled: false, 
      rolloutPercentage: 0 
    });
    
    console.log(`Emergency rollback performed for: ${flagName}`);
  }

  /**
   * Get feature flag metrics
   */
  getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    Object.keys(this.flags).forEach(flagName => {
      const flag = this.flags[flagName];
      metrics[flagName] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        userEnabled: this.isEnabled(flagName),
        version: flag.version,
        description: flag.description,
      };
    });

    return metrics;
  }
}

// Global feature flag manager instance
export const featureFlagManager = new FeatureFlagManager();

// Convenience hook for React components
export const useFeatureFlag = (flagName: string): boolean => {
  return featureFlagManager.isEnabled(flagName);
};

// Convenience function for checking multiple flags
export const useFeatureFlags = (flagNames: string[]): Record<string, boolean> => {
  const flags: Record<string, boolean> = {};
  flagNames.forEach(name => {
    flags[name] = featureFlagManager.isEnabled(name);
  });
  return flags;
};

export default featureFlagManager;
