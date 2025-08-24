// Production Deployment Configuration for Wordy Kids
// Optimizations for production builds and deployment

const path = require("path");

module.exports = {
  // Build optimization settings
  build: {
    // Enable source maps for production debugging (smaller maps)
    generateSourceMaps: true,
    sourceMapType: "source-map", // Full source maps for better debugging

    // Bundle analysis
    analyzeBundle: process.env.ANALYZE_BUNDLE === "true",

    // Output configuration
    outputPath: path.resolve(__dirname, "../dist"),
    publicPath: "/",

    // Asset optimization
    optimization: {
      // Minimize JS and CSS
      minimize: true,

      // Split chunks for better caching
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          // Vendor libraries (React, etc.)
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          // Game components (can be lazy loaded)
          games: {
            test: /[\\/]components[\\/]games[\\/]/,
            name: "games",
            chunks: "async",
            priority: 5,
          },
          // Admin components (admin-only)
          admin: {
            test: /[\\/]components[\\/]Admin/,
            name: "admin",
            chunks: "async",
            priority: 5,
          },
          // UI components (shared across app)
          ui: {
            test: /[\\/]components[\\/]ui[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 7,
          },
        },
      },

      // Runtime chunk for webpack runtime
      runtimeChunk: "single",
    },

    // Performance budgets
    performance: {
      maxEntrypointSize: 512000, // 512KB
      maxAssetSize: 256000, // 256KB
      hints: "warning",
    },
  },

  // Asset optimization
  assets: {
    // Image optimization
    images: {
      // Convert to WebP when possible
      webp: {
        quality: 85,
        enabled: true,
      },

      // Optimize PNG/JPEG
      optimize: {
        png: {
          quality: [0.8, 0.9],
        },
        jpeg: {
          quality: 85,
          progressive: true,
        },
      },

      // Responsive images
      responsive: {
        sizes: [320, 640, 768, 1024, 1280, 1920],
        formats: ["webp", "jpg"],
      },
    },

    // Audio optimization
    audio: {
      // Compress audio files
      compression: {
        mp3: {
          bitrate: 128, // 128kbps for good quality/size balance
          quality: "high",
        },
      },

      // Preload critical audio
      preload: [
        "/sounds/cat.mp3",
        "/sounds/dog.mp3",
        "/sounds/elephant.mp3",
        "/sounds/lion.mp3",
      ],
    },
  },

  // CDN and caching configuration
  cdn: {
    // Enable CDN for static assets
    enabled: process.env.USE_CDN === "true",

    // CDN URLs
    urls: {
      static: process.env.CDN_STATIC_URL || "",
      images: process.env.CDN_IMAGES_URL || "",
      audio: process.env.CDN_AUDIO_URL || "",
    },

    // Cache headers
    cacheHeaders: {
      // Long cache for immutable assets
      immutable: {
        "Cache-Control": "public, max-age=31536000, immutable",
        assets: ["*.js", "*.css", "*.woff2", "*.woff"],
      },

      // Medium cache for images
      images: {
        "Cache-Control": "public, max-age=604800", // 1 week
        assets: ["*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif", "*.svg"],
      },

      // Short cache for audio (can be updated)
      audio: {
        "Cache-Control": "public, max-age=86400", // 1 day
        assets: ["*.mp3", "*.wav", "*.ogg"],
      },

      // No cache for HTML
      html: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        assets: ["*.html"],
      },
    },
  },

  // Security headers
  security: {
    headers: {
      // Content Security Policy
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.builder.io",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "media-src 'self' https:",
        "connect-src 'self' https: wss:",
        "worker-src 'self' blob:",
      ].join("; "),

      // Other security headers
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },

  // Environment-specific settings
  environments: {
    production: {
      // API endpoints
      apiUrl: process.env.PROD_API_URL || "https://api.wordykids.com",

      // Feature flags
      features: {
        enableAnalytics: true,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
        enableOfflineMode: true,
      },

      // Logging
      logging: {
        level: "error",
        enableConsole: false,
        enableRemote: true,
      },
    },

    staging: {
      apiUrl:
        process.env.STAGING_API_URL || "https://staging-api.wordykids.com",

      features: {
        enableAnalytics: true,
        enableErrorReporting: true,
        enablePerformanceMonitoring: true,
        enableOfflineMode: true,
      },

      logging: {
        level: "warn",
        enableConsole: true,
        enableRemote: true,
      },
    },
  },

  // Monitoring and analytics
  monitoring: {
    // Error tracking
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    },

    // Performance monitoring
    performance: {
      // Web Vitals thresholds
      thresholds: {
        lcp: 2500, // Largest Contentful Paint (ms)
        fid: 100, // First Input Delay (ms)
        cls: 0.1, // Cumulative Layout Shift
      },

      // Custom metrics
      customMetrics: [
        "app-init-time",
        "game-load-time",
        "audio-load-time",
        "navigation-time",
      ],
    },

    // Analytics
    analytics: {
      // Google Analytics
      googleAnalytics: {
        measurementId: process.env.GA_MEASUREMENT_ID,
        enabled: process.env.NODE_ENV === "production",
      },

      // Custom analytics
      custom: {
        endpoint: process.env.ANALYTICS_ENDPOINT,
        enabled: true,
      },
    },
  },

  // Progressive Web App settings
  pwa: {
    enabled: true,

    // Service worker configuration
    serviceWorker: {
      swSrc: "./public/sw-advanced.js",
      swDest: "sw.js",

      // Caching strategies
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com/,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "google-fonts-stylesheets",
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com/,
          handler: "CacheFirst",
          options: {
            cacheName: "google-fonts-webfonts",
            expiration: {
              maxEntries: 30,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
      ],
    },

    // Manifest configuration
    manifest: {
      name: "Wordy Kids - Educational Word Learning",
      short_name: "Wordy Kids",
      description: "Fun and interactive word learning for children",
      theme_color: "#4CAF50",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait-primary",

      // Icons (generated from source)
      icons: [
        {
          src: "/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },

  // Deployment automation
  deployment: {
    // Pre-deployment checks
    preDeployChecks: [
      "npm run typecheck",
      "npm run test",
      "npm run build",
      "npm run test:e2e",
    ],

    // Post-deployment actions
    postDeploy: [
      "clear-cdn-cache",
      "warm-up-critical-pages",
      "run-smoke-tests",
    ],

    // Rollback configuration
    rollback: {
      enabled: true,
      retainVersions: 5,
      automaticRollback: {
        enabled: true,
        errorThreshold: 0.05, // 5% error rate
        timeWindow: 300, // 5 minutes
      },
    },
  },

  // Performance optimization
  optimization: {
    // Lazy loading configuration
    lazyLoading: {
      // Components to lazy load
      components: [
        "AdminDashboard",
        "AdvancedAnalyticsDashboard",
        "EnhancedJungleQuizAdventure",
        "WordGarden",
        "EnhancedGameHub",
      ],

      // Preload on hover/focus
      preloadOnInteraction: true,

      // Intersection observer options
      intersectionOptions: {
        rootMargin: "50px",
        threshold: 0.1,
      },
    },

    // Bundle optimization
    bundleOptimization: {
      // Tree shaking
      treeShaking: true,

      // Dead code elimination
      deadCodeElimination: true,

      // Duplicate dependency elimination
      dedupe: true,

      // External dependencies (loaded from CDN)
      externals:
        process.env.USE_CDN === "true"
          ? {
              react: "React",
              "react-dom": "ReactDOM",
            }
          : {},
    },
  },
};
