// client/lib/localStorageManager.ts

interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
  priority: "high" | "medium" | "low";
  compressed?: boolean;
  version: string;
}

interface StorageConfig {
  maxSize: number; // in bytes
  compressionThreshold: number; // compress items larger than this
  defaultExpiry: number; // default expiry in milliseconds
  cleanupInterval: number; // cleanup interval in milliseconds
  version: string;
}

interface StorageStats {
  totalItems: number;
  totalSize: number;
  availableSpace: number;
  oldestItem: number;
  newestItem: number;
  expiredItems: number;
}

class LocalStorageManager {
  private config: StorageConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private compressionEnabled: boolean;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      maxSize: 5 * 1024 * 1024, // 5MB default
      compressionThreshold: 1024, // 1KB
      defaultExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
      cleanupInterval: 60 * 60 * 1000, // 1 hour
      version: "1.0.0",
      ...config,
    };

    this.compressionEnabled = this.checkCompressionSupport();
    this.initializeCleanup();
    this.migrateData();
  }

  /**
   * Store data with automatic compression and expiry
   */
  setItem<T>(
    key: string,
    data: T,
    options: {
      expiry?: number;
      priority?: "high" | "medium" | "low";
      compress?: boolean;
    } = {},
  ): boolean {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: options.expiry || this.config.defaultExpiry,
        priority: options.priority || "medium",
        version: this.config.version,
      };

      let serialized = JSON.stringify(item);

      // Auto-compress if data is large enough
      if (
        this.compressionEnabled &&
        (options.compress ||
          serialized.length > this.config.compressionThreshold)
      ) {
        try {
          const compressed = this.compress(serialized);
          if (compressed.length < serialized.length) {
            item.compressed = true;
            serialized = compressed;
          }
        } catch (e) {
          console.warn("Compression failed for", key, e);
        }
      }

      // Check storage space
      if (!this.hasSpace(serialized.length)) {
        this.freeSpace(serialized.length);
      }

      localStorage.setItem(this.getPrefixedKey(key), serialized);

      // Update metadata
      this.updateMetadata();

      return true;
    } catch (error) {
      console.error("Failed to store item:", key, error);

      // Try emergency cleanup
      this.emergencyCleanup();

      // Retry once
      try {
        localStorage.setItem(
          this.getPrefixedKey(key),
          JSON.stringify({
            data,
            timestamp: Date.now(),
            priority: options.priority || "high",
            version: this.config.version,
          }),
        );
        return true;
      } catch (retryError) {
        console.error("Failed to store item after cleanup:", key, retryError);
        return false;
      }
    }
  }

  /**
   * Retrieve data with automatic decompression
   */
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const prefixedKey = this.getPrefixedKey(key);
      let serialized = localStorage.getItem(prefixedKey);

      if (!serialized) {
        return defaultValue || null;
      }

      let item: StorageItem<T>;

      // Try to parse as StorageItem first
      try {
        item = JSON.parse(serialized);
      } catch (e) {
        // If parsing fails, it might be old format data
        return this.migrateLegacyItem(key, serialized, defaultValue);
      }

      // Check if item has expired
      if (this.isExpired(item)) {
        this.removeItem(key);
        return defaultValue || null;
      }

      // Decompress if needed
      if (item.compressed && this.compressionEnabled) {
        try {
          const decompressed = this.decompress(serialized);
          item = JSON.parse(decompressed);
        } catch (e) {
          console.error("Decompression failed for", key, e);
          this.removeItem(key);
          return defaultValue || null;
        }
      }

      // Update access timestamp for LRU
      item.timestamp = Date.now();
      localStorage.setItem(
        prefixedKey,
        item.compressed
          ? this.compress(JSON.stringify(item))
          : JSON.stringify(item),
      );

      return item.data;
    } catch (error) {
      console.error("Failed to retrieve item:", key, error);
      return defaultValue || null;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.getPrefixedKey(key));
      this.updateMetadata();
    } catch (error) {
      console.error("Failed to remove item:", key, error);
    }
  }

  /**
   * Check if item exists and is not expired
   */
  hasItem(key: string): boolean {
    try {
      const item = localStorage.getItem(this.getPrefixedKey(key));
      if (!item) return false;

      const parsed: StorageItem = JSON.parse(item);
      return !this.isExpired(parsed);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    const stats: StorageStats = {
      totalItems: 0,
      totalSize: 0,
      availableSpace: 0,
      oldestItem: Date.now(),
      newestItem: 0,
      expiredItems: 0,
    };

    const prefix = this.getPrefix();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;

      const item = localStorage.getItem(key);
      if (!item) continue;

      stats.totalItems++;
      stats.totalSize += item.length * 2; // UTF-16 characters = 2 bytes each

      try {
        const parsed: StorageItem = JSON.parse(item);
        stats.oldestItem = Math.min(stats.oldestItem, parsed.timestamp);
        stats.newestItem = Math.max(stats.newestItem, parsed.timestamp);

        if (this.isExpired(parsed)) {
          stats.expiredItems++;
        }
      } catch (e) {
        // Legacy item
      }
    }

    stats.availableSpace = this.config.maxSize - stats.totalSize;

    return stats;
  }

  /**
   * Clean up expired and low-priority items
   */
  cleanup(force: boolean = false): number {
    let removedCount = 0;
    const items: Array<{ key: string; item: StorageItem; size: number }> = [];
    const prefix = this.getPrefix();

    // Collect all items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;

      const serialized = localStorage.getItem(key);
      if (!serialized) continue;

      try {
        const item: StorageItem = JSON.parse(serialized);
        items.push({
          key: key.slice(prefix.length),
          item,
          size: serialized.length * 2,
        });
      } catch (e) {
        // Remove corrupted items
        localStorage.removeItem(key);
        removedCount++;
      }
    }

    // Remove expired items
    for (const { key, item } of items) {
      if (this.isExpired(item)) {
        this.removeItem(key);
        removedCount++;
      }
    }

    // If force cleanup or storage is getting full
    const stats = this.getStats();
    if (force || stats.totalSize > this.config.maxSize * 0.8) {
      // Sort by priority and age (LRU for same priority)
      items.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityWeight[a.item.priority] || 2;
        const bPriority = priorityWeight[b.item.priority] || 2;

        if (aPriority !== bPriority) {
          return aPriority - bPriority; // Lower priority first
        }

        return a.item.timestamp - b.item.timestamp; // Older first
      });

      // Remove items until we have enough space
      const targetSize = this.config.maxSize * 0.6;
      let currentSize = stats.totalSize;

      for (const { key, item } of items) {
        if (currentSize <= targetSize) break;
        if (item.priority !== "high") {
          this.removeItem(key);
          currentSize -= this.getItemSize(key);
          removedCount++;
        }
      }
    }

    this.updateMetadata();
    console.log(
      `LocalStorage cleanup completed. Removed ${removedCount} items.`,
    );

    return removedCount;
  }

  /**
   * Emergency cleanup when storage is full
   */
  private emergencyCleanup(): void {
    console.warn("Emergency localStorage cleanup triggered");

    // Remove all low priority items immediately
    const prefix = this.getPrefix();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;

      const serialized = localStorage.getItem(key);
      if (!serialized) continue;

      try {
        const item: StorageItem = JSON.parse(serialized);
        if (item.priority === "low" || this.isExpired(item)) {
          keysToRemove.push(key);
        }
      } catch (e) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Failed to remove item during emergency cleanup:", key);
      }
    });
  }

  /**
   * Optimize storage by recompressing and reorganizing data
   */
  optimize(): Promise<{
    itemsProcessed: number;
    spaceReclaimed: number;
    errors: number;
  }> {
    return new Promise((resolve) => {
      const result = {
        itemsProcessed: 0,
        spaceReclaimed: 0,
        errors: 0,
      };

      const prefix = this.getPrefix();
      const itemsToProcess: Array<{ key: string; data: any }> = [];

      // Collect items that need optimization
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith(prefix)) continue;

        const originalKey = key.slice(prefix.length);
        const data = this.getItem(originalKey);

        if (data !== null) {
          itemsToProcess.push({ key: originalKey, data });
        }
      }

      // Process items in batches to avoid blocking
      const batchSize = 10;
      let currentBatch = 0;

      const processBatch = () => {
        const start = currentBatch * batchSize;
        const end = Math.min(start + batchSize, itemsToProcess.length);

        for (let i = start; i < end; i++) {
          const { key, data } = itemsToProcess[i];

          try {
            const oldSize = this.getItemSize(key);
            this.removeItem(key);

            // Re-store with current compression settings
            const success = this.setItem(key, data, {
              compress: true,
              priority: "medium",
            });

            if (success) {
              const newSize = this.getItemSize(key);
              result.spaceReclaimed += oldSize - newSize;
              result.itemsProcessed++;
            } else {
              result.errors++;
            }
          } catch (error) {
            result.errors++;
            console.error("Error optimizing item:", key, error);
          }
        }

        currentBatch++;

        if (end < itemsToProcess.length) {
          // Schedule next batch
          setTimeout(processBatch, 10);
        } else {
          // Optimization complete
          this.updateMetadata();
          resolve(result);
        }
      };

      processBatch();
    });
  }

  /**
   * Clear all app data
   */
  clear(): void {
    const prefix = this.getPrefix();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error("Failed to remove key:", key);
      }
    });

    this.updateMetadata();
  }

  /**
   * Export data for backup
   */
  exportData(): string {
    const data: Record<string, any> = {};
    const prefix = this.getPrefix();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix)) continue;

      const originalKey = key.slice(prefix.length);
      const value = this.getItem(originalKey);

      if (value !== null) {
        data[originalKey] = value;
      }
    }

    return JSON.stringify({
      version: this.config.version,
      timestamp: Date.now(),
      data,
    });
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const backup = JSON.parse(jsonData);

      if (!backup.data) {
        throw new Error("Invalid backup format");
      }

      // Clear existing data
      this.clear();

      // Import data
      for (const [key, value] of Object.entries(backup.data)) {
        this.setItem(key, value, { priority: "high" });
      }

      return true;
    } catch (error) {
      console.error("Failed to import data:", error);
      return false;
    }
  }

  // Public method for getting prefixed key (needed by hooks)
  getPrefixedKey(key: string): string {
    return `${this.getPrefix()}${key}`;
  }

  // Private helper methods
  private getPrefix(): string {
    return "wordy_kids_v1_";
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.expiry) return false;
    return Date.now() - item.timestamp > item.expiry;
  }

  private hasSpace(requiredSize: number): boolean {
    try {
      const stats = this.getStats();
      return stats.availableSpace >= requiredSize;
    } catch (error) {
      return false;
    }
  }

  private freeSpace(requiredSize: number): void {
    const stats = this.getStats();
    const spaceNeeded = requiredSize - stats.availableSpace;

    if (spaceNeeded <= 0) return;

    this.cleanup(true);
  }

  private getItemSize(key: string): number {
    const item = localStorage.getItem(this.getPrefixedKey(key));
    return item ? item.length * 2 : 0;
  }

  private compress(data: string): string {
    // Simple RLE compression for demo
    // In production, you might want to use a proper compression library
    return data.replace(/(.)\1+/g, (match, char) => {
      return match.length > 3 ? `${char}*${match.length}` : match;
    });
  }

  private decompress(data: string): string {
    // Simple RLE decompression
    return data.replace(/(.)\*(\d+)/g, (_, char, count) => {
      return char.repeat(parseInt(count));
    });
  }

  private checkCompressionSupport(): boolean {
    try {
      const test = "aaaaa";
      const compressed = this.compress(test);
      const decompressed = this.decompress(compressed);
      return decompressed === test;
    } catch (error) {
      return false;
    }
  }

  private migrateLegacyItem<T>(
    key: string,
    serialized: string,
    defaultValue?: T,
  ): T | null {
    try {
      // Try to parse as direct JSON (legacy format)
      const data = JSON.parse(serialized);

      // Re-store in new format
      this.setItem(key, data, { priority: "medium" });

      return data;
    } catch (error) {
      console.warn("Failed to migrate legacy item:", key);
      this.removeItem(key);
      return defaultValue || null;
    }
  }

  private migrateData(): void {
    // Migration logic for version updates
    const metadataKey = this.getPrefixedKey("_metadata");
    const metadata = localStorage.getItem(metadataKey);

    if (!metadata) {
      // First time setup
      this.updateMetadata();
      return;
    }

    try {
      const parsed = JSON.parse(metadata);
      if (parsed.version !== this.config.version) {
        console.log(
          "Migrating localStorage from",
          parsed.version,
          "to",
          this.config.version,
        );
        // Perform any necessary migrations here
        this.updateMetadata();
      }
    } catch (error) {
      console.error("Failed to parse metadata, resetting:", error);
      this.updateMetadata();
    }
  }

  private updateMetadata(): void {
    const metadata = {
      version: this.config.version,
      lastCleanup: Date.now(),
      stats: this.getStats(),
    };

    try {
      localStorage.setItem(
        this.getPrefixedKey("_metadata"),
        JSON.stringify(metadata),
      );
    } catch (error) {
      console.error("Failed to update metadata:", error);
    }
  }

  private initializeCleanup(): void {
    // Initial cleanup
    this.cleanup();

    // Set up periodic cleanup
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    // Cleanup on page unload
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => {
        this.cleanup();
        if (this.cleanupTimer) {
          clearInterval(this.cleanupTimer);
        }
      });
    }
  }

  /**
   * Get storage health information
   */
  getHealthReport(): {
    status: "healthy" | "warning" | "critical";
    issues: string[];
    recommendations: string[];
    stats: StorageStats;
  } {
    const stats = this.getStats();
    const issues: string[] = [];
    const recommendations: string[] = [];

    let status: "healthy" | "warning" | "critical" = "healthy";

    // Check storage usage
    const usagePercent = (stats.totalSize / this.config.maxSize) * 100;

    if (usagePercent > 90) {
      status = "critical";
      issues.push(`Storage usage critical: ${usagePercent.toFixed(1)}%`);
      recommendations.push("Run cleanup or increase storage limit");
    } else if (usagePercent > 70) {
      status = "warning";
      issues.push(`Storage usage high: ${usagePercent.toFixed(1)}%`);
      recommendations.push("Consider running cleanup");
    }

    // Check expired items
    if (stats.expiredItems > 0) {
      if (status === "healthy") status = "warning";
      issues.push(`${stats.expiredItems} expired items found`);
      recommendations.push("Run cleanup to remove expired items");
    }

    // Check for very old items (>30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    if (stats.oldestItem < thirtyDaysAgo) {
      if (status === "healthy") status = "warning";
      issues.push("Very old items detected (>30 days)");
      recommendations.push("Consider data archival or cleanup");
    }

    return {
      status,
      issues,
      recommendations,
      stats,
    };
  }
}

// Export singleton instance
export const localStorageManager = new LocalStorageManager({
  maxSize: 5 * 1024 * 1024, // 5MB
  compressionThreshold: 1024, // 1KB
  defaultExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  cleanupInterval: 60 * 60 * 1000, // 1 hour
  version: "1.0.0",
});

export default LocalStorageManager;
