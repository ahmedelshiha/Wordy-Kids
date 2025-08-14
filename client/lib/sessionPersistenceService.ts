import { SessionData } from '@/hooks/useSessionPersistence';

interface PersistenceServiceConfig {
  autoSaveInterval: number;
  maxRetries: number;
  debounceTime: number;
  enableNetworkSync: boolean;
  enableIndexedDB: boolean;
}

interface QueuedSave {
  id: string;
  data: Partial<SessionData>;
  timestamp: number;
  retries: number;
  priority: 'low' | 'medium' | 'high';
}

class SessionPersistenceService {
  private config: PersistenceServiceConfig;
  private saveQueue: QueuedSave[] = [];
  private isProcessing = false;
  private debounceTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private networkStatus = true;
  private indexedDB: IDBDatabase | null = null;

  constructor(config: Partial<PersistenceServiceConfig> = {}) {
    this.config = {
      autoSaveInterval: 3000,
      maxRetries: 3,
      debounceTime: 1000,
      enableNetworkSync: true,
      enableIndexedDB: true,
      ...config,
    };

    this.initialize();
  }

  private async initialize() {
    // Initialize IndexedDB for offline storage
    if (this.config.enableIndexedDB) {
      await this.initIndexedDB();
    }

    // Setup network status monitoring
    this.setupNetworkMonitoring();

    // Start background processing
    this.startBackgroundProcessing();

    // Setup cleanup on page unload
    this.setupUnloadHandlers();
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('IndexedDB not supported, falling back to localStorage only');
        resolve();
        return;
      }

      const request = indexedDB.open('WordAdventureDB', 1);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.indexedDB = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for session data
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('timestamp', 'timestamp', { unique: false });
          sessionStore.createIndex('type', 'type', { unique: false });
        }

        // Create object store for backup data
        if (!db.objectStoreNames.contains('backups')) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'id' });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  private setupNetworkMonitoring() {
    if (!this.config.enableNetworkSync) return;

    const updateNetworkStatus = () => {
      this.networkStatus = navigator.onLine;
      if (this.networkStatus && this.saveQueue.length > 0) {
        // Network came back online, process queued saves
        this.processQueue();
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Initial status
    this.networkStatus = navigator.onLine;
  }

  private setupUnloadHandlers() {
    const handleBeforeUnload = () => {
      // Force sync all pending saves
      this.forceSync();
    };

    const handlePageHide = () => {
      // Handle page visibility API
      this.forceSync();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.forceSync();
      } else {
        // Page became visible again, resume processing
        this.startBackgroundProcessing();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  private startBackgroundProcessing() {
    // Process queue periodically
    const processInterval = setInterval(() => {
      if (!this.isProcessing && this.saveQueue.length > 0) {
        this.processQueue();
      }
    }, this.config.autoSaveInterval);

    // Clear interval when page is hidden to save resources
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearInterval(processInterval);
      }
    });
  }

  public queueSave(data: Partial<SessionData>, priority: 'low' | 'medium' | 'high' = 'medium'): string {
    const id = `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const queuedSave: QueuedSave = {
      id,
      data,
      timestamp: Date.now(),
      retries: 0,
      priority,
    };

    // Add to queue with priority ordering
    this.saveQueue.push(queuedSave);
    this.saveQueue.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Debounce processing to avoid excessive saves
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.processQueue();
    }, this.config.debounceTime);

    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.saveQueue.length === 0) return;

    this.isProcessing = true;

    try {
      const batch = this.saveQueue.splice(0, 5); // Process up to 5 saves at once

      const savePromises = batch.map(async (queuedSave) => {
        try {
          await this.executeSave(queuedSave);
        } catch (error) {
          console.error(`Failed to save ${queuedSave.id}:`, error);
          
          // Retry logic
          if (queuedSave.retries < this.config.maxRetries) {
            queuedSave.retries++;
            queuedSave.timestamp = Date.now();
            this.saveQueue.unshift(queuedSave); // Add back to front for immediate retry
          } else {
            console.error(`Giving up on save ${queuedSave.id} after ${this.config.maxRetries} retries`);
          }
        }
      });

      await Promise.allSettled(savePromises);
    } finally {
      this.isProcessing = false;
      
      // Schedule retry if there are failed items
      if (this.saveQueue.some(save => save.retries > 0)) {
        this.scheduleRetry();
      }
    }
  }

  private scheduleRetry() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }

    this.retryTimer = setTimeout(() => {
      this.processQueue();
    }, 5000); // Retry after 5 seconds
  }

  private async executeSave(queuedSave: QueuedSave): Promise<void> {
    const { data } = queuedSave;

    // Primary: Save to localStorage
    try {
      const existingData = this.loadFromLocalStorage() || {};
      const mergedData = { ...existingData, ...data, lastSaved: Date.now() };
      
      // Compress and save
      const compressed = this.compressData(mergedData);
      localStorage.setItem('wordAdventure_sessionData', compressed);
    } catch (localStorageError) {
      console.warn('localStorage save failed:', localStorageError);
      
      // Fallback to IndexedDB if available
      if (this.indexedDB) {
        await this.saveToIndexedDB(queuedSave);
      } else {
        throw localStorageError;
      }
    }

    // Secondary: Save to IndexedDB for backup
    if (this.indexedDB && this.config.enableIndexedDB) {
      try {
        await this.saveToIndexedDB(queuedSave);
      } catch (indexedDBError) {
        console.warn('IndexedDB backup save failed:', indexedDBError);
        // Don't throw, localStorage save might have succeeded
      }
    }

    // Tertiary: Network sync if enabled and online
    if (this.config.enableNetworkSync && this.networkStatus) {
      try {
        await this.syncToNetwork(data);
      } catch (networkError) {
        console.warn('Network sync failed:', networkError);
        // Don't throw, local saves might have succeeded
      }
    }
  }

  private async saveToIndexedDB(queuedSave: QueuedSave): Promise<void> {
    if (!this.indexedDB) throw new Error('IndexedDB not available');

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');

      const sessionRecord = {
        id: queuedSave.id,
        data: queuedSave.data,
        timestamp: queuedSave.timestamp,
        type: 'session_data',
      };

      const request = store.put(sessionRecord);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async syncToNetwork(data: Partial<SessionData>): Promise<void> {
    // This would sync to a backend API if available
    // For now, this is a placeholder for future network sync functionality
    
    if (!navigator.onLine) {
      throw new Error('Network not available');
    }

    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Session data synced to network (simulated)');
        resolve();
      }, 100);
    });
  }

  private loadFromLocalStorage(): SessionData | null {
    try {
      const saved = localStorage.getItem('wordAdventure_sessionData');
      if (!saved) return null;
      
      return this.decompressData(saved);
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  private compressData(data: any): string {
    // Simple compression by removing whitespace and reducing precision
    return JSON.stringify(data, (key, value) => {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        return Math.round(value * 100) / 100;
      }
      return value;
    });
  }

  private decompressData(compressed: string): any {
    try {
      return JSON.parse(compressed);
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return null;
    }
  }

  public forceSync(): void {
    // Force immediate processing of all queued saves
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.processQueue();
  }

  public async loadLatestSession(): Promise<SessionData | null> {
    // Try localStorage first
    let data = this.loadFromLocalStorage();
    
    if (!data && this.indexedDB) {
      // Fallback to IndexedDB
      try {
        data = await this.loadFromIndexedDB();
      } catch (error) {
        console.error('Failed to load from IndexedDB:', error);
      }
    }

    return data;
  }

  private async loadFromIndexedDB(): Promise<SessionData | null> {
    if (!this.indexedDB) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.indexedDB!.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('timestamp');

      // Get the most recent session
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(cursor.value.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  public clearAllSessions(): void {
    // Clear localStorage
    localStorage.removeItem('wordAdventure_sessionData');
    localStorage.removeItem('wordAdventure_sessionBackup');

    // Clear queue
    this.saveQueue = [];

    // Clear IndexedDB
    if (this.indexedDB) {
      const transaction = this.indexedDB.transaction(['sessions', 'backups'], 'readwrite');
      transaction.objectStore('sessions').clear();
      transaction.objectStore('backups').clear();
    }
  }

  public getQueueStatus() {
    return {
      queueLength: this.saveQueue.length,
      isProcessing: this.isProcessing,
      networkStatus: this.networkStatus,
      hasIndexedDB: !!this.indexedDB,
    };
  }
}

// Global singleton instance
let persistenceService: SessionPersistenceService | null = null;

export const getSessionPersistenceService = (config?: Partial<PersistenceServiceConfig>): SessionPersistenceService => {
  if (!persistenceService) {
    persistenceService = new SessionPersistenceService(config);
  }
  return persistenceService;
};

export { SessionPersistenceService };
export type { PersistenceServiceConfig, QueuedSave };
