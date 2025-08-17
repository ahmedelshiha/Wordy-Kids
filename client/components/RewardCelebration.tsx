import React, { useEffect, useState } from "react";

interface RewardCelebrationProps {
  isVisible: boolean;
  type?:
    | "word_learned"
    | "quiz_complete"
    | "achievement"
    | "level_up"
    | "perfect_score";
  title?: string;
  message?: string;
  points?: number;
  onComplete?: () => void;
  duration?: number;
}

interface Confetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
}

export const RewardCelebration: React.FC<RewardCelebrationProps> = ({
  isVisible,
  type = "word_learned",
  title,
  message,
  points = 0,
  onComplete,
  duration = 3000,
}) => {
  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const [showContent, setShowContent] = useState(false);

  const celebrationConfig = {
    word_learned: {
      title: title || "🌟 Amazing!",
      message: message || "You learned a new word!",
      emojis: ["🌟", "✨", "🎉", "👏", "💫"],
      colors: ["#ff6b9d", "#4facfe", "#43e97b", "#fa709a", "#feca57"],
      confettiCount: 25,
    },
    quiz_complete: {
      title: title || "🧠 Quiz Master!",
      message: message || "Outstanding quiz performance!",
      emojis: ["🏆", "🎯", "🧠", "⭐", "🎊"],
      colors: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
      confettiCount: 35,
    },
    achievement: {
      title: title || "🏆 Achievement Unlocked!",
      message: message || "You earned a new badge!",
      emojis: ["🏆", "🥇", "👑", "💎", "🌟"],
      colors: ["#ffd700", "#ff6b35", "#f7971e", "#ffd200", "#ffaa00"],
      confettiCount: 40,
    },
    level_up: {
      title: title || "🚀 Level Up!",
      message: message || "You reached a new level!",
      emojis: ["🚀", "🌈", "⚡", "🔥", "💫"],
      colors: ["#ff9a9e", "#fecfef", "#fecfef", "#a8edea", "#fed6e3"],
      confettiCount: 50,
    },
    perfect_score: {
      title: title || "✨ Perfect Score!",
      message: message || "Absolutely incredible!",
      emojis: ["✨", "🌟", "💫", "🎯", "🔮"],
      colors: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
      confettiCount: 60,
    },
  };

  const config = celebrationConfig[type];

  useEffect(() => {
    if (!isVisible) {
      setConfetti([]);
      setShowContent(false);
      return;
    }

    // Show content with slight delay
    const contentTimer = setTimeout(() => setShowContent(true), 200);

    // Generate confetti
    const newConfetti: Confetti[] = [];
    for (let i = 0; i < config.confettiCount; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 5 + 2,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }
    setConfetti(newConfetti);

    // Auto-complete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(timer);
    };
  }, [isVisible, type, duration, onComplete]);

  // Animate confetti
  useEffect(() => {
    if (confetti.length === 0) return;

    const animateConfetti = () => {
      setConfetti((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            rotation: particle.rotation + particle.rotationSpeed,
            vy: particle.vy + 0.3, // gravity
          }))
          .filter((particle) => particle.y < window.innerHeight + 50),
      );
    };

    const interval = setInterval(animateConfetti, 50);
    return () => clearInterval(interval);
  }, [confetti.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

      {/* Confetti */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            color: particle.color,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Celebration Card */}
      {showContent && (
        <div className="relative bg-gradient-to-br from-white via-yellow-50 to-pink-50 rounded-3xl shadow-2xl border-4 border-yellow-300 p-8 mx-4 max-w-md animate-badge-unlock">
          {/* Magical border effect */}
          <div className="absolute inset-0 rounded-3xl animate-magical-portal" />

          {/* Floating sparkles around the card */}
          <div className="absolute -top-4 -left-4 text-3xl animate-kid-magic-sparkle">
            ✨
          </div>
          <div className="absolute -top-2 -right-6 text-2xl animate-sparkle animation-delay-200">
            ⭐
          </div>
          <div className="absolute -bottom-4 -left-2 text-2xl animate-gentle-bounce">
            🌟
          </div>
          <div className="absolute -bottom-2 -right-4 text-3xl animate-gentle-float animation-delay-100">
            💫
          </div>

          {/* Content */}
          <div className="relative text-center">
            <h2 className="text-3xl font-kid-friendly font-bold text-purple-800 mb-2 text-shadow animate-gentle-bounce">
              {config.title}
            </h2>

            <p className="text-lg font-kid-friendly text-purple-700 mb-4">
              {config.message}
            </p>

            {points > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl py-3 px-6 mb-4 shadow-lg animate-gentle-float">
                <span className="text-2xl font-kid-friendly font-bold">
                  +{points} Points! 🎯
                </span>
              </div>
            )}

            {/* Celebration emojis */}
            <div className="flex justify-center gap-4 mb-6">
              {config.emojis.slice(0, 3).map((emoji, index) => (
                <span
                  key={index}
                  className="text-4xl animate-mascot-bounce"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {/* Continue button */}
            <button
              onClick={onComplete}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-kid-friendly font-bold py-3 px-8 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 animate-kid-pulse-glow"
            >
              Continue Adventure! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardCelebration;
