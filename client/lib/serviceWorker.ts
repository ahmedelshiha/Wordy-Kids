/**
 * Service Worker Registration and Management
 * Handles registration, updates, and communication with the service worker
 */

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

interface CacheStatus {
  cacheSize: number;
  cacheVersion: string;
  lastUpdated: number;
  offlineReady: boolean;
}

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private isOnline = true;
  private messageChannel: MessageChannel | null = null;

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  // Initialize service worker
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw-advanced.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully');

      // Set up event listeners
      this.setupEventListeners();

      // Check for updates
      await this.checkForUpdates();

      // Setup online/offline detection
      this.setupOnlineDetection();

      // Setup message channel
      this.setupMessageChannel();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Setup event listeners for service worker lifecycle
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Listen for waiting service worker (update available)
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker installed and ready
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    // Listen for service worker controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed - reloading page');
      window.location.reload();
    });
  }

  // Check for service worker updates
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.warn('Failed to check for service worker updates:', error);
    }
  }

  // Activate waiting service worker
  async activateUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Send message to waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Setup online/offline detection
  private setupOnlineDetection(): void {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyOnlineStatus(true);
      console.log('App is back online');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
      console.log('App is offline');
    });
  }

  // Setup message channel for communication
  private setupMessageChannel(): void {
    this.messageChannel = new MessageChannel();
    
    // Send port to service worker
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(
        { type: 'SETUP_CHANNEL' },
        [this.messageChannel.port2]
      );
    }

    // Listen for messages from service worker
    this.messageChannel.port1.addEventListener('message', (event) => {
      this.handleMessage(event.data);
    });

    this.messageChannel.port1.start();
  }

  // Handle messages from service worker
  private handleMessage(message: ServiceWorkerMessage): void {
    switch (message.type) {
      case 'CACHE_STATUS':
        this.handleCacheStatus(message.data);
        break;
      case 'CACHE_CLEARED':
        console.log('Cache cleared successfully');
        break;
      case 'RESOURCES_PRELOADED':
        console.log('Resources preloaded successfully');
        break;
      default:
        console.log('Unknown message from service worker:', message);
    }
  }

  // Queue action for background sync
  async queueSyncAction(type: string, data: any): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      console.warn('No service worker controller available for sync');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'QUEUE_SYNC_ACTION',
      data: { type, data }
    });
  }

  // Get cache status from service worker
  async getCacheStatus(): Promise<CacheStatus | null> {
    return new Promise((resolve) => {
      if (!this.messageChannel) {
        resolve(null);
        return;
      }

      const timeout = setTimeout(() => {
        resolve(null);
      }, 5000);

      const messageHandler = (event: MessageEvent) => {
        if (event.data.type === 'CACHE_STATUS') {
          clearTimeout(timeout);
          this.messageChannel!.port1.removeEventListener('message', messageHandler);
          resolve(event.data.data);
        }
      };

      this.messageChannel.port1.addEventListener('message', messageHandler);

      // Request cache status
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'GET_CACHE_STATUS'
        });
      }
    });
  }

  // Clear application cache
  async clearCache(): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      console.warn('No service worker controller available');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
  }

  // Preload resources for offline use
  async preloadResources(resources: string[]): Promise<void> {
    if (!navigator.serviceWorker.controller) {
      console.warn('No service worker controller available');
      return;
    }

    navigator.serviceWorker.controller.postMessage({
      type: 'PRELOAD_RESOURCES',
      data: { resources }
    });
  }

  // Notification callbacks
  private notifyUpdateAvailable(): void {
    // Dispatch custom event for UI to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  private notifyOnlineStatus(online: boolean): void {
    window.dispatchEvent(new CustomEvent('online-status-changed', {
      detail: { online }
    }));
  }

  private handleCacheStatus(status: CacheStatus): void {
    window.dispatchEvent(new CustomEvent('cache-status-updated', {
      detail: status
    }));
  }

  // Getters for status
  get hasUpdate(): boolean {
    return this.updateAvailable;
  }

  get online(): boolean {
    return this.isOnline;
  }

  get isRegistered(): boolean {
    return this.registration !== null;
  }
}

// React hooks for service worker integration
export function useServiceWorker() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [cacheStatus, setCacheStatus] = React.useState<CacheStatus | null>(null);
  const swManager = ServiceWorkerManager.getInstance();

  React.useEffect(() => {
    // Initialize service worker
    swManager.initialize();

    // Listen for online status changes
    const handleOnlineStatus = (event: CustomEvent) => {
      setIsOnline(event.detail.online);
    };

    // Listen for update notifications
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    // Listen for cache status updates
    const handleCacheStatus = (event: CustomEvent) => {
      setCacheStatus(event.detail);
    };

    window.addEventListener('online-status-changed', handleOnlineStatus as EventListener);
    window.addEventListener('sw-update-available', handleUpdateAvailable);
    window.addEventListener('cache-status-updated', handleCacheStatus as EventListener);

    return () => {
      window.removeEventListener('online-status-changed', handleOnlineStatus as EventListener);
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
      window.removeEventListener('cache-status-updated', handleCacheStatus as EventListener);
    };
  }, []);

  const activateUpdate = React.useCallback(async () => {
    await swManager.activateUpdate();
    setUpdateAvailable(false);
  }, []);

  const queueSyncAction = React.useCallback(async (type: string, data: any) => {
    await swManager.queueSyncAction(type, data);
  }, []);

  const getCacheStatus = React.useCallback(async () => {
    const status = await swManager.getCacheStatus();
    setCacheStatus(status);
    return status;
  }, []);

  const clearCache = React.useCallback(async () => {
    await swManager.clearCache();
  }, []);

  const preloadResources = React.useCallback(async (resources: string[]) => {
    await swManager.preloadResources(resources);
  }, []);

  return {
    isOnline,
    updateAvailable,
    cacheStatus,
    activateUpdate,
    queueSyncAction,
    getCacheStatus,
    clearCache,
    preloadResources,
    isRegistered: swManager.isRegistered
  };
}

// Offline action queue hook
export function useOfflineActionQueue() {
  const { queueSyncAction, isOnline } = useServiceWorker();
  const [queuedActions, setQueuedActions] = React.useState<Array<{ type: string; data: any }>>([]);

  const addAction = React.useCallback(async (type: string, data: any) => {
    if (isOnline) {
      // Execute immediately if online
      try {
        await executeAction(type, data);
      } catch (error) {
        // Queue if execution fails
        await queueSyncAction(type, data);
        setQueuedActions(prev => [...prev, { type, data }]);
      }
    } else {
      // Queue for later if offline
      await queueSyncAction(type, data);
      setQueuedActions(prev => [...prev, { type, data }]);
    }
  }, [isOnline, queueSyncAction]);

  const clearQueue = React.useCallback(() => {
    setQueuedActions([]);
  }, []);

  return {
    addAction,
    queuedActions,
    clearQueue,
    hasQueuedActions: queuedActions.length > 0
  };
}

// Execute action immediately
async function executeAction(type: string, data: any): Promise<void> {
  switch (type) {
    case 'word-progress':
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      break;
    case 'user-settings':
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      break;
    case 'achievement-unlock':
      await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      break;
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}

// Preload critical resources for offline use
export async function preloadCriticalResources(): Promise<void> {
  const swManager = ServiceWorkerManager.getInstance();
  
  const criticalResources = [
    '/',
    '/app',
    '/static/css/main.css',
    '/static/js/bundle.js',
    '/sounds/cat.mp3',
    '/sounds/dog.mp3',
    '/sounds/elephant.mp3',
    '/sounds/lion.mp3',
    '/images/logo.png'
  ];

  await swManager.preloadResources(criticalResources);
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
