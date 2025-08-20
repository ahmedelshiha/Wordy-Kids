import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface JungleRewardCelebrationProps {
  isVisible: boolean;
  type?:
    | "word_learned"
    | "quiz_complete"
    | "achievement"
    | "level_up"
    | "perfect_score"
    | "jungle_discovery"
    | "animal_friend"
    | "treasure_found"
    | "expedition_complete";
  title?: string;
  message?: string;
  points?: number;
  jungleCoins?: number;
  onComplete?: () => void;
  duration?: number;
  intensity?: "low" | "medium" | "high" | "epic";
}

interface JungleConfetti {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
  size: number;
  life: number;
  maxLife: number;
}

interface JungleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  scale: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export const EnhancedJungleRewardCelebration: React.FC<JungleRewardCelebrationProps> = ({
  isVisible,
  type = "word_learned",
  title,
  message,
  points = 0,
  jungleCoins = 0,
  onComplete,
  duration = 3500,
  intensity = "medium",
}) => {
  const [confetti, setConfetti] = useState<JungleConfetti[]>([]);
  const [particles, setParticles] = useState<JungleParticle[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<"enter" | "celebrate" | "exit">("enter");

  const jungleCelebrationConfig = {
    word_learned: {
      title: title || "🌿 Word Discovered!",
      message: message || "You found a new word in the jungle!",
      emojis: ["🌿", "🦋", "✨", "🌺", "💫"],
      confettiEmojis: ["🌿", "🦋", "🌺", "🌸", "🍃"],
      colors: ["#4ade80", "#22c55e", "#16a34a", "#15803d", "#166534"],
      confettiCount: 25,
      particleCount: 15,
      background: "from-jungle-DEFAULT to-emerald-500",
      borderColor: "border-jungle-DEFAULT",
      soundEffect: "nature",
    },
    quiz_complete: {
      title: title || "🧠 Jungle Quiz Mastered!",
      message: message || "You conquered the jungle brain challenge!",
      emojis: ["🧠", "🎯", "⭐", "🏆", "💎"],
      confettiEmojis: ["🧠", "⭐", "🎯", "💫", "✨"],
      colors: ["#3b82f6", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554"],
      confettiCount: 35,
      particleCount: 20,
      background: "from-sky-DEFAULT to-blue-500",
      borderColor: "border-sky-DEFAULT",
      soundEffect: "triumph",
    },
    achievement: {
      title: title || "🏆 Jungle Achievement Unlocked!",
      message: message || "You earned a legendary jungle badge!",
      emojis: ["🏆", "👑", "💎", "🌟", "⚡"],
      confettiEmojis: ["🏆", "👑", "💎", "⭐", "🌟"],
      colors: ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"],
      confettiCount: 45,
      particleCount: 25,
      background: "from-sunshine-DEFAULT to-orange-500",
      borderColor: "border-sunshine-DEFAULT",
      soundEffect: "victory",
    },
    level_up: {
      title: title || "🚀 Jungle Level Up!",
      message: message || "You climbed higher in the jungle canopy!",
      emojis: ["🚀", "🌳", "⚡", "🌈", "💫"],
      confettiEmojis: ["🚀", "🌳", "⚡", "🌈", "⭐"],
      colors: ["#8b5cf6", "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95"],
      confettiCount: 50,
      particleCount: 30,
      background: "from-playful-purple to-profile-purple",
      borderColor: "border-playful-purple",
      soundEffect: "levelup",
    },
    perfect_score: {
      title: title || "✨ Perfect Jungle Explorer!",
      message: message || "Flawless performance in the wild!",
      emojis: ["✨", "🌟", "💫", "🎯", "🔮"],
      confettiEmojis: ["✨", "🌟", "💫", "🎯", "🔮"],
      colors: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
      confettiCount: 60,
      particleCount: 35,
      background: "from-coral-red to-pink-500",
      borderColor: "border-coral-red",
      soundEffect: "perfect",
    },
    jungle_discovery: {
      title: title || "🗺️ New Territory Discovered!",
      message: message || "You found a hidden jungle area!",
      emojis: ["🗺️", "🧭", "🌿", "🦜", "🐵"],
      confettiEmojis: ["🗺️", "🧭", "🌿", "🦜", "🐵"],
      colors: ["#059669", "#047857", "#065f46", "#064e3b", "#022c22"],
      confettiCount: 40,
      particleCount: 25,
      background: "from-emerald-500 to-green-600",
      borderColor: "border-emerald-500",
      soundEffect: "discovery",
    },
    animal_friend: {
      title: title || "🐵 New Animal Friend!",
      message: message || "A jungle creature became your buddy!",
      emojis: ["🐵", "🦜", "🦋", "🐅", "🦔"],
      confettiEmojis: ["🐵", "🦜", "🦋", "🐅", "❤️"],
      colors: ["#f97316", "#ea580c", "#c2410c", "#9a3412", "#7c2d12"],
      confettiCount: 35,
      particleCount: 20,
      background: "from-bright-orange to-orange-600",
      borderColor: "border-bright-orange",
      soundEffect: "friendship",
    },
    treasure_found: {
      title: title || "💎 Jungle Treasure Found!",
      message: message || "You discovered ancient jungle riches!",
      emojis: ["💎", "🪙", "👑", "⚱️", "✨"],
      confettiEmojis: ["💎", "🪙", "👑", "⚱️", "✨"],
      colors: ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"],
      confettiCount: 55,
      particleCount: 30,
      background: "from-amber-400 to-yellow-500",
      borderColor: "border-amber-400",
      soundEffect: "treasure",
    },
    expedition_complete: {
      title: title || "🏕️ Expedition Complete!",
      message: message || "Successfully completed jungle expedition!",
      emojis: ["🏕️", "🎒", "🗺️", "🌟", "🏆"],
      confettiEmojis: ["🏕️", "🎒", "🗺️", "🌟", "🏆"],
      colors: ["#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"],
      confettiCount: 50,
      particleCount: 28,
      background: "from-indigo-500 to-purple-600",
      borderColor: "border-indigo-500",
      soundEffect: "expedition",
    },
  };

  const config = jungleCelebrationConfig[type];

  const getIntensityMultiplier = () => {
    switch (intensity) {
      case "low": return 0.5;
      case "medium": return 1;
      case "high": return 1.5;
      case "epic": return 2;
      default: return 1;
    }
  };

  useEffect(() => {
    if (!isVisible) {
      setConfetti([]);
      setParticles([]);
      setShowContent(false);
      setAnimationPhase("enter");
      return;
    }

    const intensityMultiplier = getIntensityMultiplier();

    // Show content with slight delay
    const contentTimer = setTimeout(() => {
      setShowContent(true);
      setAnimationPhase("celebrate");
    }, 300);

    // Generate jungle confetti
    const newConfetti: JungleConfetti[] = [];
    const confettiCount = Math.floor(config.confettiCount * intensityMultiplier);
    
    for (let i = 0; i < confettiCount; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -50,
        vx: (Math.random() - 0.5) * 12,
        vy: Math.random() * 6 + 3,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        emoji: config.confettiEmojis[Math.floor(Math.random() * config.confettiEmojis.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        size: Math.random() * 0.5 + 0.8,
        life: 0,
        maxLife: 120 + Math.random() * 60,
      });
    }
    setConfetti(newConfetti);

    // Generate floating particles
    const newParticles: JungleParticle[] = [];
    const particleCount = Math.floor(config.particleCount * intensityMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i + 1000,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
        vx: (Math.random() - 0.5) * 4,
        vy: -(Math.random() * 3 + 2),
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
        scale: Math.random() * 0.5 + 0.5,
        opacity: 1,
        life: 0,
        maxLife: 100 + Math.random() * 50,
      });
    }
    setParticles(newParticles);

    // Exit phase
    const exitTimer = setTimeout(() => {
      setAnimationPhase("exit");
    }, duration - 800);

    // Auto-complete after duration
    const completeTimer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [isVisible, type, duration, intensity, onComplete]);

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
            vy: particle.vy + 0.4, // gravity
            life: particle.life + 1,
          }))
          .filter((particle) => 
            particle.y < window.innerHeight + 100 && 
            particle.life < particle.maxLife
          ),
      );
    };

    const interval = setInterval(animateConfetti, 50);
    return () => clearInterval(interval);
  }, [confetti.length]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            opacity: Math.max(0, 1 - (particle.life / particle.maxLife)),
            scale: particle.scale * (1 - (particle.life / particle.maxLife) * 0.3),
            life: particle.life + 1,
          }))
          .filter((particle) => 
            particle.y > -100 && 
            particle.life < particle.maxLife &&
            particle.opacity > 0.1
          ),
      );
    };

    const interval = setInterval(animateParticles, 60);
    return () => clearInterval(interval);
  }, [particles.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Enhanced Backdrop with Jungle Gradient */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000",
        animationPhase === "enter" && "bg-black/0 backdrop-blur-none",
        animationPhase === "celebrate" && "bg-black/30 backdrop-blur-sm",
        animationPhase === "exit" && "bg-black/0 backdrop-blur-none"
      )} />

      {/* Jungle Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated jungle vines */}
        <div className="absolute top-0 left-1/4 w-2 h-full bg-gradient-to-b from-jungle-DEFAULT/20 to-transparent transform rotate-12 animate-jungle-sway" />
        <div className="absolute top-0 right-1/3 w-2 h-full bg-gradient-to-b from-emerald-500/20 to-transparent transform -rotate-6 animate-jungle-float" />
        
        {/* Floating leaves background */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-jungle-DEFAULT/10 animate-jungle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 20 + 30}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 2 + 3}s`,
            }}
          >
            🌿
          </div>
        ))}
      </div>

      {/* Confetti Layer */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none transition-opacity duration-200"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.size})`,
            fontSize: "28px",
            opacity: Math.max(0, 1 - (particle.life / particle.maxLife)),
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Floating Particles Layer */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `scale(${particle.scale})`,
            opacity: particle.opacity,
            fontSize: "32px",
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Main Celebration Card */}
      {showContent && (
        <div className={cn(
          "relative bg-gradient-to-br from-white via-jungle-light to-emerald-50 rounded-3xl shadow-2xl border-4 mx-4 max-w-md w-full transition-all duration-700 transform",
          config.borderColor,
          animationPhase === "enter" && "scale-50 opacity-0 rotate-12",
          animationPhase === "celebrate" && "scale-100 opacity-100 rotate-0 animate-jungle-celebration",
          animationPhase === "exit" && "scale-110 opacity-0"
        )}>
          {/* Jungle Border Glow Effect */}
          <div className={cn(
            "absolute inset-0 rounded-3xl opacity-50 animate-jungle-glow",
            `bg-gradient-to-r ${config.background}`
          )} />

          {/* Floating Achievement Icons */}
          <div className="absolute -top-6 -left-6 text-4xl animate-jungle-float animation-delay-0">
            {config.emojis[0]}
          </div>
          <div className="absolute -top-4 -right-8 text-3xl animate-jungle-sway animation-delay-200">
            {config.emojis[1]}
          </div>
          <div className="absolute -bottom-6 -left-4 text-3xl animate-jungle-celebration animation-delay-400">
            {config.emojis[2]}
          </div>
          <div className="absolute -bottom-4 -right-6 text-4xl animate-jungle-level-up animation-delay-100">
            {config.emojis[3]}
          </div>

          {/* Corner Sparkles */}
          {intensity !== "low" && (
            <>
              <div className="absolute top-2 left-2 text-sunshine-DEFAULT animate-jungle-sparkle">✨</div>
              <div className="absolute top-2 right-2 text-sunshine-DEFAULT animate-jungle-sparkle animation-delay-300">⭐</div>
              <div className="absolute bottom-2 left-2 text-sunshine-DEFAULT animate-jungle-sparkle animation-delay-600">💫</div>
              <div className="absolute bottom-2 right-2 text-sunshine-DEFAULT animate-jungle-sparkle animation-delay-900">🌟</div>
            </>
          )}

          {/* Content Container */}
          <div className="relative z-10 p-6 md:p-8 text-center">
            {/* Main Title */}
            <h2 className={cn(
              "text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent animate-jungle-glow",
              config.background
            )}>
              {config.title}
            </h2>

            {/* Message */}
            <p className="text-lg md:text-xl text-jungle-dark/80 mb-6 font-medium">
              {config.message}
            </p>

            {/* Rewards Section */}
            {(points > 0 || jungleCoins > 0) && (
              <div className="space-y-3 mb-6">
                {points > 0 && (
                  <div className={cn(
                    "bg-gradient-to-r text-white rounded-2xl py-3 px-6 shadow-lg animate-jungle-float",
                    config.background
                  )}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🎯</span>
                      <span className="text-xl md:text-2xl font-bold">
                        +{points} Points!
                      </span>
                    </div>
                  </div>
                )}
                {jungleCoins > 0 && (
                  <div className="bg-gradient-to-r from-sunshine-DEFAULT to-orange-400 text-white rounded-2xl py-3 px-6 shadow-lg animate-jungle-sway">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">💎</span>
                      <span className="text-xl md:text-2xl font-bold">
                        +{jungleCoins} Jungle Coins!
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Celebration Emojis */}
            <div className="flex justify-center gap-3 md:gap-4 mb-6">
              {config.emojis.slice(0, 5).map((emoji, index) => (
                <span
                  key={index}
                  className="text-3xl md:text-4xl animate-jungle-celebration"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animationDuration: `${1.5 + index * 0.2}s`
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>

            {/* Epic Intensity Extra Effects */}
            {intensity === "epic" && (
              <div className="mb-6">
                <div className="text-4xl animate-pulse mb-2">🎆</div>
                <div className="text-sm font-bold text-sunshine-dark uppercase tracking-wide">
                  EPIC ACHIEVEMENT!
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={onComplete}
              className={cn(
                "bg-gradient-to-r text-white font-bold py-3 px-8 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95",
                config.background,
                intensity === "epic" ? "animate-jungle-level-up" : "animate-jungle-glow"
              )}
            >
              <span className="flex items-center gap-2">
                <span>Continue Jungle Adventure!</span>
                <span className="text-xl">🚀</span>
              </span>
            </button>

            {/* Mobile-Optimized Tap Hint */}
            <div className="mt-4 text-xs text-jungle-DEFAULT/60 md:hidden">
              Tap anywhere to continue
            </div>
          </div>

          {/* Pulsing Ring Effect for Epic Rewards */}
          {intensity === "epic" && (
            <div className={cn(
              "absolute inset-0 rounded-3xl border-4 animate-ping opacity-30",
              config.borderColor
            )} />
          )}
        </div>
      )}

      {/* Mobile Touch Area */}
      <div 
        className="absolute inset-0 md:hidden"
        onClick={onComplete}
        onTouchEnd={onComplete}
      />
    </div>
  );
};

export default EnhancedJungleRewardCelebration;
