/**
 * localStorage Optimization utilities to reduce storage overhead and improve efficiency
 */

// Compression utilities
class StorageCompressor {
  // Simple LZ-string implementation for compression
  static compress(data: string): string {
    if (!data) return "";

    const dict: { [key: string]: number } = {};
    const result: (string | number)[] = [];
    let dictSize = 256;
    let w = "";

    for (let i = 0; i < data.length; i++) {
      const c = data.charAt(i);
      const wc = w + c;

      if (dict[wc]) {
        w = wc;
      } else {
        result.push(dict[w] ? dict[w] : w);
        dict[wc] = dictSize++;
        w = c;
      }
    }

    if (w) {
      result.push(dict[w] ? dict[w] : w);
    }

    return JSON.stringify(result);
  }

  static decompress(compressed: string): string {
    if (!compressed) return "";

    try {
      const data = JSON.parse(compressed);
      const dict: { [key: number]: string } = {};
      let dictSize = 256;
      let result = "";
      let w = String(data[0]);

      result += w;

      for (let i = 1; i < data.length; i++) {
        const k = data[i];
        let entry = "";

        if (dict[k]) {
          entry = dict[k];
        } else if (k === dictSize) {
          entry = w + w.charAt(0);
        } else {
          entry = String(k);
        }

        result += entry;
        dict[dictSize++] = w + entry.charAt(0);
        w = entry;
      }

      return result;
    } catch (error) {
      console.warn("Failed to decompress data:", error);
      return compressed; // Return original if decompression fails
    }
  }
}

// Storage quota management
class StorageQuotaManager {
  private static readonly QUOTA_WARNING_THRESHOLD = 0.8; // 80%
  private static readonly QUOTA_ERROR_THRESHOLD = 0.95; // 95%

  static async checkStorageQuota(): Promise<{
    used: number;
    available: number;
    percentage: number;
    warning: boolean;
    error: boolean;
  }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const available = estimate.quota || 0;
        const percentage = available > 0 ? used / available : 0;

        return {
          used,
          available,
          percentage,
          warning: percentage > this.QUOTA_WARNING_THRESHOLD,
          error: percentage > this.QUOTA_ERROR_THRESHOLD,
        };
      } catch (error) {
        console.warn("Failed to estimate storage quota:", error);
      }
    }

    // Fallback for browsers without Storage API
    const used = this.getLocalStorageSize();
    const maxSize = 5 * 1024 * 1024; // Assume 5MB limit
    const percentage = used / maxSize;

    return {
      used,
      available: maxSize,
      percentage,
      warning: percentage > this.QUOTA_WARNING_THRESHOLD,
      error: percentage > this.QUOTA_ERROR_THRESHOLD,
    };
  }

  private static getLocalStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage[key];
        total += key.length + value.length;
      }
    }
    return total * 2; // UTF-16 encoding
  }

  static async cleanupIfNeeded(): Promise<void> {
    const quota = await this.checkStorageQuota();

    if (quota.warning) {
      console.warn(
        "Storage quota warning:",
        Math.round(quota.percentage * 100) + "%",
      );
      this.performCleanup();
    }
  }

  private static performCleanup(): void {
    // Remove old cache entries
    const cachePrefix = "words_v";
    const sessionPrefix = "wordAdventure_session";
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    const now = Date.now();

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(cachePrefix) || key.startsWith(sessionPrefix)) {
        try {
          const data = JSON.parse(localStorage[key]);
          if (data.timestamp && now - data.timestamp > maxAge) {
            localStorage.removeItem(key);
            console.log("Cleaned up old storage entry:", key);
          }
        } catch (error) {
          // If we can't parse it, it might be corrupted - remove it
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// Optimized storage manager with automatic compression and cleanup
export class OptimizedStorageManager {
  private static readonly COMPRESSION_THRESHOLD = 1024; // Compress if > 1KB
  private compressionEnabled: boolean;
  private keyPrefix: string;

  constructor(keyPrefix: string = "", compressionEnabled: boolean = true) {
    this.keyPrefix = keyPrefix;
    this.compressionEnabled = compressionEnabled;
  }

  // Set item with automatic compression
  setItem(
    key: string,
    value: any,
    options: {
      compress?: boolean;
      expires?: number; // Time in milliseconds
      priority?: "high" | "medium" | "low";
    } = {},
  ): void {
    const fullKey = this.keyPrefix + key;
    const { compress, expires, priority = "medium" } = options;

    try {
      const serialized = JSON.stringify(value);
      const shouldCompress =
        compress ??
        (this.compressionEnabled &&
          serialized.length > OptimizedStorageManager.COMPRESSION_THRESHOLD);

      const data = {
        value: shouldCompress
          ? StorageCompressor.compress(serialized)
          : serialized,
        compressed: shouldCompress,
        timestamp: Date.now(),
        expires: expires ? Date.now() + expires : null,
        priority,
        size: serialized.length,
      };

      localStorage.setItem(fullKey, JSON.stringify(data));

      // Check quota after storing
      StorageQuotaManager.cleanupIfNeeded();
    } catch (error) {
      console.error("Failed to store item:", key, error);

      // If storage is full, try to clean up and retry
      if (error.name === "QuotaExceededError") {
        this.cleanup();
        try {
          localStorage.setItem(
            fullKey,
            JSON.stringify({ value, timestamp: Date.now() }),
          );
        } catch (retryError) {
          console.error("Failed to store item after cleanup:", key, retryError);
          throw retryError;
        }
      }
    }
  }

  // Get item with automatic decompression
  getItem<T = any>(key: string): T | null {
    const fullKey = this.keyPrefix + key;

    try {
      const stored = localStorage.getItem(fullKey);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // Handle legacy data (direct values)
      if (
        typeof data === "string" ||
        typeof data === "number" ||
        typeof data === "boolean"
      ) {
        return data as T;
      }

      // Handle wrapped data
      if (data && typeof data === "object") {
        // Check expiration
        if (data.expires && Date.now() > data.expires) {
          this.removeItem(key);
          return null;
        }

        const rawValue = data.compressed
          ? StorageCompressor.decompress(data.value)
          : data.value;

        return JSON.parse(rawValue);
      }

      return data;
    } catch (error) {
      console.warn("Failed to retrieve item:", key, error);
      // If corrupted, remove it
      this.removeItem(key);
      return null;
    }
  }

  // Remove item
  removeItem(key: string): void {
    const fullKey = this.keyPrefix + key;
    localStorage.removeItem(fullKey);
  }

  // Clear all items with this prefix
  clear(): void {
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.keyPrefix),
    );

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // Get all keys with this prefix
  getKeys(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.keyPrefix))
      .map((key) => key.substring(this.keyPrefix.length));
  }

  // Cleanup expired and low-priority items
  cleanup(): void {
    const now = Date.now();
    const keysToCheck = Object.keys(localStorage).filter((key) =>
      key.startsWith(this.keyPrefix),
    );

    let cleanedCount = 0;

    keysToCheck.forEach((fullKey) => {
      try {
        const stored = localStorage.getItem(fullKey);
        if (!stored) return;

        const data = JSON.parse(stored);

        // Remove expired items
        if (data.expires && now > data.expires) {
          localStorage.removeItem(fullKey);
          cleanedCount++;
          return;
        }

        // Remove old low-priority items (older than 3 days)
        if (data.priority === "low" && data.timestamp) {
          const age = now - data.timestamp;
          if (age > 3 * 24 * 60 * 60 * 1000) {
            // 3 days
            localStorage.removeItem(fullKey);
            cleanedCount++;
          }
        }
      } catch (error) {
        // Remove corrupted entries
        localStorage.removeItem(fullKey);
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} storage entries`);
    }
  }

  // Get storage statistics
  getStats(): {
    totalItems: number;
    totalSize: number;
    compressedItems: number;
    compressionRatio: number;
  } {
    const keys = this.getKeys();
    let totalSize = 0;
    let compressedItems = 0;
    let originalSize = 0;
    let compressedSize = 0;

    keys.forEach((key) => {
      try {
        const stored = localStorage.getItem(this.keyPrefix + key);
        if (stored) {
          const data = JSON.parse(stored);
          const size = data.size || stored.length;
          totalSize += size;

          if (data.compressed) {
            compressedItems++;
            compressedSize += data.value.length;
            originalSize += size;
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });

    return {
      totalItems: keys.length,
      totalSize,
      compressedItems,
      compressionRatio: originalSize > 0 ? compressedSize / originalSize : 1,
    };
  }
}

// Specialized storage managers for different data types
export const sessionStorage = new OptimizedStorageManager("session_", true);
export const cacheStorage = new OptimizedStorageManager("cache_", true);
export const settingsStorage = new OptimizedStorageManager("settings_", false);
export const progressStorage = new OptimizedStorageManager("progress_", true);

// React hook for optimized storage
export function useOptimizedStorage<T>(
  key: string,
  defaultValue: T,
  storageManager: OptimizedStorageManager = cacheStorage,
): [T, (value: T) => void, () => void] {
  const [value, setValue] = React.useState<T>(() => {
    const stored = storageManager.getItem<T>(key);
    return stored !== null ? stored : defaultValue;
  });

  const setStoredValue = React.useCallback(
    (newValue: T) => {
      setValue(newValue);
      storageManager.setItem(key, newValue);
    },
    [key, storageManager],
  );

  const removeValue = React.useCallback(() => {
    setValue(defaultValue);
    storageManager.removeItem(key);
  }, [key, defaultValue, storageManager]);

  return [value, setStoredValue, removeValue];
}

// Storage monitoring hook
export function useStorageMonitoring() {
  const [quota, setQuota] = React.useState<any>(null);

  React.useEffect(() => {
    const checkQuota = async () => {
      const quotaInfo = await StorageQuotaManager.checkStorageQuota();
      setQuota(quotaInfo);
    };

    checkQuota();

    // Check quota every 5 minutes
    const interval = setInterval(checkQuota, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return quota;
}

// Batch operations for efficient storage
export class BatchStorageOperations {
  private operations: Array<{
    type: "set" | "remove";
    key: string;
    value?: any;
    options?: any;
  }> = [];
  private storageManager: OptimizedStorageManager;

  constructor(storageManager: OptimizedStorageManager) {
    this.storageManager = storageManager;
  }

  set(key: string, value: any, options?: any): this {
    this.operations.push({ type: "set", key, value, options });
    return this;
  }

  remove(key: string): this {
    this.operations.push({ type: "remove", key });
    return this;
  }

  execute(): void {
    this.operations.forEach((op) => {
      if (op.type === "set") {
        this.storageManager.setItem(op.key, op.value, op.options);
      } else {
        this.storageManager.removeItem(op.key);
      }
    });

    this.operations = [];
  }

  clear(): void {
    this.operations = [];
  }
}
