// client/lib/builder-registry.ts
import { Builder } from '@builder.io/react'

// Import your educational components
import { JungleKidNav } from '../components/JungleKidNav'
import { WordCard } from '../components/WordCard'
import { WordGarden } from '../components/WordGarden'
import { SettingsPanel } from '../components/SettingsPanel'

// Register Jungle Kid Navigation Component
Builder.registerComponent(JungleKidNav, {
  name: 'Jungle Kid Navigation',
  description: 'Main navigation component with jungle theme and user avatar',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F...',
  inputs: [
    {
      name: 'user',
      type: 'object',
      helperText: 'User information including name and avatar',
      subFields: [
        { 
          name: 'name', 
          type: 'string', 
          required: true,
          helperText: 'Child\'s display name'
        },
        { 
          name: 'avatar', 
          type: 'file', 
          required: false,
          allowedFileTypes: ['jpg', 'png', 'gif', 'svg'],
          helperText: 'Child\'s avatar image'
        }
      ]
    },
    {
      name: 'showProgress',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Display learning progress indicators'
    },
    {
      name: 'theme',
      type: 'string',
      enum: ['jungle', 'ocean', 'space', 'forest'],
      defaultValue: 'jungle',
      helperText: 'Visual theme for the navigation'
    },
    {
      name: 'enableSounds',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Enable interactive sound effects'
    }
  ],
  canHaveChildren: false,
  hideFromInsertMenu: false
})

// Register Educational Word Card Component
Builder.registerComponent(WordCard, {
  name: 'Educational Word Card',
  description: 'Interactive word learning card with audio and visual elements',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F...',
  inputs: [
    {
      name: 'word',
      type: 'string',
      required: true,
      helperText: 'The word to display and teach'
    },
    {
      name: 'definition',
      type: 'text',
      required: true,
      helperText: 'Simple, kid-friendly definition'
    },
    {
      name: 'pronunciation',
      type: 'string',
      required: false,
      helperText: 'Phonetic pronunciation guide (e.g., "EL-uh-fuhnt")'
    },
    {
      name: 'audioUrl',
      type: 'file',
      allowedFileTypes: ['mp3', 'wav', 'ogg'],
      helperText: 'Audio pronunciation of the word'
    },
    {
      name: 'imageUrl',
      type: 'file',
      allowedFileTypes: ['jpg', 'png', 'gif', 'svg'],
      helperText: 'Visual representation of the word'
    },
    {
      name: 'difficulty',
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      defaultValue: 'easy',
      helperText: 'Learning difficulty level'
    },
    {
      name: 'category',
      type: 'string',
      enum: ['animals', 'colors', 'shapes', 'numbers', 'letters', 'actions'],
      defaultValue: 'animals',
      helperText: 'Word category for organization'
    },
    {
      name: 'animationStyle',
      type: 'string',
      enum: ['bounce', 'fade', 'slide', 'flip'],
      defaultValue: 'bounce',
      helperText: 'Card animation style'
    },
    {
      name: 'showHint',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Display visual hints for the word'
    }
  ],
  canHaveChildren: false
})

// Register Word Learning Garden Component
Builder.registerComponent(WordGarden, {
  name: 'Word Learning Garden',
  description: 'Interactive garden-themed word learning environment',
  image: 'https://cdn.builder.io/api/v1/image/assets%2F...',
  inputs: [
    {
      name: 'wordList',
      type: 'list',
      helperText: 'List of words to include in the garden',
      subFields: [
        { 
          name: 'word', 
          type: 'string',
          required: true,
          helperText: 'Word to plant in garden'
        },
        { 
          name: 'learned', 
          type: 'boolean',
          defaultValue: false,
          helperText: 'Whether child has mastered this word'
        },
        {
          name: 'plantType',
          type: 'string',
          enum: ['flower', 'tree', 'bush', 'vine'],
          defaultValue: 'flower',
          helperText: 'Visual plant representation'
        }
      ]
    },
    {
      name: 'gameMode',
      type: 'string',
      enum: ['practice', 'challenge', 'review', 'quiz'],
      defaultValue: 'practice',
      helperText: 'Learning interaction mode'
    },
    {
      name: 'maxWords',
      type: 'number',
      defaultValue: 10,
      min: 5,
      max: 25,
      helperText: 'Maximum words to display at once'
    },
    {
      name: 'enableWeather',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Show animated weather effects'
    },
    {
      name: 'gardenTheme',
      type: 'string',
      enum: ['tropical', 'enchanted', 'desert', 'arctic'],
      defaultValue: 'tropical',
      helperText: 'Garden environment theme'
    }
  ],
  canHaveChildren: false
})

// Register Achievement Badge Component
Builder.registerComponent(require('../components/AchievementBadge').default, {
  name: 'Achievement Badge',
  description: 'Reward badge for learning milestones',
  inputs: [
    {
      name: 'badgeType',
      type: 'string',
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      defaultValue: 'bronze',
      helperText: 'Badge tier and visual style'
    },
    {
      name: 'title',
      type: 'string',
      required: true,
      helperText: 'Achievement title (e.g., "Word Master")'
    },
    {
      name: 'description',
      type: 'text',
      helperText: 'Description of the achievement'
    },
    {
      name: 'icon',
      type: 'string',
      enum: ['star', 'trophy', 'medal', 'crown', 'gem'],
      defaultValue: 'star',
      helperText: 'Badge icon style'
    },
    {
      name: 'earnedDate',
      type: 'date',
      helperText: 'When the badge was earned'
    },
    {
      name: 'isUnlocked',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Whether badge is available to earn'
    },
    {
      name: 'animateOnReveal',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Animate when badge is first shown'
    }
  ]
})

// Register Progress Tracker Component
Builder.registerComponent(require('../components/ProgressTracker').default, {
  name: 'Learning Progress Tracker',
  description: 'Visual progress indicator for learning goals',
  inputs: [
    {
      name: 'currentProgress',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 100,
      helperText: 'Current progress percentage (0-100)'
    },
    {
      name: 'goalTitle',
      type: 'string',
      required: true,
      helperText: 'Title of the learning goal'
    },
    {
      name: 'progressType',
      type: 'string',
      enum: ['circular', 'linear', 'tree', 'path'],
      defaultValue: 'circular',
      helperText: 'Visual progress representation style'
    },
    {
      name: 'showMilestones',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Display milestone markers'
    },
    {
      name: 'colorScheme',
      type: 'string',
      enum: ['rainbow', 'jungle', 'ocean', 'sunset'],
      defaultValue: 'jungle',
      helperText: 'Color theme for progress visualization'
    }
  ]
})

// Register Settings Panel Component
Builder.registerComponent(SettingsPanel, {
  name: 'Educational Settings Panel',
  description: 'Configuration panel for learning preferences',
  inputs: [
    {
      name: 'allowVolumeControl',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Allow children to adjust volume'
    },
    {
      name: 'showDifficultySettings',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Display difficulty level options'
    },
    {
      name: 'enableParentalControls',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Require parent approval for changes'
    },
    {
      name: 'availableThemes',
      type: 'list',
      defaultValue: ['jungle', 'ocean', 'space'],
      subFields: [
        { name: 'theme', type: 'string' }
      ],
      helperText: 'Theme options available to children'
    }
  ]
})

// Register Interactive Quiz Component
Builder.registerComponent(require('../components/InteractiveQuiz').default, {
  name: 'Interactive Learning Quiz',
  description: 'Gamified quiz component with multiple question types',
  inputs: [
    {
      name: 'questions',
      type: 'list',
      required: true,
      helperText: 'Quiz questions and answers',
      subFields: [
        { 
          name: 'question', 
          type: 'text', 
          required: true,
          helperText: 'Question text'
        },
        { 
          name: 'questionType',
          type: 'string',
          enum: ['multiple-choice', 'true-false', 'matching', 'fill-blank'],
          defaultValue: 'multiple-choice'
        },
        { 
          name: 'answers', 
          type: 'list',
          subFields: [
            { name: 'text', type: 'string', required: true },
            { name: 'isCorrect', type: 'boolean', defaultValue: false }
          ]
        },
        {
          name: 'explanation',
          type: 'text',
          helperText: 'Explanation shown after answering'
        },
        {
          name: 'audioHint',
          type: 'file',
          allowedFileTypes: ['mp3', 'wav'],
          helperText: 'Audio hint for the question'
        }
      ]
    },
    {
      name: 'quizMode',
      type: 'string',
      enum: ['learn', 'practice', 'test', 'review'],
      defaultValue: 'learn',
      helperText: 'Quiz interaction mode'
    },
    {
      name: 'showHints',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Allow children to request hints'
    },
    {
      name: 'celebrateSuccess',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Show celebration animations for correct answers'
    },
    {
      name: 'timeLimit',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 300,
      helperText: 'Time limit per question in seconds (0 = no limit)'
    }
  ]
})

// Register Parent Dashboard Component
Builder.registerComponent(require('../components/ParentDashboard').default, {
  name: 'Parent Learning Dashboard',
  description: 'Analytics and progress overview for parents',
  inputs: [
    {
      name: 'childId',
      type: 'string',
      required: true,
      helperText: 'Child identifier for progress tracking'
    },
    {
      name: 'showDetailedAnalytics',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Display detailed learning analytics'
    },
    {
      name: 'timeRange',
      type: 'string',
      enum: ['week', 'month', 'quarter', 'year'],
      defaultValue: 'month',
      helperText: 'Progress reporting time range'
    },
    {
      name: 'enableRecommendations',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Show AI-powered learning recommendations'
    }
  ]
})

// Register AI Word Recommendation Component
Builder.registerComponent(require('../components/AIWordRecommendation').default, {
  name: 'AI Word Recommendations',
  description: 'AI-powered personalized word suggestions',
  inputs: [
    {
      name: 'learningLevel',
      type: 'string',
      enum: ['beginner', 'intermediate', 'advanced'],
      defaultValue: 'beginner',
      helperText: 'Child\'s current learning level'
    },
    {
      name: 'interestsCategories',
      type: 'list',
      defaultValue: ['animals'],
      subFields: [
        { name: 'category', type: 'string' }
      ],
      helperText: 'Child\'s learning interests'
    },
    {
      name: 'maxRecommendations',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 15,
      helperText: 'Number of word recommendations to show'
    },
    {
      name: 'adaptiveDifficulty',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Automatically adjust difficulty based on performance'
    }
  ]
})

// Export component registry for initialization
export const initializeBuilderRegistry = () => {
  console.log('Builder.io component registry initialized with educational components')
}

// Custom component configuration for educational context
Builder.configure({
  // Enable custom targeting for educational content
  customTargeting: {
    age: {
      type: 'number',
      friendlyName: 'Child Age',
      description: 'Target content by child age'
    },
    learningLevel: {
      type: 'enum',
      values: ['beginner', 'intermediate', 'advanced'],
      friendlyName: 'Learning Level'
    },
    interests: {
      type: 'list',
      friendlyName: 'Learning Interests',
      description: 'Child\'s educational interests'
    }
  }
})

export default Builder