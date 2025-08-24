#!/usr/bin/env node

/**
 * Dependency Analyzer
 *
 * Analyzes package.json dependencies to identify unused packages
 * that can be safely removed.
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class DependencyAnalyzer {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), "package.json");
    this.clientDir = path.join(process.cwd(), "client");
    this.serverDir = path.join(process.cwd(), "server");
    this.unusedDeps = [];
    this.usedDeps = [];
    this.devOnlyInProd = [];
  }

  async analyze() {
    console.log("📦 Analyzing package dependencies...");

    const packageJson = JSON.parse(
      fs.readFileSync(this.packageJsonPath, "utf8"),
    );
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    console.log(
      `📊 Found ${Object.keys(dependencies).length} total dependencies`,
    );

    for (const [depName, version] of Object.entries(dependencies)) {
      if (this.isBuiltInOrExcluded(depName)) {
        continue;
      }

      const usage = this.checkDependencyUsage(depName);
      if (usage.used) {
        this.usedDeps.push({ name: depName, version, ...usage });
      } else {
        this.unusedDeps.push({ name: depName, version });
      }
    }

    this.analyzeDevVsProdUsage(packageJson);
    this.generateReport();
  }

  isBuiltInOrExcluded(depName) {
    // Exclude certain packages that are hard to detect automatically
    const excluded = [
      "react",
      "react-dom", // Core React
      "vite",
      "typescript",
      "vitest", // Build tools
      "@types/", // Type definitions
      "tailwindcss",
      "postcss",
      "autoprefixer", // CSS processing
      "eslint",
      "prettier", // Linting tools
    ];

    return excluded.some(
      (pattern) =>
        depName.startsWith(pattern) || depName === pattern.replace("/", ""),
    );
  }

  checkDependencyUsage(depName) {
    try {
      const searchDirs = [this.clientDir, this.serverDir];
      let foundInClient = false;
      let foundInServer = false;
      let importCount = 0;

      for (const dir of searchDirs) {
        if (!fs.existsSync(dir)) continue;

        try {
          // Search for direct imports
          const directImport = execSync(
            `grep -r "from ['\"\\"]${depName}['\"\\'"]" "${dir}" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" 2>/dev/null || true`,
            { encoding: "utf8" },
          );

          // Search for require statements
          const requireImport = execSync(
            `grep -r "require(['\"\\'"]${depName}['\"\\'"])" "${dir}" --include="*.tsx" --include="*.ts" --include="*.js" --include="*.jsx" 2>/dev/null || true`,
            { encoding: "utf8" },
          );

          const found = directImport.trim() || requireImport.trim();
          if (found) {
            importCount += found
              .split("\n")
              .filter((line) => line.trim()).length;
            if (dir === this.clientDir) foundInClient = true;
            if (dir === this.serverDir) foundInServer = true;
          }
        } catch (error) {
          // Ignore grep errors
        }
      }

      return {
        used: foundInClient || foundInServer,
        foundInClient,
        foundInServer,
        importCount,
      };
    } catch (error) {
      console.warn(`⚠️ Could not check usage for ${depName}: ${error.message}`);
      return {
        used: true,
        foundInClient: true,
        foundInServer: false,
        importCount: 0,
      };
    }
  }

  analyzeDevVsProdUsage(packageJson) {
    // Check if dev dependencies are used in production code
    const devDeps = Object.keys(packageJson.devDependencies || {});

    for (const usedDep of this.usedDeps) {
      if (devDeps.includes(usedDep.name) && usedDep.foundInClient) {
        // Dev dependency used in client code might need to be moved to dependencies
        this.devOnlyInProd.push(usedDep);
      }
    }
  }

  generateReport() {
    console.log("\n📋 DEPENDENCY ANALYSIS REPORT");
    console.log("==============================\n");

    console.log(`📊 Summary:`);
    console.log(
      `   - Total dependencies analyzed: ${this.usedDeps.length + this.unusedDeps.length}`,
    );
    console.log(`   - Used dependencies: ${this.usedDeps.length}`);
    console.log(`   - Unused dependencies: ${this.unusedDeps.length}`);
    console.log(`   - Dev deps in production: ${this.devOnlyInProd.length}\n`);

    if (this.unusedDeps.length > 0) {
      console.log("🗑️ UNUSED DEPENDENCIES (safe to remove):");
      console.log("─".repeat(50));
      this.unusedDeps.forEach((dep) => {
        console.log(`   ${dep.name}@${dep.version}`);
      });
      console.log("");

      console.log("📝 REMOVAL COMMANDS:");
      console.log("─".repeat(20));
      const depNames = this.unusedDeps.map((d) => d.name).join(" ");
      console.log(`npm uninstall ${depNames}`);
      console.log("");
    }

    if (this.devOnlyInProd.length > 0) {
      console.log("⚠️ DEV DEPENDENCIES USED IN PRODUCTION:");
      console.log("─".repeat(50));
      this.devOnlyInProd.forEach((dep) => {
        console.log(`   ${dep.name} (${dep.importCount} imports)`);
      });
      console.log("");
      console.log(
        "💡 Consider moving these to dependencies if they're needed at runtime",
      );
      console.log("");
    }

    console.log("✅ WELL-USED DEPENDENCIES:");
    console.log("─".repeat(30));
    this.usedDeps
      .filter((d) => !this.devOnlyInProd.includes(d))
      .sort((a, b) => b.importCount - a.importCount)
      .slice(0, 10)
      .forEach((dep) => {
        const location =
          dep.foundInClient && dep.foundInServer
            ? "client+server"
            : dep.foundInClient
              ? "client"
              : "server";
        console.log(`   ${dep.name} (${dep.importCount} imports, ${location})`);
      });
    console.log("");

    console.log("💡 RECOMMENDATIONS:");
    console.log("─".repeat(20));
    console.log("1. Review unused dependencies list before removal");
    console.log(
      "2. Check if any unused deps are used indirectly (peer dependencies)",
    );
    console.log("3. Consider tree-shaking for large libraries");
    console.log("4. Move dev dependencies used in production to dependencies");
    console.log("5. Run this analysis after major feature changes\n");

    this.saveReportToFile();
  }

  saveReportToFile() {
    const reportPath = path.join(
      process.cwd(),
      "backup",
      "dependency-analysis-report.json",
    );
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDependencies: this.usedDeps.length + this.unusedDeps.length,
        usedDependencies: this.usedDeps.length,
        unusedDependencies: this.unusedDeps.length,
        devDepsInProduction: this.devOnlyInProd.length,
      },
      unusedDependencies: this.unusedDeps,
      devDepsInProduction: this.devOnlyInProd,
      usedDependencies: this.usedDeps.map((d) => ({
        name: d.name,
        version: d.version,
        importCount: d.importCount,
        foundInClient: d.foundInClient,
        foundInServer: d.foundInServer,
      })),
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Detailed report saved to: ${reportPath}`);
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new DependencyAnalyzer();
  analyzer.analyze().catch((error) => {
    console.error("Dependency analysis failed:", error);
    process.exit(1);
  });
}

module.exports = DependencyAnalyzer;
