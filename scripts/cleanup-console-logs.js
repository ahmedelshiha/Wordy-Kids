#!/usr/bin/env node

/**
 * Console.log cleanup script - removes development debug logging
 * Run with: node scripts/cleanup-console-logs.js
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_CLEAN = [
  'client/components/ProductionErrorBoundary.tsx',
  'client/components/AchievementSystem.tsx',
  'client/components/EnhancedSupportManagement.tsx',
  'client/components/VoiceIntegrationTest.tsx',
  'client/components/EnhancedWordLibrary.tsx',
  'client/components/ParentLearningAnalyticsEnhanced.tsx',
  'client/components/EncouragingFeedback.tsx',
  'client/components/EnhancedUserManagement.tsx',
  'client/components/SettingsTestPanel.tsx',
];

// Patterns to remove (debug/development console.log statements)
const DEBUG_PATTERNS = [
  /console\.log\("(Pronounced|Favorited|Word \d+ mastered).*?\);?/g,
  /console\.log\(`Word \$\{.*?\} mastered with rating.*?\);?/g,
  /console\.log\("(Started|Finished|Speaking).*?\);?/g,
  /console\.log\("(Test pronunciation|Voice changed).*?\);?/g,
  /console\.log\("(Share cancelled|Error sharing).*?\);?/g,
  /console\.log\((["'`])(Continue|Try again|Show hint).*?\1\);?/g,
];

// Preserve these patterns (legitimate logging)
const PRESERVE_PATTERNS = [
  /console\.log.*error/i,
  /console\.log.*Error/,
  /console\.error/,
  /console\.warn/,
];

function shouldPreserveLog(line) {
  return PRESERVE_PATTERNS.some(pattern => pattern.test(line));
}

function cleanupFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove debug console.log patterns
  DEBUG_PATTERNS.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!shouldPreserveLog(match)) {
          content = content.replace(match, '// Debug logging removed');
          changed = true;
        }
      });
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Cleaned: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes: ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🧹 Starting console.log cleanup...\n');
  
  let totalCleaned = 0;
  
  FILES_TO_CLEAN.forEach(filePath => {
    if (cleanupFile(filePath)) {
      totalCleaned++;
    }
  });

  console.log(`\n🎉 Cleanup completed! ${totalCleaned} files were cleaned.`);
  console.log('\n📝 Manual review recommended for:');
  console.log('   - Error handling console.log statements');
  console.log('   - Conditional development logging');
  console.log('   - Console statements in test files');
}

if (require.main === module) {
  main();
}

module.exports = { cleanupFile, DEBUG_PATTERNS };
