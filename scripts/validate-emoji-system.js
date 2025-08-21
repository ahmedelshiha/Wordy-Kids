#!/usr/bin/env node

/**
 * Emoji System Validation and Testing Framework
 * Comprehensive testing suite for emoji rendering, accessibility, and performance
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Test configuration
const TEST_CONFIG = {
  sourceDir: './client',
  testDir: './tests/emoji',
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  criticalEmojis: ['🦉', '🦜', '🐵', '🐘'],
  achievementEmojis: ['🏆', '🌟', '👑', '💎', '🥇'],
  gameEmojis: ['🎯', '🚀', '🧠', '📚', '🎮'],
  verbose: process.argv.includes('--verbose'),
  generateReport: true,
};

class EmojiValidationFramework {
  constructor() {
    this.testResults = {
      corruption: { passed: 0, failed: 0, details: [] },
      accessibility: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] },
      consistency: { passed: 0, failed: 0, details: [] },
      coverage: { passed: 0, failed: 0, details: [] },
    };
    this.errors = [];
    this.warnings = [];
  }

  async runAllTests() {
    console.log('🧪 Starting Emoji System Validation...');
    console.log('=====================================');

    try {
      await this.testEmojiCorruption();
      await this.testAccessibilityCompliance();
      await this.testPerformanceOptimization();
      await this.testCrossBrowserConsistency();
      await this.testEmojiCoverage();
      
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  async testEmojiCorruption() {
    console.log('\n🔍 Testing Emoji Corruption...');
    
    const files = await this.getSourceFiles();
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const corruptionResult = this.detectEmojiCorruption(content, file);
      
      if (corruptionResult.hasCorruption) {
        this.testResults.corruption.failed++;
        this.testResults.corruption.details.push({
          file,
          corruptions: corruptionResult.corruptions,
          severity: 'high'
        });
      } else {
        this.testResults.corruption.passed++;
      }
    }

    console.log(`   ✅ Clean files: ${this.testResults.corruption.passed}`);
    console.log(`   ❌ Corrupted files: ${this.testResults.corruption.failed}`);
  }

  detectEmojiCorruption(content, fileName) {
    const corruptions = [];
    
    // Check for replacement characters
    const replacementCharRegex = /[\uFFFD]/g;
    let match;
    while ((match = replacementCharRegex.exec(content)) !== null) {
      corruptions.push({
        type: 'replacement_character',
        position: match.index,
        character: match[0],
        line: this.getLineNumber(content, match.index)
      });
    }

    // Check for malformed emoji sequences
    const malformedEmojiRegex = /[\u{1F300}-\u{1F9FF}][\u{FE00}-\u{FE0F}]?[\u{200D}]?[\u{1F300}-\u{1F9FF}]?/gu;
    const emojiMatches = content.match(malformedEmojiRegex) || [];
    
    emojiMatches.forEach((emoji, index) => {
      if (emoji.includes('\uFFFD') || emoji.length > 8) {
        corruptions.push({
          type: 'malformed_sequence',
          emoji,
          position: content.indexOf(emoji),
          line: this.getLineNumber(content, content.indexOf(emoji))
        });
      }
    });

    // Check for broken surrogate pairs
    const brokenSurrogateRegex = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
    while ((match = brokenSurrogateRegex.exec(content)) !== null) {
      corruptions.push({
        type: 'broken_surrogate',
        position: match.index,
        character: match[0],
        line: this.getLineNumber(content, match.index)
      });
    }

    return {
      hasCorruption: corruptions.length > 0,
      corruptions
    };
  }

  async testAccessibilityCompliance() {
    console.log('\n♿ Testing Accessibility Compliance...');
    
    const files = await this.getSourceFiles();
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const accessibilityResult = this.validateAccessibility(content, file);
      
      if (accessibilityResult.violations.length > 0) {
        this.testResults.accessibility.failed++;
        this.testResults.accessibility.details.push({
          file,
          violations: accessibilityResult.violations
        });
      } else {
        this.testResults.accessibility.passed++;
      }
    }

    console.log(`   ✅ Accessible files: ${this.testResults.accessibility.passed}`);
    console.log(`   ❌ Files with violations: ${this.testResults.accessibility.failed}`);
  }

  validateAccessibility(content, fileName) {
    const violations = [];

    // Check for emoji without ARIA labels
    const emojiWithoutAriaRegex = /<span[^>]*>[\u{1F300}-\u{1F9FF}]<\/span>/gu;
    let match;
    while ((match = emojiWithoutAriaRegex.exec(content)) !== null) {
      if (!match[0].includes('aria-label') && !match[0].includes('role="img"')) {
        violations.push({
          type: 'missing_aria_label',
          element: match[0],
          line: this.getLineNumber(content, match.index),
          severity: 'medium'
        });
      }
    }

    // Check for interactive emojis without keyboard accessibility
    const interactiveEmojiRegex = /<[^>]*onClick[^>]*>[\u{1F300}-\u{1F9FF}]/gu;
    while ((match = interactiveEmojiRegex.exec(content)) !== null) {
      if (!match[0].includes('tabIndex') && !match[0].includes('onKeyDown')) {
        violations.push({
          type: 'missing_keyboard_access',
          element: match[0],
          line: this.getLineNumber(content, match.index),
          severity: 'high'
        });
      }
    }

    // Check for missing alt text on emoji images
    const emojiImgRegex = /<img[^>]*src[^>]*emoji[^>]*>/gi;
    while ((match = emojiImgRegex.exec(content)) !== null) {
      if (!match[0].includes('alt=')) {
        violations.push({
          type: 'missing_alt_text',
          element: match[0],
          line: this.getLineNumber(content, match.index),
          severity: 'high'
        });
      }
    }

    return { violations };
  }

  async testPerformanceOptimization() {
    console.log('\n⚡ Testing Performance Optimization...');
    
    const files = await this.getSourceFiles();
    let totalFiles = 0;
    let optimizedFiles = 0;

    for (const file of files) {
      const content = await readFile(file, 'utf8');
      const performanceResult = this.validatePerformance(content, file);
      
      totalFiles++;
      
      if (performanceResult.isOptimized) {
        optimizedFiles++;
        this.testResults.performance.passed++;
      } else {
        this.testResults.performance.failed++;
        this.testResults.performance.details.push({
          file,
          issues: performanceResult.issues
        });
      }
    }

    const optimizationRate = (optimizedFiles / totalFiles * 100).toFixed(1);
    console.log(`   ✅ Optimization rate: ${optimizationRate}%`);
    console.log(`   ⚡ Optimized files: ${optimizedFiles}/${totalFiles}`);
  }

  validatePerformance(content, fileName) {
    const issues = [];
    let isOptimized = true;

    // Check for lazy loading implementation
    if (content.includes('emoji') && !content.includes('LazyEmoji') && !content.includes('lazy')) {
      issues.push({
        type: 'missing_lazy_loading',
        severity: 'medium',
        suggestion: 'Consider using LazyEmoji component for better performance'
      });
      isOptimized = false;
    }

    // Check for Twemoji usage without caching
    if (content.includes('twemoji') && !content.includes('cache')) {
      issues.push({
        type: 'missing_caching',
        severity: 'medium',
        suggestion: 'Implement emoji caching for better performance'
      });
      isOptimized = false;
    }

    // Check for multiple emoji renders without virtualization
    const emojiCount = (content.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 20 && !content.includes('Virtual')) {
      issues.push({
        type: 'large_emoji_list_not_virtualized',
        severity: 'high',
        emojiCount,
        suggestion: 'Consider using VirtualizedEmojiList for large emoji collections'
      });
      isOptimized = false;
    }

    // Check for critical emoji preloading
    const hasCriticalEmojis = TEST_CONFIG.criticalEmojis.some(emoji => content.includes(emoji));
    if (hasCriticalEmojis && !content.includes('preload') && !content.includes('critical')) {
      issues.push({
        type: 'missing_critical_preloading',
        severity: 'high',
        suggestion: 'Preload critical navigation emojis for better user experience'
      });
      isOptimized = false;
    }

    return { isOptimized, issues };
  }

  async testCrossBrowserConsistency() {
    console.log('\n🌐 Testing Cross-Browser Consistency...');
    
    const consistencyTests = [
      this.validateTwemojiImplementation(),
      this.validateFontFallbacks(),
      this.validateEmojiSizing(),
      this.validateAccessibilityAcrossBrowsers(),
    ];

    const results = await Promise.all(consistencyTests);
    const passedTests = results.filter(result => result.passed).length;
    const totalTests = results.length;

    this.testResults.consistency.passed = passedTests;
    this.testResults.consistency.failed = totalTests - passedTests;
    this.testResults.consistency.details = results.filter(result => !result.passed);

    console.log(`   ✅ Passed consistency tests: ${passedTests}/${totalTests}`);
  }

  async validateTwemojiImplementation() {
    // Check if Twemoji is properly implemented
    const twemojiServiceExists = fs.existsSync('./client/lib/twemojiService.ts');
    const twemojiComponentExists = fs.existsSync('./client/components/ui/twemoji.tsx');
    
    if (twemojiServiceExists && twemojiComponentExists) {
      return { test: 'twemoji_implementation', passed: true };
    } else {
      return {
        test: 'twemoji_implementation',
        passed: false,
        issues: ['Missing Twemoji implementation files']
      };
    }
  }

  async validateFontFallbacks() {
    // Check if emoji-safe fonts are configured
    const fontConfigExists = fs.existsSync('./client/styles/emoji-safe-fonts.css');
    
    if (fontConfigExists) {
      const content = await readFile('./client/styles/emoji-safe-fonts.css', 'utf8');
      const hasNotoEmoji = content.includes('Noto Color Emoji');
      const hasAppleEmoji = content.includes('Apple Color Emoji');
      const hasSegoeEmoji = content.includes('Segoe UI Emoji');
      
      if (hasNotoEmoji && hasAppleEmoji && hasSegoeEmoji) {
        return { test: 'font_fallbacks', passed: true };
      }
    }
    
    return {
      test: 'font_fallbacks',
      passed: false,
      issues: ['Incomplete emoji font fallback configuration']
    };
  }

  async validateEmojiSizing() {
    // Check if responsive emoji sizing is implemented
    const globalCssExists = fs.existsSync('./client/global.css');
    
    if (globalCssExists) {
      const content = await readFile('./client/global.css', 'utf8');
      const hasResponsiveSizing = content.includes('@media') && content.includes('emoji');
      
      if (hasResponsiveSizing) {
        return { test: 'emoji_sizing', passed: true };
      }
    }
    
    return {
      test: 'emoji_sizing',
      passed: false,
      issues: ['Missing responsive emoji sizing configuration']
    };
  }

  async validateAccessibilityAcrossBrowsers() {
    // Check if accessibility features are browser-agnostic
    const accessibilityUtilExists = fs.existsSync('./client/lib/emojiAccessibility.ts');
    
    if (accessibilityUtilExists) {
      const content = await readFile('./client/lib/emojiAccessibility.ts', 'utf8');
      const hasScreenReaderSupport = content.includes('aria-label');
      const hasKeyboardSupport = content.includes('tabIndex') || content.includes('onKeyDown');
      const hasHighContrastSupport = content.includes('prefers-contrast');
      
      if (hasScreenReaderSupport && hasKeyboardSupport && hasHighContrastSupport) {
        return { test: 'accessibility_cross_browser', passed: true };
      }
    }
    
    return {
      test: 'accessibility_cross_browser',
      passed: false,
      issues: ['Incomplete cross-browser accessibility implementation']
    };
  }

  async testEmojiCoverage() {
    console.log('\n�� Testing Emoji Coverage...');
    
    const files = await this.getSourceFiles();
    const emojiUsage = new Map();
    const componentUsage = new Map();
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      
      // Count direct emoji usage
      const emojis = content.match(/[\u{1F300}-\u{1F9FF}]/gu) || [];
      emojis.forEach(emoji => {
        emojiUsage.set(emoji, (emojiUsage.get(emoji) || 0) + 1);
      });
      
      // Count component usage
      const components = content.match(/(Accessible|Lazy|Twemoji)\w*Emoji/g) || [];
      components.forEach(component => {
        componentUsage.set(component, (componentUsage.get(component) || 0) + 1);
      });
    }

    // Calculate coverage metrics
    const totalEmojis = Array.from(emojiUsage.keys()).length;
    const criticalEmojisCovered = TEST_CONFIG.criticalEmojis.filter(emoji => 
      emojiUsage.has(emoji)
    ).length;
    
    const coverageRate = (criticalEmojisCovered / TEST_CONFIG.criticalEmojis.length * 100).toFixed(1);
    
    this.testResults.coverage.passed = criticalEmojisCovered;
    this.testResults.coverage.failed = TEST_CONFIG.criticalEmojis.length - criticalEmojisCovered;
    this.testResults.coverage.details.push({
      totalEmojis,
      criticalEmojisCovered,
      coverageRate,
      emojiUsage: Array.from(emojiUsage.entries()),
      componentUsage: Array.from(componentUsage.entries())
    });

    console.log(`   📈 Total unique emojis: ${totalEmojis}`);
    console.log(`   🎯 Critical emoji coverage: ${coverageRate}%`);
    console.log(`   🧩 Component usage: ${componentUsage.size} different components`);
  }

  async getSourceFiles() {
    const files = [];
    await this.collectFiles(TEST_CONFIG.sourceDir, files);
    return files.filter(file => 
      TEST_CONFIG.extensions.includes(path.extname(file))
    );
  }

  async collectFiles(dirPath, files) {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryStat = await stat(fullPath);
      
      if (entryStat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
          await this.collectFiles(fullPath, files);
        }
      } else {
        files.push(fullPath);
      }
    }
  }

  getLineNumber(content, position) {
    return content.slice(0, position).split('\n').length;
  }

  generateTestReport() {
    console.log('\n📋 Validation Report');
    console.log('===================');
    
    const categories = Object.keys(this.testResults);
    let totalPassed = 0;
    let totalFailed = 0;
    
    categories.forEach(category => {
      const result = this.testResults[category];
      totalPassed += result.passed;
      totalFailed += result.failed;
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`   ✅ Passed: ${result.passed}`);
      console.log(`   ❌ Failed: ${result.failed}`);
      
      if (result.failed > 0 && TEST_CONFIG.verbose) {
        console.log(`   Details: ${result.details.length} issues found`);
      }
    });
    
    const overallScore = (totalPassed / (totalPassed + totalFailed) * 100).toFixed(1);
    console.log(`\n🎯 Overall Score: ${overallScore}%`);
    
    if (overallScore >= 90) {
      console.log('🎉 Excellent! Emoji system is well-optimized.');
    } else if (overallScore >= 75) {
      console.log('👍 Good! Some improvements recommended.');
    } else {
      console.log('⚠️  Needs improvement. Please address the issues found.');
    }

    // Generate detailed JSON report
    if (TEST_CONFIG.generateReport) {
      this.saveDetailedReport();
    }
  }

  saveDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      testResults: this.testResults,
      summary: {
        totalTests: Object.values(this.testResults).reduce((sum, cat) => sum + cat.passed + cat.failed, 0),
        totalPassed: Object.values(this.testResults).reduce((sum, cat) => sum + cat.passed, 0),
        totalFailed: Object.values(this.testResults).reduce((sum, cat) => sum + cat.failed, 0),
      },
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.generateRecommendations(),
    };

    const reportPath = `./emoji-validation-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.testResults.corruption.failed > 0) {
      recommendations.push({
        category: 'corruption',
        priority: 'high',
        message: 'Fix emoji corruption issues immediately to prevent display problems'
      });
    }
    
    if (this.testResults.accessibility.failed > 0) {
      recommendations.push({
        category: 'accessibility',
        priority: 'high',
        message: 'Improve accessibility compliance for better user experience'
      });
    }
    
    if (this.testResults.performance.failed > 0) {
      recommendations.push({
        category: 'performance',
        priority: 'medium',
        message: 'Implement performance optimizations for better loading times'
      });
    }
    
    return recommendations;
  }
}

// Main execution
if (require.main === module) {
  const validator = new EmojiValidationFramework();
  
  if (process.argv.includes('--help')) {
    console.log(`
Emoji System Validation Framework

Usage:
  node validate-emoji-system.js [options]

Options:
  --verbose     Show detailed validation information
  --help        Show this help message

Tests performed:
  • Emoji corruption detection
  • Accessibility compliance
  • Performance optimization
  • Cross-browser consistency
  • Emoji coverage analysis

Examples:
  node validate-emoji-system.js           # Run all validation tests
  node validate-emoji-system.js --verbose # Detailed output
`);
    process.exit(0);
  }

  validator.runAllTests().catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

module.exports = { EmojiValidationFramework };
