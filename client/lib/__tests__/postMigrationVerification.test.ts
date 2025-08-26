/**
 * Post-Migration Verification Tests
 * Ensures all hardening features work correctly
 */

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock performance for Node.js environment
Object.defineProperty(global, "performance", {
  value: {
    now: () => Date.now(),
  },
});

import { parentDashboardAnalytics } from "../parentDashboardAnalytics";
import { featureFlagManager } from "../featureFlags";
import { JungleAdventureStorage } from "../jungleAdventureStorage";

describe("Post-Migration Hardening Features", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("Analytics System", () => {
    test("should track dashboard load time", () => {
      const loadTime = 250;
      parentDashboardAnalytics.trackDashboardLoad(loadTime);

      const metrics = parentDashboardAnalytics.getMetrics();
      expect(metrics.loadTimes).toContain(loadTime);
    });

    test("should track map interactions", () => {
      parentDashboardAnalytics.trackMapInteraction("marker_click", {
        markerId: "test",
      });

      const metrics = parentDashboardAnalytics.getMetrics();
      expect(metrics.mapInteractions).toBe(1);
    });

    test("should track timeline filter usage", () => {
      parentDashboardAnalytics.trackTimelineFilter("achievements", 5);

      const metrics = parentDashboardAnalytics.getMetrics();
      expect(metrics.timelineFilters).toBe(1);
    });

    test("should provide performance summary", () => {
      parentDashboardAnalytics.trackDashboardLoad(100);
      parentDashboardAnalytics.trackDashboardLoad(200);

      const summary = parentDashboardAnalytics.getPerformanceSummary();
      expect(summary.averageLoadTime).toBe(150);
    });
  });

  describe("Feature Flag System", () => {
    test("should check if jungle map is enabled", () => {
      const isEnabled = featureFlags.isFeatureEnabled("jungle-map-enhanced", {
        userRole: "parent",
      });
      expect(typeof isEnabled).toBe("boolean");
    });

    test("should respect rollout percentages", () => {
      const flag = featureFlags.getFeatureFlag("advanced-analytics");
      expect(flag?.rolloutPercentage).toBe(50);
    });

    test("should filter by target audience", () => {
      const parentEnabled = featureFlags.isFeatureEnabled(
        "jungle-map-enhanced",
        { userRole: "parent" },
      );
      const childEnabled = featureFlags.isFeatureEnabled(
        "jungle-map-enhanced",
        { userRole: "child" },
      );

      // Jungle map is targeted for parents
      expect(parentEnabled).toBe(true);
      expect(childEnabled).toBe(false);
    });
  });

  describe("Storage Versioning", () => {
    test("should default to current version for new users", () => {
      const settings = JungleAdventureStorage.getSettings();
      expect(settings.version).toBe("2.0.0");
    });

    test("should migrate v1 settings to v2", () => {
      // Simulate v1 settings
      localStorage.setItem(
        "jungleAdventureSettings",
        JSON.stringify({
          version: "1.0.0",
          family: { timeRestrictions: true },
        }),
      );

      const settings = JungleAdventureStorage.getSettings();
      expect(settings.version).toBe("2.0.0");
      expect(settings.family?.jungleMapEnabled).toBe(true); // Default for v2
    });

    test("should preserve existing data during migration", () => {
      localStorage.setItem(
        "jungleAdventureSettings",
        JSON.stringify({
          version: "1.0.0",
          family: { timeRestrictions: true, progressSharing: false },
        }),
      );

      const settings = JungleAdventureStorage.getSettings();
      expect(settings.family?.timeRestrictions).toBe(true);
      expect(settings.family?.progressSharing).toBe(false);
    });
  });

  describe("Storage API", () => {
    test("should get and set map markers", () => {
      const markers = [{ id: "test", x: 10, y: 20 }];
      JungleAdventureStorage.updateMapMarkers(markers);

      const retrieved = JungleAdventureStorage.getMapMarkers();
      expect(retrieved).toEqual(markers);
    });

    test("should add timeline events", () => {
      const event = { id: "test-event", type: "achievement", title: "Test" };
      JungleAdventureStorage.addTimelineEvent(event);

      const events = JungleAdventureStorage.getTimelineEvents();
      expect(events).toContain(event);
    });

    test("should provide analytics summary", () => {
      // Add some test data
      JungleAdventureStorage.updateSettings({
        timelineEvents: [
          { analytics: { timeSpent: 10, accuracyScore: 90 } },
          { analytics: { timeSpent: 20, accuracyScore: 80 } },
        ],
      });

      const summary = JungleAdventureStorage.getAnalyticsSummary();
      expect(summary.totalTimeSpent).toBe(30);
      expect(summary.averageAccuracy).toBe(85);
    });
  });

  describe("Error Handling", () => {
    test("should handle corrupted localStorage gracefully", () => {
      localStorage.setItem("jungleAdventureSettings", "invalid-json");

      // Should not throw and return default settings
      const settings = JungleAdventureStorage.getSettings();
      expect(settings.version).toBe("2.0.0");
    });

    test("should track errors", () => {
      parentDashboardAnalytics.trackError("map", "Test error message");

      const metrics = parentDashboardAnalytics.getMetrics();
      expect(metrics.errorOccurrences).toBe(1);
    });
  });
});

// Export for potential manual testing
export const verificationTests = {
  testAnalytics: () => {
    console.log("🧪 Testing Analytics...");
    parentDashboardAnalytics.trackDashboardLoad(150);
    console.log(
      "📊 Analytics working:",
      parentDashboardAnalytics.getPerformanceSummary(),
    );
  },

  testFeatureFlags: () => {
    console.log("🧪 Testing Feature Flags...");
    const enabled = featureFlags.getEnabledFeatures({ userRole: "parent" });
    console.log("🎛️ Enabled features:", enabled);
  },

  testStorage: () => {
    console.log("🧪 Testing Storage...");
    const settings = JungleAdventureStorage.getSettings();
    console.log("💾 Storage version:", settings.version);
  },
};
