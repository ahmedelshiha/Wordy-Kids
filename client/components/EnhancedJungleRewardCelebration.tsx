import React, { useEffect, useState, useRef } from "react";
import { audioService } from "@/lib/audioService";

interface JungleRewardCelebrationProps {
  isVisible: boolean;
  type?:
    | "word_learned"
    | "quiz_complete"
    | "achievement"
    | "level_up"
    | "perfect_score"
    | "region_unlock"
    | "animal_friend"
    | "jungle_master"
    | "exploration_complete";
  title?: string;
  message?: string;
  points?: number;
  onComplete?: () => void;
  duration?: number;
  achievement?: {
    id: string;
    name: string;
    description: string;
    icon: string;
    difficulty: string;
    rarity: string;
    region?: string;
    reward?: {
      type: string;
      item: string;
      preview?: string;
    };
    storyline?: {
      unlockText: string;
      celebrationText: string;
      nextHint?: string;
    };
  };
  region?: {
    id: string;
    name: string;
    icon: string;
    description: string;
    animals: string[];
  };
  animalFriend?: {
    name: string;
    emoji: string;
    description: string;
    abilities: string[];
  };
}

interface JungleParticle {
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
  opacity: number;
  life: number;
  maxLife: number;
  type: "leaf" | "sparkle" | "animal" | "flower" | "butterfly";
}

interface FloatingElement {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  delay: number;
  duration: number;
}

export const EnhancedJungleRewardCelebration: React.FC<
  JungleRewardCelebrationProps
> = ({
  isVisible,
  type = "achievement",
  title,
  message,
  points = 0,
  onComplete,
  duration = 4000,
  achievement,
  region,
  animalFriend,
}) => {
  const [particles, setParticles] = useState<JungleParticle[]>([]);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>(
    [],
  );
  const [showContent, setShowContent] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<
    "entrance" | "celebration" | "story" | "exit"
  >("entrance");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const celebrationConfig = {
    word_learned: {
      title: title || "🌟 Word Discovered!",
      message: message || "Amazing! You found a new jungle word!",
      emojis: ["🌿", "🍃", "✨", "🌟", "🦋"],
      colors: ["#10b981", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"],
      particleCount: 30,
      bgGradient: "from-emerald-400 to-green-500",
      soundEffect: "leaf_rustle",
    },
    quiz_complete: {
      title: title || "🧠 Quiz Master!",
      message: message || "Brilliant! You've completed the jungle quiz!",
      emojis: ["🦁", "🐯", "🦊", "🐺", "🦅"],
      colors: ["#f59e0b", "#f97316", "#ea580c", "#dc2626", "#b91c1c"],
      particleCount: 40,
      bgGradient: "from-orange-400 to-red-500",
      soundEffect: "animal_roar",
    },
    achievement: {
      title:
        title ||
        achievement?.storyline?.unlockText ||
        "🏆 Achievement Unlocked!",
      message:
        message ||
        achievement?.storyline?.celebrationText ||
        achievement?.name ||
        "You earned a jungle achievement!",
      emojis: ["🏆", "👑", "⭐", "💎", "🎉"],
      colors: ["#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"],
      particleCount: 60,
      bgGradient: "from-purple-500 to-pink-600",
      soundEffect: "achievement_fanfare",
    },
    level_up: {
      title: title || "🚀 Level Up!",
      message: message || "Incredible! You've grown stronger in the jungle!",
      emojis: ["🚀", "⚡", "🌈", "💫", "🔥"],
      colors: ["#06b6d4", "#0891b2", "#0e7490", "#155e75", "#164e63"],
      particleCount: 50,
      bgGradient: "from-cyan-400 to-blue-600",
      soundEffect: "level_up_chime",
    },
    perfect_score: {
      title: title || "✨ Perfect Score!",
      message: message || "Flawless! You're a true jungle champion!",
      emojis: ["✨", "🌟", "💫", "🎯", "🔮"],
      colors: ["#eab308", "#f59e0b", "#f97316", "#ea580c", "#dc2626"],
      particleCount: 80,
      bgGradient: "from-yellow-400 to-orange-600",
      soundEffect: "perfect_chime",
    },
    region_unlock: {
      title: title || `🗺️ ${region?.name} Unlocked!`,
      message: message || `Welcome to the amazing ${region?.name}!`,
      emojis: region?.animals || ["🌍", "🗺️", "🧭", "⛰️", "🏞️"],
      colors: ["#059669", "#0d9488", "#0f766e", "#115e59", "#134e4a"],
      particleCount: 70,
      bgGradient: "from-teal-500 to-emerald-600",
      soundEffect: "region_unlock",
    },
    animal_friend: {
      title: title || `🐾 New Friend: ${animalFriend?.name}!`,
      message: message || `${animalFriend?.description}`,
      emojis: [animalFriend?.emoji || "🐾", "❤️", "🌟", "🎉", "🦋"],
      colors: ["#ec4899", "#db2777", "#be185d", "#9d174d", "#831843"],
      particleCount: 45,
      bgGradient: "from-pink-500 to-rose-600",
      soundEffect: "animal_greeting",
    },
    jungle_master: {
      title: title || "👑 Jungle Master!",
      message: message || "You have become the ultimate jungle master!",
      emojis: ["👑", "🌟", "✨", "💎", "🏆"],
      colors: ["#7c3aed", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"],
      particleCount: 100,
      bgGradient: "from-violet-600 to-purple-700",
      soundEffect: "master_achievement",
    },
    exploration_complete: {
      title: title || "🧭 Region Explored!",
      message: message || "You've fully explored this jungle region!",
      emojis: ["🧭", "🗺️", "🌿", "🦋", "✨"],
      colors: ["#059669", "#10b981", "#22c55e", "#4ade80", "#86efac"],
      particleCount: 55,
      bgGradient: "from-emerald-500 to-green-600",
      soundEffect: "exploration_complete",
    },
  };

  const config = celebrationConfig[type];

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      setFloatingElements([]);
      setShowContent(false);
      setCurrentPhase("entrance");
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    // Play appropriate sound effect
    try {
      audioService.playCheerSound();
    } catch (error) {
      console.log("Audio not available, continuing with visual celebration");
    }

    // Phase timing
    const phaseTimer1 = setTimeout(() => setShowContent(true), 300);
    const phaseTimer2 = setTimeout(() => setCurrentPhase("celebration"), 800);
    const phaseTimer3 = setTimeout(() => setCurrentPhase("story"), 2500);
    const phaseTimer4 = setTimeout(
      () => setCurrentPhase("exit"),
      duration - 1000,
    );

    // Generate initial particles
    generateParticles();

    // Generate floating elements
    generateFloatingElements();

    // Auto-complete after duration
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(phaseTimer3);
      clearTimeout(phaseTimer4);
      clearTimeout(timer);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, type, duration, onComplete]);

  const generateParticles = () => {
    const newParticles: JungleParticle[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < config.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / config.particleCount;
      const radius = 50 + Math.random() * 100;
      const speed = 3 + Math.random() * 4;

      newParticles.push({
        id: i,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2 - 2, // Slight upward bias
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: 0.8 + Math.random() * 0.4,
        opacity: 1,
        life: 0,
        maxLife: 180 + Math.random() * 120,
        type: ["leaf", "sparkle", "animal", "flower", "butterfly"][
          Math.floor(Math.random() * 5)
        ] as any,
      });
    }

    setParticles(newParticles);
  };

  const generateFloatingElements = () => {
    const elements: FloatingElement[] = [];
    const specialEmojis = [
      ...config.emojis,
      ...(achievement?.icon ? [achievement.icon] : []),
      ...(region?.icon ? [region.icon] : []),
      ...(animalFriend?.emoji ? [animalFriend.emoji] : []),
    ];

    for (let i = 0; i < 8; i++) {
      elements.push({
        id: i,
        emoji: specialEmojis[Math.floor(Math.random() * specialEmojis.length)],
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 100,
        scale: 0.8 + Math.random() * 0.6,
        delay: i * 200,
        duration: 3000 + Math.random() * 2000,
      });
    }

    setFloatingElements(elements);
  };

  // Particle animation loop
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            rotation: particle.rotation + particle.rotationSpeed,
            vy: particle.vy + 0.2, // gravity
            vx: particle.vx * 0.99, // air resistance
            life: particle.life + 1,
            opacity: Math.max(0, 1 - particle.life / particle.maxLife),
          }))
          .filter(
            (particle) =>
              particle.life < particle.maxLife &&
              particle.y < window.innerHeight + 100 &&
              particle.opacity > 0.1,
          ),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-95 animate-pulse`}
      />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* Floating Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute text-6xl pointer-events-none opacity-80"
          style={{
            left: element.x,
            bottom: -100,
            transform: `scale(${element.scale})`,
            animation: `floatUp ${element.duration}ms ease-out ${element.delay}ms forwards`,
          }}
        >
          {element.emoji}
        </div>
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg) scale(${particle.size})`,
            opacity: particle.opacity,
            fontSize: "2rem",
            color: particle.color,
            textShadow: "0 0 10px currentColor",
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Main Celebration Card */}
      {showContent && (
        <div
          className={`relative transform transition-all duration-1000 ${
            currentPhase === "entrance"
              ? "scale-50 opacity-0"
              : currentPhase === "exit"
                ? "scale-110 opacity-50"
                : "scale-100 opacity-100"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-4 border-white/50 p-8 mx-4 max-w-lg relative overflow-hidden">
            {/* Magical border animation */}
            <div className="absolute inset-0 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>

            {/* Floating corner decorations */}
            <div className="absolute -top-6 -left-6 text-4xl animate-bounce">
              ✨
            </div>
            <div className="absolute -top-4 -right-8 text-3xl animate-pulse animation-delay-300">
              🌟
            </div>
            <div
              className="absolute -bottom-6 -left-4 text-3xl animate-spin animation-delay-600"
              style={{ animationDuration: "3s" }}
            >
              💫
            </div>
            <div className="absolute -bottom-4 -right-6 text-4xl animate-bounce animation-delay-900">
              ⭐
            </div>

            {/* Content */}
            <div className="relative text-center space-y-6">
              {/* Achievement Icon */}
              {(achievement?.icon || region?.icon || animalFriend?.emoji) && (
                <div className="text-8xl animate-bounce mb-4">
                  {achievement?.icon || region?.icon || animalFriend?.emoji}
                </div>
              )}

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-pulse">
                {config.title}
              </h2>

              {/* Message */}
              <p className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                {config.message}
              </p>

              {/* Points Display */}
              {points > 0 && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl py-4 px-6 mb-6 shadow-xl">
                  <span className="text-2xl md:text-3xl font-bold animate-bounce">
                    +{points} Adventure Points! 🎯
                  </span>
                </div>
              )}

              {/* Achievement Details */}
              {achievement && currentPhase === "story" && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-6 text-left animate-slideIn">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">
                    🏆 Achievement Details
                  </h3>
                  <p className="text-purple-700 mb-3">
                    {achievement.description}
                  </p>

                  {achievement.reward && (
                    <div className="bg-white/70 rounded-lg p-3 mb-3">
                      <span className="font-semibold text-purple-800">
                        🎁 Reward:{" "}
                      </span>
                      <span className="text-purple-700">
                        {achievement.reward.item}
                      </span>
                      {achievement.reward.preview && (
                        <p className="text-sm text-purple-600 mt-1">
                          {achievement.reward.preview}
                        </p>
                      )}
                    </div>
                  )}

                  {achievement.storyline?.nextHint && (
                    <div className="bg-yellow-100 rounded-lg p-3">
                      <span className="font-semibold text-yellow-800">
                        💡 Next Adventure:{" "}
                      </span>
                      <span className="text-yellow-700">
                        {achievement.storyline.nextHint}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Region Details */}
              {region && currentPhase === "story" && (
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-6 mb-6 text-left animate-slideIn">
                  <h3 className="font-bold text-lg text-green-800 mb-2">
                    🗺️ New Region Unlocked
                  </h3>
                  <p className="text-green-700 mb-3">{region.description}</p>

                  <div className="bg-white/70 rounded-lg p-3">
                    <span className="font-semibold text-green-800">
                      🐾 Meet the locals:{" "}
                    </span>
                    <div className="flex gap-2 mt-2">
                      {region.animals.map((animal, index) => (
                        <span
                          key={index}
                          className="text-2xl animate-bounce"
                          style={{ animationDelay: `${index * 200}ms` }}
                        >
                          {animal}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Animal Friend Details */}
              {animalFriend && currentPhase === "story" && (
                <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 mb-6 text-left animate-slideIn">
                  <h3 className="font-bold text-lg text-pink-800 mb-2">
                    🐾 New Animal Friend
                  </h3>
                  <p className="text-pink-700 mb-3">
                    {animalFriend.description}
                  </p>

                  {animalFriend.abilities &&
                    animalFriend.abilities.length > 0 && (
                      <div className="bg-white/70 rounded-lg p-3">
                        <span className="font-semibold text-pink-800">
                          ✨ Special Abilities:{" "}
                        </span>
                        <ul className="list-disc list-inside text-pink-700 mt-1">
                          {animalFriend.abilities.map((ability, index) => (
                            <li key={index} className="text-sm">
                              {ability}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              )}

              {/* Celebration emoji row */}
              <div className="flex justify-center gap-4 mb-6">
                {config.emojis.slice(0, 5).map((emoji, index) => (
                  <span
                    key={index}
                    className="text-3xl md:text-4xl animate-bounce"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>

              {/* Continue button */}
              <button
                onClick={onComplete}
                className={`bg-gradient-to-r ${config.bgGradient} text-white font-bold py-4 px-8 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 active:scale-95 animate-pulse`}
              >
                {currentPhase === "story"
                  ? "Continue Adventure! 🚀"
                  : "Amazing! 🌟"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) scale(var(--scale)) rotate(0deg);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(var(--scale)) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(300%);
          }
        }

        @keyframes slideIn {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.6s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-900 {
          animation-delay: 900ms;
        }
      `}</style>
    </div>
  );
};

export default EnhancedJungleRewardCelebration;
