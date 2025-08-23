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
          defaultValue: "����",
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

// Register Enhanced Word Card component
Builder.registerComponent(EnhancedWordCard, {
  name: "Enhanced Word Card",
  friendlyName: "📚 Educational Word Card",
  description: "Interactive word learning card with audio, definitions, and mastery tracking",
  image: "https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d",

  inputs: [
    {
      name: "word",
      friendlyName: "Word Data",
      type: "object",
      required: true,
      subFields: [
        {
          name: "id",
          friendlyName: "Word ID",
          type: "number",
          required: true,
          defaultValue: 1,
          description: "Unique identifier for the word"
        },
        {
          name: "word",
          friendlyName: "Word Text",
          type: "string",
          required: true,
          defaultValue: "adventure",
          description: "The word to display and teach"
        },
        {
          name: "pronunciation",
          friendlyName: "Pronunciation Guide",
          type: "string",
          defaultValue: "ad-VEN-cher",
          description: "Phonetic pronunciation guide"
        },
        {
          name: "definition",
          friendlyName: "Definition",
          type: "text",
          required: true,
          defaultValue: "An exciting or unusual experience",
          description: "Clear definition of the word"
        },
        {
          name: "example",
          friendlyName: "Example Sentence",
          type: "text",
          defaultValue: "We went on an adventure in the jungle",
          description: "Example sentence using the word"
        },
        {
          name: "funFact",
          friendlyName: "Fun Fact",
          type: "text",
          description: "Interesting fact about the word"
        },
        {
          name: "emoji",
          friendlyName: "Word Emoji",
          type: "string",
          defaultValue: "🗺️",
          description: "Visual emoji representation"
        },
        {
          name: "category",
          friendlyName: "Category",
          type: "string",
          enum: ["animals", "nature", "actions", "emotions", "objects", "places"],
          defaultValue: "actions",
          description: "Word category"
        },
        {
          name: "difficulty",
          friendlyName: "Difficulty Level",
          type: "string",
          enum: ["easy", "medium", "hard"],
          defaultValue: "medium",
          description: "Learning difficulty"
        },
        {
          name: "imageUrl",
          friendlyName: "Word Image",
          type: "file",
          allowedFileTypes: ["jpg", "png", "gif", "svg"],
          description: "Visual representation image"
        }
      ]
    },
    {
      name: "showDefinition",
      friendlyName: "Show Definition Initially",
      type: "boolean",
      defaultValue: false,
      description: "Whether to show definition immediately"
    },
    {
      name: "showVocabularyBuilder",
      friendlyName: "Show Vocabulary Builder",
      type: "boolean",
      defaultValue: true,
      description: "Enable vocabulary building features"
    },
    {
      name: "className",
      friendlyName: "CSS Classes",
      type: "string",
      description: "Additional CSS classes for custom styling"
    }
  ],

  canHaveChildren: false,
  tags: ["education", "vocabulary", "learning", "words", "interactive"],

  defaultStyles: {
    maxWidth: "400px",
    margin: "0 auto"
  }
});

// Register Adventure Map component
Builder.registerComponent(AdventureMap, {
  name: "Adventure Map",
  friendlyName: "🗺️ Adventure Learning Map",
  description: "Interactive adventure map for word rescue games and exploration",
  image: "https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d",

  inputs: [
    {
      name: "wordsNeedingRescue",
      friendlyName: "Words to Rescue",
      type: "list",
      description: "List of words that need to be rescued in the adventure",
      subFields: [
        {
          name: "id",
          type: "string",
          required: true
        },
        {
          name: "word",
          type: "string",
          required: true
        },
        {
          name: "zone",
          type: "string",
          enum: ["word_forest", "memory_castle", "vocabulary_village", "dragon_peak", "crystal_caves"],
          defaultValue: "word_forest"
        },
        {
          name: "difficulty",
          type: "string",
          enum: ["easy", "medium", "hard"],
          defaultValue: "medium"
        },
        {
          name: "status",
          type: "string",
          enum: ["captured", "rescued", "mastered"],
          defaultValue: "captured"
        }
      ]
    },
    {
      name: "wordHero",
      friendlyName: "Word Hero Character",
      type: "object",
      description: "The hero character exploring the map",
      subFields: [
        {
          name: "name",
          type: "string",
          defaultValue: "Word Explorer",
          description: "Hero's name"
        },
        {
          name: "level",
          type: "number",
          defaultValue: 1,
          description: "Hero's level"
        },
        {
          name: "health",
          type: "number",
          defaultValue: 100,
          description: "Hero's health points"
        },
        {
          name: "experience",
          type: "number",
          defaultValue: 0,
          description: "Hero's experience points"
        },
        {
          name: "currentZone",
          type: "string",
          enum: ["word_forest", "memory_castle", "vocabulary_village", "dragon_peak", "crystal_caves"],
          defaultValue: "word_forest",
          description: "Current zone location"
        }
      ]
    },
    {
      name: "className",
      friendlyName: "CSS Classes",
      type: "string",
      description: "Additional CSS classes for custom styling"
    }
  ],

  canHaveChildren: false,
  tags: ["education", "adventure", "map", "games", "interactive"],

  defaultStyles: {
    width: "100%",
    minHeight: "500px"
  }
});

// Export for potential external use
export { JungleKidNav, EnhancedWordCard, AdventureMap };

console.log('✅ Builder.io educational components registered successfully');

/**
 * Usage in Builder.io:
 *
 * 🌿 JUNGLE KID NAVIGATION:
 * 1. Drag "Jungle Kid Navigation" from the component library
 * 2. Configure animals, sounds, and animations in the visual editor
 * 3. Set custom menu items or use defaults (🦉 Home, 🦜 Learn, 🐵 Play, 🐘 Achievements)
 * 4. Choose theme: "jungle" for full experience, "simple" for basic navigation
 * 5. Configure accessibility and performance settings as needed
 *
 * 📚 ENHANCED WORD CARD:
 * 1. Drag "Educational Word Card" from the component library
 * 2. Configure word data: text, definition, pronunciation, example
 * 3. Set difficulty level and category
 * 4. Upload word image or choose emoji representation
 * 5. Enable/disable vocabulary builder features
 *
 * 🗺️ ADVENTURE MAP:
 * 1. Drag "Adventure Learning Map" from the component library
 * 2. Configure words to rescue across different zones
 * 3. Set up word hero character with level and stats
 * 4. Customize adventure zones and difficulty levels
 * 5. Enable interactive exploration features
 *
 * The components automatically:
 * - Adapt to screen size (desktop/tablet/mobile)
 * - Optimize performance based on device capabilities
 * - Provide accessibility features (ARIA, keyboard navigation)
 * - Respect user motion preferences
 * - Include educational progress tracking
 */
