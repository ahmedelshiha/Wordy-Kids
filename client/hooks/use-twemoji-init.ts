/**
 * React hook for initializing Twemoji and managing emoji rendering state
 */

import { useEffect, useState, useCallback } from "react";
import {
  initializeTwemojiSafe,
  isTwemojiSupported,
  preloadNavigationTwemojis,
} from "@/lib/twemojiService";
import { preloadCriticalEmojis } from "@/lib/emojiUtilsEnhanced";

export interface TwemojiState {
  isInitialized: boolean;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface TwemojiActions {
  reinitialize: () => Promise<void>;
  preloadEmojis: (emojis: string[]) => void;
}

export interface UseTwemojiInitReturn extends TwemojiState, TwemojiActions {}

/**
 * Hook for managing Twemoji initialization and state
 */
export function useTwemojiInit(): UseTwemojiInitReturn {
  const [state, setState] = useState<TwemojiState>({
    isInitialized: false,
    isSupported: false,
    isLoading: true,
    error: null,
  });

  const initialize = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if Twemoji is supported in this environment
      const supported = isTwemojiSupported();

      if (!supported) {
        setState({
          isInitialized: false,
          isSupported: false,
          isLoading: false,
          error: "Twemoji not supported in this environment",
        });
        return;
      }

      // Initialize Twemoji
      await initializeTwemojiSafe();

      // Preload critical navigation emojis
      preloadNavigationTwemojis();

      setState({
        isInitialized: true,
        isSupported: true,
        isLoading: false,
        error: null,
      });

      console.log("Twemoji initialized successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setState({
        isInitialized: false,
        isSupported: false,
        isLoading: false,
        error: errorMessage,
      });
      console.warn("Failed to initialize Twemoji:", error);
    }
  }, []);

  const reinitialize = useCallback(async () => {
    await initialize();
  }, [initialize]);

  const preloadEmojis = useCallback((emojis: string[]) => {
    emojis.forEach((emoji) => {
      const codePoint = Array.from(emoji)
        .map((char) => char.codePointAt(0)?.toString(16).toLowerCase())
        .filter(Boolean)
        .join("-");

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codePoint}.svg`;
      document.head.appendChild(link);
    });
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Preload critical emojis when initialized
  useEffect(() => {
    if (state.isInitialized) {
      const criticalEmojis = preloadCriticalEmojis();
      preloadEmojis(criticalEmojis);
    }
  }, [state.isInitialized, preloadEmojis]);

  // Handle online/offline status changes
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (navigator.onLine && !state.isInitialized && !state.isLoading) {
        initialize();
      }
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, [state.isInitialized, state.isLoading, initialize]);

  return {
    ...state,
    reinitialize,
    preloadEmojis,
  };
}

/**
 * Simplified hook that just returns whether Twemoji should be used
 */
export function useTwemojiEnabled(): boolean {
  const { isInitialized, isSupported } = useTwemojiInit();
  return isInitialized && isSupported;
}

/**
 * Hook for getting the appropriate emoji rendering method
 */
export function useEmojiRenderer() {
  const twemojiEnabled = useTwemojiEnabled();

  return useCallback(
    (
      emoji: string,
      options?: {
        size?: number;
        className?: string;
        ariaLabel?: string;
      },
    ) => {
      if (twemojiEnabled) {
        // Return Twemoji configuration
        return {
          type: "twemoji" as const,
          emoji,
          ...options,
        };
      }

      // Return fallback emoji configuration
      return {
        type: "emoji" as const,
        emoji,
        ...options,
      };
    },
    [twemojiEnabled],
  );
}

/**
 * Hook for preloading specific emoji sets
 */
export function useEmojiPreloader() {
  const { preloadEmojis, isInitialized } = useTwemojiInit();

  const preloadNavigationEmojis = useCallback(() => {
    if (isInitialized) {
      preloadEmojis(["🦉", "🦜", "🐵", "🐘"]);
    }
  }, [preloadEmojis, isInitialized]);

  const preloadAchievementEmojis = useCallback(() => {
    if (isInitialized) {
      preloadEmojis(["🏆", "🌟", "👑", "💎", "🥇"]);
    }
  }, [preloadEmojis, isInitialized]);

  const preloadGameEmojis = useCallback(() => {
    if (isInitialized) {
      preloadEmojis(["🎯", "🚀", "🧠", "📚", "🎮"]);
    }
  }, [preloadEmojis, isInitialized]);

  return {
    preloadNavigationEmojis,
    preloadAchievementEmojis,
    preloadGameEmojis,
    preloadCustomEmojis: preloadEmojis,
  };
}
