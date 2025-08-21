#!/usr/bin/env node

/**
 * Check for Map naming conflicts in the codebase
 * This script prevents bare "Map" imports from lucide-react and checks for naming conflicts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Patterns to check for
const conflictPatterns = [
  {
    pattern: /import\s*{[^}]*\bMap\b[^}]*}\s*from\s*['"]lucide-react['"]/,
    message:
      'Found bare "Map" import from lucide-react. Use "Map as MapIcon" instead.',
    severity: "error",
  },
  {
    pattern: /const\s+Map\s*=/,
    message: 'Found variable declaration using reserved name "Map".',
    severity: "error",
  },
  {
    pattern: /let\s+Map\s*=/,
    message: 'Found variable declaration using reserved name "Map".',
    severity: "error",
  },
  {
    pattern: /var\s+Map\s*=/,
    message: 'Found variable declaration using reserved name "Map".',
    severity: "error",
  },
  {
    pattern: /function\s+Map\s*\(/,
    message: 'Found function declaration using reserved name "Map".',
    severity: "error",
  },
  {
    pattern: /class\s+Map\s*/,
    message: 'Found class declaration using reserved name "Map".',
    severity: "error",
  },
];

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith(".") && !file.includes("node_modules")) {
        walkDir(filePath, fileList);
      }
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const issues = [];

    lines.forEach((line, index) => {
      conflictPatterns.forEach(({ pattern, message, severity }) => {
        if (pattern.test(line)) {
          issues.push({
            line: index + 1,
            content: line.trim(),
            message,
            severity,
          });
        }
      });
    });

    return issues;
  } catch (error) {
    log(colors.red, `Error reading file ${filePath}: ${error.message}`);
    return [];
  }
}

function main() {
  log(colors.blue, "🔍 Checking for Map naming conflicts...\n");

  // Get project root (one level up from scripts dir)
  const projectRoot = path.resolve(__dirname, "..");

  // Find all TypeScript/JavaScript files
  const dirsToCheck = ["client", "server", "shared"].map((dir) =>
    path.join(projectRoot, dir),
  );
  let allFiles = [];

  dirsToCheck.forEach((dir) => {
    if (fs.existsSync(dir)) {
      allFiles = allFiles.concat(walkDir(dir));
    }
  });

  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;

  allFiles.forEach((file) => {
    const issues = checkFile(file);

    if (issues.length > 0) {
      // Make path relative to project root for cleaner display
      const relativePath = path.relative(projectRoot, file);
      log(colors.yellow, `📄 ${relativePath}:`);

      issues.forEach((issue) => {
        const color = issue.severity === "error" ? colors.red : colors.yellow;
        const prefix = issue.severity === "error" ? "❌" : "⚠️";

        log(color, `  ${prefix} Line ${issue.line}: ${issue.message}`);
        log(colors.reset, `     ${issue.content}`);

        if (issue.severity === "error") {
          errorCount++;
        } else {
          warningCount++;
        }
        totalIssues++;
      });

      console.log("");
    }
  });

  // Summary
  if (totalIssues === 0) {
    log(colors.green, "✅ No Map naming conflicts found!");
    process.exit(0);
  } else {
    log(colors.blue, "📊 Summary:");
    log(colors.red, `   Errors: ${errorCount}`);
    log(colors.yellow, `   Warnings: ${warningCount}`);
    log(colors.blue, `   Total: ${totalIssues}\n`);

    if (errorCount > 0) {
      log(colors.red, "❌ Found critical naming conflicts that must be fixed.");
      log(colors.blue, "💡 Quick fixes:");
      log(colors.reset, '   • Replace: import { Map } from "lucide-react"');
      log(
        colors.reset,
        '   • With:    import { Map as MapIcon } from "lucide-react"',
      );
      log(
        colors.reset,
        "   • Use descriptive names for maps: JungleMap, QuestMap, etc.\n",
      );

      process.exit(1);
    } else {
      log(colors.yellow, "⚠️  Found warnings but no critical errors.");
      process.exit(0);
    }
  }
}

// Check if running as a git hook
if (process.argv.includes("--git-hook")) {
  log(colors.blue, "🔗 Running as git pre-commit hook...");
}

main();
