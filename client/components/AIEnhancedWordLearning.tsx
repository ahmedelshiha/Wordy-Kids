import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  Star,
  Zap,
  Heart,
  ChevronRight,
  RotateCcw,
  Settings,
  BarChart3,
  Sparkles
} from "lucide-react";
import { useAIWordRecommendations, useRealTimeLearningAnalytics, useAdaptiveDifficulty } from "@/hooks/use-ai-word-recommendations";
import { SessionContext } from "@/lib/aiWordRecommendationService";
import { Word } from "@/data/wordsDatabase";
import { ChildWordStats } from "@shared/api";
import { WordCard } from "./WordCard";
import { EncouragingFeedback } from "./EncouragingFeedback";
import { FloatingBubbles } from "./FloatingBubbles";
import { CelebrationEffect } from "./CelebrationEffect";

interface AIEnhancedWordLearningProps {
  userId: string;
  userProgress: {
    rememberedWords: Set<number>;
    forgottenWords: Set<number>;
    excludedWordIds: Set<number>;
  };
  childStats?: ChildWordStats | null;
  selectedCategory?: string;
  onWordProgress?: (word: Word, status: "remembered" | "needs_practice") => void;
  onSessionComplete?: (results: any) => void;
}

export function AIEnhancedWordLearning({
  userId,
  userProgress,
  childStats,
  selectedCategory,
  onWordProgress,
  onSessionComplete
}: AIEnhancedWordLearningProps) {
  
  // AI Recommendations Hook
  const [aiState, aiActions] = useAIWordRecommendations({
    userId,
    enableRealTimeAdaptation: true,
    enableAnalytics: true,
    enableMotivationalBoosts: true,
    autoStartSession: false
  });

  // Real-time analytics
  const { analytics: realtimeAnalytics, isLoading: analyticsLoading } = useRealTimeLearningAnalytics(userId);

  // Local state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [wordStartTime, setWordStartTime] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [sessionGoal, setSessionGoal] = useState<"learning" | "review" | "challenge" | "confidence">("learning");
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(1);

  // Adaptive difficulty suggestion
  const difficultyAdjustment = useAdaptiveDifficulty(
    userId,
    aiState.sessionProgress.efficiency,
    wordStartTime ? Date.now() - wordStartTime : 0
  );

  // Initialize AI recommendations when component mounts
  useEffect(() => {
    if (!aiState.hasInitialized) return;

    const sessionContext: SessionContext = {
      timeOfDay: new Date().getHours(),
      availableTime: 15, // Default 15 minutes
      sessionGoal,
      deviceType: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
      previousSessionGap: 24 // Default 24 hours
    };

    if (!aiState.currentRecommendation) {
      aiActions.getRecommendations(
        sessionContext,
        userProgress,
        childStats,
        selectedCategory || "all",
        20
      );
    }
  }, [aiState.hasInitialized, selectedCategory, sessionGoal, userProgress, childStats]);

  // Start session when recommendations are ready
  const handleStartSession = useCallback(() => {
    if (aiState.currentRecommendation && !sessionStarted) {
      aiActions.startSession(aiState.currentRecommendation);
      setSessionStarted(true);
      setWordStartTime(Date.now());
      setCurrentWordIndex(0);
    }
  }, [aiState.currentRecommendation, sessionStarted, aiActions]);

  // Handle word interactions
  const handleWordResponse = useCallback(async (word: Word, isCorrect: boolean) => {
    const responseTime = Date.now() - wordStartTime;
    
    // Record interaction with AI system
    await aiActions.recordWordInteraction({
      wordId: word.id,
      word: word.word,
      isCorrect,
      responseTime,
      hintsUsed,
      attemptNumber: currentAttempt
    });

    // Call parent callback
    onWordProgress?.(word, isCorrect ? "remembered" : "needs_practice");

    // Show celebration for correct answers
    if (isCorrect) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }

    // Move to next word or end session
    if (currentWordIndex < aiState.words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setWordStartTime(Date.now());
      setHintsUsed(0);
      setCurrentAttempt(1);
    } else {
      // Session complete
      await handleSessionComplete(true);
    }
  }, [wordStartTime, hintsUsed, currentAttempt, currentWordIndex, aiState.words.length, aiActions, onWordProgress]);

  const handleSessionComplete = useCallback(async (completed: boolean, reason?: string) => {
    const results = await aiActions.endSession({
      completed,
      reason,
      userSatisfaction: 4 // Could be collected from user
    });

    setSessionStarted(false);
    onSessionComplete?.(results);
  }, [aiActions, onSessionComplete]);

  const handleHintRequest = useCallback(async () => {
    if (currentWordIndex < aiState.words.length) {
      const hint = await aiActions.requestHint(aiState.words[currentWordIndex].id);
      setHintsUsed(prev => prev + 1);
    }
  }, [currentWordIndex, aiState.words, aiActions]);

  const handleSkipWord = useCallback(async () => {
    if (currentWordIndex < aiState.words.length) {
      await aiActions.skipWord(aiState.words[currentWordIndex].id, "user_skip");
      setCurrentWordIndex(prev => prev + 1);
      setWordStartTime(Date.now());
      setHintsUsed(0);
      setCurrentAttempt(1);
    }
  }, [currentWordIndex, aiState.words, aiActions]);

  const currentWord = aiState.words[currentWordIndex];

  if (aiState.isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 mx-auto mb-4">
            <Brain className="w-8 h-8 text-educational-blue" />
          </div>
          <p className="text-lg text-gray-600">AI is preparing personalized recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  if (aiState.error) {
    return (
      <Alert className="w-full max-w-4xl mx-auto">
        <AlertDescription className="flex items-center justify-between">
          <span>AI system unavailable. Using standard word selection.</span>
          <Button onClick={() => aiActions.reset()} variant="outline" size="sm">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Floating Effects */}
      <FloatingBubbles />
      {showCelebration && <CelebrationEffect />}

      {/* AI Insights Header */}
      <Card className="bg-gradient-to-r from-educational-blue/5 to-educational-purple/5 border-educational-blue/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-educational-blue to-educational-purple p-2 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI-Powered Learning</CardTitle>
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(aiState.confidence * 100)}% | 
                  Words: {aiState.words.length} selected
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-educational-green/10 text-educational-green border-educational-green/30">
                {sessionGoal.charAt(0).toUpperCase() + sessionGoal.slice(1)} Mode
              </Badge>
              <Button
                onClick={() => setShowAnalytics(!showAnalytics)}
                variant="ghost"
                size="sm"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* AI Reasoning */}
        {aiState.reasoning.length > 0 && (
          <CardContent className="pt-0">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Brain className="w-4 h-4 text-educational-blue mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">AI Analysis:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {aiState.reasoning.slice(-3).map((reason, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-educational-blue">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Session Controls */}
      {!sessionStarted && aiState.currentRecommendation && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Start Learning?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => setSessionGoal("learning")}
                  className={`p-3 rounded-lg border transition-colors ${
                    sessionGoal === "learning" 
                      ? "bg-educational-blue text-white border-educational-blue" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Learning</div>
                </button>
                <button
                  onClick={() => setSessionGoal("review")}
                  className={`p-3 rounded-lg border transition-colors ${
                    sessionGoal === "review" 
                      ? "bg-educational-purple text-white border-educational-purple" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <RotateCcw className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Review</div>
                </button>
                <button
                  onClick={() => setSessionGoal("challenge")}
                  className={`p-3 rounded-lg border transition-colors ${
                    sessionGoal === "challenge" 
                      ? "bg-educational-orange text-white border-educational-orange" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Zap className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Challenge</div>
                </button>
                <button
                  onClick={() => setSessionGoal("confidence")}
                  className={`p-3 rounded-lg border transition-colors ${
                    sessionGoal === "confidence" 
                      ? "bg-educational-green text-white border-educational-green" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <Heart className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-sm font-medium">Confidence</div>
                </button>
              </div>
              <Button 
                onClick={handleStartSession}
                className="bg-gradient-to-r from-educational-blue to-educational-purple text-white px-8 py-3"
                size="lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Start AI-Enhanced Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Learning Interface */}
      {sessionStarted && currentWord && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Word Learning Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Progress Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Session Progress</span>
                  <span className="text-sm text-gray-600">
                    {currentWordIndex + 1} / {aiState.words.length}
                  </span>
                </div>
                <Progress 
                  value={(currentWordIndex / aiState.words.length) * 100} 
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Accuracy: {Math.round(aiState.sessionProgress.efficiency * 100)}%</span>
                  <span>Engagement: {Math.round(aiState.sessionProgress.engagement * 100)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Word Card */}
            <WordCard
              word={currentWord}
              onWordLearned={(word, rating) => handleWordResponse(word, rating === "easy")}
              showDefinition={true}
              autoPlay={true}
              compact={false}
            />

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button 
                    onClick={handleHintRequest}
                    variant="outline"
                    disabled={hintsUsed >= 3}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint ({hintsUsed}/3)
                  </Button>
                  <Button 
                    onClick={handleSkipWord}
                    variant="outline"
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Skip Word
                  </Button>
                  <Button 
                    onClick={() => handleSessionComplete(false, "user_quit")}
                    variant="outline"
                  >
                    End Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-4">
            {/* Real-time Feedback */}
            <Card className="bg-gradient-to-br from-educational-green/5 to-educational-blue/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {/* Encouragement */}
                {aiState.encouragementMessages.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm font-medium text-educational-green mb-1">Encouragement</p>
                    <p className="text-xs text-gray-700">
                      {aiState.encouragementMessages[aiState.encouragementMessages.length - 1]}
                    </p>
                  </div>
                )}

                {/* Adaptive Hints */}
                {aiState.adaptiveHints.length > 0 && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm font-medium text-educational-blue mb-1">Smart Hint</p>
                    <p className="text-xs text-gray-700">
                      {aiState.adaptiveHints[aiState.adaptiveHints.length - 1]}
                    </p>
                  </div>
                )}

                {/* Difficulty Adjustment */}
                {aiState.difficultyAdjustment && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm font-medium text-educational-purple mb-1">Difficulty</p>
                    <p className="text-xs text-gray-700">
                      AI suggests making it {aiState.difficultyAdjustment} based on your performance
                    </p>
                  </div>
                )}

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-educational-blue">
                      {aiState.sessionProgress.wordsCorrect}
                    </div>
                    <div className="text-xs text-gray-600">Correct</div>
                  </div>
                  <div className="bg-white/60 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-educational-purple">
                      {Math.round(aiState.sessionProgress.engagement * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Engagement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Analytics */}
            {showAnalytics && realtimeAnalytics && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Learning Velocity</span>
                      <span className="font-medium">
                        {realtimeAnalytics.velocityTrend.slice(-1)[0]?.toFixed(1) || '0.0'} words/min
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Retention Rate</span>
                      <span className="font-medium">
                        {Math.round((realtimeAnalytics.retentionTrend.slice(-1)[0] || 0) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Cognitive Load</span>
                      <span className="font-medium">
                        {Math.round(aiState.sessionProgress.cognitiveLoad * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Session Summary */}
      {!sessionStarted && aiState.sessionProgress.wordsAttempted > 0 && (
        <Card className="bg-gradient-to-r from-educational-green/5 to-educational-blue/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-educational-gold" />
              Session Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-blue">
                  {aiState.sessionProgress.wordsCorrect}
                </div>
                <div className="text-sm text-gray-600">Words Learned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-purple">
                  {Math.round(aiState.sessionProgress.efficiency * 100)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-green">
                  {Math.round(aiState.sessionProgress.engagement * 100)}%
                </div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-educational-orange">
                  <Clock className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-sm text-gray-600">Time Well Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
