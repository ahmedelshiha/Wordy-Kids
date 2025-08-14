// Cache manager for word-related data with automatic invalidation
export class CacheManager {
  private static instance: CacheManager;
  private cacheVersions = new Map<string, number>();
  private readonly CACHE_VERSION_KEY = "cacheVersions";
  private readonly GLOBAL_CACHE_VERSION_KEY = "globalCacheVersion";

  constructor() {
    this.loadCacheVersions();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Load cache versions from localStorage
  private loadCacheVersions() {
    try {
      const stored = localStorage.getItem(this.CACHE_VERSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cacheVersions = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.warn("Failed to load cache versions:", error);
      this.cacheVersions.clear();
    }
  }

  // Save cache versions to localStorage
  private saveCacheVersions() {
    try {
      const obj = Object.fromEntries(this.cacheVersions);
      localStorage.setItem(this.CACHE_VERSION_KEY, JSON.stringify(obj));
    } catch (error) {
      console.warn("Failed to save cache versions:", error);
    }
  }

  // Get global cache version
  getGlobalCacheVersion(): number {
    const stored = localStorage.getItem(this.GLOBAL_CACHE_VERSION_KEY);
    return stored ? parseInt(stored, 10) : 1;
  }

  // Increment global cache version (invalidates all caches)
  incrementGlobalCacheVersion(): number {
    const newVersion = this.getGlobalCacheVersion() + 1;
    localStorage.setItem(this.GLOBAL_CACHE_VERSION_KEY, newVersion.toString());

    // Clear all versioned caches
    this.cacheVersions.clear();
    this.saveCacheVersions();

    console.log("Global cache version incremented to:", newVersion);
    return newVersion;
  }

  // Get cache version for a specific key
  getCacheVersion(key: string): number {
    return this.cacheVersions.get(key) || 1;
  }

  // Increment cache version for a specific key
  incrementCacheVersion(key: string): number {
    const newVersion = this.getCacheVersion(key) + 1;
    this.cacheVersions.set(key, newVersion);
    this.saveCacheVersions();
    console.log(`Cache version for '${key}' incremented to:`, newVersion);
    return newVersion;
  }

  // Create a versioned cache key
  createVersionedKey(baseKey: string, cacheKey?: string): string {
    const keyToUse = cacheKey || baseKey;
    const version = this.getCacheVersion(keyToUse);
    const globalVersion = this.getGlobalCacheVersion();
    return `${baseKey}_v${version}_g${globalVersion}`;
  }

  // Set item with versioning
  setItem(key: string, value: any, cacheKey?: string): void {
    try {
      const versionedKey = this.createVersionedKey(key, cacheKey);
      const serialized = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        version: this.getCacheVersion(cacheKey || key),
        globalVersion: this.getGlobalCacheVersion(),
      });
      localStorage.setItem(versionedKey, serialized);

      // Clean up old versions
      this.cleanupOldVersions(key);
    } catch (error) {
      console.warn("Failed to set cached item:", error);
    }
  }

  // Get item with version checking
  getItem<T>(key: string, cacheKey?: string): T | null {
    try {
      const versionedKey = this.createVersionedKey(key, cacheKey);
      const stored = localStorage.getItem(versionedKey);

      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored);
      const currentVersion = this.getCacheVersion(cacheKey || key);
      const currentGlobalVersion = this.getGlobalCacheVersion();

      // Check if cache is still valid
      if (
        parsed.version !== currentVersion ||
        parsed.globalVersion !== currentGlobalVersion
      ) {
        localStorage.removeItem(versionedKey);
        return null;
      }

      return parsed.data;
    } catch (error) {
      console.warn("Failed to get cached item:", error);
      return null;
    }
  }

  // Remove item and all its versions
  removeItem(key: string): void {
    // Remove all versions of this key
    Object.keys(localStorage).forEach((storageKey) => {
      if (storageKey.startsWith(key + "_v")) {
        localStorage.removeItem(storageKey);
      }
    });
  }

  // Clean up old versions of a key
  private cleanupOldVersions(baseKey: string): void {
    const currentVersion = this.createVersionedKey(baseKey);
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(baseKey + "_v") && key !== currentVersion) {
        localStorage.removeItem(key);
      }
    });
  }

  // Invalidate specific cache categories
  invalidateWordCaches(): void {
    const wordCacheKeys = [
      "wordsDatabase",
      "wordsByCategory",
      "wordProgress",
      "sessionWords",
      "userWordHistory",
      "forgottenWords",
      "rememberedWords",
      "wordStats",
      "categoryStats",
    ];

    wordCacheKeys.forEach((key) => {
      this.incrementCacheVersion(key);
      this.cleanupOldVersions(key);
    });

    // Also remove any non-versioned word-related caches
    this.removeNonVersionedWordCaches();

    console.log("Word-related caches invalidated");
  }

  // Remove non-versioned word-related caches
  private removeNonVersionedWordCaches(): void {
    const keysToRemove: string[] = [];

    Object.keys(localStorage).forEach((key) => {
      // Match word-related keys that aren't versioned
      if (
        (key.includes("word") ||
          key.includes("category") ||
          key.includes("session") ||
          key.includes("progress") ||
          key.includes("vocabulary") ||
          key.includes("adventure")) &&
        !key.includes("_v") && // Not versioned
        key !== this.CACHE_VERSION_KEY &&
        key !== this.GLOBAL_CACHE_VERSION_KEY
      ) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    if (keysToRemove.length > 0) {
      console.log("Removed non-versioned word caches:", keysToRemove);
    }
  }

  // Invalidate category-specific caches
  invalidateCategoryCaches(): void {
    const categoryKeys = [
      "categories",
      "categoryStats",
      "categoryProgress",
      "availableCategories",
    ];

    categoryKeys.forEach((key) => {
      this.incrementCacheVersion(key);
    });

    console.log("Category-related caches invalidated");
  }

  // Invalidate session caches
  invalidateSessionCaches(): void {
    const sessionKeys = [
      "currentSession",
      "sessionHistory",
      "sessionStats",
      "sessionWords",
      "sessionProgress",
    ];

    sessionKeys.forEach((key) => {
      this.incrementCacheVersion(key);
      this.removeItem(key);
    });

    console.log("Session-related caches invalidated");
  }

  // Get cache statistics
  getCacheStats(): {
    totalItems: number;
    wordRelatedItems: number;
    totalSize: number;
    versions: Record<string, number>;
  } {
    let totalItems = 0;
    let wordRelatedItems = 0;
    let totalSize = 0;

    Object.keys(localStorage).forEach((key) => {
      totalItems++;
      totalSize += localStorage.getItem(key)?.length || 0;

      if (
        key.includes("word") ||
        key.includes("category") ||
        key.includes("session") ||
        key.includes("progress")
      ) {
        wordRelatedItems++;
      }
    });

    return {
      totalItems,
      wordRelatedItems,
      totalSize,
      versions: Object.fromEntries(this.cacheVersions),
    };
  }

  // Clear all caches (nuclear option)
  clearAllCaches(): void {
    const protectedKeys = [
      this.CACHE_VERSION_KEY,
      this.GLOBAL_CACHE_VERSION_KEY,
      "theme",
      "language",
      "userPreferences",
    ];

    Object.keys(localStorage).forEach((key) => {
      if (!protectedKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    this.incrementGlobalCacheVersion();
    console.log("All caches cleared");
  }
}

// Singleton instance
export const cacheManager = CacheManager.getInstance();

// Enhanced localStorage wrapper with automatic cache management
export class SmartStorage {
  constructor(private cacheKey: string) {}

  // Set with automatic versioning
  set<T>(key: string, value: T): void {
    cacheManager.setItem(key, value, this.cacheKey);
  }

  // Get with version checking
  get<T>(key: string): T | null {
    return cacheManager.getItem<T>(key, this.cacheKey);
  }

  // Remove item
  remove(key: string): void {
    cacheManager.removeItem(key);
  }

  // Invalidate this cache category
  invalidate(): void {
    cacheManager.incrementCacheVersion(this.cacheKey);
  }

  // Clear all items in this cache category
  clear(): void {
    this.invalidate();
    // Clean up any existing items
    Object.keys(localStorage).forEach((storageKey) => {
      if (storageKey.includes(this.cacheKey)) {
        localStorage.removeItem(storageKey);
      }
    });
  }
}

// Pre-configured smart storage instances
export const wordStorage = new SmartStorage("words");
export const categoryStorage = new SmartStorage("categories");
export const sessionStorage = new SmartStorage("sessions");
export const progressStorage = new SmartStorage("progress");

// Utility functions for common cache operations
export const invalidateAllWordData = () => {
  cacheManager.invalidateWordCaches();
  cacheManager.invalidateCategoryCaches();
  cacheManager.invalidateSessionCaches();
};

export const refreshWordDatabase = () => {
  invalidateAllWordData();

  // Dispatch event to notify components
  window.dispatchEvent(
    new CustomEvent("wordDatabaseRefresh", {
      detail: { timestamp: Date.now() },
    }),
  );

  // Cross-tab notification
  localStorage.setItem("wordDatabaseRefresh", Date.now().toString());
  localStorage.removeItem("wordDatabaseRefresh");
};
