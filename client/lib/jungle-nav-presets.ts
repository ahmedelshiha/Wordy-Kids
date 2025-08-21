/**
 * 🎯 JungleKidNav Preset Bundles
 * Simplified configuration options for Builder.io editors
 * Reduces misconfiguration risk and improves UX
 */

import type { JungleAnimationConfig } from "./theme/animation";

// 🎓 Preset Bundle Definitions
export interface JungleNavPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<JungleAnimationConfig>;
  additionalProps?: {
    theme?: "jungle" | "simple";
    enableSounds?: boolean;
    enableParticles?: boolean;
    showParentGate?: boolean;
  };
}

export const jungleNavPresets: JungleNavPreset[] = [
  {
    id: "calm-learning",
    name: "Calm Learning",
    description:
      "Maximum focus environment - gentle breathing only, no distractions, optimal for studying and concentration",
    icon: "🧘",
    config: {
      idleSpeed: "slow",
      intensity: "subtle",
      idlePauseDuration: "long",
      animationStyle: "breathing",
      rareEffects: false,
      reducedMotion: false,
    },
    additionalProps: {
      theme: "simple",
      enableSounds: false,
      enableParticles: false,
      showParentGate: true,
    },
  },

  {
    id: "balanced-adventure",
    name: "Balanced Adventure",
    description:
      "Perfect balance of engagement and calm - soft glow effects with occasional magical elements",
    icon: "🌿",
    config: {
      idleSpeed: "medium",
      intensity: "normal",
      idlePauseDuration: "medium",
      animationStyle: "glow",
      rareEffects: true,
      reducedMotion: false,
    },
    additionalProps: {
      theme: "jungle",
      enableSounds: true,
      enableParticles: true,
      showParentGate: true,
    },
  },

  {
    id: "playful-adventure",
    name: "Playful Adventure",
    description:
      "High engagement mode - animal micro-movements add character, perfect for interactive learning",
    icon: "🎮",
    config: {
      idleSpeed: "fast",
      intensity: "playful",
      idlePauseDuration: "short",
      animationStyle: "micro",
      rareEffects: true,
      reducedMotion: false,
    },
    additionalProps: {
      theme: "jungle",
      enableSounds: true,
      enableParticles: true,
      showParentGate: true,
    },
  },

  {
    id: "accessibility-first",
    name: "Accessibility First",
    description:
      "Fully accessible mode - no animations, high contrast, screen reader optimized",
    icon: "♿",
    config: {
      idleSpeed: "slow",
      intensity: "subtle",
      idlePauseDuration: "long",
      animationStyle: "none",
      rareEffects: false,
      reducedMotion: true,
    },
    additionalProps: {
      theme: "simple",
      enableSounds: false,
      enableParticles: false,
      showParentGate: false,
    },
  },

  {
    id: "bedtime-mode",
    name: "Bedtime Mode",
    description:
      "Ultra-calm evening mode - gentle breathing only, perfect for wind-down activities",
    icon: "🌙",
    config: {
      idleSpeed: "slow",
      intensity: "subtle",
      idlePauseDuration: "long",
      animationStyle: "breathing",
      rareEffects: false,
      reducedMotion: false,
    },
    additionalProps: {
      theme: "simple",
      enableSounds: false,
      enableParticles: false,
      showParentGate: true,
    },
  },

  {
    id: "high-energy",
    name: "High Energy",
    description:
      "Maximum engagement mode - animal micro-movements with glow effects for active learning",
    icon: "⚡",
    config: {
      idleSpeed: "fast",
      intensity: "playful",
      idlePauseDuration: "short",
      animationStyle: "micro",
      rareEffects: true,
      reducedMotion: false,
    },
    additionalProps: {
      theme: "jungle",
      enableSounds: true,
      enableParticles: true,
      showParentGate: true,
    },
  },
];

// 🎯 Preset Application Functions
export const getPresetById = (
  presetId: string,
): JungleNavPreset | undefined => {
  return jungleNavPresets.find((preset) => preset.id === presetId);
};

export const getPresetConfig = (
  presetId: string,
): Partial<JungleAnimationConfig> | undefined => {
  const preset = getPresetById(presetId);
  return preset?.config;
};

export const getAllPresetProps = (
  presetId: string,
): Record<string, any> | undefined => {
  const preset = getPresetById(presetId);
  if (!preset) return undefined;

  return {
    ...preset.config,
    ...preset.additionalProps,
  };
};

// 🏷️ Preset Categories for Builder.io Organization
export const presetCategories = {
  "Learning Modes": ["calm-learning", "balanced-adventure", "bedtime-mode"],
  "Engagement Levels": ["playful-adventure", "high-energy"],
  Accessibility: ["accessibility-first"],
};

// 📊 Preset Comparison Chart
export const presetComparison = {
  "calm-learning": {
    focus: 10,
    engagement: 3,
    accessibility: 9,
    performance: 10,
  },
  "balanced-adventure": {
    focus: 7,
    engagement: 7,
    accessibility: 7,
    performance: 8,
  },
  "playful-adventure": {
    focus: 4,
    engagement: 10,
    accessibility: 6,
    performance: 6,
  },
  "accessibility-first": {
    focus: 8,
    engagement: 2,
    accessibility: 10,
    performance: 10,
  },
  "bedtime-mode": {
    focus: 9,
    engagement: 1,
    accessibility: 9,
    performance: 10,
  },
  "high-energy": { focus: 2, engagement: 10, accessibility: 4, performance: 4 },
};

// 🎨 Builder.io Display Helpers
export const getPresetDisplayName = (presetId: string): string => {
  const preset = getPresetById(presetId);
  return preset ? `${preset.icon} ${preset.name}` : presetId;
};

export const getPresetDescription = (presetId: string): string => {
  const preset = getPresetById(presetId);
  return preset?.description || "Custom configuration";
};

// 🔧 Development Utilities
export const validatePreset = (preset: JungleNavPreset): boolean => {
  const requiredFields = ["id", "name", "description", "icon", "config"];
  return requiredFields.every((field) => field in preset);
};

export const getPresetPerformanceScore = (presetId: string): number => {
  const scores = presetComparison[presetId as keyof typeof presetComparison];
  return scores ? scores.performance : 5;
};

export default jungleNavPresets;
