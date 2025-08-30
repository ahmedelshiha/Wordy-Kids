import { Builder } from '@builder.io/react';
import { ExplorerShell } from './components/explorer/ExplorerShell';
import { CategoryTile } from './components/category/CategoryTile';
import { CategoryGrid } from './components/category/CategoryGrid';
import { WordCardUnified } from './components/word-card/WordCardUnified';
import { RewardPopup } from './components/RewardPopup';
import { JungleWordLibrary } from './components/JungleWordLibrary';

/**
 * Word schema for Builder.io
 */
export const WordSchema = {
  name: 'Word',
  inputs: [
    { 
      name: 'id', 
      type: 'number', 
      required: true, 
      helperText: 'Unique identifier for the word' 
    },
    { 
      name: 'word', 
      type: 'string', 
      required: true, 
      helperText: 'The word to learn' 
    },
    { 
      name: 'pronunciation', 
      type: 'string', 
      helperText: 'Phonetic pronunciation guide (optional)' 
    },
    { 
      name: 'definition', 
      type: 'string', 
      required: true, 
      helperText: 'Clear definition suitable for children' 
    },
    { 
      name: 'example', 
      type: 'string', 
      helperText: 'Example sentence using the word' 
    },
    { 
      name: 'funFact', 
      type: 'string', 
      helperText: 'Interesting fact about the word or concept' 
    },
    { 
      name: 'emoji', 
      type: 'string', 
      helperText: 'Emoji mascot to represent the word visually' 
    },
    { 
      name: 'difficulty', 
      type: 'string', 
      enum: ['easy', 'medium', 'hard'], 
      defaultValue: 'easy',
      helperText: 'Difficulty level appropriate for different age groups' 
    },
    { 
      name: 'category', 
      type: 'string', 
      required: true,
      enum: ['animals', 'food', 'nature', 'colors', 'body', 'objects', 'family', 'feelings'],
      helperText: 'Category for grouping related words' 
    },
    { 
      name: 'imageUrl', 
      type: 'string', 
      helperText: 'Optional image URL for visual learning' 
    },
  ],
};

/**
 * Category schema for Builder.io
 */
export const CategorySchema = {
  name: 'Category',
  inputs: [
    { 
      name: 'id', 
      type: 'string', 
      required: true, 
      helperText: 'Unique category identifier' 
    },
    { 
      name: 'name', 
      type: 'string', 
      required: true, 
      helperText: 'Display name for the category' 
    },
    { 
      name: 'emoji', 
      type: 'string', 
      required: true, 
      helperText: 'Jungle mascot emoji for the category' 
    },
    { 
      name: 'description', 
      type: 'string', 
      helperText: 'Kid-friendly description of the category' 
    },
    { 
      name: 'wordCount', 
      type: 'number', 
      defaultValue: 0,
      helperText: 'Total number of words in this category' 
    },
    {
      name: 'difficultyMix',
      type: 'object',
      subFields: [
        { name: 'easy', type: 'number', defaultValue: 0 },
        { name: 'medium', type: 'number', defaultValue: 0 },
        { name: 'hard', type: 'number', defaultValue: 0 },
      ],
      helperText: 'Distribution of word difficulties in this category'
    },
    { 
      name: 'locked', 
      type: 'boolean', 
      defaultValue: false,
      helperText: 'Whether category requires prerequisites' 
    },
    { 
      name: 'recommended', 
      type: 'boolean', 
      defaultValue: false,
      helperText: 'Mark as "For You" recommendation' 
    },
    { 
      name: 'estimatedTime', 
      type: 'string', 
      helperText: 'Estimated completion time (e.g., "5-10 min")' 
    },
  ],
};

/**
 * Register JungleWordLibrary - Main exploration page
 */
Builder.registerComponent(JungleWordLibrary, {
  name: 'JungleWordLibrary',
  friendlyName: 'Jungle Word Library',
  description: 'Complete word learning experience with categories, cards, and rewards',
  image: 'https://cdn.builder.io/api/v1/image/assets%2Faa7eabd22b7740259ee07856675f90b8%2F64d77a05a37c4a1db87e8ad8e1b7e0d6',
  inputs: [
    { 
      name: 'initialMode', 
      type: 'string', 
      enum: ['map', 'adventure', 'favorites'], 
      defaultValue: 'map',
      helperText: 'Starting view mode for the explorer'
    },
    { 
      name: 'ageGroup', 
      type: 'string', 
      enum: ['3-5', '6-8', '9-12'], 
      defaultValue: '6-8',
      helperText: 'Target age group for content and UX adjustments'
    },
    {
      name: 'accessibilitySettings',
      type: 'object',
      subFields: [
        { name: 'highContrast', type: 'boolean', defaultValue: false },
        { name: 'largeText', type: 'boolean', defaultValue: false },
        { name: 'reducedMotion', type: 'boolean', defaultValue: false },
        { name: 'autoPlay', type: 'boolean', defaultValue: false },
        { name: 'soundEnabled', type: 'boolean', defaultValue: true },
      ],
      helperText: 'Accessibility and learning preferences'
    },
  ],
  defaultStyles: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
});

/**
 * Register ExplorerShell - Header and navigation wrapper
 */
Builder.registerComponent(ExplorerShell, {
  name: 'ExplorerShell',
  friendlyName: 'Explorer Shell',
  description: 'Jungle-themed header with navigation, stats, and controls',
  inputs: [
    { 
      name: 'title', 
      type: 'string', 
      defaultValue: '🌟 Jungle Explorer',
      helperText: 'Title displayed in the header'
    },
    { 
      name: 'showStats', 
      type: 'boolean', 
      defaultValue: true,
      helperText: 'Show gems, streak, and session time'
    },
    { 
      name: 'mode', 
      type: 'string', 
      enum: ['map', 'adventure', 'favorites'], 
      defaultValue: 'map',
      helperText: 'Current navigation mode'
    },
    { 
      name: 'gems', 
      type: 'number', 
      defaultValue: 0,
      helperText: 'Number of gems earned'
    },
    { 
      name: 'streak', 
      type: 'number', 
      defaultValue: 0,
      helperText: 'Learning streak in days'
    },
    { 
      name: 'sessionTime', 
      type: 'string', 
      defaultValue: '00:00',
      helperText: 'Current session duration'
    },
  ],
  defaultStyles: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f0fff4 0%, #e0f2fe 50%, #f3e5f5 100%)',
  },
});

/**
 * Register CategoryGrid - Grid of category tiles
 */
Builder.registerComponent(CategoryGrid, {
  name: 'CategoryGrid',
  friendlyName: 'Category Grid',
  description: 'Responsive grid of jungle category tiles with filtering',
  inputs: [
    { 
      name: 'viewMode', 
      type: 'string', 
      enum: ['grid', 'list'], 
      defaultValue: 'grid',
      helperText: 'Display layout mode'
    },
    { 
      name: 'showFilters', 
      type: 'boolean', 
      defaultValue: true,
      helperText: 'Show category filters and search'
    },
    { 
      name: 'tileSize', 
      type: 'string', 
      enum: ['sm', 'md', 'lg'], 
      defaultValue: 'md',
      helperText: 'Size of category tiles'
    },
    { 
      name: 'ageGroup', 
      type: 'string', 
      enum: ['3-5', '6-8', '9-12'], 
      defaultValue: '6-8',
      helperText: 'Age group for tile sizing and features'
    },
    { 
      name: 'maxCategories', 
      type: 'number',
      helperText: 'Limit number of categories shown (optional)'
    },
  ],
  defaultStyles: {
    width: '100%',
    padding: '1rem',
  },
});

/**
 * Register CategoryTile - Individual category card
 */
Builder.registerComponent(CategoryTile, {
  name: 'CategoryTile',
  friendlyName: 'Category Tile',
  description: 'Interactive jungle category tile with mascot and progress',
  inputs: [
    ...CategorySchema.inputs,
    { 
      name: 'size', 
      type: 'string', 
      enum: ['sm', 'md', 'lg'], 
      defaultValue: 'md',
      helperText: 'Tile size'
    },
    { 
      name: 'reducedMotion', 
      type: 'boolean', 
      defaultValue: false,
      helperText: 'Disable animations for accessibility'
    },
  ],
  defaultStyles: {
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
});

/**
 * Register WordCardUnified - Main word learning card
 */
Builder.registerComponent(WordCardUnified, {
  name: 'WordCardUnified',
  friendlyName: 'Word Card',
  description: 'Interactive word learning card with pronunciation and actions',
  inputs: [
    ...WordSchema.inputs,
    { 
      name: 'autoPronounce', 
      type: 'boolean', 
      defaultValue: true,
      helperText: 'Auto-pronounce word when card loads'
    },
    { 
      name: 'showButtons', 
      type: 'boolean', 
      defaultValue: true,
      helperText: 'Show Say It, Practice, and Master It buttons'
    },
    { 
      name: 'size', 
      type: 'string', 
      enum: ['sm', 'md', 'lg'], 
      defaultValue: 'md',
      helperText: 'Card size'
    },
    { 
      name: 'ageGroup', 
      type: 'string', 
      enum: ['3-5', '6-8', '9-12'], 
      defaultValue: '6-8',
      helperText: 'Age group for UX adaptations'
    },
    { 
      name: 'currentStars', 
      type: 'number', 
      defaultValue: 0, 
      min: 0, 
      max: 3,
      helperText: 'Current mastery level (0-3 stars)'
    },
    { 
      name: 'masteryStatus', 
      type: 'string', 
      enum: ['none', 'practice', 'mastered'], 
      defaultValue: 'none',
      helperText: 'Learning progress status'
    },
    { 
      name: 'isFavorited', 
      type: 'boolean', 
      defaultValue: false,
      helperText: 'Whether word is in favorites'
    },
  ],
  defaultStyles: {
    perspective: '1000px',
    margin: '0 auto',
  },
});

/**
 * Register RewardPopup - Celebration and feedback popup
 */
Builder.registerComponent(RewardPopup, {
  name: 'RewardPopup',
  friendlyName: 'Reward Popup',
  description: 'Kid-friendly celebration popup with confetti and rewards',
  inputs: [
    { 
      name: 'title', 
      type: 'string', 
      defaultValue: 'Great Job!',
      helperText: 'Celebration title'
    },
    { 
      name: 'message', 
      type: 'string', 
      defaultValue: 'You did amazing!',
      helperText: 'Encouraging message'
    },
    { 
      name: 'rewardIcon', 
      type: 'string', 
      defaultValue: '🌟',
      helperText: 'Main reward emoji or icon'
    },
    { 
      name: 'type', 
      type: 'string', 
      enum: ['word', 'category', 'streak', 'game'], 
      defaultValue: 'word',
      helperText: 'Type of reward for appropriate styling'
    },
    { 
      name: 'gemsEarned', 
      type: 'number', 
      defaultValue: 0,
      helperText: 'Number of gems awarded'
    },
    { 
      name: 'crownLevel', 
      type: 'string', 
      enum: ['bronze', 'silver', 'gold', 'rainbow'],
      helperText: 'Crown level achieved (if applicable)'
    },
    { 
      name: 'streakDays', 
      type: 'number',
      helperText: 'Streak length (if applicable)'
    },
    { 
      name: 'reducedMotion', 
      type: 'boolean', 
      defaultValue: false,
      helperText: 'Reduce animations for accessibility'
    },
  ],
  defaultStyles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * Custom inputs for Builder.io components
 */

// Age group selector for kid-friendly UX
Builder.registerEditor({
  name: 'ageGroupSelector',
  component: (props: any) => (
    <select {...props}>
      <option value="3-5">Ages 3-5 (Large UI, Simple)</option>
      <option value="6-8">Ages 6-8 (Standard)</option>
      <option value="9-12">Ages 9-12 (Advanced)</option>
    </select>
  ),
});

// Emoji picker for mascots
Builder.registerEditor({
  name: 'emojiPicker',
  component: (props: any) => (
    <input 
      {...props} 
      placeholder="🦁 Pick an emoji mascot"
      style={{ fontSize: '24px', padding: '8px' }}
    />
  ),
});

// Word difficulty selector with descriptions
Builder.registerEditor({
  name: 'difficultySelector',
  component: (props: any) => (
    <select {...props}>
      <option value="easy">Easy (3-6 years) - Simple, common words</option>
      <option value="medium">Medium (6-9 years) - Intermediate vocabulary</option>
      <option value="hard">Hard (9-12 years) - Advanced concepts</option>
    </select>
  ),
});

console.log('✅ Jungle Word Library components registered with Builder.io');

// Export schemas for external use
export { 
  ExplorerShell, 
  CategoryGrid, 
  CategoryTile, 
  WordCardUnified, 
  RewardPopup, 
  JungleWordLibrary 
};
