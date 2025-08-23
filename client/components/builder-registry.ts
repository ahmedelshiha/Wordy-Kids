/**
 * Builder.io Component Registration
 * Register custom components for use in Builder.io pages
 */

import { Builder } from "@builder.io/react";
import JungleKidNav from "@/components/JungleKidNav";
import { EnhancedWordCard } from "@/components/EnhancedWordCard";
import { AdventureMap } from "@/components/AdventureMap";

// Register JungleKidNav component with Builder.io
Builder.registerComponent(JungleKidNav, {
  name: "JungleKidNav",
  friendlyName: "🌿 Jungle Kid Navigation",
  description:
    "Immersive jungle-themed navigation with animal guides and interactive animations",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d",

  inputs: [
    // Core Navigation Settings
    {
      name: "activeTab",
      friendlyName: "Active Tab",
      type: "string",
      defaultValue: "dashboard",
      enum: ["dashboard", "learn", "quiz", "achievements"],
      description: "Currently active navigation tab",
    },
    {
      name: "userRole",
      friendlyName: "User Role",
      type: "string",
      defaultValue: "child",
      enum: ["child", "parent"],
      description: "Current user role for appropriate navigation display",
    },

    // Menu Configuration
    {
      name: "menuItems",
      friendlyName: "Custom Menu Items",
      type: "list",
      description: "Override default navigation with custom menu items",
      subFields: [
        {
          name: "label",
          friendlyName: "Label",
          type: "string",
          required: true,
          description: "Display name for the navigation item",
        },
        {
          name: "link",
          friendlyName: "Link/Route",
          type: "string",
          required: true,
          description: "Navigation route or URL",
        },
        {
          name: "icon",
          friendlyName: "Icon/Emoji",
          type: "string",
          defaultValue: "🌟",
          description: "Emoji or icon to display (e.g., 🦉, 🦜, 🐵, 🐘)",
        },
        {
          name: "animal",
          friendlyName: "Animal Guide",
          type: "string",
          description: "Animal character name for this section",
        },
      ],
    },

    // Theme and Visual Settings
    {
      name: "theme",
      friendlyName: "Navigation Theme",
      type: "string",
      defaultValue: "jungle",
      enum: ["jungle", "simple"],
      description: "Choose between immersive jungle theme or simple navigation",
    },
    {
      name: "enableSounds",
      friendlyName: "Enable Sounds",
      type: "boolean",
      defaultValue: true,
      description: "Enable animal sounds and audio feedback",
    },
    {
      name: "animations",
      friendlyName: "Enable Animations",
      type: "boolean",
      defaultValue: true,
      description: "Enable hover effects and animal animations",
    },
    {
      name: "enableParticles",
      friendlyName: "Enable Particle Effects",
      type: "boolean",
      defaultValue: true,
      description: "Enable fireflies and magical particle effects",
    },

    // Accessibility and Performance
    {
      name: "reducedMotion",
      friendlyName: "Reduced Motion",
      type: "boolean",
      defaultValue: false,
      description:
        "Disable animations for accessibility (overrides animation settings)",
    },
    {
      name: "autoOptimize",
      friendlyName: "Auto Performance Optimization",
      type: "boolean",
      defaultValue: true,
      description: "Automatically optimize for device performance",
    },

    // Parent Controls
    {
      name: "showParentGate",
      friendlyName: "Show Parent Gate",
      type: "boolean",
      defaultValue: true,
      description: "Display parent access button for family controls",
    },

    // Styling
    {
      name: "className",
      friendlyName: "CSS Classes",
      type: "string",
      description: "Additional CSS classes for custom styling",
    },
  ],

  // Define component behavior
  canHaveChildren: false,
  noWrap: false,

  // Default styles
  defaultStyles: {
    position: "fixed",
    bottom: "0",
    left: "0",
    right: "0",
    zIndex: "40",
  },

  // Component category in Builder.io
  tags: ["navigation", "kids", "jungle", "animals", "interactive"],

  // Advanced configuration
  hideFromInsertMenu: false,

  // Responsive behavior
  responsiveStyles: {
    large: {
      height: "100px",
    },
    medium: {
      height: "80px",
    },
    small: {
      height: "70px",
    },
  },
});

// Export for potential external use
export { JungleKidNav };

/**
 * Usage in Builder.io:
 *
 * 1. Drag "Jungle Kid Navigation" from the component library
 * 2. Configure animals, sounds, and animations in the visual editor
 * 3. Set custom menu items or use defaults (🦉 Home, 🦜 Learn, 🐵 Play, 🐘 Achievements)
 * 4. Choose theme: "jungle" for full experience, "simple" for basic navigation
 * 5. Configure accessibility and performance settings as needed
 *
 * The component automatically:
 * - Adapts to screen size (desktop/tablet/mobile)
 * - Optimizes performance based on device capabilities
 * - Provides accessibility features (ARIA, keyboard navigation)
 * - Respects user motion preferences
 * - Includes parent gate for family controls
 */
