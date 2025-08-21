/**
 * Emoji Accessibility Utilities
 * Provides comprehensive accessibility support for emoji rendering
 */

export interface EmojiAccessibilityConfig {
  includeAriaLabel: boolean;
  includeAriaHidden: boolean;
  includeRole: boolean;
  includeTitle: boolean;
  includeAltText: boolean;
  customDescription?: string;
}

export const DEFAULT_ACCESSIBILITY_CONFIG: EmojiAccessibilityConfig = {
  includeAriaLabel: true,
  includeAriaHidden: false,
  includeRole: true,
  includeTitle: true,
  includeAltText: true,
};

/**
 * Comprehensive emoji descriptions for screen readers
 */
export const EMOJI_DESCRIPTIONS: Record<string, string> = {
  // Navigation Animals - Detailed descriptions for jungle adventure
  "🦉": "Wise Owl - Your guide to the Home Tree dashboard where adventures begin",
  "🦜": "Smart Parrot - Your companion to the Book Jungle learning library",
  "🐵": "Playful Monkey - Your friend for Adventure Games and fun challenges",
  "🐘": "Majestic Elephant - Your mentor in the Trophy Grove for achievements",

  // Achievement Emojis
  "🏆": "Golden Trophy - Symbol of major achievement and success",
  "🌟": "Bright Star - Symbol of excellent performance and progress",
  "👑": "Royal Crown - Symbol of mastery and exceptional accomplishment",
  "💎": "Sparkling Diamond - Symbol of rare and precious achievement",
  "🥇": "Gold Medal - Symbol of first place and victory",
  "🎖️": "Military Medal - Symbol of honor and recognition",

  // Learning and Progress
  "🎯": "Target Bullseye - Symbol of focus, accuracy, and hitting goals",
  "🚀": "Rocket Ship - Symbol of rapid progress and achievement takeoff",
  "🧠": "Brain - Symbol of thinking, learning, and intelligence",
  "📚": "Stack of Books - Symbol of knowledge, learning, and education",
  "💡": "Light Bulb - Symbol of ideas, understanding, and eureka moments",
  "✨": "Sparkles - Symbol of magic, excitement, and special moments",

  // Emotions and Reactions
  "😊": "Smiling Face - Expression of happiness and satisfaction",
  "🤔": "Thinking Face - Expression of contemplation and problem-solving",
  "🎉": "Party Popper - Symbol of celebration and achievement",
  "🤗": "Hugging Face - Expression of warmth and encouragement",
  "😍": "Heart Eyes - Expression of love and admiration",
  "🥳": "Party Face - Expression of celebration and excitement",

  // Actions and Tools
  "👁️": "Eye - Symbol for showing, revealing, or focusing attention",
  "🔊": "Speaker - Symbol for audio, sound, and listening",
  "🔍": "Magnifying Glass - Symbol for searching and discovering",
  "✏️": "Pencil - Symbol for writing, creating, and learning",
  "📝": "Memo - Symbol for notes, tasks, and documentation",

  // Nature and Environment
  "🌿": "Herb Leaf - Symbol of nature, growth, and the jungle environment",
  "🍃": "Falling Leaves - Symbol of natural movement and jungle atmosphere",
  "🌱": "Seedling - Symbol of new growth, beginnings, and potential",
  "🌳": "Deciduous Tree - Symbol of strength, growth, and the jungle canopy",
  "🍀": "Four Leaf Clover - Symbol of luck and good fortune",

  // Weather and Time
  "☀️": "Sun - Symbol of brightness, energy, and positivity",
  "🌙": "Crescent Moon - Symbol of rest, calm, and nighttime",
  "⭐": "Star - Symbol of guidance, achievement, and brightness",
  "🌈": "Rainbow - Symbol of hope, beauty, and positive outcomes",

  // Games and Entertainment
  "🎮": "Video Game Controller - Symbol of gaming and interactive fun",
  "��": "Dice - Symbol of chance, games, and random selection",
  "🧩": "Puzzle Piece - Symbol of problem-solving and completing challenges",
  "🎪": "Circus Tent - Symbol of fun, entertainment, and spectacle",

  // Objects and Tools
  "📱": "Mobile Phone - Symbol of communication and technology",
  "💻": "Laptop Computer - Symbol of digital learning and technology",
  "🔑": "Key - Symbol of access, unlocking, and solutions",
  "🗝️": "Old Key - Symbol of discovering secrets and unlocking potential",
};

/**
 * Get appropriate ARIA label for an emoji
 */
export function getEmojiAriaLabel(
  emoji: string,
  context?: string,
  customDescription?: string,
): string {
  if (customDescription) {
    return customDescription;
  }

  const description = EMOJI_DESCRIPTIONS[emoji];
  if (description) {
    return context ? `${description} - ${context}` : description;
  }

  // Fallback to basic description
  return `Emoji: ${emoji}`;
}

/**
 * Get appropriate alt text for emoji images
 */
export function getEmojiAltText(
  emoji: string,
  context?: string,
  customDescription?: string,
): string {
  if (customDescription) {
    return customDescription;
  }

  const description = EMOJI_DESCRIPTIONS[emoji];
  if (description) {
    // For alt text, we want a shorter, more direct description
    const shortDescription = description.split(" - ")[0]; // Take the first part before the dash
    return context ? `${shortDescription} ${context}` : shortDescription;
  }

  return `Emoji ${emoji}`;
}

/**
 * Generate complete accessibility attributes for an emoji
 */
export function getEmojiAccessibilityAttributes(
  emoji: string,
  config: Partial<EmojiAccessibilityConfig> = {},
  context?: string,
): Record<string, string> {
  const finalConfig = { ...DEFAULT_ACCESSIBILITY_CONFIG, ...config };
  const attributes: Record<string, string> = {};

  if (finalConfig.includeRole) {
    attributes.role = "img";
  }

  if (finalConfig.includeAriaLabel) {
    attributes["aria-label"] = getEmojiAriaLabel(
      emoji,
      context,
      finalConfig.customDescription,
    );
  }

  if (finalConfig.includeAriaHidden) {
    attributes["aria-hidden"] = "true";
  }

  if (finalConfig.includeTitle) {
    attributes.title = getEmojiAriaLabel(
      emoji,
      context,
      finalConfig.customDescription,
    );
  }

  if (finalConfig.includeAltText) {
    attributes.alt = getEmojiAltText(
      emoji,
      context,
      finalConfig.customDescription,
    );
  }

  return attributes;
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: high)").matches;
}

/**
 * Check if user is using a screen reader
 */
export function isUsingScreenReader(): boolean {
  if (typeof window === "undefined") return false;

  // Check for common screen reader indicators
  const screenReaderIndicators = [
    "JAWS",
    "NVDA",
    "JAWSEYES",
    "WindowEyes",
    "COBRA",
    "ORCA",
    "VoiceOver",
    "TalkBack",
  ];

  const userAgent = navigator.userAgent;
  return screenReaderIndicators.some((indicator) =>
    userAgent.includes(indicator),
  );
}

/**
 * Get comprehensive accessibility settings
 */
export interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReader: boolean;
  preferredFontSize: "small" | "medium" | "large";
  announceEmojis: boolean;
}

export function getAccessibilitySettings(): AccessibilitySettings {
  return {
    reducedMotion: prefersReducedMotion(),
    highContrast: prefersHighContrast(),
    screenReader: isUsingScreenReader(),
    preferredFontSize: "medium", // Default, could be detected from user preferences
    announceEmojis: true, // Default to announcing emojis for better accessibility
  };
}

/**
 * Generate emoji HTML with full accessibility support
 */
export function generateAccessibleEmojiHtml(
  emoji: string,
  options: {
    className?: string;
    context?: string;
    config?: Partial<EmojiAccessibilityConfig>;
    size?: number | string;
    interactive?: boolean;
  } = {},
): string {
  const {
    className = "emoji-accessible",
    context,
    config = {},
    size,
    interactive = false,
  } = options;

  const attributes = getEmojiAccessibilityAttributes(emoji, config, context);
  const accessibilitySettings = getAccessibilitySettings();

  // Build the HTML attributes
  const htmlAttributes: string[] = [];

  Object.entries(attributes).forEach(([key, value]) => {
    htmlAttributes.push(`${key}="${value}"`);
  });

  if (className) {
    htmlAttributes.push(`class="${className}"`);
  }

  if (size) {
    const sizeValue = typeof size === "number" ? `${size}px` : size;
    htmlAttributes.push(`style="width: ${sizeValue}; height: ${sizeValue};"`);
  }

  if (interactive) {
    htmlAttributes.push('tabindex="0"');

    // Add keyboard event handling hint for screen readers
    if (accessibilitySettings.screenReader) {
      htmlAttributes.push('data-keyboard-accessible="true"');
    }
  }

  // Add reduced motion class if user prefers it
  if (accessibilitySettings.reducedMotion) {
    const currentClass = className || "";
    htmlAttributes.push(`class="${currentClass} reduced-motion"`);
  }

  return `<span ${htmlAttributes.join(" ")}>${emoji}</span>`;
}

/**
 * Navigation-specific accessibility utilities
 */
export const navigationAccessibility = {
  /**
   * Get accessibility attributes for jungle navigation items
   */
  getNavItemAttributes: (animal: string, label: string) => {
    const emoji =
      {
        owl: "🦉",
        parrot: "🦜",
        monkey: "🐵",
        elephant: "🐘",
      }[animal.toLowerCase()] || "🐾";

    return getEmojiAccessibilityAttributes(
      emoji,
      {
        includeAriaLabel: true,
        includeRole: true,
        includeTitle: true,
        customDescription: `Navigate to ${label} - ${EMOJI_DESCRIPTIONS[emoji]}`,
      },
      `Navigation button for ${label}`,
    );
  },

  /**
   * Announce navigation changes to screen readers
   */
  announceNavigation: (from: string, to: string) => {
    if (isUsingScreenReader()) {
      const announcement = `Navigated from ${from} to ${to}`;

      // Create a live region announcement
      const liveRegion = document.createElement("div");
      liveRegion.setAttribute("aria-live", "polite");
      liveRegion.setAttribute("aria-atomic", "true");
      liveRegion.setAttribute("class", "sr-only");
      liveRegion.textContent = announcement;

      document.body.appendChild(liveRegion);

      // Remove after announcement
      setTimeout(() => {
        document.body.removeChild(liveRegion);
      }, 1000);
    }
  },
};

/**
 * Achievement-specific accessibility utilities
 */
export const achievementAccessibility = {
  /**
   * Announce achievement unlocked to screen readers
   */
  announceAchievement: (achievementName: string, emoji: string) => {
    const description = getEmojiAriaLabel(emoji, "achievement unlocked");
    const announcement = `Achievement unlocked: ${achievementName}. ${description}`;

    // Create a live region announcement
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "assertive"); // More urgent than polite
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.setAttribute("class", "sr-only");
    liveRegion.textContent = announcement;

    document.body.appendChild(liveRegion);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(liveRegion);
    }, 2000);
  },

  /**
   * Get accessibility attributes for achievement emojis
   */
  getAchievementAttributes: (emoji: string, achievementName: string) => {
    return getEmojiAccessibilityAttributes(
      emoji,
      {
        includeAriaLabel: true,
        includeRole: true,
        includeTitle: true,
        customDescription: `${achievementName} achievement - ${EMOJI_DESCRIPTIONS[emoji] || "Achievement earned"}`,
      },
      `Achievement: ${achievementName}`,
    );
  },
};
