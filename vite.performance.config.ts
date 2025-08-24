import { defineConfig } from "vite";
import { PERFORMANCE_BUDGETS } from "./client/lib/performance";

/**
 * Vite Performance Configuration
 * Enforces performance budgets and optimizations for the Jungle Adventure theme
 */

export const performanceConfig = defineConfig({
  build: {
    // Bundle size limits
    chunkSizeWarningLimit: PERFORMANCE_BUDGETS.totalJS / 1024, // Convert to KB

    rollupOptions: {
      output: {
        // Code splitting strategy
        manualChunks: {
          // Vendor libraries
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-tabs",
            "@radix-ui/react-select",
          ],
          icons: ["lucide-react"],

          // Jungle Adventure components
          "jungle-adventure": [
            "./client/components/ui/adventure-button.tsx",
            "./client/components/ui/jungle-card.tsx",
            "./client/components/ui/jungle-panel.tsx",
            "./client/components/ui/progress-vine.tsx",
          ],

          // Templates (lazy loaded)
          templates: [
            "./client/templates/LoginTemplate.tsx",
            "./client/templates/AppHomeTemplate.tsx",
            "./client/templates/AdminTemplate.tsx",
          ],

          // Game components (lazy loaded)
          games: [
            "./client/components/games/EnhancedGameHub.tsx",
            "./client/components/games/EnhancedJungleQuizAdventure.tsx",
            "./client/components/games/FlashcardDuel.tsx",
          ],
        },

        // Asset naming for caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split(".") ?? [];
          const ext = info[info.length - 1];

          if (
            /\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name ?? "")
          ) {
            return `assets/images/[name]-[hash][extname]`;
          }

          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name ?? "")) {
            return `assets/fonts/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },

        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ["console.log", "console.info", "console.debug"],
      },
      mangle: {
        safari10: true,
      },
    },

    // Source maps only for development
    sourcemap: false,

    // Asset inlining threshold (4KB)
    assetsInlineLimit: 4096,
  },

  // CSS optimization
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // PurgeCSS will be handled by Tailwind
        require("autoprefixer"),
        require("cssnano")({
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              mergeLonghand: false, // Avoid issues with CSS custom properties
            },
          ],
        }),
      ],
    },
  },

  // Optimization settings
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "lucide-react",
    ],
    exclude: [
      // Exclude heavy libraries from pre-bundling
      "three",
      "@tensorflow/tfjs",
    ],
  },

  // Preview server optimization
  preview: {
    headers: {
      // Security headers
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",

      // Performance headers
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  },
});

// Bundle analyzer plugin
export function bundleAnalyzerPlugin() {
  return {
    name: "bundle-analyzer",
    generateBundle(options: any, bundle: any) {
      const chunks = Object.values(bundle).filter(
        (chunk: any) => chunk.type === "chunk",
      );
      const assets = Object.values(bundle).filter(
        (chunk: any) => chunk.type === "asset",
      );

      const totalJSSize = chunks.reduce((size: number, chunk: any) => {
        return size + (chunk.code?.length || 0);
      }, 0);

      const totalCSSSize = assets
        .filter((asset: any) => asset.fileName.endsWith(".css"))
        .reduce((size: number, asset: any) => {
          return size + (asset.source?.length || 0);
        }, 0);

      // Check against budgets
      const budgetWarnings = [];

      if (totalJSSize > PERFORMANCE_BUDGETS.totalJS) {
        budgetWarnings.push(
          `⚠️  JavaScript bundle size (${(totalJSSize / 1024).toFixed(1)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.totalJS / 1024).toFixed(1)}KB)`,
        );
      }

      if (totalCSSSize > PERFORMANCE_BUDGETS.totalCSS) {
        budgetWarnings.push(
          `⚠️  CSS bundle size (${(totalCSSSize / 1024).toFixed(1)}KB) exceeds budget (${(PERFORMANCE_BUDGETS.totalCSS / 1024).toFixed(1)}KB)`,
        );
      }

      if (budgetWarnings.length > 0) {
        console.warn("\n🚨 Performance Budget Warnings:");
        budgetWarnings.forEach((warning) => console.warn(warning));
        console.warn("\nConsider:");
        console.warn("- Code splitting for large components");
        console.warn("- Tree shaking unused code");
        console.warn("- Lazy loading non-critical features");
        console.warn("- Using dynamic imports\n");
      } else {
        console.log("✅ All performance budgets met!");
        console.log(`📦 JavaScript: ${(totalJSSize / 1024).toFixed(1)}KB`);
        console.log(`🎨 CSS: ${(totalCSSSize / 1024).toFixed(1)}KB`);
      }
    },
  };
}

// Performance monitoring plugin
export function performanceMonitoringPlugin() {
  return {
    name: "performance-monitoring",
    transformIndexHtml(html: string) {
      // Inject performance monitoring script
      const monitoringScript = `
        <script>
          // Jungle Adventure Performance Monitoring
          window.JUNGLE_PERFORMANCE = {
            startTime: performance.now(),
            budgets: ${JSON.stringify(PERFORMANCE_BUDGETS)},
          };
          
          // Monitor Core Web Vitals
          if ('PerformanceObserver' in window) {
            // LCP monitoring
            new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              if (lastEntry.startTime > window.JUNGLE_PERFORMANCE.budgets.lcp) {
                console.warn('🐌 LCP exceeds budget:', lastEntry.startTime + 'ms');
              }
            }).observe({entryTypes: ['largest-contentful-paint']});
            
            // FID monitoring  
            new PerformanceObserver((list) => {
              list.getEntries().forEach((entry) => {
                const fid = entry.processingStart - entry.startTime;
                if (fid > window.JUNGLE_PERFORMANCE.budgets.fid) {
                  console.warn('🐌 FID exceeds budget:', fid + 'ms');
                }
              });
            }).observe({entryTypes: ['first-input']});
          }
        </script>
      `;

      return html.replace("</head>", `${monitoringScript}</head>`);
    },
  };
}

// Asset optimization plugin
export function assetOptimizationPlugin() {
  return {
    name: "asset-optimization",
    generateBundle(options: any, bundle: any) {
      // Optimize SVG assets
      Object.keys(bundle).forEach((fileName) => {
        if (fileName.endsWith(".svg")) {
          const asset = bundle[fileName] as any;
          if (asset.type === "asset" && typeof asset.source === "string") {
            // Basic SVG optimization
            asset.source = asset.source
              .replace(/\s+/g, " ") // Normalize whitespace
              .replace(/<!--.*?-->/g, "") // Remove comments
              .trim();
          }
        }
      });
    },
  };
}

export default performanceConfig;
