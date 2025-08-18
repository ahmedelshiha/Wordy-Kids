import * as React from "react";

// AI State Interface - matches AIRecommendationState
export interface AIState {
  isSessionActive: boolean;
  confidence: number;
  reasoning: string[];
  currentRecommendation?: any;
  words?: any[];
  sessionProgress?: {
    wordsAttempted: number;
    wordsCorrect: number;
    currentWordIndex: number;
    efficiency: number;
    engagement: number;
    cognitiveLoad: number;
  };
  difficultyAdjustment?: "easier" | "harder" | "maintain" | null;
  adaptiveHints?: string[];
  encouragementMessages?: string[];
  learningAnalytics?: {
    velocityTrend: number[];
    retentionTrend: number[];
    categoryMastery: Map<string, number>;
    predictedOutcomes: any;
  } | null;
  isLoading?: boolean;
  error?: string | null;
  hasInitialized?: boolean;
}

// AI Actions Interface - matches AIRecommendationActions
export interface AIActions {
  startSession: (recommendation: any) => void;
  endSession: (outcome: { completed: boolean; reason?: string }) => void;
  getRecommendations?: (...args: any[]) => Promise<void>;
  recordWordInteraction?: (interaction: any) => Promise<void>;
  reset?: () => void;
}

// Session Statistics
export interface SessionStats {
  accuracy: number;
  wordsLearned: number;
  totalWords: number;
  timeSpent?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
}

// AI Card Content Props
export interface AICardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  // Standard CardContent props
  className?: string;
  children?: React.ReactNode;

  // AI Enhancement Props
  aiState: AIState;
  aiActions: AIActions;
  showAIInsights?: boolean;
  setShowAIInsights?: (show: boolean) => void;
  confidenceLevel?: number;
  difficultyAdjustment?: "easier" | "harder" | "maintain";
  sessionWords?: any[];
  sessionStats?: SessionStats;

  // Customization Options
  showMobileAI?: boolean;
  showDesktopAI?: boolean;
  headerClassName?: string;
  enableAIHeader?: boolean;
}

// Extended AI Card Content Props with comprehensive features
export interface ExtendedAICardContentProps extends AICardContentProps {
  // AI Status and Control
  aiStatus?: "loading" | "active" | "error" | "inactive" | "disabled";
  globalAIEnabled?: boolean;
  onToggleGlobalAI?: () => void;
  onRetryAI?: () => void;
  aiErrorMessage?: string;

  // Settings
  showAISettings?: boolean;
  setShowAISettings?: (show: boolean) => void;

  // Session Management
  SESSION_SIZE?: number;

  // Enhanced display options
  showQuickStats?: boolean;
  showErrorAlert?: boolean;
}
