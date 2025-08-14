import React from 'react';
import { Word } from "@/data/wordsDatabase";

// Event types for word database changes
export interface WordDatabaseEvent {
  type: 'words-added' | 'words-updated' | 'words-deleted' | 'categories-changed' | 'full-refresh';
  timestamp: number;
  data?: {
    words?: Word[];
    categories?: string[];
    wordIds?: number[];
  };
}

// Real-time word database service
class RealTimeWordDatabaseService {
  private listeners: Set<(event: WordDatabaseEvent) => void> = new Set();
  private currentWords: Word[] = [];
  private currentCategories: string[] = [];
  private lastUpdate: number = Date.now();
  private checkInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Import the current words database
      const { wordsDatabase, getAllCategories } = await import("@/data/wordsDatabase");
      this.currentWords = [...wordsDatabase];
      this.currentCategories = getAllCategories();
      this.lastUpdate = Date.now();
      this.isInitialized = true;
      
      // Start monitoring for changes
      this.startMonitoring();
      
      console.log('Real-time word database initialized with', this.currentWords.length, 'words');
    } catch (error) {
      console.error('Failed to initialize real-time word database:', error);
    }
  }

  // Start monitoring for database changes
  private startMonitoring() {
    // Only check for changes when explicitly triggered (more efficient for browser)
    // Auto-check every 10 seconds as backup
    this.checkInterval = setInterval(() => {
      this.checkForChanges();
    }, 10000);

    // Listen for storage events (when admin adds words via localStorage)
    window.addEventListener('storage', this.handleStorageChange.bind(this));

    // Listen for custom events (when admin adds words in current tab)
    window.addEventListener('wordDatabaseUpdate', this.handleCustomEvent.bind(this));
  }

  // Stop monitoring
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    window.removeEventListener('wordDatabaseUpdate', this.handleCustomEvent.bind(this));
    this.listeners.clear();
    this.isInitialized = false;
  }

  // Check for changes in the words database
  private async checkForChanges() {
    try {
      // Import the words database (browser will handle caching)
      const module = await import("@/data/wordsDatabase");

      if (!module || !module.wordsDatabase || !module.getAllCategories) {
        console.warn('Word database module not properly loaded');
        return;
      }

      const { wordsDatabase, getAllCategories } = module;
      const newWords = [...wordsDatabase];
      const newCategories = getAllCategories();

      // Validate data
      if (!Array.isArray(newWords) || !Array.isArray(newCategories)) {
        console.warn('Invalid word database data structure');
        return;
      }

      // Check if words have changed
      const wordsChanged = this.hasWordsChanged(newWords);
      const categoriesChanged = this.hasCategoriesChanged(newCategories);

      if (wordsChanged || categoriesChanged) {
        const previousWordCount = this.currentWords.length;
        const newWordCount = newWords.length;

        this.currentWords = newWords;
        this.currentCategories = newCategories;
        this.lastUpdate = Date.now();

        // Determine the type of change
        let eventType: WordDatabaseEvent['type'] = 'full-refresh';
        let eventData: any = {
          words: newWords,
          categories: newCategories
        };

        if (newWordCount > previousWordCount) {
          eventType = 'words-added';
          eventData.words = newWords.slice(previousWordCount);
        } else if (newWordCount < previousWordCount) {
          eventType = 'words-deleted';
        } else if (categoriesChanged) {
          eventType = 'categories-changed';
        } else {
          eventType = 'words-updated';
        }

        // Notify all listeners
        this.notifyListeners({
          type: eventType,
          timestamp: this.lastUpdate,
          data: eventData
        });

        console.log('Word database changes detected:', eventType, `(${newWordCount} words)`);
      }
    } catch (error) {
      console.error('Error checking for word database changes:', error);
      // Don't throw the error to prevent crashes
    }
  }

  // Handle storage events (cross-tab communication)
  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'wordDatabaseUpdate') {
      this.triggerRefresh();
    }
  }

  // Handle custom events (same-tab communication)
  private handleCustomEvent(event: CustomEvent) {
    this.triggerRefresh();
  }

  // Check if words array has changed
  private hasWordsChanged(newWords: Word[]): boolean {
    if (newWords.length !== this.currentWords.length) {
      return true;
    }
    
    // Quick check using JSON comparison (for simplicity)
    return JSON.stringify(newWords) !== JSON.stringify(this.currentWords);
  }

  // Check if categories have changed
  private hasCategoriesChanged(newCategories: string[]): boolean {
    if (newCategories.length !== this.currentCategories.length) {
      return true;
    }
    
    return JSON.stringify(newCategories.sort()) !== JSON.stringify(this.currentCategories.sort());
  }

  // Add event listener
  addListener(callback: (event: WordDatabaseEvent) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Remove event listener
  removeListener(callback: (event: WordDatabaseEvent) => void) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners(event: WordDatabaseEvent) {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in word database listener:', error);
      }
    });
  }

  // Force a refresh check
  triggerRefresh() {
    this.checkForChanges();
  }

  // Get current words
  getCurrentWords(): Word[] {
    return [...this.currentWords];
  }

  // Get current categories
  getCurrentCategories(): string[] {
    return [...this.currentCategories];
  }

  // Get last update timestamp
  getLastUpdate(): number {
    return this.lastUpdate;
  }

  // Invalidate all related caches
  invalidateCaches() {
    // Clear word-related localStorage caches
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.includes('word') || 
      key.includes('category') || 
      key.includes('session') ||
      key.includes('progress')
    );
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Trigger a browser-wide cache invalidation event
    localStorage.setItem('wordDatabaseUpdate', Date.now().toString());
    localStorage.removeItem('wordDatabaseUpdate');
    
    // Dispatch custom event for current tab
    window.dispatchEvent(new CustomEvent('wordDatabaseUpdate', {
      detail: { timestamp: Date.now() }
    }));
    
    console.log('Word database caches invalidated');
  }
}

// Singleton instance
export const realTimeWordDB = new RealTimeWordDatabaseService();

// Auto-initialize when imported
realTimeWordDB.initialize();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  realTimeWordDB.destroy();
});

// Helper hook for React components
export function useRealTimeWords() {
  const [words, setWords] = React.useState<Word[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Initialize if needed
    if (!realTimeWordDB.getLastUpdate()) {
      realTimeWordDB.initialize().then(() => {
        setWords(realTimeWordDB.getCurrentWords());
        setCategories(realTimeWordDB.getCurrentCategories());
        setLastUpdate(realTimeWordDB.getLastUpdate());
        setIsLoading(false);
      });
    } else {
      setWords(realTimeWordDB.getCurrentWords());
      setCategories(realTimeWordDB.getCurrentCategories());
      setLastUpdate(realTimeWordDB.getLastUpdate());
      setIsLoading(false);
    }

    // Listen for changes
    const unsubscribe = realTimeWordDB.addListener((event) => {
      setWords(realTimeWordDB.getCurrentWords());
      setCategories(realTimeWordDB.getCurrentCategories());
      setLastUpdate(realTimeWordDB.getLastUpdate());
      
      // Show notification about the change
      if (event.type === 'words-added' && event.data?.words) {
        console.log(`${event.data.words.length} new words added!`);
      } else if (event.type === 'categories-changed') {
        console.log('Categories updated!');
      }
    });

    return unsubscribe;
  }, []);

  return {
    words,
    categories,
    lastUpdate,
    isLoading,
    refresh: () => realTimeWordDB.triggerRefresh(),
    invalidateCaches: () => realTimeWordDB.invalidateCaches()
  };
}

// React import (will be available when used in components)
declare const React: any;
