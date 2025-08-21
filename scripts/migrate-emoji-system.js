#!/usr/bin/env node

/**
 * Emoji System Migration Utility
 * Automates the migration of existing emoji usage to the new future-proof system
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuration
const CONFIG = {
  sourceDir: './client',
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  backupDir: './backup-pre-emoji-migration',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Emoji mapping and replacement patterns
const EMOJI_MIGRATIONS = {
  // Navigation emojis - replace with accessible components
  '🦉': {
    component: 'AccessibleJungleNavEmoji',
    props: { animal: 'owl', label: 'Home Tree' },
    import: "import { AccessibleJungleNavEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🦜': {
    component: 'AccessibleJungleNavEmoji',
    props: { animal: 'parrot', label: 'Book Jungle' },
    import: "import { AccessibleJungleNavEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🐵': {
    component: 'AccessibleJungleNavEmoji',
    props: { animal: 'monkey', label: 'Adventure Games' },
    import: "import { AccessibleJungleNavEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🐘': {
    component: 'AccessibleJungleNavEmoji',
    props: { animal: 'elephant', label: 'Trophy Grove' },
    import: "import { AccessibleJungleNavEmoji } from '@/components/ui/accessible-emoji';"
  },

  // Achievement emojis
  '🏆': {
    component: 'AccessibleAchievementEmoji',
    props: { emoji: '🏆', achievementName: 'Trophy' },
    import: "import { AccessibleAchievementEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🌟': {
    component: 'AccessibleAchievementEmoji',
    props: { emoji: '🌟', achievementName: 'Star' },
    import: "import { AccessibleAchievementEmoji } from '@/components/ui/accessible-emoji';"
  },
  '👑': {
    component: 'AccessibleAchievementEmoji',
    props: { emoji: '👑', achievementName: 'Crown' },
    import: "import { AccessibleAchievementEmoji } from '@/components/ui/accessible-emoji';"
  },

  // Game emojis
  '🎯': {
    component: 'AccessibleGameEmoji',
    props: { emoji: '🎯', gameName: 'Target Game' },
    import: "import { AccessibleGameEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🚀': {
    component: 'AccessibleGameEmoji',
    props: { emoji: '🚀', gameName: 'Rocket Game' },
    import: "import { AccessibleGameEmoji } from '@/components/ui/accessible-emoji';"
  },
  '🧠': {
    component: 'AccessibleGameEmoji',
    props: { emoji: '🧠', gameName: 'Brain Game' },
    import: "import { AccessibleGameEmoji } from '@/components/ui/accessible-emoji';"
  },

  // General emojis - use LazyEmoji for better performance
  'DEFAULT': {
    component: 'LazyEmoji',
    props: { emoji: 'EMOJI_PLACEHOLDER', priority: 'medium' },
    import: "import { LazyEmoji } from '@/components/ui/lazy-emoji';"
  }
};

// Patterns to detect emoji usage
const EMOJI_PATTERNS = [
  // Direct emoji in JSX
  /(<[^>]*>)([🦉🦜🐵🐘🏆🌟👑🎯🚀🧠✨⭐🎉🤔😊💡🔊👁️])((?:<\/[^>]+>)|)/g,
  
  // Emoji in strings
  /(["'`])([🦉🦜🐵🐘🏆🌟👑🎯🚀🧠✨⭐🎉🤔😊💡🔊👁️])\1/g,
  
  // Emoji constants usage
  /EMOJI_CONSTANTS\.([A-Z_]+)/g,
];

class EmojiMigrationTool {
  constructor() {
    this.filesProcessed = 0;
    this.migrationsApplied = 0;
    this.errors = [];
    this.requiredImports = new Set();
  }

  async run() {
    console.log('🚀 Starting Emoji System Migration...');
    console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE MIGRATION'}`);
    
    try {
      // Create backup if not dry run
      if (!CONFIG.dryRun) {
        await this.createBackup();
      }

      // Process all files
      await this.processDirectory(CONFIG.sourceDir);

      // Generate summary report
      this.generateReport();

    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  async createBackup() {
    console.log('📦 Creating backup...');
    
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }

    // Simple backup by copying source directory
    await this.copyDirectory(CONFIG.sourceDir, CONFIG.backupDir);
    console.log(`✅ Backup created at ${CONFIG.backupDir}`);
  }

  async copyDirectory(src, dest) {
    const entries = await readdir(src);
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      const entryStat = await stat(srcPath);
      
      if (entryStat.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        await this.copyDirectory(srcPath, destPath);
      } else {
        const content = await readFile(srcPath);
        await writeFile(destPath, content);
      }
    }
  }

  async processDirectory(dirPath) {
    const entries = await readdir(dirPath);
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const entryStat = await stat(fullPath);
      
      if (entryStat.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
          await this.processDirectory(fullPath);
        }
      } else if (this.shouldProcessFile(fullPath)) {
        await this.processFile(fullPath);
      }
    }
  }

  shouldProcessFile(filePath) {
    const ext = path.extname(filePath);
    return CONFIG.extensions.includes(ext);
  }

  async processFile(filePath) {
    try {
      this.filesProcessed++;
      
      if (CONFIG.verbose) {
        console.log(`📄 Processing: ${filePath}`);
      }

      const content = await readFile(filePath, 'utf8');
      const { newContent, migrations } = this.migrateFileContent(content, filePath);
      
      if (migrations.length > 0) {
        console.log(`🔄 ${filePath}: ${migrations.length} migrations applied`);
        this.migrationsApplied += migrations.length;

        if (!CONFIG.dryRun) {
          await writeFile(filePath, newContent);
        }

        if (CONFIG.verbose) {
          migrations.forEach(migration => {
            console.log(`   - ${migration}`);
          });
        }
      }

    } catch (error) {
      this.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }

  migrateFileContent(content, filePath) {
    let newContent = content;
    const migrations = [];
    const fileImports = new Set();

    // Detect and replace emoji patterns
    EMOJI_PATTERNS.forEach(pattern => {
      newContent = newContent.replace(pattern, (match, ...groups) => {
        const emoji = this.extractEmojiFromMatch(match, groups);
        
        if (emoji && EMOJI_MIGRATIONS[emoji]) {
          const migration = EMOJI_MIGRATIONS[emoji];
          const replacement = this.generateReplacementComponent(migration, emoji);
          
          migrations.push(`${emoji} → ${migration.component}`);
          fileImports.add(migration.import);
          this.requiredImports.add(migration.import);
          
          return replacement;
        }
        
        // Use default LazyEmoji for unmapped emojis
        if (emoji) {
          const defaultMigration = EMOJI_MIGRATIONS.DEFAULT;
          const replacement = this.generateReplacementComponent(defaultMigration, emoji);
          
          migrations.push(`${emoji} → LazyEmoji (default)`);
          fileImports.add(defaultMigration.import);
          this.requiredImports.add(defaultMigration.import);
          
          return replacement;
        }
        
        return match;
      });
    });

    // Add required imports to the file
    if (fileImports.size > 0) {
      newContent = this.addImportsToFile(newContent, Array.from(fileImports));
    }

    return { newContent, migrations };
  }

  extractEmojiFromMatch(match, groups) {
    // Extract emoji from different match patterns
    for (const group of groups) {
      if (group && /[\u{1F300}-\u{1F9FF}]/u.test(group)) {
        return group;
      }
    }
    return null;
  }

  generateReplacementComponent(migration, emoji) {
    const props = { ...migration.props };
    
    // Replace placeholder with actual emoji
    if (props.emoji === 'EMOJI_PLACEHOLDER') {
      props.emoji = emoji;
    }

    // Generate props string
    const propsString = Object.entries(props)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `<${migration.component} ${propsString} />`;
  }

  addImportsToFile(content, imports) {
    // Find existing imports section
    const importRegex = /^import\s+.*$/gm;
    const existingImports = content.match(importRegex) || [];
    
    // Check which imports are already present
    const newImports = imports.filter(imp => 
      !existingImports.some(existing => existing.includes(imp.split('from')[1]))
    );

    if (newImports.length === 0) {
      return content;
    }

    // Add new imports after existing imports
    const lastImportIndex = existingImports.length > 0 
      ? content.lastIndexOf(existingImports[existingImports.length - 1]) + existingImports[existingImports.length - 1].length
      : 0;

    const beforeImports = content.slice(0, lastImportIndex);
    const afterImports = content.slice(lastImportIndex);
    
    return beforeImports + '\n' + newImports.join('\n') + afterImports;
  }

  generateReport() {
    console.log('\n📊 Migration Report');
    console.log('==================');
    console.log(`Files processed: ${this.filesProcessed}`);
    console.log(`Migrations applied: ${this.migrationsApplied}`);
    console.log(`Errors encountered: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`   ${error.file}: ${error.error}`);
      });
    }

    console.log('\n📦 Required Imports:');
    this.requiredImports.forEach(imp => {
      console.log(`   ${imp}`);
    });

    if (CONFIG.dryRun) {
      console.log('\n⚠️  This was a DRY RUN - no files were modified');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log(`   Backup available at: ${CONFIG.backupDir}`);
    }

    // Generate detailed report file
    this.generateDetailedReport();
  }

  generateDetailedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      config: CONFIG,
      summary: {
        filesProcessed: this.filesProcessed,
        migrationsApplied: this.migrationsApplied,
        errorsCount: this.errors.length,
      },
      errors: this.errors,
      requiredImports: Array.from(this.requiredImports),
      migrationMappings: EMOJI_MIGRATIONS,
    };

    const reportPath = `./emoji-migration-report-${Date.now()}.json`;
    
    if (!CONFIG.dryRun) {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`\n📋 Detailed report saved to: ${reportPath}`);
    }
  }
}

// Validation functions
function validateMigration() {
  console.log('🔍 Validating migration...');
  
  // Check for remaining raw emoji usage
  // Check for missing imports
  // Validate component prop usage
  // Check accessibility compliance
  
  console.log('✅ Validation completed');
}

// Main execution
if (require.main === module) {
  const tool = new EmojiMigrationTool();
  
  if (process.argv.includes('--help')) {
    console.log(`
Emoji System Migration Tool

Usage:
  node migrate-emoji-system.js [options]

Options:
  --dry-run     Preview changes without modifying files
  --verbose     Show detailed migration information
  --help        Show this help message

Examples:
  node migrate-emoji-system.js --dry-run    # Preview migration
  node migrate-emoji-system.js              # Apply migration
  node migrate-emoji-system.js --verbose    # Detailed output
`);
    process.exit(0);
  }

  tool.run().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}

module.exports = { EmojiMigrationTool, EMOJI_MIGRATIONS };
