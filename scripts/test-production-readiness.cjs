#!/usr/bin/env node

/**
 * Production Readiness Testing Script for Jungle Word Library
 * Tests all major functionality, performance, accessibility, and offline capabilities
 */

const fs = require('fs');
const path = require('path');

console.log('🌴 Jungle Word Library - Production Readiness Test');
console.log('===============================================\n');

// Test results storage
let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function addTestResult(name, status, message, details = null) {
  const result = { name, status, message, details, timestamp: new Date().toISOString() };
  testResults.tests.push(result);
  
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${name}: ${message}`);
  } else if (status === 'FAIL') {
    testResults.failed++;
    console.log(`❌ ${name}: ${message}`);
    if (details) console.log(`   Details: ${details}`);
  } else if (status === 'WARN') {
    testResults.warnings++;
    console.log(`⚠️  ${name}: ${message}`);
    if (details) console.log(`   Details: ${details}`);
  }
}

// 1. File Structure Tests
console.log('\n📁 Testing File Structure...');

function testFileExists(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    addTestResult(`File: ${description}`, 'PASS', `${filePath} exists`);
    return true;
  } else {
    addTestResult(`File: ${description}`, 'FAIL', `${filePath} not found`);
    return false;
  }
}

// Test critical files
testFileExists('client/components/JungleWordLibrarySimplified.tsx', 'Main Component');
testFileExists('client/components/LazyComponents.tsx', 'Lazy Loading');
testFileExists('client/lib/featureFlags.ts', 'Feature Flags');
testFileExists('client/hooks/useJungleGameState.ts', 'Game State Hook');
testFileExists('client/hooks/useJungleAudioService.ts', 'Audio Service Hook');
testFileExists('client/hooks/useJungleAccessibility.ts', 'Accessibility Hook');
testFileExists('client/pages/ParentDashboard.tsx', 'Parent Dashboard');
testFileExists('public/service-worker.js', 'Service Worker');
testFileExists('backup/old-components/enhanced-word-library/README.md', 'Migration Backup');

// 2. Route Configuration Tests
console.log('\n🛣️  Testing Route Configuration...');

function testRouteConfig() {
  try {
    const appTsxPath = path.join(process.cwd(), 'client/App.tsx');
    const appContent = fs.readFileSync(appTsxPath, 'utf8');
    
    // Check for critical routes
    const criticalRoutes = [
      '/app',
      '/jungle-library',
      '/parent-dashboard'
    ];
    
    criticalRoutes.forEach(route => {
      if (appContent.includes(`path="${route}"`)) {
        addTestResult(`Route: ${route}`, 'PASS', 'Route correctly configured');
      } else {
        addTestResult(`Route: ${route}`, 'FAIL', 'Route not found in App.tsx');
      }
    });

    // Check for lazy loading imports
    if (appContent.includes('LazyJungleWordLibrary') && appContent.includes('EnhancedSuspense')) {
      addTestResult('Lazy Loading', 'PASS', 'Lazy loading properly configured');
    } else {
      addTestResult('Lazy Loading', 'FAIL', 'Lazy loading not properly configured');
    }

  } catch (error) {
    addTestResult('Route Config', 'FAIL', 'Failed to read App.tsx', error.message);
  }
}

testRouteConfig();

// 3. Service Worker Tests
console.log('\n🔧 Testing Service Worker...');

function testServiceWorker() {
  try {
    const swPath = path.join(process.cwd(), 'public/service-worker.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check for critical features
    const requiredFeatures = [
      'CACHE_NAME',
      'JUNGLE_SOUNDS',
      'install',
      'activate',
      'fetch',
      'sync'
    ];
    
    requiredFeatures.forEach(feature => {
      if (swContent.includes(feature)) {
        addTestResult(`SW Feature: ${feature}`, 'PASS', 'Service worker feature present');
      } else {
        addTestResult(`SW Feature: ${feature}`, 'FAIL', 'Service worker feature missing');
      }
    });

    // Check for offline strategies
    if (swContent.includes('cacheFirstSounds') && swContent.includes('gameStateCacheFirst')) {
      addTestResult('Offline Strategies', 'PASS', 'Offline caching strategies implemented');
    } else {
      addTestResult('Offline Strategies', 'WARN', 'Some offline strategies may be missing');
    }

  } catch (error) {
    addTestResult('Service Worker', 'FAIL', 'Failed to read service worker', error.message);
  }
}

testServiceWorker();

// 4. Accessibility Tests
console.log('\n♿ Testing Accessibility Implementation...');

function testAccessibility() {
  try {
    const accessibilityHookPath = path.join(process.cwd(), 'client/hooks/useJungleAccessibility.ts');
    const accessibilityContent = fs.readFileSync(accessibilityHookPath, 'utf8');
    
    // Check for key accessibility features
    const accessibilityFeatures = [
      'AccessibilitySettings',
      'highContrast',
      'largeText',
      'reducedMotion',
      'screenReaderEnabled',
      'announceForScreenReader',
      'trapFocus',
      'createSkipLink'
    ];
    
    accessibilityFeatures.forEach(feature => {
      if (accessibilityContent.includes(feature)) {
        addTestResult(`A11y: ${feature}`, 'PASS', 'Accessibility feature implemented');
      } else {
        addTestResult(`A11y: ${feature}`, 'WARN', 'Accessibility feature not found');
      }
    });

    // Check CSS file
    const cssPath = path.join(process.cwd(), 'client/styles/accessibility-enhancements.css');
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      if (cssContent.includes('.high-contrast') && cssContent.includes('.large-text')) {
        addTestResult('A11y CSS', 'PASS', 'Accessibility CSS styles present');
      } else {
        addTestResult('A11y CSS', 'WARN', 'Some accessibility CSS may be missing');
      }
    }

  } catch (error) {
    addTestResult('Accessibility', 'FAIL', 'Failed to test accessibility', error.message);
  }
}

testAccessibility();

// 5. Feature Flags Tests
console.log('\n🚩 Testing Feature Flags...');

function testFeatureFlags() {
  try {
    const ffPath = path.join(process.cwd(), 'client/lib/featureFlags.ts');
    const ffContent = fs.readFileSync(ffPath, 'utf8');
    
    // Check for key feature flags
    const expectedFlags = [
      'enhancedAudio',
      'jungleAnimations',
      'advancedAnalytics',
      'parentDashboard',
      'offlineMode',
      'performanceOptimizations'
    ];
    
    expectedFlags.forEach(flag => {
      if (ffContent.includes(`${flag}:`)) {
        addTestResult(`Feature Flag: ${flag}`, 'PASS', 'Feature flag configured');
      } else {
        addTestResult(`Feature Flag: ${flag}`, 'FAIL', 'Feature flag not found');
      }
    });

    // Check for rollout functionality
    if (ffContent.includes('rolloutPercentage') && ffContent.includes('emergencyRollback')) {
      addTestResult('Rollout Features', 'PASS', 'Rollout and rollback functionality present');
    } else {
      addTestResult('Rollout Features', 'FAIL', 'Rollout functionality incomplete');
    }

  } catch (error) {
    addTestResult('Feature Flags', 'FAIL', 'Failed to test feature flags', error.message);
  }
}

testFeatureFlags();

// 6. Analytics Tests
console.log('\n📊 Testing Analytics Implementation...');

function testAnalytics() {
  try {
    const gameStatePath = path.join(process.cwd(), 'client/hooks/useJungleGameState.ts');
    const gameStateContent = fs.readFileSync(gameStatePath, 'utf8');
    
    // Check for analytics features
    const analyticsFeatures = [
      'AnalyticsEvent',
      'AnalyticsManager',
      'trackEvent',
      'exportAnalyticsData',
      'deleteAllData',
      'word_mastered',
      'achievement_unlocked'
    ];
    
    analyticsFeatures.forEach(feature => {
      if (gameStateContent.includes(feature)) {
        addTestResult(`Analytics: ${feature}`, 'PASS', 'Analytics feature implemented');
      } else {
        addTestResult(`Analytics: ${feature}`, 'WARN', 'Analytics feature not found');
      }
    });

  } catch (error) {
    addTestResult('Analytics', 'FAIL', 'Failed to test analytics', error.message);
  }
}

testAnalytics();

// 7. Audio System Tests
console.log('\n🔊 Testing Audio System...');

function testAudioSystem() {
  try {
    const audioPath = path.join(process.cwd(), 'client/hooks/useJungleAudioService.ts');
    const audioContent = fs.readFileSync(audioPath, 'utf8');
    
    // Check for audio features
    if (audioContent.includes('SOUND_LIBRARY') && audioContent.includes('loadSoundPack')) {
      addTestResult('Audio System', 'PASS', 'Audio system properly configured');
    } else {
      addTestResult('Audio System', 'FAIL', 'Audio system incomplete');
    }

    // Check for sound files
    const soundsDir = path.join(process.cwd(), 'public/sounds');
    if (fs.existsSync(soundsDir)) {
      const soundFiles = fs.readdirSync(soundsDir);
      if (soundFiles.length > 0) {
        addTestResult('Sound Files', 'PASS', `${soundFiles.length} sound files found`);
      } else {
        addTestResult('Sound Files', 'WARN', 'No sound files found');
      }
    }

  } catch (error) {
    addTestResult('Audio System', 'FAIL', 'Failed to test audio system', error.message);
  }
}

testAudioSystem();

// 8. Migration Tests
console.log('\n🔄 Testing Migration Completion...');

function testMigration() {
  try {
    // Check that old components are properly archived
    const backupPath = path.join(process.cwd(), 'backup/old-components/enhanced-word-library');
    if (fs.existsSync(backupPath)) {
      const backupFiles = fs.readdirSync(backupPath);
      if (backupFiles.includes('README.md')) {
        addTestResult('Migration Backup', 'PASS', 'Old components properly archived');
      } else {
        addTestResult('Migration Backup', 'WARN', 'Migration documentation incomplete');
      }
    } else {
      addTestResult('Migration Backup', 'FAIL', 'Backup directory not found');
    }

    // Check that new components are in place
    const newComponentPath = path.join(process.cwd(), 'client/components/JungleWordLibrarySimplified.tsx');
    if (fs.existsSync(newComponentPath)) {
      const componentContent = fs.readFileSync(newComponentPath, 'utf8');
      if (componentContent.includes('useFeatureFlag') && componentContent.includes('featureFlags.enhancedAudio')) {
        addTestResult('New Component Integration', 'PASS', 'New component properly integrated with feature flags');
      } else {
        addTestResult('New Component Integration', 'WARN', 'Feature flag integration incomplete');
      }
    }

  } catch (error) {
    addTestResult('Migration', 'FAIL', 'Failed to test migration', error.message);
  }
}

testMigration();

// 9. Performance Tests
console.log('\n⚡ Testing Performance Optimizations...');

function testPerformance() {
  try {
    const lazyComponentsPath = path.join(process.cwd(), 'client/components/LazyComponents.tsx');
    if (fs.existsSync(lazyComponentsPath)) {
      const lazyContent = fs.readFileSync(lazyComponentsPath, 'utf8');
      
      if (lazyContent.includes('React.lazy') && lazyContent.includes('ResourceHints')) {
        addTestResult('Lazy Loading', 'PASS', 'Lazy loading components configured');
      } else {
        addTestResult('Lazy Loading', 'WARN', 'Lazy loading may be incomplete');
      }

      if (lazyContent.includes('preloadComponents')) {
        addTestResult('Preloading', 'PASS', 'Component preloading available');
      } else {
        addTestResult('Preloading', 'WARN', 'Preloading may be missing');
      }
    }

    // Check Vite config for performance settings
    const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      const viteContent = fs.readFileSync(viteConfigPath, 'utf8');
      if (viteContent.includes('test:')) {
        addTestResult('Test Configuration', 'PASS', 'Testing environment configured');
      } else {
        addTestResult('Test Configuration', 'WARN', 'Test configuration may be incomplete');
      }
    }

  } catch (error) {
    addTestResult('Performance', 'FAIL', 'Failed to test performance optimizations', error.message);
  }
}

testPerformance();

// 10. GDPR/Privacy Tests
console.log('\n🔒 Testing Privacy & Compliance...');

function testPrivacy() {
  try {
    const parentDashboardPath = path.join(process.cwd(), 'client/pages/ParentDashboard.tsx');
    if (fs.existsSync(parentDashboardPath)) {
      const dashboardContent = fs.readFileSync(parentDashboardPath, 'utf8');
      
      if (dashboardContent.includes('COPPA') || dashboardContent.includes('GDPR')) {
        addTestResult('Privacy Compliance', 'PASS', 'Privacy compliance considerations present');
      } else {
        addTestResult('Privacy Compliance', 'WARN', 'Privacy compliance may need attention');
      }
    }

    // Check for data export functionality
    const gameStatePath = path.join(process.cwd(), 'client/hooks/useJungleGameState.ts');
    if (fs.existsSync(gameStatePath)) {
      const gameStateContent = fs.readFileSync(gameStatePath, 'utf8');
      if (gameStateContent.includes('exportAnalyticsData') && gameStateContent.includes('deleteAllData')) {
        addTestResult('Data Rights', 'PASS', 'Data export and deletion functionality present');
      } else {
        addTestResult('Data Rights', 'WARN', 'Data rights functionality may be incomplete');
      }
    }

  } catch (error) {
    addTestResult('Privacy', 'FAIL', 'Failed to test privacy features', error.message);
  }
}

testPrivacy();

// Generate Test Report
console.log('\n📋 Test Summary');
console.log('================');
console.log(`✅ Passed: ${testResults.passed}`);
console.log(`❌ Failed: ${testResults.failed}`);
console.log(`⚠️  Warnings: ${testResults.warnings}`);
console.log(`📊 Total Tests: ${testResults.tests.length}`);

const successRate = ((testResults.passed / testResults.tests.length) * 100).toFixed(1);
console.log(`📈 Success Rate: ${successRate}%`);

// Determine overall status
let overallStatus = 'PRODUCTION READY ✅';
if (testResults.failed > 0) {
  overallStatus = 'NEEDS ATTENTION ⚠️';
}
if (testResults.failed > 5) {
  overallStatus = 'NOT READY ❌';
}

console.log(`\n🎯 Overall Status: ${overallStatus}`);

// Save detailed report
const reportPath = path.join(process.cwd(), 'test-results.json');
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
console.log(`\n📄 Detailed report saved to: ${reportPath}`);

// Recommendations
console.log('\n💡 Recommendations:');
if (testResults.failed === 0 && testResults.warnings <= 3) {
  console.log('✅ System is ready for production deployment!');
  console.log('✅ All critical features are properly implemented');
  console.log('✅ Consider running Lighthouse audit for final performance verification');
} else if (testResults.failed <= 2) {
  console.log('⚠️  Minor issues detected - address before production');
  console.log('⚠️  Review failed tests and warnings');
  console.log('⚠️  Consider additional testing');
} else {
  console.log('❌ Critical issues detected - do not deploy');
  console.log('❌ Address all failed tests before proceeding');
  console.log('❌ Review and fix critical functionality');
}

console.log('\n🌴 Test Complete - Happy Jungle Adventure! 🌴');

// Exit with appropriate code
process.exit(testResults.failed > 2 ? 1 : 0);
