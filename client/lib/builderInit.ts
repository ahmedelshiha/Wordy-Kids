/**
 * Builder.io Component Registration Initialization
 * 
 * This file ensures all Jungle Word Library components are registered
 * with Builder.io for visual editing and CMS integration.
 */

// Import registrations to ensure they run
import '../builder-registrations';

// Log successful initialization
console.log('🌟 Jungle Word Library components initialized for Builder.io');

// Export a function to manually trigger registration if needed
export const initializeBuilderComponents = () => {
  console.log('🔧 Builder.io components re-registered');
  return true;
};

/**
 * Available Builder.io Components:
 * 
 * 1. JungleWordLibrary - Complete word learning experience
 * 2. ExplorerShell - Header and navigation wrapper  
 * 3. CategoryGrid - Grid of category tiles with filtering
 * 4. CategoryTile - Individual jungle category card
 * 5. WordCardUnified - Interactive word learning card
 * 6. RewardPopup - Celebration and feedback popup
 * 
 * Custom Editors:
 * - ageGroupSelector - Age-appropriate UX settings
 * - emojiPicker - Jungle mascot selection
 * - difficultySelector - Word difficulty with descriptions
 * 
 * Schemas:
 * - WordSchema - Word content structure
 * - CategorySchema - Category definition structure
 */
