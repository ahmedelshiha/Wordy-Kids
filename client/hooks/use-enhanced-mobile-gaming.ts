import { useState, useEffect, useCallback, useRef } from 'react';

interface TouchGesture {
  type: 'tap' | 'double-tap' | 'long-press' | 'swipe' | 'pinch' | 'rotate';
  direction?: 'up' | 'down' | 'left' | 'right';
  intensity?: number;
  duration?: number;
  touches?: number;
}

interface HapticPattern {
  type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection' | 'impact' | 'notification';
  intensity?: number;
  duration?: number;
  pattern?: number[];
}

interface DeviceCapabilities {
  hasHaptics: boolean;
  hasGyroscope: boolean;
  hasAccelerometer: boolean;
  hasPressure: boolean;
  touchPoints: number;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  isTouch: boolean;
  platform: 'iOS' | 'Android' | 'Desktop' | 'Unknown';
}

interface EnhancedMobileGamingOptions {
  enableHaptics?: boolean;
  enableGestures?: boolean;
  hapticIntensity?: number;
  touchSensitivity?: number;
  gestureThreshold?: number;
  enableAdvancedTouch?: boolean;
}

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  pressure: number;
  startTime: number;
  element?: HTMLElement;
}

export const useEnhancedMobileGaming = (options: EnhancedMobileGamingOptions = {}) => {
  const {
    enableHaptics = true,
    enableGestures = true,
    hapticIntensity = 1,
    touchSensitivity = 0.8,
    gestureThreshold = 50,
    enableAdvancedTouch = true
  } = options;

  // State
  const [deviceCapabilities, setDeviceCapabilities] = useState<DeviceCapabilities>({
    hasHaptics: false,
    hasGyroscope: false,
    hasAccelerometer: false,
    hasPressure: false,
    touchPoints: 0,
    screenSize: 'medium',
    orientation: 'portrait',
    isTouch: false,
    platform: 'Unknown'
  });

  const [isGestureActive, setIsGestureActive] = useState(false);
  const [currentTouches, setCurrentTouches] = useState<Map<number, TouchPoint>>(new Map());
  const [lastTapTime, setLastTapTime] = useState(0);
  const [gestureHistory, setGestureHistory] = useState<TouchGesture[]>([]);

  // Refs
  const touchStartTime = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const gestureStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastHapticTime = useRef<number>(0);

  // Detect device capabilities
  useEffect(() => {
    const detectCapabilities = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isMobile = /mobile|tablet|ipad|iphone|android/.test(userAgent);
      
      // Detect haptic support
      const hasVibration = 'vibrate' in navigator;
      const hasHapticFeedback = 'vibrate' in navigator || ('hapticFeedback' in navigator);

      // Detect touch support
      const maxTouchPoints = navigator.maxTouchPoints || 0;
      const isTouch = 'ontouchstart' in window || maxTouchPoints > 0;

      // Detect screen size
      const screenWidth = window.innerWidth;
      const screenSize = screenWidth < 480 ? 'small' : screenWidth < 768 ? 'medium' : 'large';

      // Detect orientation
      const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';

      // Detect advanced features
      const hasGyroscope = 'DeviceOrientationEvent' in window;
      const hasAccelerometer = 'DeviceMotionEvent' in window;
      const hasPressure = 'onpointerdown' in window;

      setDeviceCapabilities({
        hasHaptics: hasHapticFeedback,
        hasGyroscope,
        hasAccelerometer,
        hasPressure,
        touchPoints: maxTouchPoints,
        screenSize,
        orientation,
        isTouch,
        platform: isIOS ? 'iOS' : isAndroid ? 'Android' : isMobile ? 'Unknown' : 'Desktop'
      });
    };

    detectCapabilities();
    
    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectCapabilities, 100); // Delay to get correct dimensions
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Enhanced haptic feedback with patterns
  const triggerHaptic = useCallback(async (pattern: HapticPattern) => {
    if (!enableHaptics || !deviceCapabilities.hasHaptics) return;

    const now = Date.now();
    // Prevent haptic spam (minimum 50ms between haptics)
    if (now - lastHapticTime.current < 50) return;
    lastHapticTime.current = now;

    try {
      let vibrationPattern: number[] = [];

      switch (pattern.type) {
        case 'light':
          vibrationPattern = [10];
          break;
        case 'medium':
          vibrationPattern = [25];
          break;
        case 'heavy':
          vibrationPattern = [50];
          break;
        case 'success':
          vibrationPattern = [20, 10, 20, 10, 40];
          break;
        case 'error':
          vibrationPattern = [100, 50, 100];
          break;
        case 'warning':
          vibrationPattern = [30, 20, 30];
          break;
        case 'selection':
          vibrationPattern = [5];
          break;
        case 'impact':
          vibrationPattern = [15, 5, 25];
          break;
        case 'notification':
          vibrationPattern = [10, 5, 10, 5, 20];
          break;
        default:
          if (pattern.pattern) {
            vibrationPattern = pattern.pattern;
          } else {
            vibrationPattern = [pattern.duration || 20];
          }
      }

      // Apply intensity scaling
      if (pattern.intensity !== undefined) {
        vibrationPattern = vibrationPattern.map(duration => 
          Math.round(duration * pattern.intensity! * hapticIntensity)
        );
      } else {
        vibrationPattern = vibrationPattern.map(duration => 
          Math.round(duration * hapticIntensity)
        );
      }

      // Use modern Vibration API
      if (navigator.vibrate) {
        navigator.vibrate(vibrationPattern);
      }

      // iOS specific haptic feedback (if available)
      if (deviceCapabilities.platform === 'iOS' && 'hapticFeedback' in navigator) {
        const hapticFeedback = (navigator as any).hapticFeedback;
        switch (pattern.type) {
          case 'light':
          case 'selection':
            hapticFeedback?.selectionChanged?.();
            break;
          case 'success':
            hapticFeedback?.notificationOccurred?.('success');
            break;
          case 'error':
            hapticFeedback?.notificationOccurred?.('error');
            break;
          case 'warning':
            hapticFeedback?.notificationOccurred?.('warning');
            break;
          case 'impact':
          case 'medium':
            hapticFeedback?.impactOccurred?.('medium');
            break;
          case 'heavy':
            hapticFeedback?.impactOccurred?.('heavy');
            break;
        }
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [enableHaptics, deviceCapabilities.hasHaptics, deviceCapabilities.platform, hapticIntensity]);

  // Enhanced gesture recognition
  const recognizeGesture = useCallback((touches: TouchPoint[], endTouches: TouchPoint[]) => {
    if (!enableGestures) return null;

    const currentTime = Date.now();
    
    // Single touch gestures
    if (touches.length === 1 && endTouches.length === 1) {
      const touch = touches[0];
      const endTouch = endTouches[0];
      const duration = currentTime - touch.startTime;
      const deltaX = endTouch.x - touch.x;
      const deltaY = endTouch.y - touch.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Long press detection
      if (duration > 500 && distance < 20) {
        return { type: 'long-press' as const, duration, intensity: 1 };
      }

      // Swipe detection
      if (distance > gestureThreshold && duration < 300) {
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        let direction: 'up' | 'down' | 'left' | 'right';
        
        if (angle >= -45 && angle <= 45) direction = 'right';
        else if (angle >= 45 && angle <= 135) direction = 'down';
        else if (angle >= -135 && angle <= -45) direction = 'up';
        else direction = 'left';

        const intensity = Math.min(distance / (gestureThreshold * 2), 1);
        
        return { 
          type: 'swipe' as const, 
          direction, 
          intensity, 
          duration 
        };
      }

      // Tap detection
      if (distance < 20 && duration < 300) {
        // Double tap detection
        if (currentTime - lastTapTime < 400) {
          setLastTapTime(0);
          return { type: 'double-tap' as const, duration, intensity: 1 };
        } else {
          setLastTapTime(currentTime);
          // Return tap after delay to check for double tap
          setTimeout(() => {
            if (Date.now() - lastTapTime > 350) {
              // Single tap confirmed
            }
          }, 350);
          return { type: 'tap' as const, duration, intensity: 1 };
        }
      }
    }

    // Multi-touch gestures
    if (touches.length === 2 && endTouches.length === 2) {
      const touch1Start = touches[0];
      const touch2Start = touches[1];
      const touch1End = endTouches[0];
      const touch2End = endTouches[1];

      // Calculate initial and final distances for pinch
      const initialDistance = Math.sqrt(
        Math.pow(touch2Start.x - touch1Start.x, 2) + 
        Math.pow(touch2Start.y - touch1Start.y, 2)
      );
      
      const finalDistance = Math.sqrt(
        Math.pow(touch2End.x - touch1End.x, 2) + 
        Math.pow(touch2End.y - touch1End.y, 2)
      );

      const distanceChange = finalDistance - initialDistance;
      
      if (Math.abs(distanceChange) > 30) {
        const intensity = Math.min(Math.abs(distanceChange) / 100, 1);
        return { 
          type: 'pinch' as const, 
          intensity: distanceChange > 0 ? intensity : -intensity,
          duration: currentTime - touch1Start.startTime
        };
      }
    }

    return null;
  }, [enableGestures, gestureThreshold, lastTapTime]);

  // Touch event handlers
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!enableAdvancedTouch) return;

    const touches = Array.from(event.touches).map((touch, index) => ({
      id: touch.identifier,
      x: touch.clientX,
      y: touch.clientY,
      pressure: (touch as any).force || 1,
      startTime: Date.now(),
      element: touch.target as HTMLElement
    }));

    const newTouchMap = new Map<number, TouchPoint>();
    touches.forEach(touch => {
      newTouchMap.set(touch.id, touch);
    });

    setCurrentTouches(newTouchMap);
    setIsGestureActive(true);
    touchStartTime.current = Date.now();

    // Long press timer
    if (touches.length === 1) {
      longPressTimer.current = setTimeout(() => {
        triggerHaptic({ type: 'medium' });
        // Long press detected
        const gesture: TouchGesture = { 
          type: 'long-press', 
          duration: Date.now() - touchStartTime.current,
          intensity: 1
        };
        setGestureHistory(prev => [...prev.slice(-9), gesture]);
      }, 500);
    }
  }, [enableAdvancedTouch, triggerHaptic]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!enableAdvancedTouch) return;

    const endTouches = Array.from(currentTouches.values());
    const gesture = recognizeGesture(endTouches, endTouches);

    if (gesture) {
      setGestureHistory(prev => [...prev.slice(-9), gesture]);
      
      // Trigger appropriate haptic feedback
      switch (gesture.type) {
        case 'tap':
          triggerHaptic({ type: 'light' });
          break;
        case 'double-tap':
          triggerHaptic({ type: 'medium' });
          break;
        case 'swipe':
          triggerHaptic({ type: 'selection' });
          break;
        case 'pinch':
          triggerHaptic({ type: 'impact' });
          break;
        case 'long-press':
          // Already handled in timer
          break;
      }
    }

    // Clear timers
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    setCurrentTouches(new Map());
    setIsGestureActive(false);
  }, [enableAdvancedTouch, currentTouches, recognizeGesture, triggerHaptic]);

  // Game-specific interaction helpers
  const createTouchAreaHandler = useCallback((
    onTap?: () => void,
    onDoubleTap?: () => void,
    onLongPress?: () => void,
    onSwipe?: (direction: 'up' | 'down' | 'left' | 'right') => void
  ) => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        e.preventDefault();
        handleTouchStart(e.nativeEvent);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        e.preventDefault();
        handleTouchEnd(e.nativeEvent);
        
        // Check gesture history for callbacks
        const lastGesture = gestureHistory[gestureHistory.length - 1];
        if (lastGesture) {
          switch (lastGesture.type) {
            case 'tap':
              onTap?.();
              break;
            case 'double-tap':
              onDoubleTap?.();
              break;
            case 'long-press':
              onLongPress?.();
              break;
            case 'swipe':
              onSwipe?.(lastGesture.direction!);
              break;
          }
        }
      },
      onTouchMove: (e: React.TouchEvent) => {
        e.preventDefault();
      }
    };
  }, [handleTouchStart, handleTouchEnd, gestureHistory]);

  // Optimized touch target helpers
  const getOptimalTouchTarget = useCallback((baseSize: number = 44) => {
    const { screenSize } = deviceCapabilities;
    
    let multiplier = 1;
    switch (screenSize) {
      case 'small':
        multiplier = 1.2;
        break;
      case 'large':
        multiplier = 0.9;
        break;
      default:
        multiplier = 1;
    }

    return Math.max(baseSize * multiplier, 44); // Minimum 44px (Apple HIG)
  }, [deviceCapabilities.screenSize]);

  const getTouchableStyle = useCallback((size?: number) => {
    const targetSize = getOptimalTouchTarget(size);
    
    return {
      minWidth: `${targetSize}px`,
      minHeight: `${targetSize}px`,
      touchAction: 'manipulation',
      userSelect: 'none' as const,
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none',
      cursor: 'pointer'
    };
  }, [getOptimalTouchTarget]);

  // Performance optimization for gaming
  const enableGameMode = useCallback(() => {
    // Prevent default touch behaviors that can interfere with gaming
    const preventDefaults = (e: Event) => {
      e.preventDefault();
    };

    // Disable context menu, text selection, etc.
    document.addEventListener('contextmenu', preventDefaults);
    document.addEventListener('selectstart', preventDefaults);
    document.addEventListener('dragstart', preventDefaults);

    // Add CSS for game optimization
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    document.body.style.webkitTouchCallout = 'none';

    return () => {
      document.removeEventListener('contextmenu', preventDefaults);
      document.removeEventListener('selectstart', preventDefaults);
      document.removeEventListener('dragstart', preventDefaults);
      
      document.body.style.touchAction = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.webkitTouchCallout = '';
    };
  }, []);

  // Battery optimization
  const optimizeForBattery = useCallback((lowPowerMode: boolean = false) => {
    if (lowPowerMode) {
      // Reduce haptic intensity
      return {
        enableHaptics: false,
        enableGestures: true,
        hapticIntensity: 0.5,
        enableAdvancedTouch: false
      };
    }
    return {
      enableHaptics,
      enableGestures,
      hapticIntensity,
      enableAdvancedTouch
    };
  }, [enableHaptics, enableGestures, hapticIntensity, enableAdvancedTouch]);

  return {
    // Device info
    deviceCapabilities,
    isGestureActive,
    currentTouches: Array.from(currentTouches.values()),
    gestureHistory: gestureHistory.slice(-10), // Last 10 gestures
    
    // Haptic functions
    triggerHaptic,
    
    // Touch handlers
    createTouchAreaHandler,
    
    // Utility functions
    getOptimalTouchTarget,
    getTouchableStyle,
    enableGameMode,
    optimizeForBattery,
    
    // Pre-defined haptic patterns for common game events
    hapticPatterns: {
      success: () => triggerHaptic({ type: 'success' }),
      error: () => triggerHaptic({ type: 'error' }),
      selection: () => triggerHaptic({ type: 'selection' }),
      achievement: () => triggerHaptic({ type: 'success', intensity: 1.5 }),
      collision: () => triggerHaptic({ type: 'impact' }),
      powerUp: () => triggerHaptic({ type: 'notification' }),
      levelComplete: () => triggerHaptic({ 
        type: 'success', 
        pattern: [50, 20, 50, 20, 100] 
      }),
      streak: (streakCount: number) => triggerHaptic({ 
        type: 'success', 
        intensity: Math.min(streakCount * 0.2, 1.5) 
      })
    }
  };
};

export default useEnhancedMobileGaming;
