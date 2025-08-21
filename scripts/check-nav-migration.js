#!/usr/bin/env node

/**
 * Navigation Migration Safeguard Script
 *
 * Prevents regression to deprecated DesktopKidNav component.
 * Run this script in CI/CD pipeline or before merging to ensure
 * no one accidentally re-introduces the deprecated component.
 */

import { readFileSync, existsSync } from "fs";
import { glob } from "glob";

const DEPRECATED_COMPONENT = "DesktopKidNav";
const REQUIRED_COMPONENT = "JungleKidNav";

// Files that are allowed to contain DesktopKidNav references (backup/documentation)
const ALLOWED_FILES = [
  "JUNGLE_KIDNAV_MIGRATION_SUMMARY.md",
  "ACHIEVEMENTS_SYSTEM_INTEGRATION_REPORT.md",
  "LEGACY_SYSTEM_RETIREMENT_SUMMARY.md",
  "client/pages/AchievementsSystemMap.tsx",
  "client/components/DesktopKidNav.deprecated.tsx",
  "client/components/DesktopKidNav.backup.tsx",
  "JUNGLE_ADVENTURE_NAV_ENHANCEMENT_SUMMARY.md",
  "ENHANCED_JUNGLE_ACHIEVEMENTS_INTEGRATION_REPORT.md",
  "scripts/check-nav-migration.js",
];

async function checkForDeprecatedImports() {
  console.log("🔍 Checking for deprecated DesktopKidNav imports...");

  try {
    const files = await glob("**/*.{ts,tsx,js,jsx}", {
      ignore: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    });

    const violations = [];

    for (const file of files) {
      // Skip allowed files
      if (ALLOWED_FILES.some((allowed) => file.includes(allowed))) {
        continue;
      }

      try {
        const content = readFileSync(file, "utf8");

        // Check for DesktopKidNav imports
        const importPatterns = [
          /import\s+.*DesktopKidNav.*from/g,
          /from\s+['"`].*DesktopKidNav/g,
          /<DesktopKidNav/g,
          /DesktopKidNav\s*\(/g,
        ];

        for (const pattern of importPatterns) {
          const matches = content.match(pattern);
          if (matches) {
            violations.push({
              file,
              matches: matches,
              type: "deprecated_usage",
            });
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return violations;
  } catch (error) {
    console.error(`❌ ERROR: Failed to check imports: ${error.message}`);
    return [];
  }
}

async function checkForMissingJungleNav() {
  console.log("🔍 Checking that JungleKidNav is properly used...");

  try {
    const indexFile = "client/pages/Index.tsx";
    if (!existsSync(indexFile)) {
      return [
        {
          file: indexFile,
          type: "missing_file",
          message: "Main Index.tsx file not found",
        },
      ];
    }

    const content = readFileSync(indexFile, "utf8");

    // Check that JungleKidNav is imported and used
    if (!content.includes("JungleKidNav")) {
      return [
        {
          file: indexFile,
          type: "missing_component",
          message: "JungleKidNav not found in main Index.tsx",
        },
      ];
    }

    return [];
  } catch (error) {
    console.error(
      `❌ ERROR: Failed to check JungleKidNav usage: ${error.message}`,
    );
    return [];
  }
}

function checkDeprecatedFiles() {
  console.log("🔍 Checking for improperly named deprecated files...");

  const violations = [];

  // These files should only exist as .backup.tsx or .deprecated.tsx
  const deprecatedPaths = [
    "client/components/DesktopKidNav.tsx",
    "components/DesktopKidNav.tsx",
  ];

  for (const path of deprecatedPaths) {
    if (existsSync(path)) {
      violations.push({
        file: path,
        type: "improper_file",
        message:
          "DesktopKidNav.tsx should not exist (should be .backup.tsx or .deprecated.tsx only)",
      });
    }
  }

  return violations;
}

function printViolations(violations, title) {
  if (violations.length === 0) {
    console.log(`✅ ${title}: No issues found`);
    return false;
  }

  console.log(`❌ ${title}: Found ${violations.length} issue(s):`);
  violations.forEach((violation, index) => {
    console.log(`\n  ${index + 1}. ${violation.file}`);
    if (violation.matches) {
      violation.matches.forEach((match) => {
        console.log(`     → ${match.trim()}`);
      });
    }
    if (violation.message) {
      console.log(`     → ${violation.message}`);
    }
  });
  console.log("");

  return true;
}

async function main() {
  console.log("🛡️  Navigation Migration Safeguard Check\n");
  console.log(
    "This script ensures no deprecated DesktopKidNav usage exists.\n",
  );

  const [importViolations, missingJungleNav, deprecatedFiles] =
    await Promise.all([
      checkForDeprecatedImports(),
      checkForMissingJungleNav(),
      checkDeprecatedFiles(),
    ]);

  let hasViolations = false;

  hasViolations |= printViolations(importViolations, "Deprecated Import Check");
  hasViolations |= printViolations(
    missingJungleNav,
    "JungleKidNav Usage Check",
  );
  hasViolations |= printViolations(deprecatedFiles, "Deprecated File Check");

  if (hasViolations) {
    console.log("❌ MIGRATION SAFEGUARD FAILED");
    console.log("\n🔧 Required Actions:");
    console.log("1. Remove all DesktopKidNav imports and usage");
    console.log("2. Replace with JungleKidNav component");
    console.log(
      "3. Ensure deprecated files are properly named (.backup.tsx or .deprecated.tsx)",
    );
    console.log("4. Re-run this script to verify fixes\n");
    console.log("📖 Migration Guide: See JUNGLE_KIDNAV_MIGRATION_SUMMARY.md");
    process.exit(1);
  } else {
    console.log("🎉 MIGRATION SAFEGUARD PASSED");
    console.log("\n✅ All checks successful:");
    console.log("- No deprecated DesktopKidNav usage found");
    console.log("- JungleKidNav is properly implemented");
    console.log("- File structure is correct");
    console.log("\n🚀 Safe to merge/deploy!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("💥 Safeguard script failed:", error);
  process.exit(1);
});
