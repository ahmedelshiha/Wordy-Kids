/**
 * 🎨 Jungle Adventure Animation Tokens
 * Centralized animation system for consistent, configurable UX
 */

export interface JungleAnimationConfig {
  idleSpeed: "slow" | "medium" | "fast";
  intensity: "subtle" | "normal" | "playful";
  idlePauseDuration: "short" | "medium" | "long";
  animationStyle: "breathing" | "glow" | "micro" | "none";
  rareEffects: boolean;
  reducedMotion: boolean;
}

// 🎯 Core Animation Timings
export const jungleAnimationTimings = {
  // Idle animation speeds (85-95% calm time)
  idleSlow: "12s ease-in-out infinite alternate",
  idleMedium: "10s ease-in-out infinite alternate",
  idleFast: "8s ease-in-out infinite alternate",

  // Interaction animations
  hover: "0.6s ease-out forwards",
  celebration: "0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
  active: "2s ease-in-out infinite",

  // Rare magical effects (5-15% visible time)
  sparkle: "20s ease-in-out infinite alternate",
  firefly: "15s ease-in-out infinite alternate",
  vines: "8s ease-in-out infinite",

  // Background ambient effects
  floating: "12s ease-in-out infinite",
  particles: "18s ease-in-out infinite",
} as const;

// ⏸️ Idle Pause Duration Controls (addresses "too fast without stopping" concern)
export const jungleAnimationPause = {
  short: "2s",  // Quick rest - more energetic feel
  medium: "4s", // Balanced pause - standard calm
  long: "6s",   // Extended rest - maximum calmness (default)
} as const;

// 🎨 Animation Intensity Levels
export const jungleAnimationIntensity = {
  subtle: {
    scale: {
      hover: 1.02,
      tap: 1.05,
      active: 1.03,
    },
    rotate: {
      hover: 2,
      tap: 5,
      sway: 1,
    },
    translate: {
      float: 2,
      bounce: 1,
    },
  },
  normal: {
    scale: {
      hover: 1.05,
      tap: 1.1,
      active: 1.05,
    },
    rotate: {
      hover: 3,
      tap: 8,
      sway: 2,
    },
    translate: {
      float: 4,
      bounce: 2,
    },
  },
  playful: {
    scale: {
      hover: 1.1,
      tap: 1.15,
      active: 1.08,
    },
    rotate: {
      hover: 5,
      tap: 12,
      sway: 3,
    },
    translate: {
      float: 6,
      bounce: 3,
    },
  },
} as const;

// 🎲 Random Delay Generators
export const generateAnimalDelays = () => ({
  owl: Math.random() * 3, // 0-3s
  parrot: Math.random() * 4 + 2, // 2-6s
  monkey: Math.random() * 5 + 3, // 3-8s
  elephant: Math.random() * 6 + 4, // 4-10s
  butterfly: Math.random() * 8 + 1, // 1-9s
  firefly: Math.random() * 10 + 5, // 5-15s
});

// 🌟 Rare Effect Configurations
export const rareEffectConfig = {
  sparkle: {
    probability: 0.15, // 15% visible time
    duration: 3000, // 3 seconds visible
    interval: 20000, // Every 20 seconds
  },
  firefly: {
    probability: 0.1, // 10% visible time
    duration: 2000, // 2 seconds visible
    interval: 15000, // Every 15 seconds
  },
  magicalGlow: {
    probability: 0.05, // 5% visible time - very rare
    duration: 1500, // 1.5 seconds visible
    interval: 30000, // Every 30 seconds
  },
};

// 🎛️ Animation State Manager
export class JungleAnimationManager {
  private config: JungleAnimationConfig;
  private delays: ReturnType<typeof generateAnimalDelays>;

  constructor(config: JungleAnimationConfig) {
    this.config = config;
    this.delays = generateAnimalDelays();
  }

  // Get timing based on speed setting
  getIdleTiming(): string {
    if (this.config.reducedMotion) return "none";

    switch (this.config.idleSpeed) {
      case "slow":
        return jungleAnimationTimings.idleSlow;
      case "medium":
        return jungleAnimationTimings.idleMedium;
      case "fast":
        return jungleAnimationTimings.idleFast;
      default:
        return jungleAnimationTimings.idleSlow;
    }
  }

  // Get intensity values
  getIntensity() {
    return jungleAnimationIntensity[this.config.intensity];
  }

  // Get animal-specific delay
  getAnimalDelay(
    animal: keyof ReturnType<typeof generateAnimalDelays>,
  ): number {
    return this.delays[animal];
  }

  // Check if rare effects should be enabled
  shouldShowRareEffects(): boolean {
    return this.config.rareEffects && !this.config.reducedMotion;
  }

  // Get pause duration based on setting
  getPauseDuration(): string {
    if (this.config.reducedMotion) return "0s";
    return jungleAnimationPause[this.config.idlePauseDuration];
  }

  // Get animation style class
  getAnimationStyleClass(): string {
    if (this.config.reducedMotion) return 'style-none';
    return `style-${this.config.animationStyle}`;
  }

  // Generate CSS custom properties
  getCSSProperties(): Record<string, string> {
    const intensity = this.getIntensity();

    return {
      "--jungle-idle-timing": this.getIdleTiming(),
      "--jungle-pause-duration": this.getPauseDuration(),
      "--jungle-animation-style": this.config.animationStyle,
      "--jungle-hover-scale": intensity.scale.hover.toString(),
      "--jungle-tap-scale": intensity.scale.tap.toString(),
      "--jungle-active-scale": intensity.scale.active.toString(),
      "--jungle-hover-rotate": `${intensity.rotate.hover}deg`,
      "--jungle-tap-rotate": `${intensity.rotate.tap}deg`,
      "--jungle-sway-rotate": `${intensity.rotate.sway}deg`,
      "--jungle-float-translate": `${intensity.translate.float}px`,
      "--jungle-bounce-translate": `${intensity.translate.bounce}px`,
      "--owl-delay": `${this.delays.owl}s`,
      "--parrot-delay": `${this.delays.parrot}s`,
      "--monkey-delay": `${this.delays.monkey}s`,
      "--elephant-delay": `${this.delays.elephant}s`,
      "--butterfly-delay": `${this.delays.butterfly}s`,
      "--firefly-delay": `${this.delays.firefly}s`,
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<JungleAnimationConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Regenerate delays if speed changed
    if (newConfig.idleSpeed) {
      this.delays = generateAnimalDelays();
    }
  }
}

// 🔧 Utility Functions
export const detectReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export const createAnimationConfig = (
  overrides: Partial<JungleAnimationConfig> = {},
): JungleAnimationConfig => ({
  idleSpeed: "slow",
  intensity: "subtle",
  idlePauseDuration: "long", // Default to maximum calmness
  animationStyle: "breathing", // Default to calm breathing
  rareEffects: true,
  reducedMotion: detectReducedMotion(),
  ...overrides,
});

// 🎨 CSS Animation Classes Generator
export const generateAnimationClasses = (config: JungleAnimationConfig) => {
  const manager = new JungleAnimationManager(config);
  const intensity = manager.getIntensity();

  return {
    // Base animation classes
    idle: manager.getIdleTiming() !== "none" ? "jungle-animate-idle" : "",
    hover: "jungle-animate-hover",
    celebration: "jungle-animate-celebration",

    // Animation style classes
    animationStyle: manager.getAnimationStyleClass(),

    // Conditional classes
    rareEffects: manager.shouldShowRareEffects() ? "jungle-rare-effects" : "",
    reducedMotion: config.reducedMotion ? "jungle-reduced-motion" : "",

    // Intensity-based classes
    intensity: `jungle-intensity-${config.intensity}`,
    speed: `jungle-speed-${config.idleSpeed}`,
  };
};

// 🧪 Development Testing Utilities
export const developmentAnimationTriggers = {
  triggerCelebration: (element: HTMLElement) => {
    element.classList.add("jungle-celebration-trigger");
    setTimeout(() => {
      element.classList.remove("jungle-celebration-trigger");
    }, 1000);
  },

  triggerHover: (element: HTMLElement) => {
    element.classList.add("jungle-hover-trigger");
    setTimeout(() => {
      element.classList.remove("jungle-hover-trigger");
    }, 600);
  },

  triggerRareEffect: (type: keyof typeof rareEffectConfig) => {
    const elements = document.querySelectorAll(`.jungle-${type}-effect`);
    elements.forEach((el) => {
      el.classList.add("jungle-rare-active");
      setTimeout(() => {
        el.classList.remove("jungle-rare-active");
      }, rareEffectConfig[type].duration);
    });
  },
};

export default JungleAnimationManager;
