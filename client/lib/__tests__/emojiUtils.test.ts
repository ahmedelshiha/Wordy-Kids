/**
 * PHASE 4: Comprehensive Emoji Testing
 * Tests for emoji handling, encoding, and validation functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  EMOJI_CONSTANTS,
  safeEmojiString,
  containsEmoji,
  countEmojis,
  extractEmojis,
  removeEmojis,
  sanitizeForStorage,
  getRandomEducationalEmoji,
  getEmojiForCategory,
  formatEmojiText,
  validateEmojiInput,
  emojiToHtmlEntities,
  emojiFormUtils
} from '../emojiUtils';

// Test data with diverse emojis
const TEST_EMOJIS = {
  basic: '😀 🎉 ❤️ 🚀 ⭐ ✨',
  complex: '👨‍💻 👩‍🎨 🏳️‍🌈 👨‍👩‍👧‍👦',
  recent: '🫠 🫡 🫥 🫶 🫶🏻 🫶🏽 🫶🏿',
  skinTones: '👋🏻 👋🏽 👋🏿 👍🏻 👍🏽 👍🏿',
  educational: '📚 🎯 🌟 ✨ 🎮 💡 🏆 🎖️',
  mixed: 'Hello 👋 World 🌍! Learning is fun 📚✨',
  corrupted: 'Bad emoji: \uFFFD replacement char',
  empty: '',
  text: 'Just regular text without emojis',
  longEmoji: '🎉'.repeat(100),
  combined: '👨‍💻📚🎯✨🌟🎮💡🏆',
};

describe('EMOJI_CONSTANTS', () => {
  it('should contain all expected educational emojis', () => {
    expect(EMOJI_CONSTANTS.BOOKS).toBe('📚');
    expect(EMOJI_CONSTANTS.TARGET).toBe('🎯');
    expect(EMOJI_CONSTANTS.LIGHT_BULB).toBe('💡');
    expect(EMOJI_CONSTANTS.TROPHY).toBe('🏆');
    expect(EMOJI_CONSTANTS.SPARKLES).toBe('✨');
    expect(EMOJI_CONSTANTS.ROCKET).toBe('🚀');
    expect(EMOJI_CONSTANTS.STAR).toBe('⭐');
  });

  it('should contain complex emojis with ZWJ sequences', () => {
    expect(EMOJI_CONSTANTS.TECHNOLOGIST).toBe('👨‍💻');
    expect(EMOJI_CONSTANTS.ARTIST).toBe('👩‍🎨');
    expect(EMOJI_CONSTANTS.PRIDE_FLAG).toBe('🏳️‍🌈');
  });

  it('should contain skin tone variants', () => {
    expect(EMOJI_CONSTANTS.WAVE_LIGHT).toBe('👋🏻');
    expect(EMOJI_CONSTANTS.WAVE_MEDIUM).toBe('👋🏽');
    expect(EMOJI_CONSTANTS.WAVE_DARK).toBe('👋🏿');
  });
});

describe('safeEmojiString', () => {
  it('should normalize Unicode strings correctly', () => {
    const result = safeEmojiString(TEST_EMOJIS.basic);
    expect(result).toBe(TEST_EMOJIS.basic);
    expect(result).toMatch(/😀/);
  });

  it('should handle empty or null input', () => {
    expect(safeEmojiString('')).toBe('');
    expect(safeEmojiString(null as any)).toBe('');
    expect(safeEmojiString(undefined as any)).toBe('');
  });

  it('should handle complex emojis with ZWJ sequences', () => {
    const result = safeEmojiString(TEST_EMOJIS.complex);
    expect(result).toContain('👨‍💻');
    expect(result).toContain('👩‍🎨');
    expect(result).toContain('🏳️‍🌈');
  });

  it('should preserve skin tone modifiers', () => {
    const result = safeEmojiString(TEST_EMOJIS.skinTones);
    expect(result).toContain('👋🏻');
    expect(result).toContain('👋🏽');
    expect(result).toContain('👋🏿');
  });
});

describe('containsEmoji', () => {
  it('should detect emojis in text', () => {
    expect(containsEmoji(TEST_EMOJIS.basic)).toBe(true);
    expect(containsEmoji(TEST_EMOJIS.mixed)).toBe(true);
    expect(containsEmoji(TEST_EMOJIS.educational)).toBe(true);
  });

  it('should return false for text without emojis', () => {
    expect(containsEmoji(TEST_EMOJIS.text)).toBe(false);
    expect(containsEmoji('Hello world')).toBe(false);
    expect(containsEmoji('123 ABC')).toBe(false);
  });

  it('should handle empty input', () => {
    expect(containsEmoji('')).toBe(false);
    expect(containsEmoji(null as any)).toBe(false);
    expect(containsEmoji(undefined as any)).toBe(false);
  });

  it('should detect complex emojis', () => {
    expect(containsEmoji(TEST_EMOJIS.complex)).toBe(true);
    expect(containsEmoji('👨‍💻')).toBe(true);
    expect(containsEmoji('🏳️‍🌈')).toBe(true);
  });
});

describe('countEmojis', () => {
  it('should count basic emojis correctly', () => {
    expect(countEmojis('😀')).toBe(1);
    expect(countEmojis('😀🎉')).toBe(2);
    expect(countEmojis('😀🎉❤️')).toBe(3);
  });

  it('should handle text mixed with emojis', () => {
    expect(countEmojis('Hello 😀 world 🎉!')).toBe(2);
    expect(countEmojis(TEST_EMOJIS.mixed)).toBeGreaterThan(0);
  });

  it('should return 0 for text without emojis', () => {
    expect(countEmojis(TEST_EMOJIS.text)).toBe(0);
    expect(countEmojis('Hello world')).toBe(0);
  });

  it('should handle empty input', () => {
    expect(countEmojis('')).toBe(0);
    expect(countEmojis(null as any)).toBe(0);
    expect(countEmojis(undefined as any)).toBe(0);
  });
});

describe('extractEmojis', () => {
  it('should extract emojis from text', () => {
    const result = extractEmojis('Hello 😀 world 🎉!');
    expect(result).toHaveLength(2);
    expect(result).toContain('😀');
    expect(result).toContain('🎉');
  });

  it('should return empty array for text without emojis', () => {
    expect(extractEmojis(TEST_EMOJIS.text)).toEqual([]);
    expect(extractEmojis('Hello world')).toEqual([]);
  });

  it('should handle complex emojis', () => {
    const result = extractEmojis('Coding 👨‍💻 and art 👩‍🎨');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle empty input', () => {
    expect(extractEmojis('')).toEqual([]);
    expect(extractEmojis(null as any)).toEqual([]);
    expect(extractEmojis(undefined as any)).toEqual([]);
  });
});

describe('removeEmojis', () => {
  it('should remove emojis from text', () => {
    const result = removeEmojis('Hello 😀 world 🎉!');
    expect(result).toBe('Hello  world !');
    expect(result).not.toContain('😀');
    expect(result).not.toContain('🎉');
  });

  it('should return original text if no emojis', () => {
    expect(removeEmojis(TEST_EMOJIS.text)).toBe(TEST_EMOJIS.text);
  });

  it('should handle text with only emojis', () => {
    const result = removeEmojis('😀🎉❤️');
    expect(result).toBe('');
  });

  it('should handle empty input', () => {
    expect(removeEmojis('')).toBe('');
    expect(removeEmojis(null as any)).toBe('');
    expect(removeEmojis(undefined as any)).toBe('');
  });
});

describe('sanitizeForStorage', () => {
  it('should sanitize text for safe storage', () => {
    const result = sanitizeForStorage(TEST_EMOJIS.mixed);
    expect(result).toBeTruthy();
    expect(result).not.toContain('\uFFFD');
  });

  it('should remove replacement characters', () => {
    const result = sanitizeForStorage(TEST_EMOJIS.corrupted);
    expect(result).not.toContain('\uFFFD');
  });

  it('should handle empty input', () => {
    expect(sanitizeForStorage('')).toBe('');
    expect(sanitizeForStorage(null as any)).toBe('');
    expect(sanitizeForStorage(undefined as any)).toBe('');
  });

  it('should preserve valid emojis', () => {
    const input = 'Hello 😀 world!';
    const result = sanitizeForStorage(input);
    expect(result).toContain('😀');
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });
});

describe('getRandomEducationalEmoji', () => {
  it('should return a valid educational emoji', () => {
    const emoji = getRandomEducationalEmoji();
    expect(emoji).toBeTruthy();
    expect(typeof emoji).toBe('string');
    expect(containsEmoji(emoji)).toBe(true);
  });

  it('should return different emojis on multiple calls', () => {
    const emojis = new Set();
    for (let i = 0; i < 20; i++) {
      emojis.add(getRandomEducationalEmoji());
    }
    // Should have some variety (not all the same)
    expect(emojis.size).toBeGreaterThan(1);
  });
});

describe('getEmojiForCategory', () => {
  it('should return appropriate emojis for categories', () => {
    expect(getEmojiForCategory('animals')).toBe(EMOJI_CONSTANTS.BUTTERFLY);
    expect(getEmojiForCategory('learning')).toBe(EMOJI_CONSTANTS.BOOKS);
    expect(getEmojiForCategory('achievement')).toBe(EMOJI_CONSTANTS.TROPHY);
    expect(getEmojiForCategory('technology')).toBe(EMOJI_CONSTANTS.TECHNOLOGIST);
  });

  it('should handle case insensitive input', () => {
    expect(getEmojiForCategory('ANIMALS')).toBe(EMOJI_CONSTANTS.BUTTERFLY);
    expect(getEmojiForCategory('Learning')).toBe(EMOJI_CONSTANTS.BOOKS);
  });

  it('should return default emoji for unknown categories', () => {
    expect(getEmojiForCategory('unknown')).toBe(EMOJI_CONSTANTS.SPARKLES);
    expect(getEmojiForCategory('')).toBe(EMOJI_CONSTANTS.SPARKLES);
  });
});

describe('formatEmojiText', () => {
  it('should add proper spacing around emojis', () => {
    const result = formatEmojiText('Hello😀world🎉!');
    expect(result).toContain(' 😀 ');
    expect(result).toContain(' 🎉 ');
    expect(result).not.toContain('😀world');
  });

  it('should handle text without emojis', () => {
    const input = 'Hello world';
    expect(formatEmojiText(input)).toBe(input);
  });

  it('should handle empty input', () => {
    expect(formatEmojiText('')).toBe('');
    expect(formatEmojiText(null as any)).toBe('');
  });

  it('should normalize multiple spaces', () => {
    const result = formatEmojiText('Hello  😀  world');
    expect(result).not.toContain('  ');
    expect(result).toMatch(/\s😀\s/);
  });
});

describe('validateEmojiInput', () => {
  it('should validate correct emoji input', () => {
    const result = validateEmojiInput('Hello 😀 world!');
    expect(result.isValid).toBe(true);
    expect(result.cleaned).toBe('Hello 😀 world!');
    expect(result.errors).toHaveLength(0);
  });

  it('should detect corrupted input', () => {
    const result = validateEmojiInput('Bad emoji: \uFFFD');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Input contains corrupted characters');
  });

  it('should handle empty input', () => {
    const result = validateEmojiInput('');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Input is required');
  });

  it('should detect input that is too long', () => {
    const longInput = 'a'.repeat(501);
    const result = validateEmojiInput(longInput);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Input is too long (max 500 characters)');
  });

  it('should handle complex emojis correctly', () => {
    const result = validateEmojiInput(TEST_EMOJIS.complex);
    expect(result.isValid).toBe(true);
    expect(result.cleaned).toContain('👨‍💻');
  });
});

describe('emojiToHtmlEntities', () => {
  it('should convert emojis to HTML entities', () => {
    const result = emojiToHtmlEntities('Hello 😀 world!');
    expect(result).toContain('&#128512;'); // 😀 as HTML entity
    expect(result).toContain('Hello');
    expect(result).toContain('world');
  });

  it('should handle text without emojis', () => {
    const input = 'Hello world';
    expect(emojiToHtmlEntities(input)).toBe(input);
  });

  it('should handle empty input', () => {
    expect(emojiToHtmlEntities('')).toBe('');
    expect(emojiToHtmlEntities(null as any)).toBe('');
  });
});

describe('emojiFormUtils', () => {
  describe('handleEmojiInput', () => {
    it('should handle valid emoji input', () => {
      let result = '';
      emojiFormUtils.handleEmojiInput('Hello 😀!', (value) => {
        result = value;
      });
      expect(result).toBe('Hello 😀!');
    });

    it('should clean invalid input', () => {
      let result = '';
      emojiFormUtils.handleEmojiInput('Bad \uFFFD emoji', (value) => {
        result = value;
      });
      expect(result).not.toContain('\uFFFD');
    });
  });

  describe('prepareForSubmission', () => {
    it('should sanitize string values in data object', () => {
      const data = {
        name: 'Hello 😀 world!',
        description: 'Learning is fun 📚',
        number: 42,
        boolean: true
      };

      const result = emojiFormUtils.prepareForSubmission(data);
      expect(result.name).toBe('Hello 😀 world!');
      expect(result.description).toBe('Learning is fun 📚');
      expect(result.number).toBe(42);
      expect(result.boolean).toBe(true);
    });

    it('should handle data with corrupted strings', () => {
      const data = {
        corrupted: 'Bad \uFFFD emoji',
        normal: 'Good text'
      };

      const result = emojiFormUtils.prepareForSubmission(data);
      expect(result.corrupted).not.toContain('\uFFFD');
      expect(result.normal).toBe('Good text');
    });
  });
});

// Database roundtrip simulation tests
describe('Database Storage Simulation', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
  });

  afterEach(() => {
    mockStorage = {};
  });

  const simulateStorageRoundtrip = (data: string): string => {
    // Simulate storing and retrieving from database
    const sanitized = sanitizeForStorage(data);
    const key = 'test-' + Date.now();
    mockStorage[key] = JSON.stringify({ content: sanitized });
    
    // Simulate retrieval
    const retrieved = JSON.parse(mockStorage[key]);
    return retrieved.content;
  };

  it('should preserve basic emojis through storage roundtrip', () => {
    const original = TEST_EMOJIS.basic;
    const retrieved = simulateStorageRoundtrip(original);
    expect(retrieved).toBe(original);
  });

  it('should preserve complex emojis through storage roundtrip', () => {
    const original = TEST_EMOJIS.complex;
    const retrieved = simulateStorageRoundtrip(original);
    expect(retrieved).toContain('👨‍💻');
    expect(retrieved).toContain('👩‍🎨');
  });

  it('should preserve skin tone variants through storage roundtrip', () => {
    const original = TEST_EMOJIS.skinTones;
    const retrieved = simulateStorageRoundtrip(original);
    expect(retrieved).toContain('👋🏻');
    expect(retrieved).toContain('👋🏽');
    expect(retrieved).toContain('👋🏿');
  });

  it('should handle mixed content through storage roundtrip', () => {
    const original = TEST_EMOJIS.mixed;
    const retrieved = simulateStorageRoundtrip(original);
    expect(retrieved).toContain('Hello');
    expect(retrieved).toContain('👋');
    expect(retrieved).toContain('🌍');
    expect(retrieved).toContain('📚');
  });
});

// API endpoint simulation tests
describe('API Endpoint Simulation', () => {
  const simulateApiRoundtrip = async (data: any): Promise<any> => {
    // Simulate API request/response cycle
    const prepared = emojiFormUtils.prepareForSubmission(data);
    const jsonString = JSON.stringify(prepared);
    
    // Simulate network transmission
    const transmitted = jsonString;
    
    // Simulate server processing and response
    const parsed = JSON.parse(transmitted);
    return parsed;
  };

  it('should preserve emojis through API roundtrip', async () => {
    const originalData = {
      title: 'Learning Adventure 🎯',
      description: 'Fun with emojis 😀🎉📚',
      category: 'education',
      emoji: '🌟'
    };

    const result = await simulateApiRoundtrip(originalData);
    expect(result.title).toBe('Learning Adventure 🎯');
    expect(result.description).toBe('Fun with emojis 😀🎉📚');
    expect(result.emoji).toBe('🌟');
  });

  it('should handle complex emoji data through API roundtrip', async () => {
    const originalData = {
      users: [
        { name: 'Developer 👨‍💻', avatar: '🧑‍💻' },
        { name: 'Artist 👩‍🎨', avatar: '🎨' }
      ],
      message: 'Welcome to the team! 🎉🎯'
    };

    const result = await simulateApiRoundtrip(originalData);
    expect(result.users[0].name).toBe('Developer 👨‍💻');
    expect(result.users[1].name).toBe('Artist 👩‍🎨');
    expect(result.message).toBe('Welcome to the team! 🎉🎯');
  });
});
