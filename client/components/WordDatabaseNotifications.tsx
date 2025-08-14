import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, RefreshCw, Plus, Sparkles, X } from 'lucide-react';
import { useRealTimeWords } from '@/lib/realTimeWordDatabase';

interface Notification {
  id: string;
  type: 'words-added' | 'words-updated' | 'categories-changed' | 'full-refresh';
  message: string;
  count?: number;
  timestamp: number;
  dismissed?: boolean;
}

export function WordDatabaseNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { refresh } = useRealTimeWords();

  useEffect(() => {
    // Listen for word database changes
    const handleWordDatabaseEvent = (event: any) => {
      const { type, data, timestamp } = event.detail || event;
      
      let message = 'Word database updated!';
      let count = 0;
      
      switch (type) {
        case 'words-added':
          count = data?.words?.length || 0;
          message = `${count} new word${count === 1 ? '' : 's'} added!`;
          break;
        case 'words-updated':
          message = 'Words have been updated!';
          break;
        case 'categories-changed':
          message = 'Categories updated!';
          break;
        case 'full-refresh':
          message = 'Word database refreshed!';
          break;
      }

      const notification: Notification = {
        id: `notification_${timestamp}_${Math.random()}`,
        type,
        message,
        count,
        timestamp
      };

      setNotifications(prev => [...prev.slice(-4), notification]); // Keep last 5 notifications

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, dismissed: true } : n)
        );
      }, 5000);

      // Remove dismissed notifications after animation
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5500);
    };

    // Listen for custom events
    window.addEventListener('wordDatabaseUpdate', handleWordDatabaseEvent);
    window.addEventListener('wordDatabaseRefresh', handleWordDatabaseEvent);

    // Listen for storage events (cross-tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'wordDatabaseUpdate' || event.key === 'wordDatabaseRefresh') {
        handleWordDatabaseEvent({
          type: 'full-refresh',
          timestamp: parseInt(event.newValue || '0')
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('wordDatabaseUpdate', handleWordDatabaseEvent);
      window.removeEventListener('wordDatabaseRefresh', handleWordDatabaseEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const dismissNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 500);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'words-added':
        return <Plus className="w-4 h-4 text-green-600" />;
      case 'words-updated':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'categories-changed':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'full-refresh':
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'words-added':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'words-updated':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'categories-changed':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'full-refresh':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <Alert
          key={notification.id}
          className={`
            ${getNotificationColor(notification.type)}
            transform transition-all duration-500 ease-in-out
            ${notification.dismissed 
              ? 'translate-x-full opacity-0 scale-95' 
              : 'translate-x-0 opacity-100 scale-100'
            }
            shadow-lg border
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getNotificationIcon(notification.type)}
              <AlertDescription className="font-medium">
                {notification.message}
              </AlertDescription>
              {notification.count && notification.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/80 text-current"
                >
                  +{notification.count}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissNotification(notification.id)}
              className="h-6 w-6 p-0 hover:bg-white/20"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}

// Compact version for mobile
export function CompactWordDatabaseNotifications() {
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleWordDatabaseEvent = (event: any) => {
      const { type, data, timestamp } = event.detail || event;
      
      let message = '📚 Updated!';
      let count = 0;
      
      switch (type) {
        case 'words-added':
          count = data?.words?.length || 0;
          message = `🎉 +${count} word${count === 1 ? '' : 's'}!`;
          break;
        case 'words-updated':
          message = '✨ Words updated!';
          break;
        case 'categories-changed':
          message = '🏷️ Categories updated!';
          break;
        case 'full-refresh':
          message = '🔄 Refreshed!';
          break;
      }

      const notification: Notification = {
        id: `compact_${timestamp}`,
        type,
        message,
        count,
        timestamp
      };

      setLatestNotification(notification);
      setIsVisible(true);

      // Auto-hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);

      // Clear after animation
      setTimeout(() => {
        setLatestNotification(null);
      }, 3500);
    };

    window.addEventListener('wordDatabaseUpdate', handleWordDatabaseEvent);
    window.addEventListener('wordDatabaseRefresh', handleWordDatabaseEvent);

    return () => {
      window.removeEventListener('wordDatabaseUpdate', handleWordDatabaseEvent);
      window.removeEventListener('wordDatabaseRefresh', handleWordDatabaseEvent);
    };
  }, []);

  if (!latestNotification) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-[9999] md:hidden">
      <div
        className={`
          bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-2 opacity-0 scale-95'}
        `}
      >
        <span className="text-sm font-medium text-gray-700">
          {latestNotification.message}
        </span>
      </div>
    </div>
  );
}
