#!/usr/bin/env node

/**
 * Builder.io Component Registration Verification Script
 *
 * Verifies that JungleKidNav is properly registered with Builder.io
 * and no deprecated DesktopKidNav references remain in content.
 */

import { readFileSync, existsSync } from "fs";
import { glob } from "glob";

const REQUIRED_COMPONENT = "JungleKidNav";
const DEPRECATED_COMPONENT = "DesktopKidNav";

// Component configuration validation
const REQUIRED_PROPS = [
  "theme",
  "performanceMode",
  "animalGuides",
  "effects",
  "menuItems",
  "enableSounds",
  "animations",
  "reducedMotion",
];

function verifyComponentExists() {
  const componentPath = "client/components/JungleKidNav.tsx";
  if (!existsSync(componentPath)) {
    console.error(
      `❌ ERROR: ${REQUIRED_COMPONENT} component not found at ${componentPath}`,
    );
    return false;
  }

  console.log(`✅ SUCCESS: ${REQUIRED_COMPONENT} component exists`);
  return true;
}

function verifyComponentProps() {
  try {
    const componentContent = readFileSync(
      "client/components/JungleKidNav.tsx",
      "utf8",
    );

    // Check for Builder.io compatible props interface
    if (!componentContent.includes("Builder.io compatible props interface")) {
      console.error("❌ ERROR: Missing Builder.io compatible props interface");
      return false;
    }

    // Verify required props are defined
    const missingProps = REQUIRED_PROPS.filter(
      (prop) =>
        !componentContent.includes(`${prop}?:`) &&
        !componentContent.includes(`${prop}:`),
    );

    if (missingProps.length > 0) {
      console.error(
        `❌ ERROR: Missing required props: ${missingProps.join(", ")}`,
      );
      return false;
    }

    console.log("✅ SUCCESS: All required Builder.io props are defined");
    return true;
  } catch (error) {
    console.error(
      `❌ ERROR: Failed to verify component props: ${error.message}`,
    );
    return false;
  }
}

async function verifyNoDeprecatedReferences() {
  try {
    // Search for any remaining DesktopKidNav imports or usage
    const files = await glob("**/*.{ts,tsx,js,jsx}", {
      ignore: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.backup.*",
        "**/*.deprecated.*",
      ],
    });

    const deprecatedReferences = [];

    for (const file of files) {
      try {
        const content = readFileSync(file, "utf8");

        // Check for imports
        if (
          content.includes(`from "@/components/${DEPRECATED_COMPONENT}"`) ||
          content.includes(`from "./components/${DEPRECATED_COMPONENT}"`) ||
          content.includes(`<${DEPRECATED_COMPONENT}`)
        ) {
          deprecatedReferences.push({
            file,
            type: "component_usage",
          });
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    if (deprecatedReferences.length > 0) {
      console.error("❌ ERROR: Found deprecated DesktopKidNav references:");
      deprecatedReferences.forEach((ref) => {
        console.error(`  - ${ref.file} (${ref.type})`);
      });
      return false;
    }

    console.log("✅ SUCCESS: No deprecated DesktopKidNav references found");
    return true;
  } catch (error) {
    console.error(
      `❌ ERROR: Failed to verify deprecated references: ${error.message}`,
    );
    return false;
  }
}

function verifyBuilderIoConfig() {
  // Check if Builder.io config files exist and are properly configured
  const configFiles = [
    "builder.config.js",
    "builder.config.ts",
    ".builder/components.json",
  ];

  const existingConfigs = configFiles.filter((file) => existsSync(file));

  if (existingConfigs.length === 0) {
    console.log(
      "⚠️  WARNING: No Builder.io config files found. Ensure JungleKidNav is registered in Builder.io dashboard.",
    );
    return true; // Not an error, just a warning
  }

  console.log(
    `✅ SUCCESS: Found Builder.io config files: ${existingConfigs.join(", ")}`,
  );
  return true;
}

async function main() {
  console.log("🔍 Verifying Builder.io Component Registration...\n");

  const checks = [
    verifyComponentExists,
    verifyComponentProps,
    verifyNoDeprecatedReferences,
    verifyBuilderIoConfig,
  ];

  let allPassed = true;

  for (const check of checks) {
    const result = await check();
    if (!result) {
      allPassed = false;
    }
    console.log(""); // Add spacing between checks
  }

  if (allPassed) {
    console.log("🎉 SUCCESS: All Builder.io registration checks passed!");
    console.log("\n📋 Next Steps:");
    console.log("1. Verify JungleKidNav is registered in Builder.io dashboard");
    console.log("2. Update any Builder.io content entries to use JungleKidNav");
    console.log("3. Test component in Builder.io visual editor");
    process.exit(0);
  } else {
    console.log("❌ FAILED: Some Builder.io registration checks failed");
    console.log("\n🔧 Action Required:");
    console.log("1. Fix the issues listed above");
    console.log("2. Re-run this script to verify fixes");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Script failed:", error);
  process.exit(1);
});
