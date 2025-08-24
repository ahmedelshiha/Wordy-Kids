#!/usr/bin/env node

/**
 * PHASE 5: Pre-commit Hook for Emoji Corruption Detection
 * Automatically checks staged files for emoji corruption before commit
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns that indicate corrupted emojis
const CORRUPTION_PATTERNS = [
  /\uFFFD+/g, // Unicode replacement character
  /[\u{1F000}-\u{1F999}]{3,}/gu, // Suspicious emoji sequences
  /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, // Control characters
];

// File extensions to check
const EMOJI_SENSITIVE_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', 
  '.json', '.md', '.html', '.css'
];

// Files to always check regardless of extension
const CRITICAL_FILES = [
  'client/lib/emojiUtils.ts',
  'client/components/EmojiText.tsx',
  'client/pages/EmojiTestPage.tsx',
  'docs/EMOJI_HANDLING_GUIDE.md'
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(color + message + colors.reset);
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    log(colors.red, '❌ Failed to get staged files');
    return [];
  }
}

function shouldCheckFile(filePath) {
  // Always check critical files
  if (CRITICAL_FILES.includes(filePath)) {
    return true;
  }
  
  // Check by extension
  const ext = path.extname(filePath);
  return EMOJI_SENSITIVE_EXTENSIONS.includes(ext);
}

function checkFileForCorruption(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { corrupted: false, issues: [] };
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    
    // Check for corruption patterns
    CORRUPTION_PATTERNS.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Find line number
          const lines = content.substring(0, content.indexOf(match)).split('\n');
          const lineNumber = lines.length;
          
          issues.push({
            type: `Corruption Pattern ${index + 1}`,
            match: match,
            line: lineNumber,
            description: getCorruptionDescription(index)
          });
        });
      }
    });
    
    // Check for valid Unicode but suspicious sequences
    const suspiciousUnicode = content.match(/[\u{1F000}-\u{1FFFF}]/gu);
    if (suspiciousUnicode && suspiciousUnicode.length > 10) {
      // Many Unicode characters in private use areas might indicate corruption
      const uniqueChars = [...new Set(suspiciousUnicode)];
      if (uniqueChars.length > 5) {
        issues.push({
          type: 'Suspicious Unicode',
          match: uniqueChars.slice(0, 5).join(''),
          line: 'Multiple',
          description: 'Large number of Unicode private use characters detected'
        });
      }
    }
    
    return {
      corrupted: issues.length > 0,
      issues: issues
    };
  } catch (error) {
    return {
      corrupted: true,
      issues: [{
        type: 'Read Error',
        match: error.message,
        line: 0,
        description: 'Could not read file for corruption check'
      }]
    };
  }
}

function getCorruptionDescription(patternIndex) {
  const descriptions = [
    'Unicode replacement character found (indicates encoding issues)',
    'Suspicious emoji sequence (possible corruption)',
    'Control characters found (may indicate binary corruption)'
  ];
  return descriptions[patternIndex] || 'Unknown corruption pattern';
}

function checkEmojiUtilsIntegrity() {
  const emojiUtilsPath = 'client/lib/emojiUtils.ts';
  
  if (!fs.existsSync(emojiUtilsPath)) {
    return {
      valid: false,
      error: 'Emoji utilities file not found'
    };
  }
  
  try {
    const content = fs.readFileSync(emojiUtilsPath, 'utf8');
    
    // Check for required exports
    const requiredExports = [
      'EMOJI_CONSTANTS',
      'safeEmojiString',
      'containsEmoji',
      'validateEmojiInput'
    ];
    
    const missingExports = requiredExports.filter(exp => 
      !content.includes(`export ${exp}`) && 
      !content.includes(`export const ${exp}`) &&
      !content.includes(`export function ${exp}`)
    );
    
    if (missingExports.length > 0) {
      return {
        valid: false,
        error: `Missing required exports: ${missingExports.join(', ')}`
      };
    }
    
    // Check for basic emoji constants
    if (!content.includes('EMOJI_CONSTANTS') || !content.includes('TARGET') || !content.includes('SPARKLES')) {
      return {
        valid: false,
        error: 'Emoji constants appear to be corrupted or missing'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Could not validate emoji utilities: ${error.message}`
    };
  }
}

function main() {
  log(colors.blue, '🔍 Pre-commit Emoji Corruption Check');
  console.log('');
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    log(colors.yellow, '⚠️  No staged files found');
    return 0;
  }
  
  log(colors.blue, `Checking ${stagedFiles.length} staged files...`);
  
  // Check emoji utilities integrity first
  const utilsCheck = checkEmojiUtilsIntegrity();
  if (!utilsCheck.valid) {
    log(colors.red, '❌ Emoji utilities integrity check failed:');
    log(colors.red, `   ${utilsCheck.error}`);
    console.log('');
    log(colors.yellow, '💡 Please fix the emoji utilities before committing');
    return 1;
  }
  
  const filesToCheck = stagedFiles.filter(shouldCheckFile);
  
  if (filesToCheck.length === 0) {
    log(colors.green, '✅ No emoji-sensitive files to check');
    return 0;
  }
  
  log(colors.blue, `Checking ${filesToCheck.length} emoji-sensitive files:`);
  filesToCheck.forEach(file => console.log(`   ${file}`));
  console.log('');
  
  let hasCorruption = false;
  const corruptedFiles = [];
  
  for (const file of filesToCheck) {
    const result = checkFileForCorruption(file);
    
    if (result.corrupted) {
      hasCorruption = true;
      corruptedFiles.push({ file, issues: result.issues });
      
      log(colors.red, `❌ ${file}`);
      result.issues.forEach(issue => {
        log(colors.red, `   Line ${issue.line}: ${issue.type}`);
        log(colors.red, `   Content: "${issue.match}"`);
        log(colors.red, `   Issue: ${issue.description}`);
        console.log('');
      });
    } else {
      log(colors.green, `✅ ${file}`);
    }
  }
  
  console.log('');
  
  if (hasCorruption) {
    log(colors.red + colors.bold, '🚨 EMOJI CORRUPTION DETECTED!');
    console.log('');
    log(colors.red, `Found issues in ${corruptedFiles.length} files:`);
    
    corruptedFiles.forEach(({ file, issues }) => {
      log(colors.red, `   ${file}: ${issues.length} issue(s)`);
    });
    
    console.log('');
    log(colors.yellow, '💡 To fix these issues:');
    log(colors.yellow, '   1. Use the emoji utilities from client/lib/emojiUtils.ts');
    log(colors.yellow, '   2. Replace corrupted emojis with EMOJI_CONSTANTS');
    log(colors.yellow, '   3. Run the emoji test page: /emoji-test');
    log(colors.yellow, '   4. Validate input with validateEmojiInput()');
    console.log('');
    log(colors.red, 'Commit blocked to prevent emoji corruption.');
    
    return 1;
  } else {
    log(colors.green + colors.bold, '✅ All emoji checks passed!');
    log(colors.green, 'No corruption detected in staged files.');
    
    // Additional success tips
    console.log('');
    log(colors.blue, '💡 Emoji best practices reminder:');
    log(colors.blue, '   • Use EMOJI_CONSTANTS for consistency');
    log(colors.blue, '   • Validate user input with validateEmojiInput()');
    log(colors.blue, '   • Test changes on /emoji-test page');
    
    return 0;
  }
}

// Run the check
if (require.main === module) {
  process.exit(main());
}

module.exports = {
  checkFileForCorruption,
  getStagedFiles,
  shouldCheckFile,
  checkEmojiUtilsIntegrity
};
