// client/lib/builder-registry.ts
import { Builder } from "@builder.io/react";
import React from "react";

// Create fallback component factory
const createFallbackComponent = (componentName: string) => {
  return React.forwardRef<HTMLDivElement, any>((props, ref) => {
    return React.createElement(
      "div",
      {
        ref,
        className:
          "p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50",
        style: {
          minHeight: "100px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      [
        React.createElement(
          "h3",
          {
            key: "title",
            className: "font-bold text-gray-600 mb-2",
          },
          `📚 ${componentName}`,
        ),
        React.createElement(
          "p",
          {
            key: "desc",
            className: "text-sm text-gray-500 text-center",
          },
          "Educational component placeholder",
        ),
        props.children,
      ],
    );
  });
};

// Import components with fallbacks
const importComponent = (componentPath: string, fallbackName: string) => {
  try {
    const component = require(componentPath);
    return (
      component.default ||
      component[fallbackName] ||
      createFallbackComponent(fallbackName)
    );
  } catch (error) {
    console.warn(
      `Component ${componentPath} not found, using fallback for ${fallbackName}`,
    );
    return createFallbackComponent(fallbackName);
  }
};

// Safely import components with fallbacks
const JungleKidNav = importComponent(
  "../components/JungleKidNav",
  "JungleKidNav",
);
const WordCard = importComponent("../components/WordCard", "WordCard");
const WordGarden = importComponent("../components/WordGarden", "WordGarden");
const SettingsPanel = importComponent(
  "../components/SettingsPanel",
  "SettingsPanel",
);
const AchievementBadge = importComponent(
  "../components/AchievementBadge",
  "AchievementBadge",
);
const ProgressTracker = importComponent(
  "../components/ProgressTracker",
  "ProgressTracker",
);
const InteractiveQuiz = importComponent(
  "../components/InteractiveQuiz",
  "InteractiveQuiz",
);
const ParentDashboard = importComponent(
  "../components/ParentDashboard",
  "ParentDashboard",
);
const AIWordRecommendation = importComponent(
  "../components/AIWordRecommendation",
  "AIWordRecommendation",
);

// Register Jungle Kid Navigation Component
Builder.registerComponent(JungleKidNav, {
  name: "Jungle Kid Navigation",
  description: "Main navigation component with jungle theme and user avatar",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F7b3bb6b7d6d54c8a8f2e1c4f8a9e2b3c",
  inputs: [
    {
      name: "user",
      type: "object",
      helperText: "User information including name and avatar",
      subFields: [
        {
          name: "name",
          type: "string",
          required: true,
          defaultValue: "Little Explorer",
          helperText: "Child's display name",
        },
        {
          name: "avatar",
          type: "file",
          required: false,
          allowedFileTypes: ["jpg", "png", "gif", "svg"],
          helperText: "Child's avatar image",
        },
      ],
    },
    {
      name: "showProgress",
      type: "boolean",
      defaultValue: true,
      helperText: "Display learning progress indicators",
    },
    {
      name: "theme",
      type: "string",
      enum: ["jungle", "ocean", "space", "forest"],
      defaultValue: "jungle",
      helperText: "Visual theme for the navigation",
    },
    {
      name: "enableSounds",
      type: "boolean",
      defaultValue: true,
      helperText: "Enable interactive sound effects",
    },
  ],
  canHaveChildren: false,
  hideFromInsertMenu: false,
});

// Register Educational Word Card Component
Builder.registerComponent(WordCard, {
  name: "Educational Word Card",
  description: "Interactive word learning card with audio and visual elements",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
  inputs: [
    {
      name: "word",
      type: "string",
      required: true,
      defaultValue: "Elephant",
      helperText: "The word to display and teach",
    },
    {
      name: "definition",
      type: "text",
      required: true,
      defaultValue: "A large gray animal with a trunk and big ears",
      helperText: "Simple, kid-friendly definition",
    },
    {
      name: "pronunciation",
      type: "string",
      required: false,
      defaultValue: "EL-uh-fuhnt",
      helperText: 'Phonetic pronunciation guide (e.g., "EL-uh-fuhnt")',
    },
    {
      name: "audioUrl",
      type: "file",
      allowedFileTypes: ["mp3", "wav", "ogg"],
      helperText: "Audio pronunciation of the word",
    },
    {
      name: "imageUrl",
      type: "file",
      allowedFileTypes: ["jpg", "png", "gif", "svg"],
      helperText: "Visual representation of the word",
    },
    {
      name: "difficulty",
      type: "string",
      enum: ["easy", "medium", "hard"],
      defaultValue: "easy",
      helperText: "Learning difficulty level",
    },
    {
      name: "category",
      type: "string",
      enum: ["animals", "colors", "shapes", "numbers", "letters", "actions"],
      defaultValue: "animals",
      helperText: "Word category for organization",
    },
    {
      name: "animationStyle",
      type: "string",
      enum: ["bounce", "fade", "slide", "flip"],
      defaultValue: "bounce",
      helperText: "Card animation style",
    },
    {
      name: "showHint",
      type: "boolean",
      defaultValue: true,
      helperText: "Display visual hints for the word",
    },
  ],
  canHaveChildren: false,
});

// Register Word Learning Garden Component
Builder.registerComponent(WordGarden, {
  name: "Word Learning Garden",
  description: "Interactive garden-themed word learning environment",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q",
  inputs: [
    {
      name: "wordList",
      type: "list",
      helperText: "List of words to include in the garden",
      defaultValue: [
        { word: "cat", learned: true, plantType: "flower" },
        { word: "dog", learned: false, plantType: "tree" },
        { word: "bird", learned: false, plantType: "bush" },
      ],
      subFields: [
        {
          name: "word",
          type: "string",
          required: true,
          helperText: "Word to plant in garden",
        },
        {
          name: "learned",
          type: "boolean",
          defaultValue: false,
          helperText: "Whether child has mastered this word",
        },
        {
          name: "plantType",
          type: "string",
          enum: ["flower", "tree", "bush", "vine"],
          defaultValue: "flower",
          helperText: "Visual plant representation",
        },
      ],
    },
    {
      name: "gameMode",
      type: "string",
      enum: ["practice", "challenge", "review", "quiz"],
      defaultValue: "practice",
      helperText: "Learning interaction mode",
    },
    {
      name: "maxWords",
      type: "number",
      defaultValue: 10,
      min: 5,
      max: 25,
      helperText: "Maximum words to display at once",
    },
    {
      name: "enableWeather",
      type: "boolean",
      defaultValue: true,
      helperText: "Show animated weather effects",
    },
    {
      name: "gardenTheme",
      type: "string",
      enum: ["tropical", "enchanted", "desert", "arctic"],
      defaultValue: "tropical",
      helperText: "Garden environment theme",
    },
  ],
  canHaveChildren: false,
});

// Register Achievement Badge Component
Builder.registerComponent(AchievementBadge, {
  name: "Achievement Badge",
  description: "Reward badge for learning milestones",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r",
  inputs: [
    {
      name: "badgeType",
      type: "string",
      enum: ["bronze", "silver", "gold", "platinum", "diamond"],
      defaultValue: "bronze",
      helperText: "Badge tier and visual style",
    },
    {
      name: "title",
      type: "string",
      required: true,
      defaultValue: "Word Master",
      helperText: 'Achievement title (e.g., "Word Master")',
    },
    {
      name: "description",
      type: "text",
      defaultValue: "Learned 10 new words!",
      helperText: "Description of the achievement",
    },
    {
      name: "icon",
      type: "string",
      enum: ["star", "trophy", "medal", "crown", "gem"],
      defaultValue: "star",
      helperText: "Badge icon style",
    },
    {
      name: "earnedDate",
      type: "date",
      helperText: "When the badge was earned",
    },
    {
      name: "isUnlocked",
      type: "boolean",
      defaultValue: false,
      helperText: "Whether badge is available to earn",
    },
    {
      name: "animateOnReveal",
      type: "boolean",
      defaultValue: true,
      helperText: "Animate when badge is first shown",
    },
  ],
});

// Register Progress Tracker Component
Builder.registerComponent(ProgressTracker, {
  name: "Learning Progress Tracker",
  description: "Visual progress indicator for learning goals",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s",
  inputs: [
    {
      name: "currentProgress",
      type: "number",
      defaultValue: 65,
      min: 0,
      max: 100,
      helperText: "Current progress percentage (0-100)",
    },
    {
      name: "goalTitle",
      type: "string",
      required: true,
      defaultValue: "Animal Words Mastery",
      helperText: "Title of the learning goal",
    },
    {
      name: "progressType",
      type: "string",
      enum: ["circular", "linear", "tree", "path"],
      defaultValue: "circular",
      helperText: "Visual progress representation style",
    },
    {
      name: "showMilestones",
      type: "boolean",
      defaultValue: true,
      helperText: "Display milestone markers",
    },
    {
      name: "colorScheme",
      type: "string",
      enum: ["rainbow", "jungle", "ocean", "sunset"],
      defaultValue: "jungle",
      helperText: "Color theme for progress visualization",
    },
  ],
});

// Register Settings Panel Component
Builder.registerComponent(SettingsPanel, {
  name: "Educational Settings Panel",
  description: "Configuration panel for learning preferences",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
  inputs: [
    {
      name: "allowVolumeControl",
      type: "boolean",
      defaultValue: true,
      helperText: "Allow children to adjust volume",
    },
    {
      name: "showDifficultySettings",
      type: "boolean",
      defaultValue: true,
      helperText: "Display difficulty level options",
    },
    {
      name: "enableParentalControls",
      type: "boolean",
      defaultValue: false,
      helperText: "Require parent approval for changes",
    },
    {
      name: "availableThemes",
      type: "list",
      defaultValue: [
        { theme: "jungle" },
        { theme: "ocean" },
        { theme: "space" },
      ],
      subFields: [{ name: "theme", type: "string" }],
      helperText: "Theme options available to children",
    },
  ],
});

// Register Interactive Quiz Component
Builder.registerComponent(InteractiveQuiz, {
  name: "Interactive Learning Quiz",
  description: "Gamified quiz component with multiple question types",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u",
  inputs: [
    {
      name: "questions",
      type: "list",
      required: true,
      helperText: "Quiz questions and answers",
      defaultValue: [
        {
          question: "What sound does a cat make?",
          questionType: "multiple-choice",
          answers: [
            { text: "Meow", isCorrect: true },
            { text: "Woof", isCorrect: false },
            { text: "Moo", isCorrect: false },
          ],
          explanation: 'Cats say "meow" to communicate!',
        },
      ],
      subFields: [
        {
          name: "question",
          type: "text",
          required: true,
          helperText: "Question text",
        },
        {
          name: "questionType",
          type: "string",
          enum: ["multiple-choice", "true-false", "matching", "fill-blank"],
          defaultValue: "multiple-choice",
        },
        {
          name: "answers",
          type: "list",
          subFields: [
            { name: "text", type: "string", required: true },
            { name: "isCorrect", type: "boolean", defaultValue: false },
          ],
        },
        {
          name: "explanation",
          type: "text",
          helperText: "Explanation shown after answering",
        },
        {
          name: "audioHint",
          type: "file",
          allowedFileTypes: ["mp3", "wav"],
          helperText: "Audio hint for the question",
        },
      ],
    },
    {
      name: "quizMode",
      type: "string",
      enum: ["learn", "practice", "test", "review"],
      defaultValue: "learn",
      helperText: "Quiz interaction mode",
    },
    {
      name: "showHints",
      type: "boolean",
      defaultValue: true,
      helperText: "Allow children to request hints",
    },
    {
      name: "celebrateSuccess",
      type: "boolean",
      defaultValue: true,
      helperText: "Show celebration animations for correct answers",
    },
    {
      name: "timeLimit",
      type: "number",
      defaultValue: 0,
      min: 0,
      max: 300,
      helperText: "Time limit per question in seconds (0 = no limit)",
    },
  ],
});

// Register Parent Dashboard Component
Builder.registerComponent(ParentDashboard, {
  name: "Parent Learning Dashboard",
  description: "Analytics and progress overview for parents",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v",
  inputs: [
    {
      name: "childId",
      type: "string",
      required: true,
      defaultValue: "child-123",
      helperText: "Child identifier for progress tracking",
    },
    {
      name: "showDetailedAnalytics",
      type: "boolean",
      defaultValue: true,
      helperText: "Display detailed learning analytics",
    },
    {
      name: "timeRange",
      type: "string",
      enum: ["week", "month", "quarter", "year"],
      defaultValue: "month",
      helperText: "Progress reporting time range",
    },
    {
      name: "enableRecommendations",
      type: "boolean",
      defaultValue: true,
      helperText: "Show AI-powered learning recommendations",
    },
  ],
});

// Register AI Word Recommendation Component
Builder.registerComponent(AIWordRecommendation, {
  name: "AI Word Recommendations",
  description: "AI-powered personalized word suggestions",
  image:
    "https://cdn.builder.io/api/v1/image/assets%2Ff1a03f21e1554e5e98f80ac6900b0d2e%2F8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w",
  inputs: [
    {
      name: "learningLevel",
      type: "string",
      enum: ["beginner", "intermediate", "advanced"],
      defaultValue: "beginner",
      helperText: "Child's current learning level",
    },
    {
      name: "interestsCategories",
      type: "list",
      defaultValue: [{ category: "animals" }, { category: "colors" }],
      subFields: [{ name: "category", type: "string" }],
      helperText: "Child's learning interests",
    },
    {
      name: "maxRecommendations",
      type: "number",
      defaultValue: 5,
      min: 1,
      max: 15,
      helperText: "Number of word recommendations to show",
    },
    {
      name: "adaptiveDifficulty",
      type: "boolean",
      defaultValue: true,
      helperText: "Automatically adjust difficulty based on performance",
    },
  ],
});

// Export component registry for initialization
export const initializeBuilderRegistry = () => {
  console.log(
    "✅ Builder.io component registry initialized with 9 educational components",
  );

  // Note: Builder.io configuration is handled via builder.init() in App.tsx
  // Custom targeting and other advanced features should be configured
  // through the Builder.io admin interface or via the builder instance
};

export default Builder;
