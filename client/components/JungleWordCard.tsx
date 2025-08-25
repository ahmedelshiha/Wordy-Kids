import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import {
  Volume2,
  Heart,
  Star,
  Crown,
  Sparkles,
  Share,
  Eye,
  Trophy,
  Gem,
  Zap,
  Target,
  Bookmark,
  Play,
  RotateCcw,
  ThumbsUp,
  Brain,
  MapPin,
  BookOpen
} from "lucide-react";

// Types and interfaces
interface Word {
  id: number;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  funFact?: string;
  emoji?: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  rarity: "common" | "rare" | "epic" | "legendary" | "mythical";
  habitat?: string;
  imageUrl?: string;
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface JungleWordCardProps {
  word: Word;
  isWordMastered?: (wordId: number) => boolean;
  isWordFavorited?: (wordId: number) => boolean;
  onWordInteraction?: (wordId: number, action: string, data?: any) => void;
  accessibilitySettings?: {
    highContrast?: boolean;
    largeText?: boolean;
    reducedMotion?: boolean;
    speechRate?: number;
  };
  showAnimations?: boolean;
  autoPlay?: boolean;
  adventureLevel?: number;
  explorerBadges?: string[];
  isJungleQuest?: boolean;
  size?: "small" | "medium" | "large" | "xl";
  viewMode?: "card" | "carousel" | "list" | "adventure";
  className?: string;
  isMobile?: boolean;
  enableInteractions?: boolean;
}

interface ParticleEffect {
  id: string;
  emoji: string;
  x: number;
  y: number;
  delay: number;
  type: "sparkle" | "celebration" | "mastery" | "favorite" | "discovery";
}

// Rarity configurations
const RARITY_CONFIG = {
  common: {
    color: "from-green-400 to-green-600",
    borderColor: "border-green-300",
    bgGradient: "from-green-50 to-green-100",
    glowColor: "shadow-green-200",
    emoji: "🐛",
    name: "Common Critter",
    sparkleCount: 3,
    celebrationSound: "common-discovery"
  },
  rare: {
    color: "from-blue-400 to-blue-600",
    borderColor: "border-blue-300",
    bgGradient: "from-blue-50 to-blue-100",
    glowColor: "shadow-blue-200",
    emoji: "🦋",
    name: "Rare Beauty",
    sparkleCount: 5,
    celebrationSound: "rare-discovery"
  },
  epic: {
    color: "from-purple-400 to-purple-600",
    borderColor: "border-purple-300",
    bgGradient: "from-purple-50 to-purple-100",
    glowColor: "shadow-purple-200",
    emoji: "🦜",
    name: "Epic Explorer",
    sparkleCount: 8,
    celebrationSound: "epic-discovery"
  },
  legendary: {
    color: "from-yellow-400 to-orange-500",
    borderColor: "border-yellow-300",
    bgGradient: "from-yellow-50 to-orange-100",
    glowColor: "shadow-yellow-200",
    emoji: "🦁",
    name: "Legendary King",
    sparkleCount: 12,
    celebrationSound: "legendary-discovery"
  },
  mythical: {
    color: "from-pink-400 to-purple-500",
    borderColor: "border-pink-300",
    bgGradient: "from-pink-50 to-purple-100",
    glowColor: "shadow-pink-200",
    emoji: "🐉",
    name: "Mythical Wonder",
    sparkleCount: 15,
    celebrationSound: "mythical-discovery"
  }
};

// Difficulty configurations
const DIFFICULTY_CONFIG = {
  easy: {
    stars: 1,
    color: "text-green-500",
    label: "Easy Peasy",
    emoji: "🌱"
  },
  medium: {
    stars: 2,
    color: "text-yellow-500",
    label: "Getting Tricky",
    emoji: "🌿"
  },
  hard: {
    stars: 3,
    color: "text-red-500",
    label: "Challenge Mode",
    emoji: "🌳"
  }
};

export const JungleWordCard: React.FC<JungleWordCardProps> = ({
  word,
  isWordMastered,
  isWordFavorited,
  onWordInteraction,
  accessibilitySettings = {},
  showAnimations = true,
  autoPlay = false,
  adventureLevel = 1,
  explorerBadges = [],
  isJungleQuest = false,
  size = "medium",
  viewMode = "card",
  className = "",
  isMobile = false,
  enableInteractions = true
}) => {
  // State management
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinition, setShowDefinition] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [showFunFact, setShowFunFact] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("");
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [isInteracting, setIsInteracting] = useState(false);
  const [discoveryState, setDiscoveryState] = useState("hidden"); // hidden, discovering, discovered
  const [masteryProgress, setMasteryProgress] = useState(0);

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout>();
  const particleTimeoutRef = useRef<NodeJS.Timeout>();

  // Computed values
  const isMastered = isWordMastered?.(word.id) || false;
  const isFavorited = isWordFavorited?.(word.id) || false;
  const rarityConfig = RARITY_CONFIG[word.rarity] || RARITY_CONFIG.common;
  const difficultyConfig = DIFFICULTY_CONFIG[word.difficulty] || DIFFICULTY_CONFIG.easy;

  // Size configurations
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          container: "max-w-sm",
          emoji: "text-4xl",
          title: "text-2xl",
          content: "text-sm",
          button: "text-xs px-2 py-1"
        };
      case "large":
        return {
          container: "max-w-2xl",
          emoji: "text-8xl",
          title: "text-5xl",
          content: "text-xl",
          button: "text-lg px-6 py-3"
        };
      case "xl":
        return {
          container: "max-w-4xl",
          emoji: "text-9xl",
          title: "text-6xl",
          content: "text-2xl",
          button: "text-xl px-8 py-4"
        };
      default: // medium
        return {
          container: "max-w-lg",
          emoji: "text-6xl",
          title: "text-3xl",
          content: "text-base",
          button: "text-sm px-4 py-2"
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Auto-play pronunciation when card appears
  useEffect(() => {
    if (autoPlay && !accessibilitySettings.reducedMotion && discoveryState === "discovered") {
      const timer = setTimeout(() => {
        handlePronounce();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [word.id, autoPlay, discoveryState]);

  // Discovery animation on mount
  useEffect(() => {
    if (showAnimations && !accessibilitySettings.reducedMotion) {
      setDiscoveryState("discovering");
      setTimeout(() => {
        setDiscoveryState("discovered");
        createParticles("discovery");
      }, 600);
    } else {
      setDiscoveryState("discovered");
    }
  }, [showAnimations, accessibilitySettings.reducedMotion]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (particleTimeoutRef.current) {
        clearTimeout(particleTimeoutRef.current);
      }
    };
  }, []);

  // Create particle effects
  const createParticles = useCallback((type: ParticleEffect["type"], options?: { count?: number; emoji?: string }) => {
    if (!showAnimations || accessibilitySettings.reducedMotion) return;

    const count = options?.count || rarityConfig.sparkleCount;
    const particleEmojis = {
      sparkle: ["✨", "⭐", "🌟"],
      celebration: ["🎉", "🎊", "✨", "⭐", "🌟", "💫"],
      mastery: ["👑", "🏆", "💎", "⚡", "🔥"],
      favorite: ["❤️", "💖", "💕", "🥰"],
      discovery: [rarityConfig.emoji, "✨", "🌟", "💫"]
    };

    const emojis = particleEmojis[type] || particleEmojis.sparkle;
    const newParticles: ParticleEffect[] = [];

    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `${type}-${Date.now()}-${i}`,
        emoji: options?.emoji || emojis[Math.floor(Math.random() * emojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
        type
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Clear particles after animation
    if (particleTimeoutRef.current) {
      clearTimeout(particleTimeoutRef.current);
    }
    particleTimeoutRef.current = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 3000);
  }, [showAnimations, accessibilitySettings.reducedMotion, rarityConfig]);

  // Handle word pronunciation
  const handlePronounce = useCallback(() => {
    if (!enableInteractions) return;

    setIsInteracting(true);
    onWordInteraction?.(word.id, "pronounce", {
      word: word.word,
      pronunciation: word.pronunciation,
      speechRate: accessibilitySettings.speechRate || 1
    });

    // Visual feedback
    if (showAnimations && !accessibilitySettings.reducedMotion) {
      setCurrentAnimation("bounce");
      createParticles("sparkle", { count: 4 });
      
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = setTimeout(() => {
        setCurrentAnimation("");
        setIsInteracting(false);
      }, 1000);
    } else {
      setTimeout(() => setIsInteracting(false), 500);
    }
  }, [word, enableInteractions, onWordInteraction, accessibilitySettings, showAnimations, createParticles]);

  // Handle card tap/click
  const handleCardClick = useCallback(() => {
    if (!enableInteractions) return;

    // Primary action is pronunciation for preschoolers
    handlePronounce();

    // Card flip animation for engagement
    if (showAnimations && !accessibilitySettings.reducedMotion) {
      setIsFlipped(true);
      setTimeout(() => setIsFlipped(false), 800);
    }

    // Cycle through content display
    if (showDefinition && word.example && !showExample) {
      setShowExample(true);
    } else if (showExample && word.funFact && !showFunFact) {
      setShowFunFact(true);
      setShowExample(false);
    } else if (showFunFact) {
      setShowFunFact(false);
      setShowExample(false);
    }
  }, [enableInteractions, handlePronounce, showAnimations, accessibilitySettings, showDefinition, showExample, showFunFact, word]);

  // Handle mastery action
  const handleMastery = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!enableInteractions) return;

    onWordInteraction?.(word.id, "master", {
      difficulty: word.difficulty,
      rarity: word.rarity,
      category: word.category
    });

    if (!isMastered) {
      createParticles("mastery");
      setCurrentAnimation("celebrate");
      
      // Simulate mastery progress animation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 20;
        setMasteryProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setMasteryProgress(0), 2000);
        }
      }, 100);
    }
  }, [word, enableInteractions, onWordInteraction, isMastered, createParticles]);

  // Handle favorite toggle
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!enableInteractions) return;

    onWordInteraction?.(word.id, "favorite");
    
    if (!isFavorited) {
      createParticles("favorite", { count: 6 });
    }
  }, [word.id, enableInteractions, onWordInteraction, isFavorited, createParticles]);

  // Handle share action
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!enableInteractions) return;

    onWordInteraction?.(word.id, "share", {
      word: word.word,
      definition: word.definition,
      example: word.example,
      funFact: word.funFact
    });
  }, [word, enableInteractions, onWordInteraction]);

  // Handle replay action
  const handleReplay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!enableInteractions) return;

    // Show all content sequentially
    setShowDefinition(true);
    setTimeout(() => {
      if (word.example) {
        setShowExample(true);
        setTimeout(() => {
          if (word.funFact) {
            setShowFunFact(true);
          }
        }, 2000);
      }
    }, 1000);

    handlePronounce();
  }, [enableInteractions, word, handlePronounce]);

  // Render difficulty stars
  const renderDifficultyStars = () => {
    return Array.from({ length: difficultyConfig.stars }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${difficultyConfig.color} fill-current`}
      />
    ));
  };

  // Render habitat badge
  const renderHabitatBadge = () => {
    if (!word.habitat) return null;

    return (
      <Badge
        variant="outline"
        className={`text-xs font-medium ${rarityConfig.borderColor} ${
          accessibilitySettings.largeText ? "text-sm px-3 py-1" : "px-2 py-1"
        }`}
      >
        <MapPin className="w-3 h-3 mr-1" />
        {word.habitat}
      </Badge>
    );
  };

  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {/* Pronounce button - Primary action */}
        <Button
          onClick={handlePronounce}
          disabled={isInteracting}
          className={`${sizeClasses.button} bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg transform hover:scale-105 transition-all duration-200`}
          aria-label={`Pronounce ${word.word}`}
        >
          <Volume2 className="w-4 h-4 mr-2" />
          {isInteracting ? "Playing..." : "Say It!"}
        </Button>

        {/* Favorite button */}
        <Button
          onClick={handleFavorite}
          variant={isFavorited ? "default" : "outline"}
          className={`${sizeClasses.button} shadow-lg transform hover:scale-105 transition-all duration-200 ${
            isFavorited
              ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
              : "hover:bg-red-50 hover:text-red-600 border-red-200"
          }`}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
          {isFavorited ? "Loved!" : "Love It"}
        </Button>

        {/* Master button */}
        <Button
          onClick={handleMastery}
          variant={isMastered ? "default" : "outline"}
          className={`${sizeClasses.button} shadow-lg transform hover:scale-105 transition-all duration-200 ${
            isMastered
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
          }`}
          aria-label={isMastered ? "Word mastered" : "Master this word"}
        >
          <Crown className="w-4 h-4 mr-2" />
          {isMastered ? "Mastered!" : "Master It"}
        </Button>

        {/* Additional actions for larger sizes */}
        {size !== "small" && (
          <>
            <Button
              onClick={handleReplay}
              variant="outline"
              className={`${sizeClasses.button} border-purple-200 text-purple-700 hover:bg-purple-50 shadow-lg transform hover:scale-105 transition-all duration-200`}
              aria-label="Replay word introduction"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Replay
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              className={`${sizeClasses.button} border-green-200 text-green-700 hover:bg-green-50 shadow-lg transform hover:scale-105 transition-all duration-200`}
              aria-label={`Share ${word.word}`}
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative ${sizeClasses.container} ${className}`}
      role="article"
      aria-label={`Word card for ${word.word}`}
    >
      {/* Floating Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`absolute text-2xl pointer-events-none z-20 ${
            accessibilitySettings.reducedMotion ? "" : "animate-ping"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: particle.type === "celebration" ? "1.5s" : "2s"
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Mastery Progress Overlay */}
      {masteryProgress > 0 && (
        <div className="absolute inset-0 z-30 bg-black/20 rounded-xl flex items-center justify-center">
          <div className="bg-white/90 rounded-lg p-4 text-center">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-800">Mastering Word...</p>
            <Progress value={masteryProgress} className="w-24 h-2 mt-2" />
          </div>
        </div>
      )}

      <Card
        ref={cardRef}
        onClick={handleCardClick}
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-500 group
          ${rarityConfig.glowColor} shadow-lg hover:shadow-xl
          ${currentAnimation === "bounce" && !accessibilitySettings.reducedMotion ? "animate-bounce" : ""}
          ${currentAnimation === "celebrate" && !accessibilitySettings.reducedMotion ? "animate-pulse" : ""}
          ${isFlipped && !accessibilitySettings.reducedMotion ? "scale-105 rotate-1" : "scale-100 rotate-0"}
          ${discoveryState === "discovering" && !accessibilitySettings.reducedMotion ? "opacity-0 scale-90" : "opacity-100 scale-100"}
          ${accessibilitySettings.highContrast ? "bg-black text-white border-white" : "bg-white"}
          ${rarityConfig.borderColor} border-2
          ${accessibilitySettings.reducedMotion ? "" : "transform hover:scale-105"}
          ${enableInteractions ? "hover:shadow-2xl" : ""}
        `}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {/* Card Header with Rarity and Difficulty */}
        <div className={`p-4 border-b ${
          accessibilitySettings.highContrast ? "border-white" : "border-gray-200"
        } bg-gradient-to-r ${rarityConfig.bgGradient}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {renderHabitatBadge()}
              <Badge
                variant="secondary"
                className={`text-xs font-bold ${
                  accessibilitySettings.largeText ? "text-sm px-3 py-1" : "px-2 py-1"
                }`}
              >
                <span className="mr-1">{difficultyConfig.emoji}</span>
                {difficultyConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {renderDifficultyStars()}
              <Badge
                variant="secondary"
                className={`text-xs font-bold capitalize bg-gradient-to-r ${rarityConfig.color} text-white ${
                  accessibilitySettings.largeText ? "text-sm px-3 py-1" : "px-2 py-1"
                }`}
              >
                <span className="mr-1">{rarityConfig.emoji}</span>
                {rarityConfig.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Card Content */}
        <CardContent className="p-6 text-center space-y-4">
          {/* Emoji Display */}
          <div
            className={`${sizeClasses.emoji} mb-4 transition-transform duration-300 ${
              accessibilitySettings.reducedMotion ? "" : "group-hover:scale-110"
            } drop-shadow-2xl filter ${
              word.rarity === "mythical" ? "hue-rotate-15" : ""
            }`}
            role="img"
            aria-label={`${word.word} emoji`}
          >
            {word.emoji}
          </div>

          {/* Word Display */}
          <h2
            className={`font-bold mb-3 drop-shadow-lg tracking-wide ${sizeClasses.title} ${
              accessibilitySettings.highContrast ? "text-white" : "text-gray-800"
            }`}
            role="heading"
            aria-level={2}
          >
            {word.word}
          </h2>

          {/* Definition */}
          {showDefinition && (
            <div
              className={`mb-4 bg-white/80 rounded-xl p-3 backdrop-blur-sm border ${
                accessibilitySettings.highContrast ? "bg-gray-800 text-white border-white" : "border-gray-200"
              } ${accessibilitySettings.reducedMotion ? "" : "animate-fade-in"}`}
            >
              <h3 className="text-sm font-semibold text-gray-600 mb-1 flex items-center justify-center gap-1">
                <BookOpen className="w-4 h-4" />
                Definition
              </h3>
              <p className={`${sizeClasses.content} ${
                accessibilitySettings.highContrast ? "text-white" : "text-gray-700"
              }`}>
                {word.definition}
              </p>
            </div>
          )}

          {/* Example */}
          {showExample && word.example && (
            <div
              className={`mb-4 bg-blue-50 rounded-xl p-3 border border-blue-200 ${
                accessibilitySettings.highContrast ? "bg-gray-700 text-white border-white" : ""
              } ${accessibilitySettings.reducedMotion ? "" : "animate-fade-in"}`}
            >
              <h3 className="text-sm font-semibold text-blue-600 mb-1 flex items-center justify-center gap-1">
                <Target className="w-4 h-4" />
                Example
              </h3>
              <p className={`italic ${sizeClasses.content} ${
                accessibilitySettings.highContrast ? "text-gray-300" : "text-blue-700"
              }`}>
                "{word.example}"
              </p>
            </div>
          )}

          {/* Fun Fact */}
          {showFunFact && word.funFact && (
            <div
              className={`mb-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 border border-yellow-200 ${
                accessibilitySettings.highContrast ? "bg-gray-600 text-white border-white" : ""
              } ${accessibilitySettings.reducedMotion ? "" : "animate-fade-in"}`}
            >
              <h3 className={`font-bold mb-1 flex items-center justify-center gap-2 ${sizeClasses.content}`}>
                <span className="text-xl">🤓</span>
                Fun Fact!
              </h3>
              <p className={`${sizeClasses.content} ${
                accessibilitySettings.highContrast ? "text-gray-200" : "text-gray-700"
              }`}>
                {word.funFact}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {enableInteractions && renderActionButtons()}

          {/* Adventure Level Badge (if applicable) */}
          {isJungleQuest && adventureLevel > 0 && (
            <div className="mt-4 flex justify-center">
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1">
                <Zap className="w-3 h-3 mr-1" />
                Adventure Level {adventureLevel}
              </Badge>
            </div>
          )}
        </CardContent>

        {/* Status Badges */}
        {isMastered && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Trophy className="w-3 h-3" />
            MASTERED
          </div>
        )}

        {isFavorited && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <Heart className="w-3 h-3 fill-current" />
            FAVORITE
          </div>
        )}

        {/* Rarity glow effect */}
        {word.rarity === "mythical" && !accessibilitySettings.reducedMotion && (
          <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 animate-pulse pointer-events-none rounded-xl" />
        )}
        {word.rarity === "legendary" && !accessibilitySettings.reducedMotion && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse pointer-events-none rounded-xl" />
        )}
      </Card>
    </div>
  );
};

export default JungleWordCard;
