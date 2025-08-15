import { describe, it, expect, beforeEach, vi } from "vitest";
import { analyticsDataService } from "../analyticsDataService";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock goalProgressTracker
vi.mock("../goalProgressTracker", () => ({
  goalProgressTracker: {
    fetchSystematicProgress: vi.fn().mockResolvedValue({
      totalWordsLearned: 150,
      wordsLearnedToday: 5,
      wordsLearnedThisWeek: 25,
      wordsLearnedThisMonth: 100,
      currentStreak: 7,
      sessionsToday: 2,
      sessionsThisWeek: 10,
      categoriesProgress: {
        Animals: 80,
        Nature: 60,
        Food: 90,
      },
      lastUpdated: new Date(),
    }),
  },
}));

describe("AnalyticsDataService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(
      JSON.stringify([
        {
          id: "child1",
          name: "Test Child",
          wordsLearned: 150,
          currentStreak: 7,
          weeklyProgress: 25,
          lastActive: new Date().toISOString(),
        },
      ]),
    );
  });

  it("should fetch analytics data successfully", async () => {
    const data = await analyticsDataService.getAnalyticsData("30d");

    expect(data).toBeDefined();
    expect(data.keyMetrics).toBeDefined();
    expect(data.usagePatterns).toBeDefined();
    expect(data.learningOutcomes).toBeDefined();
    expect(data.lastUpdated).toBeInstanceOf(Date);
  });

  it("should return key metrics with proper structure", async () => {
    const data = await analyticsDataService.getAnalyticsData("30d");

    expect(data.keyMetrics).toHaveLength(6);

    const activeUsersMetric = data.keyMetrics.find(
      (m) => m.id === "active_users",
    );
    expect(activeUsersMetric).toBeDefined();
    expect(activeUsersMetric?.trend).toMatch(/^(up|down|stable)$/);
    expect(typeof activeUsersMetric?.value).toBe("number");
    expect(typeof activeUsersMetric?.changePercent).toBe("number");
  });

  it("should handle empty children data gracefully", async () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));

    const data = await analyticsDataService.getAnalyticsData("30d");

    expect(data).toBeDefined();
    expect(data.keyMetrics).toBeDefined();
    // Should still return data structure even with no children
  });

  it("should cache data appropriately", async () => {
    // First call
    const data1 = await analyticsDataService.getAnalyticsData("30d");

    // Second call (should use cache)
    const data2 = await analyticsDataService.getAnalyticsData("30d");

    expect(data1.lastUpdated).toEqual(data2.lastUpdated);
  });

  it("should refresh data when requested", async () => {
    const data1 = await analyticsDataService.getAnalyticsData("30d");

    // Wait a small amount to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 10));

    analyticsDataService.refreshData();
    const data2 = await analyticsDataService.getAnalyticsData("30d");

    expect(data2.lastUpdated.getTime()).toBeGreaterThan(
      data1.lastUpdated.getTime(),
    );
  });

  it("should calculate learning outcomes for categories", async () => {
    const data = await analyticsDataService.getAnalyticsData("30d");

    expect(data.learningOutcomes.length).toBeGreaterThan(0);

    const animalCategory = data.learningOutcomes.find(
      (lo) => lo.category === "Animals",
    );
    expect(animalCategory).toBeDefined();
    expect(animalCategory?.totalWords).toBeGreaterThan(0);
    expect(animalCategory?.averageAccuracy).toBeGreaterThanOrEqual(0);
    expect(animalCategory?.averageAccuracy).toBeLessThanOrEqual(100);
  });

  it("should provide usage patterns for different time slots", async () => {
    const data = await analyticsDataService.getAnalyticsData("30d");

    expect(data.usagePatterns.length).toBe(6); // 6 time slots

    const morningSlot = data.usagePatterns.find(
      (up) => up.timeOfDay === "6-9 AM",
    );
    expect(morningSlot).toBeDefined();
    expect(morningSlot?.sessions).toBeGreaterThanOrEqual(0);
    expect(morningSlot?.completionRate).toBeGreaterThanOrEqual(0);
    expect(morningSlot?.completionRate).toBeLessThanOrEqual(100);
  });
});
