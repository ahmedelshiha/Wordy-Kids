/**
 * Bundle Analysis and Optimization Utilities
 * Tools for analyzing bundle size, dependencies, and optimization opportunities
 */

interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  dependencies: DependencyInfo[];
  duplicates: DuplicateInfo[];
  unusedExports: UnusedExportInfo[];
}

interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  files: string[];
  modules: ModuleInfo[];
  isEntry: boolean;
  isInitial: boolean;
}

interface ModuleInfo {
  name: string;
  size: number;
  chunks: string[];
  reasons: string[];
  depth: number;
}

interface DependencyInfo {
  name: string;
  version: string;
  size: number;
  modules: string[];
  usage: "full" | "partial" | "unused";
}

interface DuplicateInfo {
  module: string;
  chunks: string[];
  instances: number;
  wastedBytes: number;
}

interface UnusedExportInfo {
  module: string;
  exports: string[];
  potentialSavings: number;
}

class BundleAnalyzer {
  private static instance: BundleAnalyzer;
  private stats: BundleStats | null = null;
  private isAnalyzing = false;

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  // Analyze current bundle in runtime
  async analyzeCurrentBundle(): Promise<BundleStats> {
    if (this.isAnalyzing) {
      console.warn("Bundle analysis already in progress");
      return this.stats || this.getEmptyStats();
    }

    this.isAnalyzing = true;

    try {
      const stats = await this.performAnalysis();
      this.stats = stats;
      console.log("Bundle analysis complete:", stats);
      return stats;
    } finally {
      this.isAnalyzing = false;
    }
  }

  // Perform the actual analysis
  private async performAnalysis(): Promise<BundleStats> {
    const chunks = await this.analyzeChunks();
    const dependencies = await this.analyzeDependencies();
    const duplicates = await this.findDuplicates();
    const unusedExports = await this.findUnusedExports();

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const gzippedSize = chunks.reduce(
      (sum, chunk) => sum + chunk.gzippedSize,
      0,
    );

    return {
      totalSize,
      gzippedSize,
      chunks,
      dependencies,
      duplicates,
      unusedExports,
    };
  }

  // Analyze webpack chunks from network tab
  private async analyzeChunks(): Promise<ChunkInfo[]> {
    const chunks: ChunkInfo[] = [];

    try {
      // Get resource timing information
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];
      const jsResources = resources.filter((r) => r.name.includes(".js"));

      for (const resource of jsResources) {
        const chunkName = this.extractChunkName(resource.name);
        const isEntry =
          resource.name.includes("main") || resource.name.includes("index");

        chunks.push({
          name: chunkName,
          size: resource.transferSize || 0,
          gzippedSize: resource.encodedBodySize || 0,
          files: [resource.name],
          modules: [], // Would need build stats for this
          isEntry,
          isInitial: isEntry,
        });
      }

      // Add CSS chunks
      const cssResources = resources.filter((r) => r.name.includes(".css"));
      for (const resource of cssResources) {
        const chunkName = this.extractChunkName(resource.name) + ".css";
        chunks.push({
          name: chunkName,
          size: resource.transferSize || 0,
          gzippedSize: resource.encodedBodySize || 0,
          files: [resource.name],
          modules: [],
          isEntry: false,
          isInitial: true,
        });
      }
    } catch (error) {
      console.warn("Failed to analyze chunks from performance data:", error);
    }

    return chunks;
  }

  // Analyze dependencies from package.json (if accessible)
  private async analyzeDependencies(): Promise<DependencyInfo[]> {
    const dependencies: DependencyInfo[] = [];

    try {
      // Try to fetch package.json if accessible
      const response = await fetch("/package.json");
      if (response.ok) {
        const packageJson = await response.json();
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };

        for (const [name, version] of Object.entries(deps)) {
          dependencies.push({
            name,
            version: version as string,
            size: 0, // Would need bundle stats for actual size
            modules: [],
            usage: "full", // Default, would need static analysis
          });
        }
      }
    } catch (error) {
      console.warn("Could not analyze dependencies:", error);
    }

    return dependencies;
  }

  // Find duplicate modules across chunks
  private async findDuplicates(): Promise<DuplicateInfo[]> {
    // This would require build-time analysis or source maps
    // For now, return empty array
    return [];
  }

  // Find unused exports
  private async findUnusedExports(): Promise<UnusedExportInfo[]> {
    // This would require static analysis of the codebase
    // For now, return empty array
    return [];
  }

  // Extract chunk name from URL
  private extractChunkName(url: string): string {
    const filename = url.split("/").pop() || "";
    return filename.split(".")[0] || "unknown";
  }

  // Get empty stats structure
  private getEmptyStats(): BundleStats {
    return {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      dependencies: [],
      duplicates: [],
      unusedExports: [],
    };
  }

  // Generate optimization recommendations
  generateRecommendations(): string[] {
    if (!this.stats) {
      return ["Run bundle analysis first to get recommendations"];
    }

    const recommendations: string[] = [];
    const { chunks, totalSize, gzippedSize, duplicates } = this.stats;

    // Large bundle warning
    if (totalSize > 1024 * 1024) {
      // 1MB
      recommendations.push(
        `Bundle size is large (${this.formatBytes(totalSize)}). Consider code splitting and lazy loading.`,
      );
    }

    // Poor compression ratio
    const compressionRatio = gzippedSize / totalSize;
    if (compressionRatio > 0.7) {
      recommendations.push(
        "Poor compression ratio detected. Check for non-compressible assets or duplicate code.",
      );
    }

    // Large initial chunks
    const initialChunks = chunks.filter((c) => c.isInitial);
    const initialSize = initialChunks.reduce((sum, c) => sum + c.size, 0);
    if (initialSize > 512 * 1024) {
      // 512KB
      recommendations.push(
        `Initial bundle size is ${this.formatBytes(initialSize)}. Consider moving non-critical code to dynamic imports.`,
      );
    }

    // Too many chunks
    if (chunks.length > 20) {
      recommendations.push(
        `High number of chunks (${chunks.length}). Consider consolidating smaller chunks to reduce HTTP overhead.`,
      );
    }

    // Duplicate modules
    if (duplicates.length > 0) {
      const wastedBytes = duplicates.reduce((sum, d) => sum + d.wastedBytes, 0);
      recommendations.push(
        `Found ${duplicates.length} duplicate modules wasting ${this.formatBytes(wastedBytes)}. Review webpack configuration.`,
      );
    }

    // No recommendations
    if (recommendations.length === 0) {
      recommendations.push(
        "Bundle analysis looks good! No major issues detected.",
      );
    }

    return recommendations;
  }

  // Format bytes for display
  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Export analysis results
  exportAnalysis(): string {
    if (!this.stats) {
      return JSON.stringify({ error: "No analysis data available" }, null, 2);
    }

    const report = {
      summary: {
        totalSize: this.formatBytes(this.stats.totalSize),
        gzippedSize: this.formatBytes(this.stats.gzippedSize),
        compressionRatio:
          ((this.stats.gzippedSize / this.stats.totalSize) * 100).toFixed(1) +
          "%",
        chunkCount: this.stats.chunks.length,
      },
      chunks: this.stats.chunks.map((chunk) => ({
        name: chunk.name,
        size: this.formatBytes(chunk.size),
        gzippedSize: this.formatBytes(chunk.gzippedSize),
        isEntry: chunk.isEntry,
        isInitial: chunk.isInitial,
      })),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }
}

// Performance budget checker
export class PerformanceBudget {
  private static budgets = {
    initialJS: 250 * 1024, // 250KB
    initialCSS: 50 * 1024, // 50KB
    totalJS: 1024 * 1024, // 1MB
    totalCSS: 200 * 1024, // 200KB
    chunkCount: 15,
    thirdPartySize: 300 * 1024, // 300KB
  };

  static checkBudget(
    stats: BundleStats,
  ): Array<{
    type: string;
    current: number;
    budget: number;
    status: "pass" | "warn" | "fail";
  }> {
    const results = [];

    // Check initial JS size
    const initialJS = stats.chunks
      .filter((c) => c.isInitial && c.name.includes(".js"))
      .reduce((sum, c) => sum + c.size, 0);

    results.push({
      type: "Initial JavaScript",
      current: initialJS,
      budget: this.budgets.initialJS,
      status:
        initialJS > this.budgets.initialJS
          ? "fail"
          : initialJS > this.budgets.initialJS * 0.8
            ? "warn"
            : "pass",
    });

    // Check initial CSS size
    const initialCSS = stats.chunks
      .filter((c) => c.isInitial && c.name.includes(".css"))
      .reduce((sum, c) => sum + c.size, 0);

    results.push({
      type: "Initial CSS",
      current: initialCSS,
      budget: this.budgets.initialCSS,
      status:
        initialCSS > this.budgets.initialCSS
          ? "fail"
          : initialCSS > this.budgets.initialCSS * 0.8
            ? "warn"
            : "pass",
    });

    // Check total JS size
    const totalJS = stats.chunks
      .filter((c) => c.name.includes(".js"))
      .reduce((sum, c) => sum + c.size, 0);

    results.push({
      type: "Total JavaScript",
      current: totalJS,
      budget: this.budgets.totalJS,
      status:
        totalJS > this.budgets.totalJS
          ? "fail"
          : totalJS > this.budgets.totalJS * 0.8
            ? "warn"
            : "pass",
    });

    // Check chunk count
    results.push({
      type: "Chunk Count",
      current: stats.chunks.length,
      budget: this.budgets.chunkCount,
      status:
        stats.chunks.length > this.budgets.chunkCount
          ? "fail"
          : stats.chunks.length > this.budgets.chunkCount * 0.8
            ? "warn"
            : "pass",
    });

    return results;
  }

  static setBudget(
    type: keyof typeof PerformanceBudget.budgets,
    value: number,
  ): void {
    this.budgets[type] = value;
  }

  static getBudgets() {
    return { ...this.budgets };
  }
}

// Tree shaking analysis
export class TreeShakingAnalyzer {
  static analyzeUnusedExports(modules: ModuleInfo[]): UnusedExportInfo[] {
    // This would require static analysis of the actual source code
    // For now, return placeholder data
    return [];
  }

  static analyzeDeadCode(): string[] {
    const recommendations = [];

    // Check for common dead code patterns
    if (typeof window !== "undefined") {
      // Check for unused React imports
      const reactElements = document.querySelectorAll("[data-reactroot]");
      if (reactElements.length === 0) {
        recommendations.push(
          "React might not be used. Consider removing React imports.",
        );
      }

      // Check for unused CSS classes
      const stylesheets = Array.from(document.styleSheets);
      const unusedRules = this.findUnusedCSSRules(stylesheets);
      if (unusedRules.length > 0) {
        recommendations.push(
          `Found ${unusedRules.length} potentially unused CSS rules.`,
        );
      }
    }

    return recommendations;
  }

  private static findUnusedCSSRules(stylesheets: StyleSheet[]): string[] {
    const unusedRules: string[] = [];

    try {
      for (const stylesheet of stylesheets) {
        if (stylesheet.cssRules) {
          for (const rule of Array.from(stylesheet.cssRules)) {
            if (rule instanceof CSSStyleRule) {
              try {
                const elements = document.querySelectorAll(rule.selectorText);
                if (elements.length === 0) {
                  unusedRules.push(rule.selectorText);
                }
              } catch (e) {
                // Invalid selector, skip
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn("Could not analyze CSS rules:", error);
    }

    return unusedRules;
  }
}

// React hooks for bundle analysis
export function useBundleAnalysis() {
  const [stats, setStats] = React.useState<BundleStats | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const analyzer = BundleAnalyzer.getInstance();

  const runAnalysis = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await analyzer.analyzeCurrentBundle();
      setStats(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }, [analyzer]);

  const getRecommendations = React.useCallback(() => {
    return analyzer.generateRecommendations();
  }, [analyzer]);

  const exportResults = React.useCallback(() => {
    return analyzer.exportAnalysis();
  }, [analyzer]);

  const checkBudget = React.useCallback(() => {
    if (!stats) return [];
    return PerformanceBudget.checkBudget(stats);
  }, [stats]);

  return {
    stats,
    loading,
    error,
    runAnalysis,
    getRecommendations,
    exportResults,
    checkBudget,
  };
}

// Chunk loading analysis
export function useChunkLoadingAnalysis() {
  const [chunkLoadTimes, setChunkLoadTimes] = React.useState<
    Map<string, number>
  >(new Map());

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === "resource" && entry.name.includes(".js")) {
          const chunkName =
            entry.name.split("/").pop()?.split(".")[0] || "unknown";
          setChunkLoadTimes(
            (prev) => new Map(prev.set(chunkName, entry.duration)),
          );
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });

    return () => observer.disconnect();
  }, []);

  const getSlowChunks = React.useCallback(
    (threshold = 1000) => {
      return Array.from(chunkLoadTimes.entries())
        .filter(([_, time]) => time > threshold)
        .sort(([_, a], [__, b]) => b - a);
    },
    [chunkLoadTimes],
  );

  return {
    chunkLoadTimes,
    getSlowChunks,
  };
}

export const bundleAnalyzer = BundleAnalyzer.getInstance();
