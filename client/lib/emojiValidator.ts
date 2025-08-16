/**
 * Development utility for detecting and fixing corrupted emojis
 * Run this during development to catch emoji corruption early
 */

import { detectCorruptedEmojis, isValidEmoji, sanitizeEmoji } from './emojiUtils';

export interface EmojiValidationResult {
  file: string;
  line: number;
  column: number;
  corruptedText: string;
  suggestion: string;
}

/**
 * Validates emojis in a given text and returns corruption details
 */
export function validateEmojiInText(text: string, filePath?: string): EmojiValidationResult[] {
  const results: EmojiValidationResult[] = [];
  const lines = text.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const corruption = detectCorruptedEmojis(line);
    
    if (corruption.hasCorrupted) {
      corruption.corruptedPositions.forEach(position => {
        // Extract context around the corrupted character
        const start = Math.max(0, position - 10);
        const end = Math.min(line.length, position + 10);
        const context = line.substring(start, end);
        
        results.push({
          file: filePath || 'unknown',
          line: lineIndex + 1,
          column: position + 1,
          corruptedText: context,
          suggestion: 'Replace with valid emoji from emojiUtils.ts'
        });
      });
    }
  });
  
  return results;
}

/**
 * Console utility to log emoji validation results
 */
export function logEmojiValidationResults(results: EmojiValidationResult[]): void {
  if (results.length === 0) {
    console.log('✅ No corrupted emojis found!');
    return;
  }
  
  console.warn(`🚨 Found ${results.length} corrupted emoji(s):`);
  results.forEach(result => {
    console.warn(`  📄 ${result.file}:${result.line}:${result.column}`);
    console.warn(`     Context: "${result.corruptedText}"`);
    console.warn(`     💡 ${result.suggestion}`);
  });
}

/**
 * Auto-fix corrupted emojis in text (for development use)
 */
export function autoFixCorruptedEmojis(text: string): { fixed: string; changes: number } {
  let fixed = text;
  let changes = 0;
  
  // Replace common corrupted patterns
  const corruptedPatterns = [
    { pattern: /����/g, replacement: '🤔' },
    { pattern: /\uFFFD+/g, replacement: '🌟' },
    { pattern: /�+/g, replacement: '✨' }
  ];
  
  corruptedPatterns.forEach(({ pattern, replacement }) => {
    const matches = fixed.match(pattern);
    if (matches) {
      fixed = fixed.replace(pattern, replacement);
      changes += matches.length;
    }
  });
  
  return { fixed, changes };
}

/**
 * Development helper to scan common emoji usage patterns
 */
export function scanForCommonEmojiIssues(text: string): string[] {
  const issues: string[] = [];
  
  // Check for potential encoding issues
  if (text.includes('\uFFFD')) {
    issues.push('Contains Unicode replacement characters (�)');
  }
  
  // Check for suspicious patterns
  if (/[^\x00-\x7F]{4,}/.test(text)) {
    issues.push('Contains suspiciously long non-ASCII sequences');
  }
  
  // Check for common emoji corruption patterns
  if (/\p{So}{3,}/u.test(text)) {
    issues.push('Contains potentially corrupted emoji sequences');
  }
  
  return issues;
}

/**
 * Runtime emoji safety check for production
 */
export function ensureEmojiSafety(emoji: string, fallback = '🌟'): string {
  if (!emoji || typeof emoji !== 'string') return fallback;
  
  // Quick validation
  if (emoji.includes('�') || emoji.includes('\uFFFD')) {
    console.warn(`Emoji corruption detected in production: ${emoji}`);
    return fallback;
  }
  
  return emoji;
}

// Development-only features
if (process.env.NODE_ENV === 'development') {
  // Add global emoji checker for development
  (window as any).__checkEmojis = (text: string) => {
    const results = validateEmojiInText(text);
    logEmojiValidationResults(results);
    return results;
  };
  
  (window as any).__fixEmojis = (text: string) => {
    const result = autoFixCorruptedEmojis(text);
    console.log(`Fixed ${result.changes} corrupted emoji(s)`);
    return result.fixed;
  };
}
