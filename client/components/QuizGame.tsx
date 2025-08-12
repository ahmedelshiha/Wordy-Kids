import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  ArrowRight,
  RotateCcw,
  X,
  AlertTriangle,
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { CelebrationEffect } from "@/components/CelebrationEffect";

interface QuizQuestion {
  id: number;
  word?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  emoji?: string;
}

interface QuizGameProps {
  questions: QuizQuestion[];
  onComplete: (score: number, totalQuestions: number) => void;
  onProgress?: (current: number, total: number) => void;
  onExit?: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  questions,
  onComplete,
  onProgress,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Safety checks
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              No Questions Available
            </h2>
            <p className="text-slate-600 mb-6">
              Sorry, there are no quiz questions available for this quiz type.
            </p>
            <Button onClick={onExit} className="bg-educational-blue text-white">
              Return to Quiz Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;

  // Additional safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Question Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              There was an issue loading the current question.
            </p>
            <Button onClick={onExit} className="bg-educational-blue text-white">
              Return to Quiz Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    onProgress?.(currentIndex + 1, questions.length);
  }, [currentIndex, questions.length, onProgress]);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showFeedback) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleTimeUp();
    }
  }, [timeLeft, isTimerActive, showFeedback]);

  const handleTimeUp = () => {
    setSelectedAnswer(null);
    setShowFeedback(true);
    setIsTimerActive(false);

    setTimeout(() => {
      if (isLastQuestion) {
        // Play level up sound for quiz completion
        playSoundIfEnabled.levelUp();
        audioService.playSuccessSound();
        onComplete(score, questions.length);
      } else {
        nextQuestion();
      }
    }, 2000);
  };

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    setIsTimerActive(false);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      // Play celebration effects
      setShowCelebration(true);
      audioService.playSuccessSound();
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      // Play error sound for wrong answers
      playSoundIfEnabled.error();
    }

    setTimeout(() => {
      if (isLastQuestion) {
        // Play level up sound for quiz completion
        playSoundIfEnabled.levelUp();
        audioService.playSuccessSound();
        onComplete(score + (isCorrect ? 1 : 0), questions.length);
      } else {
        nextQuestion();
      }
    }, 2500);
  };

  const nextQuestion = () => {
    setCurrentIndex(currentIndex + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  const handleExit = () => {
    setShowExitConfirm(true);
    setIsTimerActive(false);
  };

  const confirmExit = () => {
    onExit?.();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
    if (!showFeedback) {
      setIsTimerActive(true);
    }
  };

  const getButtonVariant = (option: string) => {
    if (!showFeedback) {
      return selectedAnswer === option ? "default" : "outline";
    }

    if (option === currentQuestion.correctAnswer) {
      return "default";
    }

    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return "destructive";
    }

    return "outline";
  };

  const getButtonIcon = (option: string) => {
    if (!showFeedback) return null;

    if (option === currentQuestion.correctAnswer) {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }

    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6 text-educational-yellow" />
              Word Quiz Challenge
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {timeLeft}s
              </Badge>
              <Badge className="bg-educational-purple text-white">
                {score}/{questions.length}
              </Badge>
              <Button
                onClick={handleExit}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-500 hover:bg-red-50"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-educational-blue via-educational-purple to-educational-pink" />

        <CardContent className="pt-8 pb-6">
          <div className="text-center mb-8">
            {/* Animated Picture Container */}
            <div className="inline-block mb-6">
              <div className="bg-gradient-to-br from-educational-blue-light to-educational-purple-light p-8 rounded-3xl shadow-lg border-3 border-rainbow">
                <div className="text-8xl animate-gentle-float">
                  {currentQuestion.emoji || "📚"}
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 max-w-2xl mx-auto">
            {currentQuestion.options?.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                variant={getButtonVariant(option)}
                className="h-auto p-2 md:p-4 text-center text-xs md:text-sm font-medium hover:scale-105 transition-all rounded-xl animate-kid-float"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <span className="block">{option}</span>
                {getButtonIcon(option)}
              </Button>
            ))}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div
                className={`p-4 rounded-lg ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? "bg-green-50 border border-green-200"
                    : timeLeft === 0
                      ? "bg-orange-50 border border-orange-200"
                      : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Perfect! Well done! 🎉
                      </span>
                    </>
                  ) : timeLeft === 0 ? (
                    <>
                      <Clock className="w-6 h-6 text-orange-600" />
                      <span className="font-semibold text-orange-800">
                        Time's up! ⏰
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="font-semibold text-red-800">
                        Incorrect. The correct answer is:{" "}
                        {currentQuestion.correctAnswer}
                      </span>
                    </>
                  )}
                </div>

                {currentQuestion.explanation && (
                  <p className="text-slate-700 text-sm">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {showFeedback && (
        <div className="flex justify-center gap-4">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Quiz
          </Button>

          {!isLastQuestion && (
            <Button
              onClick={nextQuestion}
              className="flex items-center gap-2 bg-educational-blue text-white"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-6 h-6" />
                Quit Quiz?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">
                Are you sure you want to quit this quiz? Your progress will be
                lost and you'll return to the quiz selection screen.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={cancelExit}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Quiz
                </Button>
                <Button
                  onClick={confirmExit}
                  variant="destructive"
                  className="flex-1"
                >
                  Quit Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Celebration Effect */}
      <CelebrationEffect
        trigger={showCelebration}
        type="confetti"
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};
