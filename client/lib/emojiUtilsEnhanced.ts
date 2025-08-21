/**
 * Enhanced Emoji Utility Library with Twemoji Support
 * Provides safe emoji management, validation, and Twemoji integration
 */

import { parseEmojiText, getTwemojiUrl } from "./twemojiService";

export interface EmojiCollection {
  [key: string]: string[];
}

/**
 * Validated emoji collections organized by category
 */
export const SAFE_EMOJIS: EmojiCollection = {
  // Learning & Achievement
  learning: [
    "🌟",
    "⭐",
    "✨",
    "🎯",
    "🚀",
    "💫",
    "🌈",
    "🎊",
    "🦋",
    "🌺",
    "🎪",
    "🦄",
    "🎵",
    "🎨",
    "🏰",
    "🏆",
    "🎖️",
    "🥇",
    "👑",
    "💎",
    "🔥",
    "⚡",
    "🌠",
  ],

  // Jungle Navigation Animals (Critical for consistent rendering)
  navigation: [
    "🦉", // Wise Owl
    "🦜", // Smart Parrot
    "🐵", // Playful Monkey
    "🐘", // Majestic Elephant
  ],

  // Emotions & Reactions
  emotions: [
    "😊",
    "😃",
    "😄",
    "🤗",
    "😍",
    "🥳",
    "🤩",
    "😎",
    "🤔",
    "🧐",
    "🤓",
    "😇",
    "🙂",
    "😌",
    "🥰",
    "😂",
  ],

  // Actions & Activities
  actions: [
    "👁️",
    "🔊",
    "🎧",
    "📚",
    "✏️",
    "📝",
    "🖊️",
    "📖",
    "🔍",
    "💡",
    "🧠",
    "💭",
    "📊",
    "📈",
    "🎲",
    "🎮",
  ],

  // Animals & Nature
  nature: [
    "🐸",
    "🦆",
    "🐱",
    "🐶",
    "🐰",
    "🦊",
    "🐼",
    "🐨",
    "🌸",
    "🌻",
    "🌹",
    "🌷",
    "🍀",
    "🌿",
    "🌱",
    "🌳",
  ],

  // Objects & Symbols
  objects: [
    "📱",
    "💻",
    "⌚",
    "🎁",
    "🎈",
    "🎀",
    "🔑",
    "💰",
    "🗝️",
    "🔮",
    "💝",
    "🎭",
    "🎪",
    "🎡",
    "🎢",
    "🎠",
  ],

  // Weather & Space
  weather: [
    "☀️",
    "🌙",
    "⭐",
    "🌟",
    "💫",
    "���",
    "☁️",
    "🌤️",
    "⛅",
    "🌦️",
    "⛈️",
    "🌩️",
    "❄️",
    "☃️",
    "🌊",
    "🔥",
  ],
};

/**
 * Enhanced emoji rendering configuration
 */
export interface EmojiRenderConfig {
  useTwemoji: boolean;
  fallbackToEmoji: boolean;
  size?: number;
  className?: string;
  lazyLoad?: boolean;
}

/**
 * Default configuration for emoji rendering
 */
export const DEFAULT_EMOJI_CONFIG: EmojiRenderConfig = {
  useTwemoji: true,
  fallbackToEmoji: true,
  size: 24,
  className: "emoji-inline",
  lazyLoad: true,
};

/**
 * Validates if a string contains valid emoji characters
 */
export function isValidEmoji(emoji: string): boolean {
  if (!emoji || typeof emoji !== "string") return false;

  // Check for replacement characters (corrupted emojis)
  if (emoji.includes("�") || emoji.includes("\uFFFD")) return false;

  // Basic emoji validation using Unicode ranges
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;

  return emojiRegex.test(emoji) && emoji.length <= 4; // Prevent overly long strings
}

/**
 * Filters out corrupted emojis from an array
 */
export function filterValidEmojis(emojis: string[]): string[] {
  return emojis.filter(isValidEmoji);
}

/**
 * Gets a random emoji from a specific category
 */
export function getRandomEmoji(
  category: keyof typeof SAFE_EMOJIS = "learning",
): string {
  const categoryEmojis = SAFE_EMOJIS[category];
  if (!categoryEmojis || categoryEmojis.length === 0) {
    console.warn(
      `No emojis found for category: ${category}, falling back to learning`,
    );
    return SAFE_EMOJIS.learning[0]; // Fallback to first learning emoji
  }

  return categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)];
}

/**
 * Gets multiple random emojis from a category
 */
export function getRandomEmojis(
  count: number,
  category: keyof typeof SAFE_EMOJIS = "learning",
): string[] {
  const result: string[] = [];
  const categoryEmojis = SAFE_EMOJIS[category];

  if (!categoryEmojis || categoryEmojis.length === 0) {
    console.warn(`No emojis found for category: ${category}`);
    return [];
  }

  for (let i = 0; i < count; i++) {
    result.push(
      categoryEmojis[Math.floor(Math.random() * categoryEmojis.length)],
    );
  }

  return result;
}

/**
 * Safely replaces corrupted emojis with valid alternatives
 */
export function sanitizeEmoji(
  emoji: string,
  fallbackCategory: keyof typeof SAFE_EMOJIS = "learning",
): string {
  if (isValidEmoji(emoji)) {
    return emoji;
  }

  console.warn(
    `Corrupted emoji detected: ${emoji}, replacing with safe alternative`,
  );
  return getRandomEmoji(fallbackCategory);
}

/**
 * Validates and sanitizes an array of emojis
 */
export function sanitizeEmojiArray(
  emojis: string[],
  fallbackCategory: keyof typeof SAFE_EMOJIS = "learning",
): string[] {
  return emojis.map((emoji) => sanitizeEmoji(emoji, fallbackCategory));
}

/**
 * Development utility to check for corrupted emojis in text
 */
export function detectCorruptedEmojis(text: string): {
  hasCorrupted: boolean;
  corruptedPositions: number[];
} {
  const corruptedPositions: number[] = [];

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "�" || char === "\uFFFD") {
      corruptedPositions.push(i);
    }
  }

  return {
    hasCorrupted: corruptedPositions.length > 0,
    corruptedPositions,
  };
}

/**
 * Enhanced emoji rendering with Twemoji support
 */
export async function renderEmojiSafe(
  emoji: string,
  config: Partial<EmojiRenderConfig> = {},
): Promise<string> {
  const finalConfig = { ...DEFAULT_EMOJI_CONFIG, ...config };

  // Validate and sanitize emoji first
  const safeEmoji = sanitizeEmoji(emoji);

  if (finalConfig.useTwemoji) {
    try {
      // Try to render with Twemoji
      const twemojiHtml = await parseEmojiText(safeEmoji);
      if (twemojiHtml !== safeEmoji) {
        return twemojiHtml;
      }
    } catch (error) {
      console.warn("Failed to render Twemoji, falling back to emoji:", error);
    }
  }

  // Fallback to regular emoji
  if (finalConfig.fallbackToEmoji) {
    return `<span class="${finalConfig.className}" role="img" aria-label="Emoji: ${safeEmoji}">${safeEmoji}</span>`;
  }

  return safeEmoji;
}

/**
 * Get Twemoji URL for an emoji with fallback
 */
export function getEmojiImageUrl(emoji: string): string {
  try {
    return getTwemojiUrl(emoji);
  } catch (error) {
    console.warn("Failed to get Twemoji URL:", error);
    return ""; // Return empty string as fallback
  }
}

/**
 * Enhanced emoji constants for specific use cases
 */
export const ENHANCED_EMOJI_CONSTANTS = {
  // Default fallbacks
  DEFAULT_SUCCESS: "🎉",
  DEFAULT_ERROR: "❌",
  DEFAULT_INFO: "ℹ️",
  DEFAULT_WARNING: "⚠️",

  // Learning states
  THINKING: "🤔",
  REMEMBERED: "😊",
  FORGOT: "🤔",
  HINT: "💡",
  SHOW: "👁️",
  LISTEN: "🔊",

  // Progress indicators
  PROGRESS_LOW: "🌱",
  PROGRESS_MEDIUM: "🌿",
  PROGRESS_HIGH: "🌟",
  PROGRESS_COMPLETE: "🏆",

  // AI indicators
  AI_ACTIVE: "🤖",
  AI_THINKING: "🧠",
  AI_CONFIDENT: "⚡",
  AI_HELPING: "✨",

  // Navigation Animals (Critical for Jungle Adventure)
  NAV_OWL: "🦉",
  NAV_PARROT: "🦜",
  NAV_MONKEY: "🐵",
  NAV_ELEPHANT: "🐘",

  // Achievement types
  ACHIEVEMENT_TROPHY: "🏆",
  ACHIEVEMENT_STAR: "🌟",
  ACHIEVEMENT_CROWN: "👑",
  ACHIEVEMENT_DIAMOND: "💎",
  ACHIEVEMENT_MEDAL: "🥇",

  // Game types
  GAME_TARGET: "🎯",
  GAME_ROCKET: "🚀",
  GAME_BRAIN: "🧠",
  GAME_BOOK: "📚",
  GAME_PUZZLE: "🧩",
} as const;

export type EnhancedEmojiConstant =
  (typeof ENHANCED_EMOJI_CONSTANTS)[keyof typeof ENHANCED_EMOJI_CONSTANTS];

/**
 * Get navigation emojis specifically for preloading
 */
export function getNavigationEmojis(): string[] {
  return [
    ENHANCED_EMOJI_CONSTANTS.NAV_OWL,
    ENHANCED_EMOJI_CONSTANTS.NAV_PARROT,
    ENHANCED_EMOJI_CONSTANTS.NAV_MONKEY,
    ENHANCED_EMOJI_CONSTANTS.NAV_ELEPHANT,
  ];
}

/**
 * Get achievement emojis for preloading
 */
export function getAchievementEmojis(): string[] {
  return [
    ENHANCED_EMOJI_CONSTANTS.ACHIEVEMENT_TROPHY,
    ENHANCED_EMOJI_CONSTANTS.ACHIEVEMENT_STAR,
    ENHANCED_EMOJI_CONSTANTS.ACHIEVEMENT_CROWN,
    ENHANCED_EMOJI_CONSTANTS.ACHIEVEMENT_DIAMOND,
    ENHANCED_EMOJI_CONSTANTS.ACHIEVEMENT_MEDAL,
  ];
}

/**
 * Get game emojis for preloading
 */
export function getGameEmojis(): string[] {
  return [
    ENHANCED_EMOJI_CONSTANTS.GAME_TARGET,
    ENHANCED_EMOJI_CONSTANTS.GAME_ROCKET,
    ENHANCED_EMOJI_CONSTANTS.GAME_BRAIN,
    ENHANCED_EMOJI_CONSTANTS.GAME_BOOK,
    ENHANCED_EMOJI_CONSTANTS.GAME_PUZZLE,
  ];
}

/**
 * Preload critical emojis for the jungle adventure app
 */
export function preloadCriticalEmojis(): string[] {
  return [
    ...getNavigationEmojis(),
    ...getAchievementEmojis().slice(0, 3), // Preload top 3 achievement emojis
    ...getGameEmojis().slice(0, 3), // Preload top 3 game emojis
  ];
}
