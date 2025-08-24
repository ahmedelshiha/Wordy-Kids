#!/usr/bin/env node

/**
 * Asset Usage Analyzer
 * 
 * Scans the codebase to identify unused assets in the public directory
 * and suggests candidates for archival.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AssetAnalyzer {
  constructor() {
    this.publicDir = path.join(process.cwd(), 'public');
    this.clientDir = path.join(process.cwd(), 'client');
    this.unusedAssets = [];
    this.usedAssets = [];
    this.duplicateAssets = [];
  }

  async analyze() {
    console.log('🔍 Analyzing asset usage...');
    
    const assets = this.findAllAssets();
    console.log(`📊 Found ${assets.length} assets to analyze`);
    
    for (const asset of assets) {
      const isUsed = this.checkAssetUsage(asset);
      if (isUsed) {
        this.usedAssets.push(asset);
      } else {
        this.unusedAssets.push(asset);
      }
    }
    
    this.findDuplicateAssets(assets);
    this.generateReport();
  }

  findAllAssets() {
    const assets = [];
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico', '.mp3', '.wav', '.ogg'];
    
    function scanDir(dir, relativePath = '') {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativeFilePath = path.join(relativePath, entry);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath, relativeFilePath);
        } else if (extensions.some(ext => entry.toLowerCase().endsWith(ext))) {
          assets.push({
            name: entry,
            path: fullPath,
            relativePath: relativeFilePath,
            size: stat.size,
            ext: path.extname(entry).toLowerCase()
          });
        }
      }
    }
    
    scanDir(this.publicDir);
    return assets;
  }

  checkAssetUsage(asset) {
    try {
      // Check for references in client code
      const searchPatterns = [
        asset.name,
        asset.relativePath.replace(/\\/g, '/'),
        path.basename(asset.name, path.extname(asset.name))
      ];
      
      for (const pattern of searchPatterns) {
        try {
          const result = execSync(
            `grep -r "${pattern}" "${this.clientDir}" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" --include="*.css" --include="*.scss"`,
            { encoding: 'utf8', stdio: 'pipe' }
          );
          if (result.trim()) {
            return true;
          }
        } catch (error) {
          // grep returns non-zero when no matches found, which is expected
        }
      }
      
      return false;
    } catch (error) {
      console.warn(`⚠️ Could not check usage for ${asset.name}: ${error.message}`);
      return true; // Conservative: assume used if we can't check
    }
  }

  findDuplicateAssets(assets) {
    const groups = {};
    
    // Group by name (ignoring extension for potential format duplicates)
    for (const asset of assets) {
      const baseName = path.basename(asset.name, path.extname(asset.name));
      if (!groups[baseName]) {
        groups[baseName] = [];
      }
      groups[baseName].push(asset);
    }
    
    // Find groups with multiple assets
    for (const [baseName, assetGroup] of Object.entries(groups)) {
      if (assetGroup.length > 1) {
        this.duplicateAssets.push({
          baseName,
          assets: assetGroup,
          formats: assetGroup.map(a => a.ext).join(', ')
        });
      }
    }
  }

  generateReport() {
    console.log('\n📋 ASSET USAGE ANALYSIS REPORT');
    console.log('================================\n');
    
    console.log(`📊 Summary:`);
    console.log(`   - Total assets: ${this.usedAssets.length + this.unusedAssets.length}`);
    console.log(`   - Used assets: ${this.usedAssets.length}`);
    console.log(`   - Unused assets: ${this.unusedAssets.length}`);
    console.log(`   - Duplicate groups: ${this.duplicateAssets.length}\n`);
    
    if (this.unusedAssets.length > 0) {
      console.log('🗑️ UNUSED ASSETS (candidates for archival):');
      console.log('─'.repeat(50));
      this.unusedAssets.forEach(asset => {
        const sizeKB = Math.round(asset.size / 1024);
        console.log(`   ${asset.relativePath} (${sizeKB}KB)`);
      });
      console.log('');
    }
    
    if (this.duplicateAssets.length > 0) {
      console.log('👥 DUPLICATE ASSETS (consider consolidation):');
      console.log('─'.repeat(50));
      this.duplicateAssets.forEach(group => {
        console.log(`   ${group.baseName} (${group.formats}):`);
        group.assets.forEach(asset => {
          const sizeKB = Math.round(asset.size / 1024);
          const used = this.usedAssets.includes(asset) ? '✓' : '✗';
          console.log(`     ${used} ${asset.relativePath} (${sizeKB}KB)`);
        });
        console.log('');
      });
    }
    
    // Generate move commands for unused assets
    if (this.unusedAssets.length > 0) {
      console.log('📝 SUGGESTED CLEANUP COMMANDS:');
      console.log('─'.repeat(50));
      console.log('# Move unused assets to backup directory:');
      this.unusedAssets.forEach(asset => {
        const backupPath = `backup/unused-assets/${asset.relativePath}`;
        console.log(`mv "${asset.path}" "${backupPath}"`);
      });
      console.log('');
    }
    
    console.log('💡 RECOMMENDATIONS:');
    console.log('─'.repeat(50));
    console.log('1. Review unused assets list manually before removal');
    console.log('2. For duplicates, keep the most optimized format (prefer .webp > .png > .jpg)');
    console.log('3. Update references to use consistent asset naming');
    console.log('4. Consider converting PNG images to WebP for better compression');
    console.log('5. Run this analysis periodically to prevent asset bloat\n');
    
    this.saveReportToFile();
  }

  saveReportToFile() {
    const reportPath = path.join(process.cwd(), 'backup', 'asset-analysis-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalAssets: this.usedAssets.length + this.unusedAssets.length,
        usedAssets: this.usedAssets.length,
        unusedAssets: this.unusedAssets.length,
        duplicateGroups: this.duplicateAssets.length
      },
      unusedAssets: this.unusedAssets,
      duplicateAssets: this.duplicateAssets,
      usedAssets: this.usedAssets.map(a => ({ name: a.name, path: a.relativePath, size: a.size }))
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Detailed report saved to: ${reportPath}`);
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new AssetAnalyzer();
  analyzer.analyze().catch(error => {
    console.error('Asset analysis failed:', error);
    process.exit(1);
  });
}

module.exports = AssetAnalyzer;
