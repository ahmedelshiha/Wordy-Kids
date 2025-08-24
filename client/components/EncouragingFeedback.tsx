import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  Sparkles,
  Trophy,
  Target,
  ThumbsUp,
  Smile,
  Zap,
  Gift,
  Crown,
} from "lucide-react";
import { audioService } from "@/lib/audioService";

interface FeedbackProps {
  type: "success" | "partial" | "encouragement" | "celebration" | "try_again";
  title?: string;
  message: string;
  points?: number;
  streak?: number;
  showAnimation?: boolean;
  onContinue?: () => void;
  onTryAgain?: () => void;
  autoHide?: boolean;
  hideDelay?: number;
}

interface ChildFeedbackSystemProps {
  feedback: FeedbackProps | null;
  onClose: () => void;
}

const successMessages = [
  "Amazing work! You're a vocabulary superstar! ⭐",
  "Fantastic! That was perfect! 🎉",
  "Incredible! You got it exactly right! 🏆",
  "Wonderful job! You're such a smart learner! 🧠",
  "Excellent! That's how it's done! 💪",
  "Perfect! You make learning look easy! ✨",
  "Outstanding! You're becoming a word master! 📚",
  "Brilliant! Your hard work is paying off! 🌟",
];

const encouragementMessages = [
  "You're doing great! Keep trying! 💪",
  "Almost there! You can do this! 🎯",
  "Good effort! Try once more! 🌟",
  "You're learning so well! Keep going! 📚",
  "Nice try! Learning is a journey! 🚀",
  "That's okay! Every mistake helps you learn! 🎈",
  "You're getting better each time! 💫",
  "Great attempt! Keep up the awesome work! 🎊",
];

const celebrationMessages = [
  "WOW! You're on fire! 🔥",
  "Incredible streak! You're unstoppable! 🚀",
  "Amazing progress! You're a learning champion! 👑",
  "Fantastic! You just earned bonus points! 💎",
  "Spectacular! You unlocked something special! 🎁",
  "Phenomenal! You're setting new records! 📊",
  "Extraordinary! You're becoming a word wizard! 🪄",
  "Magnificent! Your dedication is inspiring! ⭐",
];

const tryAgainMessages = [
  "Oops! Let's try that again together! 🤗",
  "No worries! Practice makes perfect! 🎯",
  "That's okay! Every expert was once a beginner! 🌱",
  "Let's give it another shot! You've got this! 💫",
  "Don't worry! Learning is all about trying! 🎈",
  "It's alright! Mistakes help us grow! 🌟",
  "Let's try once more! I believe in you! 💝",
  "That's okay! You're still awesome! 😊",
];

export function EncouragingFeedback({
  feedback,
  onClose,
}: ChildFeedbackSystemProps) {
  const [showExtra, setShowExtra] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (feedback) {
      // Play appropriate sound
      switch (feedback.type) {
        case "success":
        case "celebration":
          audioService.playCheerSound();
          setCurrentAnimation("bounce");
          break;
        case "partial":
          audioService.playSuccessSound();
          setCurrentAnimation("pulse");
          break;
        case "encouragement":
        case "try_again":
          audioService.playEncouragementSound();
          setCurrentAnimation("shake");
          break;
      }

      // Show extra animations for success
      if (feedback.type === "success" || feedback.type === "celebration") {
        setShowExtra(true);
        setTimeout(() => setShowExtra(false), 2000);
      }

      // Auto-hide if specified
      if (feedback.autoHide) {
        const delay = feedback.hideDelay || 3000;
        setTimeLeft(Math.ceil(delay / 1000));

        // Countdown timer
        const countdownInterval = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownInterval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);

        setTimeout(() => {
          onClose();
        }, delay);

        return () => clearInterval(countdownInterval);
      }

      // Clear animation after a delay
      setTimeout(() => {
        setCurrentAnimation("");
      }, 1000);
    }
  }, [feedback, onClose]);

  if (!feedback) return null;

  const getIcon = () => {
    switch (feedback.type) {
      case "success":
        return <Star className="w-12 h-12 text-yellow-400 fill-current" />;
      case "partial":
        return <ThumbsUp className="w-12 h-12 text-blue-400" />;
      case "encouragement":
        return <Heart className="w-12 h-12 text-pink-400 fill-current" />;
      case "celebration":
        return <Trophy className="w-12 h-12 text-gold-400" />;
      case "try_again":
        return <Smile className="w-12 h-12 text-purple-400" />;
      default:
        return <Sparkles className="w-12 h-12 text-blue-400" />;
    }
  };

  const getBackgroundGradient = () => {
    switch (feedback.type) {
      case "success":
        return "from-educational-green via-educational-blue to-educational-purple";
      case "partial":
        return "from-educational-blue via-educational-purple to-educational-blue";
      case "encouragement":
        return "from-educational-pink via-educational-purple to-educational-pink";
      case "celebration":
        return "from-educational-orange via-educational-yellow to-educational-orange";
      case "try_again":
        return "from-educational-purple via-educational-pink to-educational-purple";
      default:
        return "from-educational-blue to-educational-purple";
    }
  };

  const getRandomMessage = () => {
    switch (feedback.type) {
      case "success":
        return successMessages[
          Math.floor(Math.random() * successMessages.length)
        ];
      case "encouragement":
        return encouragementMessages[
          Math.floor(Math.random() * encouragementMessages.length)
        ];
      case "celebration":
        return celebrationMessages[
          Math.floor(Math.random() * celebrationMessages.length)
        ];
      case "try_again":
        return tryAgainMessages[
          Math.floor(Math.random() * tryAgainMessages.length)
        ];
      default:
        return feedback.message;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Floating Celebration Elements */}
      {showExtra &&
        (feedback.type === "success" || feedback.type === "celebration") && (
          <>
            <div className="absolute top-20 left-20 text-4xl animate-bounce">
              🎉
            </div>
            <div className="absolute top-32 right-24 text-3xl animate-pulse delay-200">
              ⭐
            </div>
            <div className="absolute bottom-32 left-32 text-4xl animate-bounce delay-300">
              🏆
            </div>
            <div className="absolute bottom-24 right-20 text-3xl animate-pulse delay-100">
              ✨
            </div>
            <div className="absolute top-40 left-1/2 text-2xl animate-bounce delay-400">
              🎊
            </div>
            <div className="absolute bottom-40 right-1/2 text-3xl animate-pulse delay-500">
              🌟
            </div>
          </>
        )}

      <Card
        className={`max-w-sm w-full mx-4 bg-gradient-to-br ${getBackgroundGradient()} text-white shadow-2xl rounded-3xl ${
          currentAnimation === "bounce"
            ? "animate-bounce"
            : currentAnimation === "pulse"
              ? "animate-pulse"
              : currentAnimation === "shake"
                ? "animate-pulse"
                : ""
        }`}
      >
        <CardContent className="p-6 text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={`p-3 rounded-full bg-white/20 backdrop-blur-sm ${
                feedback.showAnimation !== false ? "animate-pulse" : ""
              }`}
            >
              <div className="w-12 h-12 flex items-center justify-center">
                {getIcon()}
              </div>
            </div>
          </div>

          {/* Title */}
          {feedback.title && (
            <h2 className="text-xl font-bold text-white">{feedback.title}</h2>
          )}

          {/* Message */}
          <div className="space-y-2">
            <p className="text-base text-white/95 leading-relaxed">
              {feedback.message || getRandomMessage()}
            </p>

            {/* Points and Streak */}
            {(feedback.points || feedback.streak) && (
              <div className="flex justify-center gap-2 flex-wrap">
                {feedback.points && (
                  <Badge className="bg-slate-800/80 text-white border-slate-600/50 text-sm py-1 px-3">
                    <Zap className="w-3 h-3 mr-1" />+{feedback.points} points
                  </Badge>
                )}
                {feedback.streak && (
                  <Badge className="bg-slate-800/80 text-white border-slate-600/50 text-sm py-1 px-3">
                    <Target className="w-3 h-3 mr-1" />
                    {feedback.streak} day streak
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-2 pt-3">
            {feedback.onTryAgain && (
              <Button
                onClick={() => {
                  audioService.playWhooshSound();
                  feedback.onTryAgain?.();
                  onClose();
                }}
                className="bg-slate-800/80 hover:bg-slate-700/90 text-white border-slate-600/50 px-4 py-2 text-base"
                variant="outline"
              >
                Try Again 🔄
              </Button>
            )}

            {feedback.onContinue && (
              <Button
                onClick={() => {
                  audioService.playWhooshSound();
                  feedback.onContinue?.();
                  onClose();
                }}
                className="bg-white text-gray-800 hover:bg-white/90 px-4 py-2 text-base font-semibold"
              >
                {feedback.type === "success" || feedback.type === "celebration"
                  ? "Continue! 🚀"
                  : "Next ➡️"}
              </Button>
            )}

            {!feedback.onContinue && !feedback.onTryAgain && (
              <Button
                onClick={() => {
                  audioService.playWhooshSound();
                  onClose();
                }}
                className="bg-white text-gray-800 hover:bg-white/90 px-4 py-2 text-base font-semibold"
              >
                Awesome! 👍
              </Button>
            )}
          </div>

          {/* Progress Indicator */}
          {feedback.type === "encouragement" && (
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm text-white/80">
                💡 Remember: Every try makes you stronger!
              </p>
            </div>
          )}

          {/* Special Celebration Features */}
          {feedback.type === "celebration" && (
            <div className="pt-3 border-t border-white/20 space-y-2">
              <div className="flex items-center justify-center gap-2 text-yellow-300">
                <Crown className="w-4 h-4" />
                <span className="font-bold text-base">You're Amazing!</span>
                <Crown className="w-4 h-4" />
              </div>
              <p className="text-xs text-white/80">
                🎁 Keep up the great work for more surprises!
              </p>
              {feedback.autoHide && timeLeft && (
                <p className="text-xs text-white/60">
                  Auto-closing in {timeLeft} second{timeLeft !== 1 ? "s" : ""}
                  ...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for inline feedback (smaller, less intrusive)
interface InlineFeedbackProps {
  type: "correct" | "incorrect" | "hint";
  message: string;
  onClose?: () => void;
  autoHide?: boolean;
}

export function InlineFeedback({
  type,
  message,
  onClose,
  autoHide = true,
}: InlineFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoHide, onClose]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case "correct":
        return "bg-educational-green text-white border-educational-green";
      case "incorrect":
        return "bg-educational-pink text-white border-educational-pink";
      case "hint":
        return "bg-educational-blue text-white border-educational-blue";
      default:
        return "bg-gray-500 text-white border-gray-500";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "correct":
        return "✅";
      case "incorrect":
        return "💝"; // Heart instead of X to be gentler
      case "hint":
        return "💡";
      default:
        return "📝";
    }
  };

  return (
    <div className="flex justify-center mb-4">
      <Badge
        className={`${getStyles()} px-4 py-2 text-lg animate-fade-in border-2`}
        onClick={onClose}
      >
        <span className="mr-2">{getIcon()}</span>
        {message}
      </Badge>
    </div>
  );
}

// Usage examples and feedback templates
export const feedbackTemplates = {
  correctAnswer: (points: number = 10): FeedbackProps => ({
    type: "success",
    title: "Correct! 🎉",
    message: "",
    points,
    showAnimation: true,
    onContinue: () => console.log("Continue to next question"),
  }),

  streakAchievement: (streak: number): FeedbackProps => ({
    type: "celebration",
    title: "Streak Master! 🔥",
    message: `You're on a ${streak}-day learning streak! Keep it up!`,
    streak,
    showAnimation: true,
    onContinue: () => console.log("Continue learning"),
  }),

  wrongAnswer: (): FeedbackProps => ({
    type: "try_again",
    title: "Not quite! 💝",
    message: "",
    showAnimation: true,
    onTryAgain: () => console.log("Try again"),
    onContinue: () => console.log("Show hint or continue"),
  }),

  encouragement: (): FeedbackProps => ({
    type: "encouragement",
    title: "Keep Going! 💪",
    message: "",
    showAnimation: true,
    onContinue: () => console.log("Continue learning"),
  }),

  partialCredit: (points: number = 5): FeedbackProps => ({
    type: "partial",
    title: "Good Try! 👍",
    message: "You got part of it right! That shows you're learning!",
    points,
    showAnimation: true,
    onContinue: () => console.log("Continue"),
  }),
};
