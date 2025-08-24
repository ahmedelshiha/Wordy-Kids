/**
 * PHASE 3: JavaScript Unicode Handling
 * Utilities for proper emoji and Unicode handling throughout the application
 */

// Standard emoji constants to ensure consistency
export const EMOJI_CONSTANTS = {
  // Basic Expressions
  HAPPY: "\u{1F600}", // 😀
  PARTY: "\u{1F389}", // 🎉
  HEART: "\u2764\uFE0F", // ❤️
  ROCKET: "\u{1F680}", // 🚀
  STAR: "\u2B50", // ⭐
  SPARKLES: "\u2728", // ✨
  FIRE: "\u{1F525}", // 🔥
  THUMBS_UP: "\u{1F44D}", // 👍

  // Educational & Learning
  BOOKS: "\u{1F4DA}", // 📚
  TARGET: "\u{1F3AF}", // 🎯
  LIGHT_BULB: "\u{1F4A1}", // 💡
  TROPHY: "\u{1F3C6}", // 🏆
  MEDAL: "\u{1F3C5}", // 🏅
  GAME_CONTROLLER: "\u{1F3AE}", // 🎮
  BRAIN: "\u{1F9E0}", // 🧠

  // Nature & Animals
  TREE: "\u{1F333}", // 🌳
  LEAF: "\u{1F343}", // 🍃
  BUTTERFLY: "\u{1F98B}", // 🦋
  RAINBOW: "\u{1F308}", // 🌈
  SUN: "\u2600\uFE0F", // ☀️

  // Feedback & Encouragement
  CLAP: "\u{1F44F}", // 👏
  PEACE: "\u270C\uFE0F", // ✌️
  MUSCLE: "\u{1F4AA}", // 💪
  SMILE: "\u{1F60A}", // 😊
  WINK: "\u{1F609}", // 😉

  // Activity & Adventure
  COMPASS: "\u{1F9ED}", // 🧭
  MOUNTAIN: "\u26F0\uFE0F", // ⛰️
  TENT: "\u26FA", // ⛺
  BACKPACK: "\u{1F392}", // 🎒

  // Complex Emojis (with ZWJ sequences)
  TECHNOLOGIST: "\u{1F468}\u200D\u{1F4BB}", // 👨‍💻
  ARTIST: "\u{1F469}\u200D\u{1F3A8}", // 👩‍🎨
  PRIDE_FLAG: "\u{1F3F3}\uFE0F\u200D\u{1F308}", // 🏳️‍🌈

  // Skin tone variants (examples)
  WAVE_LIGHT: "\u{1F44B}\u{1F3FB}", // 👋🏻
  WAVE_MEDIUM: "\u{1F44B}\u{1F3FD}", // 👋🏽
  WAVE_DARK: "\u{1F44B}\u{1F3FF}", // 👋🏿
} as const;

/**
 * Safely normalize Unicode strings for consistent emoji representation
 * @param text - Text that may contain emojis
 * @returns Normalized text with consistent Unicode composition
 */
export function safeEmojiString(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    // Normalize Unicode composition (NFC) for consistent emoji representation
    return text.normalize("NFC");
  } catch (error) {
    console.warn("Unicode normalization failed:", error);
    return text;
  }
}

/**
 * Check if a string contains valid emojis
 * @param text - Text to check
 * @returns boolean indicating if the text contains emojis
 */
export function containsEmoji(text: string): boolean {
  if (!text || typeof text !== "string") {
    return false;
  }

  // Unicode emoji pattern (basic check)
  const emojiPattern =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return emojiPattern.test(text);
}

/**
 * Count the number of emoji characters in a string
 * @param text - Text to analyze
 * @returns Number of emoji characters found
 */
export function countEmojis(text: string): number {
  if (!text || typeof text !== "string") {
    return 0;
  }

  // Use Intl.Segmenter if available (modern browsers)
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = [...segmenter.segment(text)];
    return segments.filter((segment) => containsEmoji(segment.segment)).length;
  }

  // Fallback for older browsers
  const emojiPattern =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiPattern);
  return matches ? matches.length : 0;
}

/**
 * Extract all emojis from a text string
 * @param text - Text to extract emojis from
 * @returns Array of emoji characters found
 */
export function extractEmojis(text: string): string[] {
  if (!text || typeof text !== "string") {
    return [];
  }

  const emojiPattern =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  const matches = text.match(emojiPattern);
  return matches ? matches.map((emoji) => safeEmojiString(emoji)) : [];
}

/**
 * Remove emojis from a text string
 * @param text - Text to clean
 * @returns Text with emojis removed
 */
export function removeEmojis(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const emojiPattern =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
  return text.replace(emojiPattern, "").trim();
}

/**
 * Ensure a string is safe for storage and transmission
 * @param text - Text to sanitize
 * @returns Sanitized text with proper encoding
 */
export function sanitizeForStorage(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    // Normalize and ensure proper encoding
    const normalized = safeEmojiString(text);

    // Replace any problematic characters that might cause encoding issues
    return normalized.replace(/\uFFFD/g, ""); // Remove replacement characters
  } catch (error) {
    console.warn("Text sanitization failed:", error);
    return text;
  }
}

/**
 * Get a random emoji from the educational collection
 * @returns Random educational emoji
 */
export function getRandomEducationalEmoji(): string {
  const educationalEmojis = [
    EMOJI_CONSTANTS.BOOKS,
    EMOJI_CONSTANTS.TARGET,
    EMOJI_CONSTANTS.LIGHT_BULB,
    EMOJI_CONSTANTS.TROPHY,
    EMOJI_CONSTANTS.MEDAL,
    EMOJI_CONSTANTS.GAME_CONTROLLER,
    EMOJI_CONSTANTS.BRAIN,
    EMOJI_CONSTANTS.SPARKLES,
    EMOJI_CONSTANTS.STAR,
    EMOJI_CONSTANTS.ROCKET,
  ];

  const randomIndex = Math.floor(Math.random() * educationalEmojis.length);
  return educationalEmojis[randomIndex];
}

/**
 * Get emoji by category for consistent usage
 * @param category - Category name
 * @returns Appropriate emoji for the category
 */
export function getEmojiForCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    animals: EMOJI_CONSTANTS.BUTTERFLY,
    nature: EMOJI_CONSTANTS.TREE,
    learning: EMOJI_CONSTANTS.BOOKS,
    achievement: EMOJI_CONSTANTS.TROPHY,
    activity: EMOJI_CONSTANTS.TARGET,
    technology: EMOJI_CONSTANTS.TECHNOLOGIST,
    art: EMOJI_CONSTANTS.ARTIST,
    celebration: EMOJI_CONSTANTS.PARTY,
    encouragement: EMOJI_CONSTANTS.THUMBS_UP,
    default: EMOJI_CONSTANTS.SPARKLES,
  };

  return categoryMap[category.toLowerCase()] || categoryMap.default;
}

/**
 * Format text with proper emoji spacing for display
 * @param text - Text to format
 * @returns Formatted text with proper emoji spacing
 */
export function formatEmojiText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Add proper spacing around emojis for better readability
  const emojiPattern =
    /([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/gu;

  return safeEmojiString(text)
    .replace(emojiPattern, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Validate emoji input for form fields
 * @param input - User input to validate
 * @returns Object with validation result and cleaned input
 */
export function validateEmojiInput(input: string): {
  isValid: boolean;
  cleaned: string;
  errors: string[];
} {
  const errors: string[] = [];

  if (!input || typeof input !== "string") {
    errors.push("Input is required");
    return { isValid: false, cleaned: "", errors };
  }

  try {
    const cleaned = sanitizeForStorage(input);

    // Check for replacement characters (indicates corruption)
    if (cleaned.includes("\uFFFD")) {
      errors.push("Input contains corrupted characters");
    }

    // Check length limits
    if (cleaned.length > 500) {
      errors.push("Input is too long (max 500 characters)");
    }

    return {
      isValid: errors.length === 0,
      cleaned: cleaned,
      errors: errors,
    };
  } catch (error) {
    errors.push("Input contains invalid characters");
    return { isValid: false, cleaned: input, errors };
  }
}

/**
 * Convert emoji to HTML-safe entities for display
 * @param text - Text with emojis
 * @returns HTML-safe text
 */
export function emojiToHtmlEntities(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text.replace(
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu,
    (match) => {
      const codePoint = match.codePointAt(0);
      return codePoint ? `&#${codePoint};` : match;
    },
  );
}

/**
 * Form handling utilities for emoji input
 */
export const emojiFormUtils = {
  /**
   * Handle emoji input in form fields
   */
  handleEmojiInput: (
    value: string,
    callback: (cleanedValue: string) => void,
  ) => {
    const validation = validateEmojiInput(value);
    if (validation.isValid) {
      callback(validation.cleaned);
    } else {
      console.warn("Emoji input validation failed:", validation.errors);
      callback(validation.cleaned); // Still return cleaned version
    }
  },

  /**
   * Prepare emoji data for API submission
   */
  prepareForSubmission: (data: Record<string, any>): Record<string, any> => {
    const prepared: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        prepared[key] = sanitizeForStorage(value);
      } else {
        prepared[key] = value;
      }
    }

    return prepared;
  },
};
