import { describe, it, expect } from "vitest";

describe("Feature Flags Export Tests", () => {
  it("should correctly import all exports from featureFlags module", async () => {
    try {
      const module = await import("@/lib/featureFlags");
      
      // Check what's actually exported
      console.log("Available feature flags exports:", Object.keys(module));
      
      // Test required exports exist
      expect(module.featureFlagManager).toBeDefined();
      expect(module.useFeatureFlag).toBeDefined();
      expect(module.useFeatureFlags).toBeDefined();
      
      // Test functions are actually functions
      expect(typeof module.useFeatureFlag).toBe("function");
      expect(typeof module.useFeatureFlags).toBe("function");
      expect(typeof module.featureFlagManager.isEnabled).toBe("function");
      
    } catch (error) {
      console.error("Feature flags import error:", error);
      throw error;
    }
  });

  it("should work with useFeatureFlag hook", async () => {
    const { useFeatureFlag } = await import("@/lib/featureFlags");
    
    // Test single feature flag
    const isEnabled = useFeatureFlag("enhancedAudio");
    expect(typeof isEnabled).toBe("boolean");
  });

  it("should work with useFeatureFlags hook", async () => {
    const { useFeatureFlags } = await import("@/lib/featureFlags");
    
    // Test multiple feature flags
    const flags = useFeatureFlags(["enhancedAudio", "jungleAnimations", "advancedAnalytics"]);
    
    expect(typeof flags).toBe("object");
    expect(flags).toHaveProperty("enhancedAudio");
    expect(flags).toHaveProperty("jungleAnimations");
    expect(flags).toHaveProperty("advancedAnalytics");
    
    // All values should be booleans
    Object.values(flags).forEach(value => {
      expect(typeof value).toBe("boolean");
    });
  });

  it("should work with featureFlagManager", async () => {
    const { featureFlagManager } = await import("@/lib/featureFlags");
    
    // Test manager methods
    expect(typeof featureFlagManager.isEnabled).toBe("function");
    expect(typeof featureFlagManager.getFlag).toBe("function");
    expect(typeof featureFlagManager.getAllFlags).toBe("function");
    
    // Test actual functionality
    const isEnabled = featureFlagManager.isEnabled("enhancedAudio");
    expect(typeof isEnabled).toBe("boolean");
    
    const allFlags = featureFlagManager.getAllFlags();
    expect(typeof allFlags).toBe("object");
    expect(Object.keys(allFlags).length).toBeGreaterThan(0);
  });

  it("should handle invalid flag names gracefully", async () => {
    const { useFeatureFlag, useFeatureFlags } = await import("@/lib/featureFlags");
    
    // Test with non-existent flag
    const invalidFlag = useFeatureFlag("nonExistentFlag");
    expect(typeof invalidFlag).toBe("boolean");
    expect(invalidFlag).toBe(false); // Should default to false
    
    // Test with mix of valid and invalid flags
    const mixedFlags = useFeatureFlags(["enhancedAudio", "invalidFlag", "jungleAnimations"]);
    expect(mixedFlags.enhancedAudio).toBeDefined();
    expect(mixedFlags.invalidFlag).toBe(false);
    expect(mixedFlags.jungleAnimations).toBeDefined();
  });

  it("should maintain backward compatibility with default export", async () => {
    const module = await import("@/lib/featureFlags");
    
    // Test default export
    expect(module.default).toBeDefined();
    expect(module.default).toBe(module.featureFlagManager);
  });
});
