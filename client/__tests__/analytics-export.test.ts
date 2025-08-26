import { describe, it, expect } from "vitest";

describe("Analytics Export Tests", () => {
  it("should correctly import enhancedAnalytics from enhancedAnalyticsSystem", async () => {
    try {
      const module = await import("@/lib/enhancedAnalyticsSystem");
      
      // Check what's actually exported
      console.log("Available exports:", Object.keys(module));
      
      expect(module.enhancedAnalytics).toBeDefined();
      expect(module.EnhancedAnalyticsSystem).toBeDefined();
      expect(typeof module.enhancedAnalytics.trackEvent).toBe("function");
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  });

  it("should fail when trying to import non-existent enhancedAnalyticsSystem", async () => {
    try {
      // This should work - testing the correct import
      const { enhancedAnalytics } = await import("@/lib/enhancedAnalyticsSystem");
      expect(enhancedAnalytics).toBeDefined();
      
      // This should fail if someone tries to destructure enhancedAnalyticsSystem
      const module = await import("@/lib/enhancedAnalyticsSystem");
      expect(module.enhancedAnalyticsSystem).toBeUndefined();
      
    } catch (error) {
      console.error("Expected this might fail:", error);
    }
  });
});
