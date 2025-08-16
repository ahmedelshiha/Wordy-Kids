/**
 * Emoji Utility Library
 * Provides safe emoji management and validation to prevent corruption
 */

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
    "🌈",
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
 * Emoji constants for specific use cases
 */
export const EMOJI_CONSTANTS = {
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
} as const;

export type EmojiConstant =
  (typeof EMOJI_CONSTANTS)[keyof typeof EMOJI_CONSTANTS];
