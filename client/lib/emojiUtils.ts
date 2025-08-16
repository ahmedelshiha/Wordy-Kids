/**
 * Emoji utility functions for validation, sanitization, and fallbacks
 */

// Common emoji fallbacks by category
export const CATEGORY_EMOJI_FALLBACKS: Record<string, string> = {
  'food': '🍎',
  'animals': '🐱',
  'family': '👨‍👩‍👧‍👦',
  'colors': '🌈',
  'numbers': '🔢',
  'nature': '🌳',
  'school': '🎒',
  'transport': '🚗',
  'emotions': '😊',
  'weather': '☀️',
  'actions': '🏃',
  'hobbies': '🎨',
  'science': '🔬',
  'sports': '⚽',
  'house': '🏠',
  'at-the-clothes-shop': '👕',
  'default': '📚'
};

/**
 * Validates if a string contains a valid emoji
 */
export function isValidEmoji(emoji: string): boolean {
  if (!emoji || typeof emoji !== 'string') {
    return false;
  }

  // Remove whitespace and check if empty
  const trimmed = emoji.trim();
  if (!trimmed) {
    return false;
  }

  // Check for basic emoji pattern (Unicode emoji range)
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/u;
  
  return emojiRegex.test(trimmed);
}

/**
 * Sanitizes emoji input by removing invalid characters and extra whitespace
 */
export function sanitizeEmoji(emoji: string): string {
  if (!emoji || typeof emoji !== 'string') {
    return '';
  }

  // Remove leading/trailing whitespace
  let cleaned = emoji.trim();
  
  // Remove any non-emoji characters (basic cleanup)
  // This regex matches most common emoji ranges
  const emojiMatch = cleaned.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu);
  
  if (emojiMatch && emojiMatch.length > 0) {
    // Return the first valid emoji found
    return emojiMatch[0];
  }

  return '';
}

/**
 * Gets a fallback emoji for a given category
 */
export function getCategoryFallbackEmoji(category: string): string {
  return CATEGORY_EMOJI_FALLBACKS[category.toLowerCase()] || CATEGORY_EMOJI_FALLBACKS.default;
}

/**
 * Ensures a valid emoji is returned, with fallback support
 */
export function ensureValidEmoji(emoji: string, category?: string): string {
  // First try to sanitize the provided emoji
  const sanitized = sanitizeEmoji(emoji);
  if (sanitized && isValidEmoji(sanitized)) {
    return sanitized;
  }

  // If no valid emoji, return category fallback
  if (category) {
    return getCategoryFallbackEmoji(category);
  }

  // Final fallback
  return CATEGORY_EMOJI_FALLBACKS.default;
}

/**
 * Validates emoji input for forms with helpful error messages
 */
export function validateEmojiInput(emoji: string): {
  isValid: boolean;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
} {
  if (!emoji || !emoji.trim()) {
    return {
      isValid: false,
      message: 'Adding an emoji improves visual appeal',
      severity: 'info'
    };
  }

  const sanitized = sanitizeEmoji(emoji);
  if (!sanitized) {
    return {
      isValid: false,
      message: 'Please enter a valid emoji character',
      severity: 'warning'
    };
  }

  if (!isValidEmoji(sanitized)) {
    return {
      isValid: false,
      message: 'The provided emoji format is not supported',
      severity: 'error'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Suggests emojis based on word content
 */
export function suggestEmojisForWord(word: string, category?: string): string[] {
  const wordLower = word.toLowerCase();
  const suggestions: string[] = [];

  // Word-specific emoji suggestions
  const wordEmojiMap: Record<string, string[]> = {
    // Food
    'apple': ['🍎', '🍏'],
    'banana': ['🍌'],
    'orange': ['🍊'],
    'pizza': ['🍕'],
    'cake': ['🎂', '🧁'],
    'cookie': ['🍪'],
    'bread': ['🍞'],
    'milk': ['🥛'],
    'cheese': ['🧀'],
    
    // Animals
    'cat': ['🐱', '🐈'],
    'dog': ['🐶', '🐕'],
    'fish': ['🐟', '🐠'],
    'bird': ['🐦', '🦅'],
    'elephant': ['🐘'],
    'lion': ['🦁'],
    'tiger': ['🐅'],
    'bear': ['🐻'],
    'monkey': ['🐵'],
    
    // Transport
    'car': ['🚗', '🚙'],
    'bus': ['🚌'],
    'train': ['🚂', '🚆'],
    'plane': ['✈️', '🛩️'],
    'bike': ['🚲'],
    'boat': ['🚤', '⛵'],
    
    // Nature
    'tree': ['🌳', '🌲'],
    'flower': ['🌸', '🌺', '🌻'],
    'sun': ['☀️', '🌞'],
    'moon': ['🌙', '🌕'],
    'star': ['⭐', '🌟'],
    'rain': ['🌧️', '☔'],
    
    // Colors
    'red': ['🔴', '❤️'],
    'blue': ['🔵', '💙'],
    'green': ['🟢', '💚'],
    'yellow': ['🟡', '💛'],
    'purple': ['🟣', '💜'],
    'orange': ['🟠', '🧡'],
    
    // Numbers
    'one': ['1️⃣'],
    'two': ['2️⃣'],
    'three': ['3️⃣'],
    'four': ['4️⃣'],
    'five': ['5️⃣'],
    'six': ['6️⃣'],
    'seven': ['7️⃣'],
    'eight': ['8️⃣'],
    'nine': ['9️⃣'],
    'ten': ['🔟'],
    
    // Emotions
    'happy': ['😊', '😄', '😁'],
    'sad': ['😢', '😞'],
    'angry': ['😠', '😡'],
    'excited': ['🤩', '😆'],
    'love': ['❤️', '💕'],
    'surprised': ['😱', '😲'],
    
    // School
    'book': ['📚', '📖'],
    'pencil': ['✏️', '📝'],
    'school': ['🏫', '🎒'],
    'teacher': ['👩‍🏫', '👨‍🏫'],
    'student': ['👩‍🎓', '👨‍🎓'],
    
    // Sports
    'ball': ['⚽', '🏀', '🏈'],
    'swimming': ['🏊‍♀️', '🏊‍♂️'],
    'running': ['🏃‍♀️', '🏃‍♂️'],
    'football': ['🏈', '⚽'],
    'basketball': ['🏀'],
    'tennis': ['🎾'],
    
    // House
    'house': ['🏠', '🏡'],
    'door': ['🚪'],
    'window': ['🪟'],
    'bed': ['🛏️'],
    'chair': ['🪑'],
    'table': ['🪑'],
    
    // Actions
    'run': ['🏃‍♀️', '🏃‍♂️'],
    'walk': ['🚶‍♀️', '🚶‍♂️'],
    'jump': ['🤸‍♀️', '🤸‍♂️'],
    'dance': ['💃', '🕺'],
    'sing': ['🎤', '🎵'],
    'sleep': ['😴', '💤'],
    
    // Weather
    'sunny': ['☀️', '🌞'],
    'cloudy': ['☁️', '⛅'],
    'rainy': ['🌧️', '☔'],
    'snowy': ['❄️', '⛄'],
    'windy': ['💨', '🌪️'],
  };

  // Check for direct word matches
  if (wordEmojiMap[wordLower]) {
    suggestions.push(...wordEmojiMap[wordLower]);
  }

  // Check for partial matches
  Object.keys(wordEmojiMap).forEach(key => {
    if (wordLower.includes(key) || key.includes(wordLower)) {
      suggestions.push(...wordEmojiMap[key]);
    }
  });

  // Add category fallback if no specific suggestions
  if (suggestions.length === 0 && category) {
    suggestions.push(getCategoryFallbackEmoji(category));
  }

  // Remove duplicates and limit to 5 suggestions
  return [...new Set(suggestions)].slice(0, 5);
}
