/**
 * Enhanced Jungle Adventure Navigation Configuration with Twemoji Support
 * 🌿 Cross-platform child navigation system with consistent emoji rendering
 */

import { JungleNavTwemoji } from "@/components/ui/twemoji";

export interface JungleNavItem {
  id: string;
  label: string;
  animal: {
    name: string;
    emoji: string;
    twemojiComponent: React.ComponentType<{
      className?: string;
      size?: number;
      ariaLabel?: string;
    }>;
    sound?: string;
    description: string;
  };
  colors: {
    primary: string;
    secondary: string;
    gradient: string;
    hover: string;
    shadow: string;
  };
  animations: {
    idle: string;
    active: string;
    hover: string;
  };
  accessibility: {
    ariaLabel: string;
    description: string;
  };
}

export const enhancedJungleNavItems: JungleNavItem[] = [
  {
    id: "dashboard",
    label: "Home Tree",
    animal: {
      name: "Wise Owl",
      emoji: "🦉",
      twemojiComponent: JungleNavTwemoji.Owl,
      sound: "hoot",
      description: "Your cozy home in the treetops where all adventures begin",
    },
    colors: {
      primary: "#8B5CF6", // Purple
      secondary: "#A78BFA",
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      hover: "from-purple-600 via-violet-600 to-indigo-600",
      shadow: "shadow-purple-300/50",
    },
    animations: {
      idle: "gentle-sway",
      active: "owl-hoot",
      hover: "tree-rustle",
    },
    accessibility: {
      ariaLabel: "Navigate to Home Tree - Main Dashboard",
      description: "Return to your main adventure base in the jungle canopy",
    },
  },
  {
    id: "learn",
    label: "Book Jungle",
    animal: {
      name: "Smart Parrot",
      emoji: "🦜",
      twemojiComponent: JungleNavTwemoji.Parrot,
      sound: "chirp",
      description: "Explore the magical library hidden deep in the jungle",
    },
    colors: {
      primary: "#F59E0B", // Amber
      secondary: "#FCD34D",
      gradient: "from-amber-500 via-yellow-500 to-orange-500",
      hover: "from-amber-600 via-yellow-600 to-orange-600",
      shadow: "shadow-amber-300/50",
    },
    animations: {
      idle: "gentle-float",
      active: "parrot-dance",
      hover: "wing-flutter",
    },
    accessibility: {
      ariaLabel: "Enter Book Jungle - Learning Library",
      description: "Discover new words and stories with your parrot guide",
    },
  },
  {
    id: "quiz",
    label: "Adventure Games",
    animal: {
      name: "Playful Monkey",
      emoji: "🐵",
      twemojiComponent: JungleNavTwemoji.Monkey,
      sound: "ooh-ah",
      description: "Swing into action with fun games and challenges",
    },
    colors: {
      primary: "#10B981", // Emerald
      secondary: "#34D399",
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      hover: "from-emerald-600 via-green-600 to-teal-600",
      shadow: "shadow-emerald-300/50",
    },
    animations: {
      idle: "gentle-bounce",
      active: "monkey-swing",
      hover: "branch-shake",
    },
    accessibility: {
      ariaLabel: "Start Adventure Games - Fun Learning Games",
      description: "Play exciting games and challenges with your monkey friend",
    },
  },
  {
    id: "achievements",
    label: "Trophy Grove",
    animal: {
      name: "Majestic Elephant",
      emoji: "🐘",
      twemojiComponent: JungleNavTwemoji.Elephant,
      sound: "trumpet",
      description: "Celebrate your amazing accomplishments in the sacred grove",
    },
    colors: {
      primary: "#F59E0B", // Gold
      secondary: "#FCD34D",
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      hover: "from-yellow-600 via-amber-600 to-orange-600",
      shadow: "shadow-yellow-300/50",
    },
    animations: {
      idle: "gentle-glow",
      active: "elephant-celebration",
      hover: "trophy-shine",
    },
    accessibility: {
      ariaLabel: "Visit Trophy Grove - View Achievements",
      description:
        "See all your amazing achievements and progress with the wise elephant",
    },
  },
];

/**
 * Get navigation item by ID with fallback
 */
export function getNavItemById(id: string): JungleNavItem | null {
  return enhancedJungleNavItems.find((item) => item.id === id) || null;
}

/**
 * Get all navigation emojis for preloading
 */
export function getNavigationEmojis(): string[] {
  return enhancedJungleNavItems.map((item) => item.animal.emoji);
}

/**
 * Enhanced theme configuration with Twemoji support
 */
export interface EnhancedJungleThemeConfig {
  background: {
    gradient: string;
    overlay: string;
    canopy: string;
  };
  decorations: {
    vines: string[];
    fireflies: string[];
    leaves: string[];
  };
  twemoji: {
    enabled: boolean;
    fallbackToEmoji: boolean;
    preloadNavigation: boolean;
    lazyLoad: boolean;
  };
  sounds: {
    ambient: string;
    interactions: Record<string, string>;
  };
  animations: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      gentle: string;
      bouncy: string;
      elastic: string;
    };
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
}

export const enhancedJungleTheme: EnhancedJungleThemeConfig = {
  background: {
    gradient: "from-green-800 via-emerald-700 to-teal-800",
    overlay: "bg-gradient-to-b from-black/20 via-transparent to-black/10",
    canopy:
      "bg-gradient-to-b from-green-900/80 via-green-800/60 to-transparent",
  },
  decorations: {
    vines: ["🌿", "🍃", "🌱"],
    fireflies: ["✨", "💫", "⭐"],
    leaves: ["🍀", "🌿", "🍃", "🌱"],
  },
  twemoji: {
    enabled: true,
    fallbackToEmoji: true,
    preloadNavigation: true,
    lazyLoad: true,
  },
  sounds: {
    ambient: "/sounds/jungle-ambient.mp3",
    interactions: {
      hover: "/sounds/leaf-rustle.mp3",
      click: "/sounds/branch-tap.mp3",
      success: "/sounds/animal-celebration.mp3",
    },
  },
  animations: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 600,
    },
    easing: {
      gentle: "cubic-bezier(0.4, 0, 0.2, 1)",
      bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      elastic: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    },
  },
  accessibility: {
    reducedMotion: false, // Will be detected at runtime
    highContrast: false, // Will be detected at runtime
    screenReader: false, // Will be detected at runtime
  },
};

// Responsive breakpoints for navigation behavior
export const navBreakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

// Performance settings for different device capabilities
export interface DeviceCapabilities {
  animations: boolean;
  sounds: boolean;
  particles: boolean;
  backgroundEffects: boolean;
  twemoji: boolean;
}

export const getOptimalSettings = (): DeviceCapabilities => {
  // Basic device capability detection
  const hasReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isLowEnd =
    navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
  const isMobile = window.innerWidth < navBreakpoints.mobile;
  const isOnline = navigator.onLine !== false;

  return {
    animations: !hasReducedMotion && !isLowEnd,
    sounds: !isLowEnd,
    particles: !isMobile && !isLowEnd,
    backgroundEffects: !isMobile && !isLowEnd,
    twemoji: isOnline && !isLowEnd, // Enable Twemoji when online and capable
  };
};

// Enhanced navigation state management
export interface EnhancedJungleNavState {
  activeTab: string;
  isCollapsed: boolean;
  showParentGate: boolean;
  deviceCapabilities: DeviceCapabilities;
  twemojiEnabled: boolean;
  theme: EnhancedJungleThemeConfig;
}

export const defaultEnhancedNavState: EnhancedJungleNavState = {
  activeTab: "dashboard",
  isCollapsed: false,
  showParentGate: false,
  deviceCapabilities: getOptimalSettings(),
  twemojiEnabled: true,
  theme: enhancedJungleTheme,
};

/**
 * Utility functions for enhanced navigation
 */
export const navUtils = {
  /**
   * Check if Twemoji should be used based on device capabilities
   */
  shouldUseTwemoji: (capabilities: DeviceCapabilities): boolean => {
    return capabilities.twemoji && enhancedJungleTheme.twemoji.enabled;
  },

  /**
   * Get the appropriate emoji component based on settings
   */
  getEmojiComponent: (
    item: JungleNavItem,
    useTwemoji: boolean,
  ): string | React.ComponentType<any> => {
    if (useTwemoji) {
      return item.animal.twemojiComponent;
    }
    return item.animal.emoji;
  },

  /**
   * Get responsive emoji size based on screen size
   */
  getResponsiveEmojiSize: (breakpoint: keyof typeof navBreakpoints): number => {
    switch (breakpoint) {
      case "mobile":
        return 20;
      case "tablet":
        return 24;
      case "desktop":
        return 28;
      default:
        return 24;
    }
  },
};
