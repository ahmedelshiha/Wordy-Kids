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
         * LEGACY COLORS (deprecated - use new tokens)
         * ======================================== */
        educational: {
          blue: "hsl(var(--educational-blue))",
          "blue-light": "hsl(var(--educational-blue-light))",
          purple: "hsl(var(--educational-purple))",
          "purple-light": "hsl(var(--educational-purple-light))",
          green: "hsl(var(--educational-green))",
          "green-light": "hsl(var(--educational-green-light))",
          orange: "hsl(var(--educational-orange))",
          "orange-light": "hsl(var(--educational-orange-light))",
          pink: "hsl(var(--educational-pink))",
          "pink-light": "hsl(var(--educational-pink-light))",
          yellow: "hsl(var(--educational-yellow))",
          "yellow-light": "hsl(var(--educational-yellow-light))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
