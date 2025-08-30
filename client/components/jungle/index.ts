/**
 * Jungle Word Library - Unified Component System
 * 
 * Kid-first word learning experience with:
 * - Category exploration with jungle mascots
 * - Interactive word cards with front-facing actions
 * - Reward system with gems, crowns, and celebrations
 * - Full accessibility support (WCAG 2.1 AA)
 * - Age-appropriate UX (3-5, 6-8, 9-12)
 */

// Main exploration page
export { JungleWordLibrary } from '../JungleWordLibrary';

// Core shell and navigation
export { ExplorerShell } from '../explorer/ExplorerShell';

// Category system
export { CategoryGrid } from '../category/CategoryGrid';
export { CategoryTile } from '../category/CategoryTile';
export type { Category } from '../category/CategoryTile';

// Word card system
export { WordCardUnified } from '../word-card/WordCardUnified';
export type { Word } from '../word-card/WordCardUnified';

// Reward system
export { RewardPopup } from '../RewardPopup';
export { RewardProvider, useReward } from '../../contexts/RewardContext';
export type { Reward } from '../../contexts/RewardContext';

// Builder.io schemas and registrations
export { 
  WordSchema, 
  CategorySchema 
} from '../../../builder-registrations';

/**
 * Usage Examples:
 * 
 * // Full exploration experience
 * import { JungleWordLibrary } from '@/components/jungle';
 * 
 * // Individual components
 * import { 
 *   ExplorerShell, 
 *   CategoryGrid, 
 *   WordCardUnified,
 *   RewardProvider 
 * } from '@/components/jungle';
 * 
 * // Types
 * import type { Word, Category, Reward } from '@/components/jungle';
 */
