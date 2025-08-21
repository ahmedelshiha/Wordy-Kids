/**
 * 🎨 Builder.io Component Registration
 * Register JungleKidNav with full animation configurability
 * 
 * NOTE: This integration is optional and only works if @builder.io/react is installed
 */

import { JungleKidNav } from "@/components/JungleKidNav";
import { jungleNavPresets, getPresetDisplayName } from "./jungle-nav-presets";

// Conditional Builder.io import - only if package is available
let Builder: any = null;
try {
  // Try to dynamically import Builder.io
  const builderModule = require('@builder.io/react');
  Builder = builderModule?.Builder;
} catch (error) {
  // Builder.io not installed - this is fine, app will work without it
  console.log('ℹ️ Builder.io not installed - component registration skipped');
}

// 🔧 Export registration function for manual setup
export const registerJungleKidNavComponent = () => {
  if (!Builder) {
    console.log('⚠️ Builder.io not available - skipping component registration');
    return;
  }

  try {
    // 🎯 Register JungleKidNav with Builder.io
    Builder.registerComponent(JungleKidNav, {
      name: "JungleKidNav",
      friendlyName: "Jungle Kid Navigation",
      description:
        "Immersive jungle-themed navigation with animal guides and configurable animations",
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fpwb%2F8b6b83c4c0c34a0c93e92b5a5e52c9b0",

      inputs: [
        // 🎯 Preset Configuration (Simplified UX)
        {
          name: "preset",
          friendlyName: "Animation Preset",
          type: "string",
          enum: jungleNavPresets.map(preset => ({
            label: getPresetDisplayName(preset.id),
            value: preset.id
          })),
          defaultValue: "balanced-adventure",
          helperText: "Choose a pre-configured animation style. Reduces configuration complexity and ensures optimal UX.",
          advanced: false,
        },

        // 🧭 Core Navigation
        {
          name: "activeTab",
          friendlyName: "Active Tab",
          type: "string",
          enum: ["dashboard", "learn", "games", "achievements", "library"],
          defaultValue: "dashboard",
          helperText: "Currently active navigation tab",
        },
        {
          name: "userRole",
          friendlyName: "User Role",
          type: "string",
          enum: ["child", "parent"],
          defaultValue: "child",
          helperText: "Display mode for child or parent user",
        },

        // 🎨 Animation Configuration
        {
          name: "idleSpeed",
          friendlyName: "Animation Speed",
          type: "string",
          enum: [
            { label: "Slow (12s cycles)", value: "slow" },
            { label: "Medium (10s cycles)", value: "medium" },
            { label: "Fast (8s cycles)", value: "fast" },
          ],
          defaultValue: "slow",
          helperText:
            "Controls how fast animal idle animations cycle. Slow = most peaceful.",
          advanced: false,
        },
        {
          name: "intensity",
          friendlyName: "Animation Intensity",
          type: "string",
          enum: [
            { label: "Subtle (gentle movements)", value: "subtle" },
            { label: "Normal (moderate movements)", value: "normal" },
            { label: "Playful (dynamic movements)", value: "playful" },
          ],
          defaultValue: "subtle",
          helperText:
            "Controls animation scale and rotation intensity. Subtle recommended for focus.",
          advanced: false,
        },
        {
          name: "idlePauseDuration",
          friendlyName: "Pause Duration",
          type: "string",
          enum: [
            { label: "Short (2s) - Energetic", value: "short" },
            { label: "Medium (4s) - Balanced", value: "medium" },
            { label: "Long (6s) - Calm", value: "long" },
          ],
          defaultValue: "long",
          helperText:
            "Controls how long animations pause between movements. Longer = calmer experience.",
          advanced: false,
        },
        {
          name: "rareEffects",
          friendlyName: "Magical Effects",
          type: "boolean",
          defaultValue: true,
          helperText:
            "Enable sparkles, fireflies, and other rare magical effects (5-15% visible time)",
          advanced: false,
        },

        // 🎵 Audio & Theme
        {
          name: "theme",
          friendlyName: "Visual Theme",
          type: "string",
          enum: [
            { label: "Jungle Adventure", value: "jungle" },
            { label: "Simple Clean", value: "simple" },
          ],
          defaultValue: "jungle",
          helperText:
            "jungle = immersive jungle theme, simple = minimal clean theme",
        },
        {
          name: "enableSounds",
          friendlyName: "Sound Effects",
          type: "boolean",
          defaultValue: true,
          helperText: "Enable animal sounds and interaction audio feedback",
        },

        // 🧭 Menu Customization
        {
          name: "menuItems",
          friendlyName: "Custom Menu Items",
          type: "list",
          subFields: [
            {
              name: "label",
              friendlyName: "Menu Label",
              type: "string",
              required: true,
            },
            {
              name: "link",
              friendlyName: "Navigation Link",
              type: "string",
              required: true,
              helperText: "e.g., /games or /learn",
            },
            {
              name: "icon",
              friendlyName: "Icon Emoji",
              type: "string",
              defaultValue: "🌟",
              helperText: "Emoji to display (e.g., 🎮, 📚, 🏆)",
            },
            {
              name: "animal",
              friendlyName: "Animal Guide",
              type: "string",
              enum: ["owl", "parrot", "monkey", "elephant"],
              defaultValue: "parrot",
              helperText: "Which animal guide to associate with this menu item",
            },
          ],
          helperText:
            "Override default navigation items with custom menu structure",
          advanced: true,
        },

        // ♿ Accessibility & Performance
        {
          name: "reducedMotion",
          friendlyName: "Reduced Motion",
          type: "boolean",
          defaultValue: false,
          helperText:
            "Force reduced motion mode (overrides user system preference)",
          advanced: true,
        },
        {
          name: "autoOptimize",
          friendlyName: "Auto Performance",
          type: "boolean",
          defaultValue: true,
          helperText:
            "Automatically optimize animations based on device capabilities",
          advanced: true,
        },
        {
          name: "enableParticles",
          friendlyName: "Particle Effects",
          type: "boolean",
          defaultValue: true,
          helperText: "Enable floating particles and background elements",
          advanced: true,
        },

        // 🔒 Parent Controls
        {
          name: "showParentGate",
          friendlyName: "Parent Gate",
          type: "boolean",
          defaultValue: true,
          helperText: "Show parent verification before accessing parent features",
          advanced: true,
        },
      ],

      // 📱 Responsive Behavior
      noWrap: true,
      canHaveChildren: false,

      // 🎯 Default Styles
      defaultStyles: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        width: "100%",
      },

      // 🧪 Preview in Builder.io
      previewTabs: [
        {
          label: "Desktop",
          width: 1200,
          height: 800,
        },
        {
          label: "Tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Mobile",
          width: 375,
          height: 667,
        },
      ],
    });

    // 🎨 Register Preset Bundle Components
    jungleNavPresets.forEach(preset => {
      Builder.registerComponent(JungleKidNav, {
        name: `JungleKidNav-${preset.id}`,
        friendlyName: `${preset.icon} ${preset.name}`,
        description: preset.description,
        inputs: [
          {
            name: "activeTab",
            friendlyName: "Active Tab",
            type: "string",
            enum: ["dashboard", "learn", "games", "achievements", "library"],
            defaultValue: "dashboard"
          }
        ],
        defaults: {
          bindings: {
            // Animation config
            "component.options.idleSpeed": preset.config.idleSpeed || "slow",
            "component.options.intensity": preset.config.intensity || "subtle",
            "component.options.idlePauseDuration": preset.config.idlePauseDuration || "long",
            "component.options.rareEffects": preset.config.rareEffects || false,
            "component.options.reducedMotion": preset.config.reducedMotion || false,

            // Additional props
            ...Object.entries(preset.additionalProps || {}).reduce((acc, [key, value]) => {
              acc[`component.options.${key}`] = value;
              return acc;
            }, {} as Record<string, any>)
          }
        },
        // Add category for better organization
        tags: preset.id.includes('accessibility') ? ['accessibility'] :
              preset.id.includes('learning') ? ['education'] :
              ['engagement']
      });
    });

    console.log("✅ JungleKidNav registered with Builder.io");
    console.log("🎨 Available animation presets: Calm, Playful");
    console.log("🎯 Configurable props: idleSpeed, intensity, rareEffects");
  } catch (error) {
    console.error('❌ Failed to register JungleKidNav with Builder.io:', error);
  }
};

export default registerJungleKidNavComponent;
