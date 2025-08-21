import {
  ParentMenuIconVariant,
  ParentMenuAnimationStyle,
} from "../components/JungleAdventureNavV2";

/**
 * Builder.io Configuration Controls for Jungle Parent Menu
 *
 * These configuration options can be used in Builder.io to customize
 * the Parent Menu Icon behavior and appearance.
 */

export interface JungleParentMenuConfig {
  /** Show/hide parent menu icon on mobile */
  showParentMenuIcon: boolean;
  /** Choose parent menu icon variant */
  parentMenuIconVariant: ParentMenuIconVariant;
  /** Select animation style for parent menu */
  parentMenuAnimationStyle: ParentMenuAnimationStyle;
  /** Configure which sections appear in parent dialog */
  parentDialogSections: {
    dashboard: boolean;
    settings: boolean;
    signOut: boolean;
  };
}

/**
 * Default configuration for Builder.io
 */
export const DEFAULT_PARENT_MENU_CONFIG: JungleParentMenuConfig = {
  showParentMenuIcon: true,
  parentMenuIconVariant: "totem",
  parentMenuAnimationStyle: "breathing",
  parentDialogSections: {
    dashboard: true,
    settings: true,
    signOut: true,
  },
};

/**
 * Builder.io Input Configuration Schema
 *
 * This can be used in Builder.io to create a visual configuration interface
 * for customizing the Parent Menu behavior.
 */
export const BUILDER_IO_PARENT_MENU_INPUTS = [
  {
    name: "showParentMenuIcon",
    type: "boolean",
    defaultValue: true,
    helperText: 'Show Parent Menu icon on mobile (replaces "More ..." menu)',
  },
  {
    name: "parentMenuIconVariant",
    type: "select",
    defaultValue: "totem",
    options: [
      { label: "🪵 Carved Totem (Default)", value: "totem" },
      { label: "🛡️ Tribal Shield", value: "shield" },
      { label: "🔑 Golden Key", value: "key" },
    ],
    helperText: "Choose the jungle-themed icon for the parent menu",
  },
  {
    name: "parentMenuAnimationStyle",
    type: "select",
    defaultValue: "breathing",
    options: [
      { label: "Breathing Animation (6s cycle)", value: "breathing" },
      { label: "Firefly Glow Effect", value: "glow" },
      { label: "No Animation", value: "none" },
    ],
    helperText: "Select animation style (respects prefers-reduced-motion)",
  },
  {
    name: "parentDialogSections.dashboard",
    type: "boolean",
    defaultValue: true,
    helperText: "Show Parent Dashboard section in menu",
  },
  {
    name: "parentDialogSections.settings",
    type: "boolean",
    defaultValue: true,
    helperText: "Show Settings section in menu",
  },
  {
    name: "parentDialogSections.signOut",
    type: "boolean",
    defaultValue: true,
    helperText: "Show Sign Out/Register section in menu",
  },
];

/**
 * Icon Variant Descriptions for Documentation
 */
export const ICON_VARIANT_DESCRIPTIONS = {
  totem: {
    emoji: "🪵",
    name: "Carved Totem",
    description:
      "A mystical jungle totem, representing ancient wisdom and guidance",
    accessibility: "Carved wooden totem pole",
  },
  shield: {
    emoji: "🛡️",
    name: "Tribal Shield",
    description:
      "A protective tribal shield, symbolizing family safety and security",
    accessibility: "Tribal protective shield",
  },
  key: {
    emoji: "🔑",
    name: "Golden Key",
    description:
      "A golden key, representing access to family controls and settings",
    accessibility: "Golden key for family access",
  },
};

/**
 * Animation Style Descriptions
 */
export const ANIMATION_STYLE_DESCRIPTIONS = {
  breathing: {
    name: "Gentle Breathing",
    description: "Soft 6-second breathing animation (scale 1 → 1.05 → 1)",
    performance: "Low impact, smooth CSS animation",
    accessibility: "Respects prefers-reduced-motion",
  },
  glow: {
    name: "Firefly Glow",
    description: "Soft firefly-like glow aura around the icon",
    performance: "Medium impact, box-shadow animation",
    accessibility: "Disabled for reduced motion preferences",
  },
  none: {
    name: "No Animation",
    description: "Static icon with no continuous animations",
    performance: "No performance impact",
    accessibility: "Fully accessible, no motion",
  },
};
