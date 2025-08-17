import * as React from "react";

// AI State Interface
export interface AIState {
  isSessionActive: boolean;
  confidence: number;
  sessionId?: string;
  startTime?: Date;
  reasoning?: string[];
  expectedOutcomes?: {
    learningVelocity: number;
    retentionPrediction: number;
    engagementScore: number;
    difficultyFit: number;
  };
  alternativeStrategies?: string[];
  adaptiveInstructions?: {
    encouragementFrequency: number;
    hintStrategy: string;
    errorHandling: string;
  };
}

// AI Actions Interface  
export interface AIActions {
  startSession: (config: {
    words: any[];
    confidence: number;
    reasoning: string[];
    expectedOutcomes: {
      learningVelocity: number;
      retentionPrediction: number;
      engagementScore: number;
      difficultyFit: number;
    };
    alternativeStrategies: string[];
    adaptiveInstructions: {
      encouragementFrequency: number;
      hintStrategy: string;
      errorHandling: string;
    };
  }) => void;
  endSession: (config: { completed: boolean }) => void;
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
export interface AICardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  // Standard CardContent props
  className?: string;
  children?: React.ReactNode;
  
  // AI Enhancement Props
  aiState: AIState;
  aiActions: AIActions;
  showAIInsights?: boolean;
  setShowAIInsights?: (show: boolean) => void;
  confidenceLevel?: number;
  difficultyAdjustment?: "increase" | "decrease" | "maintain";
  sessionWords?: any[];
  sessionStats?: SessionStats;
  
  // Customization Options
  showMobileAI?: boolean;
  showDesktopAI?: boolean;
  headerClassName?: string;
  enableAIHeader?: boolean;
}
