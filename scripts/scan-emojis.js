#!/usr/bin/env node
/**
 * Emoji Corruption Scanner
 * Scans the codebase for corrupted emojis and potential encoding issues
 * Run with: node scripts/scan-emojis.js
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Patterns that indicate corrupted emojis
const CORRUPTION_PATTERNS = [
  /�+/g,                    // Replacement characters
  /\uFFFD+/g,              // Unicode replacement character
  /[\u{1F000}-\u{1F999}]{3,}/gu,  // Suspicious emoji sequences
];

// File patterns to scan
const FILE_PATTERNS = [
  'client/**/*.{ts,tsx,js,jsx}',
  'server/**/*.{ts,tsx,js,jsx}',
  'shared/**/*.{ts,tsx,js,jsx}'
];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, lineIndex) => {
      CORRUPTION_PATTERNS.forEach(pattern => {
        const matches = [...line.matchAll(pattern)];
        matches.forEach(match => {
          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            pattern: pattern.toString(),
            context: line.substring(Math.max(0, match.index - 20), match.index + 20),
            corrupted: match[0]
          });
        });
      });
    });

    return issues;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanCodebase() {
  const allIssues = [];

  FILE_PATTERNS.forEach(pattern => {
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      const issues = scanFile(file);
      allIssues.push(...issues);
    });
  });

  return allIssues;
}

function reportResults(issues) {
  if (issues.length === 0) {
    console.log('✅ No corrupted emojis found!');
    return 0;
  }

  console.log(`🚨 Found ${issues.length} potential emoji corruption(s):\n`);
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. 📄 ${issue.file}:${issue.line}:${issue.column}`);
    console.log(`   Pattern: ${issue.pattern}`);
    console.log(`   Corrupted: "${issue.corrupted}"`);
    console.log(`   Context: ...${issue.context}...`);
    console.log('');
  });

  console.log('💡 To fix these issues:');
  console.log('   1. Replace corrupted emojis with valid ones from client/lib/emojiUtils.ts');
  console.log('   2. Use EMOJI_CONSTANTS for consistent emoji usage');
  console.log('   3. Import { ensureEmojiSafety } from "@/lib/emojiValidator" for runtime safety');

  return issues.length;
}

// Main execution
function main() {
  console.log('🔍 Scanning codebase for corrupted emojis...\n');
  
  const issues = scanCodebase();
  const exitCode = reportResults(issues);
  
  process.exit(exitCode > 0 ? 1 : 0);
}

// Run if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = { scanCodebase, scanFile, reportResults };
