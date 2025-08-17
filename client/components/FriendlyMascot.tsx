import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface FriendlyMascotProps {
  mood?:
    | "happy"
    | "excited"
    | "encouraging"
    | "celebrating"
    | "thinking"
    | "cheering";
  size?: "small" | "medium" | "large";
  position?: "left" | "right" | "center";
  message?: string;
  showSpeechBubble?: boolean;
  animate?: boolean;
  className?: string;
}

const mascotExpressions = {
  happy: "😊",
  excited: "🤩",
  encouraging: "👍",
  celebrating: "🎉",
  thinking: "🤔",
  cheering: "🙌",
};

const mascotMessages = {
  happy: "Great job! Keep learning! 🌟",
  excited: "Wow! You're amazing! ✨",
  encouraging: "You can do it! I believe in you! 💪",
  celebrating: "Fantastic! You're a superstar! 🏆",
  thinking: "Hmm, let's think about this together! 💭",
  cheering: "Hooray! You did it! 🎊",
};

const mascotCharacters = [
  "🦁",
  "🐯",
  "🐨",
  "🐼",
  "🐸",
  "🐧",
  "🦉",
  "🦊",
  "🐺",
  "🐻",
];

export function FriendlyMascot({
  mood = "happy",
  size = "medium",
  position = "left",
  message,
  showSpeechBubble = false,
  animate = true,
  className,
}: FriendlyMascotProps) {
  const [currentCharacter, setCurrentCharacter] = useState(mascotCharacters[0]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Randomly select a mascot character on mount
    const randomIndex = Math.floor(Math.random() * mascotCharacters.length);
    setCurrentCharacter(mascotCharacters[randomIndex]);
    setIsVisible(true);
  }, []);

  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  };

  const positionClasses = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
  };

  const animationClasses = animate
    ? {
        happy: "animate-gentle-bounce",
        excited: "animate-mascot-happy",
        encouraging: "animate-mascot-wave",
        celebrating: "animate-kid-pulse-glow",
        thinking: "animate-gentle-float",
        cheering: "animate-mascot-bounce",
      }[mood]
    : "";

  const displayMessage = message || mascotMessages[mood];

  return (
    <div
      className={cn(
        "flex items-center gap-4 transition-all duration-500",
        positionClasses[position],
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className,
      )}
    >
      {position === "right" && showSpeechBubble && (
        <div className="speech-bubble kid-text-big max-w-xs">
          {displayMessage}
        </div>
      )}

      <div
        className={cn(
          "mascot-character filter drop-shadow-lg",
          sizeClasses[size],
          animationClasses,
          "cursor-pointer hover:scale-110 transition-transform duration-300",
        )}
      >
        <span className="relative">
          {currentCharacter}
          <span
            className={cn(
              "absolute -top-1 -right-1 text-sm",
              size === "large"
                ? "text-lg"
                : size === "small"
                  ? "text-xs"
                  : "text-sm",
            )}
          >
            {mascotExpressions[mood]}
          </span>
        </span>
      </div>

      {position !== "right" && showSpeechBubble && (
        <div className="speech-bubble kid-text-big max-w-xs">
          {displayMessage}
        </div>
      )}
    </div>
  );
}

// Floating mascot that appears periodically
export function FloatingMascot({
  mood = "happy",
  duration = 5000,
  className,
}: {
  mood?: FriendlyMascotProps["mood"];
  duration?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showMascot = () => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), duration);
    };

    // Show mascot initially after a delay
    const initialTimer = setTimeout(showMascot, 2000);

    // Show mascot periodically
    const interval = setInterval(showMascot, 30000); // Every 30 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [duration]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 transition-all duration-500",
        "animate-mascot-bounce",
        className,
      )}
    >
      <FriendlyMascot
        mood={mood}
        size="large"
        showSpeechBubble={true}
        animate={true}
        className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg"
      />
    </div>
  );
}

// Mascot reactions for different events
export function MascotReaction({
  type,
  onComplete,
}: {
  type: "success" | "levelUp" | "achievement" | "encouragement";
  onComplete?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const reactionConfig = {
    success: { mood: "celebrating" as const, message: "Amazing work! 🌟" },
    levelUp: {
      mood: "excited" as const,
      message: "Level up! You're incredible! 🚀",
    },
    achievement: {
      mood: "cheering" as const,
      message: "Achievement unlocked! 🏆",
    },
    encouragement: {
      mood: "encouraging" as const,
      message: "Keep going! You've got this! 💪",
    },
  };

  const config = reactionConfig[type];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="celebration-burst bg-white rounded-3xl p-8 shadow-2xl animate-mascot-bounce">
        <FriendlyMascot
          mood={config.mood}
          size="large"
          position="center"
          message={config.message}
          showSpeechBubble={true}
          animate={true}
        />
      </div>
    </div>
  );
}
