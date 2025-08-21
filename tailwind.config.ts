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
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        // Educational color palette
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
        // Jungle Green Family
        jungle: {
          DEFAULT: "hsl(var(--jungle-green))", // #4CAF50
          dark: "hsl(var(--jungle-green-dark))", // #388E3C
          light: "hsl(var(--jungle-green-light))", // #81C784
        },
        // Sunshine Yellow Family
        sunshine: {
          DEFAULT: "hsl(var(--sunshine-yellow))", // #FFC107
          dark: "hsl(var(--sunshine-yellow-dark))", // #F57F17
          light: "hsl(var(--sunshine-yellow-light))", // #FFF176
        },
        // Sky Blue Family
        sky: {
          DEFAULT: "hsl(var(--sky-blue))", // #2196F3
          dark: "hsl(var(--sky-blue-dark))", // #1976D2
          light: "hsl(var(--sky-blue-light))", // Light variant
        },
        // Dark Navy
        navy: {
          DEFAULT: "hsl(var(--dark-navy))", // #1A237E
        },
        // New Jungle Adventure Colors
        "profile-purple": "hsl(var(--profile-purple))", // #6366F1
        "bright-orange": "hsl(var(--bright-orange))", // #FF9800
        "playful-purple": "hsl(var(--playful-purple))", // #9C27B0
        "coral-red": "hsl(var(--coral-red))", // #FF5722
        "light-background": "hsl(var(--light-background))", // #F8F9FA
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
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
