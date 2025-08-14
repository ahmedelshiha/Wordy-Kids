// Test utilities for the real-time word database system
import { realTimeWordDB } from "./realTimeWordDatabase";
import { refreshWordDatabase, cacheManager } from "./cacheManager";

export const testRealTimeWordSystem = () => {
  console.log("🧪 Testing Real-Time Word Database System...");

  // Test 1: Basic functionality
  console.log("\n1. Testing basic functionality:");
  console.log("Current words count:", realTimeWordDB.getCurrentWords().length);
  console.log("Current categories:", realTimeWordDB.getCurrentCategories());
  console.log("Last update:", new Date(realTimeWordDB.getLastUpdate()));

  // Test 2: Cache invalidation
  console.log("\n2. Testing cache invalidation:");
  const cacheStats = cacheManager.getCacheStats();
  console.log("Cache stats before invalidation:", cacheStats);

  cacheManager.invalidateWordCaches();
  console.log("Word caches invalidated successfully");

  // Test 3: Manual refresh trigger
  console.log("\n3. Testing manual refresh:");
  realTimeWordDB.triggerRefresh();
  console.log("Manual refresh triggered");

  // Test 4: Global refresh
  console.log("\n4. Testing global refresh:");
  refreshWordDatabase();
  console.log("Global refresh triggered");

  // Test 5: Event listener
  console.log("\n5. Testing event listeners:");
  const unsubscribe = realTimeWordDB.addListener((event) => {
    console.log(
      "📡 Event received:",
      event.type,
      "at",
      new Date(event.timestamp).toLocaleTimeString(),
    );
  });

  // Simulate a change
  setTimeout(() => {
    console.log("Simulating word database change...");
    window.dispatchEvent(
      new CustomEvent("wordDatabaseUpdate", {
        detail: { timestamp: Date.now() },
      }),
    );
  }, 1000);

  // Clean up after 3 seconds
  setTimeout(() => {
    unsubscribe();
    console.log("✅ Test completed - event listener cleaned up");
  }, 3000);

  return {
    currentWords: realTimeWordDB.getCurrentWords().length,
    currentCategories: realTimeWordDB.getCurrentCategories().length,
    lastUpdate: realTimeWordDB.getLastUpdate(),
    cacheStats: cacheManager.getCacheStats(),
  };
};

// Function to simulate adding a new word (for testing)
export const simulateNewWord = () => {
  console.log("🎭 Simulating new word addition...");

  // This would normally update the actual wordsDatabase
  // For testing, we just trigger the refresh events
  refreshWordDatabase();

  // Trigger a fake "words-added" event
  window.dispatchEvent(
    new CustomEvent("wordDatabaseUpdate", {
      detail: {
        type: "words-added",
        timestamp: Date.now(),
        data: {
          words: [{ id: 999, word: "Test", category: "test" }],
        },
      },
    }),
  );

  console.log("✨ New word simulation complete");
};

// Export for browser console testing
if (typeof window !== "undefined") {
  (window as any).testRealTimeWords = testRealTimeWordSystem;
  (window as any).simulateNewWord = simulateNewWord;
  (window as any).realTimeWordDB = realTimeWordDB;
  (window as any).cacheManager = cacheManager;
}
