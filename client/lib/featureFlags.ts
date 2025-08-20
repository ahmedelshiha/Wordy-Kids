/**
 * Feature Flag System for Jungle Adventure
 * Enables controlled rollout of new features
 */

interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  targetAudience?: "all" | "parents" | "children";
  minimumVersion?: string;
  expiryDate?: Date;
}

interface UserContext {
  userId?: string;
  userRole?: "child" | "parent";
  sessionId?: string;
  version?: string;
}

class FeatureFlagManager {
  private flags: Record<string, FeatureFlag> = {
    // Jungle Map & Timeline Features
    "jungle-map-enhanced": {
      key: "jungle-map-enhanced",
      name: "Enhanced Jungle Map",
      description: "Interactive map with analytics tooltips and zoom controls",
      enabled: true,
      rolloutPercentage: 100, // Full rollout post-migration
      targetAudience: "parents",
      minimumVersion: "2.0.0",
    },
    "family-achievements-timeline": {
      key: "family-achievements-timeline",
      name: "Family Achievements Timeline",
      description:
        "Chronological timeline of learning milestones and achievements",
      enabled: true,
      rolloutPercentage: 100, // Full rollout post-migration
      targetAudience: "parents",
      minimumVersion: "2.0.0",
    },
    // New Features for Gradual Rollout
    "advanced-analytics": {
      key: "advanced-analytics",
      name: "Advanced Analytics Dashboard",
      description: "Detailed performance metrics and insights",
      enabled: true,
      rolloutPercentage: 50, // 50% rollout
      targetAudience: "parents",
      minimumVersion: "2.0.0",
    },
    "ai-powered-recommendations": {
      key: "ai-powered-recommendations",
      name: "AI-Powered Learning Recommendations",
      description: "Personalized learning path suggestions",
      enabled: false,
      rolloutPercentage: 10, // Limited beta
      targetAudience: "all",
      minimumVersion: "2.0.0",
    },
    "social-learning-features": {
      key: "social-learning-features",
      name: "Social Learning Features",
      description: "Share progress with friends and family",
      enabled: false,
      rolloutPercentage: 0, // Not yet ready
      targetAudience: "all",
      minimumVersion: "2.1.0",
    },
    // Performance & Debugging Features
    "performance-monitoring": {
      key: "performance-monitoring",
      name: "Performance Monitoring",
      description: "Advanced telemetry and performance tracking",
      enabled: true,
      rolloutPercentage: 100,
      targetAudience: "all",
      minimumVersion: "2.0.0",
    },
    "debug-mode": {
      key: "debug-mode",
      name: "Debug Mode",
      description: "Show debug information and development tools",
      enabled: false,
      rolloutPercentage: 0,
      targetAudience: "all",
    },
  };

  /**
   * Check if a feature is enabled for a given user context
   */
  isFeatureEnabled(featureKey: string, userContext: UserContext = {}): boolean {
    const flag = this.flags[featureKey];

    if (!flag) {
      console.warn(`Feature flag not found: ${featureKey}`);
      return false;
    }

    // Check if feature is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check minimum version requirement
    if (flag.minimumVersion && userContext.version) {
      if (!this.isVersionSupported(userContext.version, flag.minimumVersion)) {
        return false;
      }
    }

    // Check target audience
    if (flag.targetAudience && flag.targetAudience !== "all") {
      if (userContext.userRole !== flag.targetAudience) {
        return false;
      }
    }

    // Check expiry date
    if (flag.expiryDate && new Date() > flag.expiryDate) {
      return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const userId = userContext.userId || userContext.sessionId || "anonymous";
      const hash = this.hashUserId(userId + featureKey);
      const userPercentile = hash % 100;

      if (userPercentile >= flag.rolloutPercentage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all enabled features for a user context
   */
  getEnabledFeatures(userContext: UserContext = {}): string[] {
    return Object.keys(this.flags).filter((key) =>
      this.isFeatureEnabled(key, userContext),
    );
  }

  /**
   * Get feature flag details
   */
  getFeatureFlag(featureKey: string): FeatureFlag | null {
    return this.flags[featureKey] || null;
  }

  /**
   * Get all feature flags (for admin/debug purposes)
   */
  getAllFeatureFlags(): Record<string, FeatureFlag> {
    return { ...this.flags };
  }

  /**
   * Override feature flag for testing/debugging
   */
  overrideFeatureFlag(featureKey: string, enabled: boolean): void {
    if (process.env.NODE_ENV === "development") {
      const overrides = this.getOverrides();
      overrides[featureKey] = enabled;
      localStorage.setItem(
        "jungleFeatureFlagOverrides",
        JSON.stringify(overrides),
      );
      console.log(`🎛️ Feature flag override: ${featureKey} = ${enabled}`);
    }
  }

  /**
   * Clear all feature flag overrides
   */
  clearOverrides(): void {
    localStorage.removeItem("jungleFeatureFlagOverrides");
    console.log("🧹 Feature flag overrides cleared");
  }

  /**
   * Get current overrides from localStorage
   */
  private getOverrides(): Record<string, boolean> {
    try {
      const stored = localStorage.getItem("jungleFeatureFlagOverrides");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Check for development overrides
   */
  private isOverridden(featureKey: string): boolean | null {
    if (process.env.NODE_ENV !== "development") {
      return null;
    }

    const overrides = this.getOverrides();
    return overrides.hasOwnProperty(featureKey) ? overrides[featureKey] : null;
  }

  /**
   * Simple version comparison
   */
  private isVersionSupported(
    currentVersion: string,
    requiredVersion: string,
  ): boolean {
    const current = currentVersion.split(".").map(Number);
    const required = requiredVersion.split(".").map(Number);

    for (let i = 0; i < Math.max(current.length, required.length); i++) {
      const currentPart = current[i] || 0;
      const requiredPart = required[i] || 0;

      if (currentPart > requiredPart) return true;
      if (currentPart < requiredPart) return false;
    }

    return true; // Equal versions
  }

  /**
   * Simple hash function for consistent user bucketing
   */
  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Update feature flag rollout percentage (for A/B testing)
   */
  updateRolloutPercentage(featureKey: string, percentage: number): boolean {
    if (this.flags[featureKey]) {
      this.flags[featureKey].rolloutPercentage = Math.max(
        0,
        Math.min(100, percentage),
      );
      console.log(`📊 Updated ${featureKey} rollout to ${percentage}%`);
      return true;
    }
    return false;
  }

  /**
   * Enable/disable feature globally
   */
  toggleFeature(featureKey: string, enabled: boolean): boolean {
    if (this.flags[featureKey]) {
      this.flags[featureKey].enabled = enabled;
      console.log(
        `🎛️ Feature ${featureKey} ${enabled ? "enabled" : "disabled"}`,
      );
      return true;
    }
    return false;
  }

  /**
   * Get feature usage statistics (for analytics)
   */
  getFeatureUsageStats(): Record<
    string,
    {
      enabled: boolean;
      rolloutPercentage: number;
      estimatedUsers: number;
    }
  > {
    const stats: Record<string, any> = {};

    for (const [key, flag] of Object.entries(this.flags)) {
      stats[key] = {
        enabled: flag.enabled,
        rolloutPercentage: flag.rolloutPercentage,
        estimatedUsers: flag.enabled
          ? Math.round((100 * flag.rolloutPercentage) / 100)
          : 0,
      };
    }

    return stats;
  }
}

// Create singleton instance
export const featureFlags = new FeatureFlagManager();

// Convenience function for checking features
export const isFeatureEnabled = (
  featureKey: string,
  userContext?: UserContext,
): boolean => {
  return featureFlags.isFeatureEnabled(featureKey, userContext);
};

// Hook for React components
export const useFeatureFlag = (
  featureKey: string,
  userContext?: UserContext,
): boolean => {
  // In a real implementation, this would use React.useState and React.useEffect
  // to re-evaluate when context changes
  return featureFlags.isFeatureEnabled(featureKey, userContext);
};

export default featureFlags;
