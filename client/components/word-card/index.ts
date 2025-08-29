// Main component
export { default as JungleWordLibraryCard } from "./JungleWordLibraryCard";

// Types
export type {
  Word,
  WordCardProps,
  AccessibilitySettings,
  DiscoveryMode,
  Rating,
  WordCardState,
  WordCardAction,
  Particle,
  WordProgressEvent,
  WordPracticeEvent,
} from "./types";

// Context
export { WordCardProvider, useWordCardContext } from "./context/WordCardContext";

// Hooks
export { useWordCardState } from "./hooks/useWordCardState";
export { usePronunciation } from "./hooks/usePronunciation";
export { useCelebration } from "./hooks/useCelebration";
export { useHints } from "./hooks/useHints";
export { useProgressDispatch } from "./hooks/useProgressDispatch";

// Utils
export {
  getJungleDifficultyTheme,
  getRarityColor,
  getJungleCategoryColor,
  getRarityBadgeStyle,
  getDifficultyStars,
  getCardBackgroundGradient,
} from "./utils/wordCardTheme";

// Parts (for advanced customization)
export { WordCardShell } from "./parts/WordCardShell";
export { WordHeaderBadges } from "./parts/WordHeaderBadges";
export { WordStatusBadges } from "./parts/WordStatusBadges";
export { WordMedia } from "./parts/WordMedia";
export { WordTitlePronounce } from "./parts/WordTitlePronounce";
export { WordActions } from "./parts/WordActions";
export { WordProgressBar } from "./parts/WordProgressBar";
export { ParticlesOverlay } from "./parts/ParticlesOverlay";
export { ModeSelector } from "./parts/ModeSelector";
export { BackDetails } from "./parts/BackDetails";
export { AccessibilityAnnouncer } from "./parts/AccessibilityAnnouncer";

