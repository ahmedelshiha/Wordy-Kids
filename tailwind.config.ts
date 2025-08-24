import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      /* ========================================
       * JUNGLE ADVENTURE DESIGN TOKENS
       * ======================================== */
      colors: {
        /* Legacy Radix UI colors - maintained for compatibility */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        /* ========================================
         * JUNGLE ADVENTURE BRAND COLORS
         * ======================================== */
        jungle: {
          100: "hsl(var(--color-jungle-100) / <alpha-value>)",
          200: "hsl(var(--color-jungle-200) / <alpha-value>)",
          300: "hsl(var(--color-jungle-300) / <alpha-value>)",
          400: "hsl(var(--color-jungle-400) / <alpha-value>)",
          500: "hsl(var(--color-jungle-500) / <alpha-value>)",
          600: "hsl(var(--color-jungle-600) / <alpha-value>)",
          700: "hsl(var(--color-jungle-700) / <alpha-value>)",
          DEFAULT: "hsl(var(--color-jungle-500) / <alpha-value>)",
        },
        banana: {
          100: "hsl(var(--color-banana-100) / <alpha-value>)",
          200: "hsl(var(--color-banana-200) / <alpha-value>)",
          300: "hsl(var(--color-banana-300) / <alpha-value>)",
          400: "hsl(var(--color-banana-400) / <alpha-value>)",
          500: "hsl(var(--color-banana-500) / <alpha-value>)",
          600: "hsl(var(--color-banana-600) / <alpha-value>)",
          DEFAULT: "hsl(var(--color-banana-500) / <alpha-value>)",
        },
        sky: {
          100: "hsl(var(--color-sky-100) / <alpha-value>)",
          200: "hsl(var(--color-sky-200) / <alpha-value>)",
          300: "hsl(var(--color-sky-300) / <alpha-value>)",
          400: "hsl(var(--color-sky-400) / <alpha-value>)",
          500: "hsl(var(--color-sky-500) / <alpha-value>)",
          600: "hsl(var(--color-sky-600) / <alpha-value>)",
          DEFAULT: "hsl(var(--color-sky-500) / <alpha-value>)",
        },
        wood: {
          200: "hsl(var(--color-wood-200) / <alpha-value>)",
          300: "hsl(var(--color-wood-300) / <alpha-value>)",
          400: "hsl(var(--color-wood-400) / <alpha-value>)",
          500: "hsl(var(--color-wood-500) / <alpha-value>)",
          600: "hsl(var(--color-wood-600) / <alpha-value>)",
          DEFAULT: "hsl(var(--color-wood-500) / <alpha-value>)",
        },
        berry: {
          200: "hsl(var(--color-berry-200) / <alpha-value>)",
          300: "hsl(var(--color-berry-300) / <alpha-value>)",
          400: "hsl(var(--color-berry-400) / <alpha-value>)",
          500: "hsl(var(--color-berry-500) / <alpha-value>)",
          600: "hsl(var(--color-berry-600) / <alpha-value>)",
          DEFAULT: "hsl(var(--color-berry-500) / <alpha-value>)",
        },

        /* ========================================
         * SURFACE & SEMANTIC COLORS
         * ======================================== */
        surface: {
          DEFAULT: "hsl(var(--color-surface) / <alpha-value>)",
          2: "hsl(var(--color-surface-2) / <alpha-value>)",
          3: "hsl(var(--color-surface-3) / <alpha-value>)",
        },
        text: {
          DEFAULT: "hsl(var(--color-text) / <alpha-value>)",
          secondary: "hsl(var(--color-text-secondary) / <alpha-value>)",
          muted: "hsl(var(--color-text-muted) / <alpha-value>)",
          inverse: "hsl(var(--color-text-inverse) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--color-success) / <alpha-value>)",
          light: "hsl(var(--color-success-light) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--color-warning) / <alpha-value>)",
          light: "hsl(var(--color-warning-light) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--color-danger) / <alpha-value>)",
          light: "hsl(var(--color-danger-light) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--color-info) / <alpha-value>)",
          light: "hsl(var(--color-info-light) / <alpha-value>)",
        },

        /* ========================================
         * ADMIN PALETTE (controlled exception)
         * ======================================== */
        admin: {
          bg: "hsl(var(--color-admin-bg) / <alpha-value>)",
          surface: "hsl(var(--color-admin-surface) / <alpha-value>)",
          border: "hsl(var(--color-admin-border) / <alpha-value>)",
          text: "hsl(var(--color-admin-text) / <alpha-value>)",
          muted: "hsl(var(--color-admin-text-muted) / <alpha-value>)",
          accent: "hsl(var(--color-admin-accent) / <alpha-value>)",
        },

        /* ========================================
         * EDUCATIONAL COLORS (now unified with jungle theme)
         * These automatically map to jungle theme tokens via CSS variables
         * ======================================== */
        educational: {
          blue: "hsl(var(--educational-blue))" /* -> sky-500 */,
          "blue-light": "hsl(var(--educational-blue-light))" /* -> sky-200 */,
          purple: "hsl(var(--educational-purple))" /* -> berry-500 */,
          "purple-light":
            "hsl(var(--educational-purple-light))" /* -> berry-200 */,
          green: "hsl(var(--educational-green))" /* -> jungle-500 */,
          "green-light":
            "hsl(var(--educational-green-light))" /* -> jungle-200 */,
          orange: "hsl(var(--educational-orange))" /* -> wood-500 */,
          "orange-light":
            "hsl(var(--educational-orange-light))" /* -> wood-200 */,
          pink: "hsl(var(--educational-pink))" /* -> berry-400 */,
          "pink-light": "hsl(var(--educational-pink-light))" /* -> berry-200 */,
          yellow: "hsl(var(--educational-yellow))" /* -> banana-500 */,
          "yellow-light":
            "hsl(var(--educational-yellow-light))" /* -> banana-200 */,
        },

        /* ========================================
         * QUIZ ADVENTURE THEME COLORS
         * Time-based backgrounds and quiz UI elements
         * ======================================== */
        quiz: {
          "morning-start": "hsl(var(--quiz-morning-start))",
          "morning-mid": "hsl(var(--quiz-morning-mid))",
          "morning-end": "hsl(var(--quiz-morning-end))",
          "midday-start": "hsl(var(--quiz-midday-start))",
          "midday-mid": "hsl(var(--quiz-midday-mid))",
          "midday-end": "hsl(var(--quiz-midday-end))",
          "evening-start": "hsl(var(--quiz-evening-start))",
          "evening-mid": "hsl(var(--quiz-evening-mid))",
          "evening-end": "hsl(var(--quiz-evening-end))",
          "night-start": "hsl(var(--quiz-night-start))",
          "night-mid": "hsl(var(--quiz-night-mid))",
          "night-end": "hsl(var(--quiz-night-end))",
          gold: "hsl(var(--quiz-gold-accent))",
          "treasure-border": "var(--quiz-treasure-border)",
          "option-bg": "var(--quiz-option-bg)",
        },
        // Legacy Jungle Green Family
        "jungle-legacy": {
          DEFAULT: "hsl(var(--jungle-green))",
          dark: "hsl(var(--jungle-green-dark))",
          light: "hsl(var(--jungle-green-light))",
        },
        // Legacy Sunshine Yellow Family
        sunshine: {
          DEFAULT: "hsl(var(--sunshine-yellow))",
          dark: "hsl(var(--sunshine-yellow-dark))",
          light: "hsl(var(--sunshine-yellow-light))",
        },
        // Legacy Dark Navy
        navy: {
          DEFAULT: "hsl(var(--dark-navy))",
        },
        // Legacy Jungle Adventure Colors
        "profile-purple": "hsl(var(--profile-purple))",
        "bright-orange": "hsl(var(--bright-orange))",
        "playful-purple": "hsl(var(--playful-purple))",
        "coral-red": "hsl(var(--coral-red))",
        "light-background": "hsl(var(--light-background))",
      },
      /* ========================================
       * TYPOGRAPHY
       * ======================================== */
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        xs: ["var(--fs-xs)", { lineHeight: "var(--lh-normal)" }],
        sm: ["var(--fs-sm)", { lineHeight: "var(--lh-normal)" }],
        base: ["var(--fs-base)", { lineHeight: "var(--lh-normal)" }],
        lg: ["var(--fs-lg)", { lineHeight: "var(--lh-normal)" }],
        xl: ["var(--fs-xl)", { lineHeight: "var(--lh-snug)" }],
        "2xl": ["var(--fs-2xl)", { lineHeight: "var(--lh-snug)" }],
        "3xl": ["var(--fs-3xl)", { lineHeight: "var(--lh-snug)" }],
        "4xl": ["var(--fs-4xl)", { lineHeight: "var(--lh-tight)" }],
        "5xl": ["var(--fs-5xl)", { lineHeight: "var(--lh-tight)" }],
        "6xl": ["var(--fs-6xl)", { lineHeight: "var(--lh-tight)" }],
        // Fluid typography
        "h1-fluid": ["var(--fs-h1-fluid)", { lineHeight: "var(--lh-tight)" }],
        "h2-fluid": ["var(--fs-h2-fluid)", { lineHeight: "var(--lh-tight)" }],
        "h3-fluid": ["var(--fs-h3-fluid)", { lineHeight: "var(--lh-snug)" }],
        "h4-fluid": ["var(--fs-h4-fluid)", { lineHeight: "var(--lh-snug)" }],
        "h5-fluid": ["var(--fs-h5-fluid)", { lineHeight: "var(--lh-snug)" }],
        "h6-fluid": ["var(--fs-h6-fluid)", { lineHeight: "var(--lh-normal)" }],
      },
      fontWeight: {
        light: "var(--fw-light)",
        normal: "var(--fw-regular)",
        medium: "var(--fw-medium)",
        semibold: "var(--fw-semibold)",
        bold: "var(--fw-bold)",
        extrabold: "var(--fw-extrabold)",
      },
      lineHeight: {
        tight: "var(--lh-tight)",
        snug: "var(--lh-snug)",
        normal: "var(--lh-normal)",
        relaxed: "var(--lh-relaxed)",
        loose: "var(--lh-loose)",
      },

      /* ========================================
       * SPACING
       * ======================================== */
      spacing: {
        1: "var(--sp-1)",
        2: "var(--sp-2)",
        3: "var(--sp-3)",
        4: "var(--sp-4)",
        5: "var(--sp-5)",
        6: "var(--sp-6)",
        8: "var(--sp-8)",
        10: "var(--sp-10)",
        12: "var(--sp-12)",
        16: "var(--sp-16)",
        20: "var(--sp-20)",
        24: "var(--sp-24)",
        // Component-specific spacing
        "card-sm": "var(--card-padding-sm)",
        card: "var(--card-padding)",
        "card-lg": "var(--card-padding-lg)",
        "btn-h-xs": "var(--btn-h-xs)",
        "btn-h-sm": "var(--btn-h-sm)",
        "btn-h-md": "var(--btn-h-md)",
        "btn-h-lg": "var(--btn-h-lg)",
        "btn-h-xl": "var(--btn-h-xl)",
        "input-h-sm": "var(--input-h-sm)",
        "input-h-md": "var(--input-h-md)",
        "input-h-lg": "var(--input-h-lg)",
        "nav-h-mobile": "var(--nav-h-mobile)",
        "nav-h-desktop": "var(--nav-h-desktop)",
      },

      /* ========================================
       * BORDER RADIUS & SHADOWS
       * ======================================== */
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
        // Legacy support
        DEFAULT: "var(--radius-lg)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
        glow: "var(--shadow-glow)",
        jungle: "var(--shadow-jungle)",
        // Legacy support
        DEFAULT: "var(--shadow-md)",
      },

      /* ========================================
       * Z-INDEX
       * ======================================== */
      zIndex: {
        hide: "var(--z-hide)",
        base: "var(--z-base)",
        docked: "var(--z-docked)",
        dropdown: "var(--z-dropdown)",
        sticky: "var(--z-sticky)",
        banner: "var(--z-banner)",
        overlay: "var(--z-overlay)",
        modal: "var(--z-modal)",
        popover: "var(--z-popover)",
        tooltip: "var(--z-tooltip)",
        toast: "var(--z-toast)",
        max: "var(--z-max)",
      },

      /* ========================================
       * TRANSITIONS & ANIMATIONS
       * ======================================== */
      transitionDuration: {
        instant: "var(--dur-instant)",
        fast: "var(--dur-fast)",
        normal: "var(--dur-normal)",
        slow: "var(--dur-slow)",
        slower: "var(--dur-slower)",
        slowest: "var(--dur-slowest)",
        DEFAULT: "var(--dur-normal)",
      },
      transitionTimingFunction: {
        soft: "var(--ease-soft)",
        bounce: "var(--ease-bounce)",
        elastic: "var(--ease-elastic)",
        DEFAULT: "var(--ease-soft)",
      },
      animation: {
        // Jungle Adventure animations
        float: "float-soft 8s ease-in-out infinite",
        sway: "leaf-sway 6s ease-in-out infinite alternate",
        "pop-in": "pop-in var(--dur-normal) var(--ease-soft)",
        breath: "gentle-breath 8s ease-in-out infinite",
        glow: "serene-glow 12s ease-in-out infinite",
        "pulse-calm": "calm-pulse 6s ease-in-out infinite",
        "emoji-float": "gentle-emoji-float 3s ease-in-out infinite",
        sparkle: "jungle-sparkle 1.5s ease-in-out infinite",
        "reveal-up": "reveal-up var(--dur-slow) var(--ease-out)",
        "fade-in": "fade-in-scale var(--dur-normal) var(--ease-out)",
        "slide-left": "slide-in-left var(--dur-normal) var(--ease-out)",
        "slide-right": "slide-in-right var(--dur-normal) var(--ease-out)",
        "bounce-in": "bounce-in var(--dur-slow) var(--ease-bounce)",
        shimmer: "shimmer 2s ease-in-out infinite",
        progress: "progress-fill var(--dur-slow) var(--ease-out)",
        wiggle: "wiggle 2s ease-in-out",
        celebrate: "jungle-celebration 2s ease-in-out",
        "level-up": "jungle-level-up 3s var(--ease-bounce)",
        "parallax-slow": "parallax-slow 20s linear infinite",
        "parallax-medium": "parallax-medium 15s linear infinite",
        "parallax-fast": "parallax-fast 10s linear infinite",

        // Legacy animations (maintained for compatibility)
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gentle-bounce": "gentle-bounce 3s ease-in-out infinite",
        "gentle-float": "gentle-float 4s ease-in-out infinite",
        "gentle-breath": "gentle-breath 8s ease-in-out infinite",
        "serene-glow": "serene-glow 12s ease-in-out infinite",
        "peaceful-hover": "peaceful-hover 0.4s ease-out forwards",
        "calm-pulse": "calm-pulse 6s ease-in-out infinite",
        "gentle-emoji-float": "gentle-emoji-float 3s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        // New calming navigation animations
        "gentle-breath": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.02)",
            opacity: "0.98",
          },
        },
        "serene-glow": {
          "0%, 100%": {
            boxShadow: "0 0 0px rgba(76, 175, 80, 0)",
          },
          "50%": {
            boxShadow: "0 0 8px rgba(76, 175, 80, 0.15)",
          },
        },
        "peaceful-hover": {
          "0%": {
            transform: "translateY(0) scale(1)",
          },
          "100%": {
            transform: "translateY(-0.5px) scale(1.005)",
          },
        },
        "calm-pulse": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: "0.97",
          },
        },
        // Gentle emoji floating animation
        "gentle-emoji-float": {
          "0%, 100%": {
            transform: "translateY(0) rotate(-2deg)",
          },
          "50%": {
            transform: "translateY(-6px) rotate(2deg)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gentle-bounce": "gentle-bounce 3s ease-in-out infinite",
        "gentle-float": "gentle-float 4s ease-in-out infinite",
        sparkle: "sparkle-enhanced 2s ease-in-out infinite",
        "emoji-bounce": "emoji-bounce 1.5s ease-in-out",
        "star-fill": "star-fill 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "celebration-sparkles": "celebration-sparkles 1.5s ease-out infinite",
        "voice-pulse": "voice-pulse 2s infinite",
        "funny-voice-pulse": "funny-voice-pulse 2s infinite",
        "mini-game-appear":
          "mini-game-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "letter-highlight": "letter-highlight 1s ease-in-out infinite",
        "puzzle-piece-place": "puzzle-piece-place 0.3s ease-out",
        // Jungle Adventure Animations
        "jungle-glow": "jungle-glow 3s linear infinite",
        "jungle-float": "jungle-float 4s ease-in-out infinite",
        "jungle-sway": "jungle-sway 2s ease-in-out infinite",
        "jungle-sparkle": "jungle-sparkle 1.5s ease-in-out infinite",
        "jungle-celebration": "jungle-celebration 2s ease-in-out",
        "jungle-level-up": "jungle-level-up 3s ease-out",
        // New calming navigation animations
        "gentle-breath": "gentle-breath 8s ease-in-out infinite",
        "serene-glow": "serene-glow 12s ease-in-out infinite",
        "peaceful-hover": "peaceful-hover 0.4s ease-out forwards",
        "calm-pulse": "calm-pulse 6s ease-in-out infinite",
        // Gentle emoji floating animation
        "gentle-emoji-float": "gentle-emoji-float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
