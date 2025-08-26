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

  it("should properly export enhancedAnalytics and not export deprecated enhancedAnalyticsSystem", async () => {
    try {
      // This should work - testing the correct import
      const { enhancedAnalytics } = await import(
        "@/lib/enhancedAnalyticsSystem"
      );
      expect(enhancedAnalytics).toBeDefined();

      // The deprecated alias should not be exported anymore
      const module = await import("@/lib/enhancedAnalyticsSystem");
      expect(module.enhancedAnalyticsSystem).toBeUndefined();

      // Verify correct exports are present
      expect(module.enhancedAnalytics).toBeDefined();
      expect(module.EnhancedAnalyticsSystem).toBeDefined();
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  });
});
