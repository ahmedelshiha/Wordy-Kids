import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Volume2,
  Heart,
  RotateCcw,
  Sparkles,
  Star,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Sword,
  Shield,
  AlertTriangle,
  Flame,
  Target,
  Zap,
  Crown,
} from "lucide-react";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import { adventureService } from "@/lib/adventureService";
import { WordAdventureStatus } from "@shared/adventure";

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
  imageUrl?: string;
  masteryLevel?: number;
  lastReviewed?: Date;
  nextReview?: Date;
}

interface WordCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
}

export const WordCard: React.FC<WordCardProps> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
}) => {
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [adventureStatus, setAdventureStatus] =
    useState<WordAdventureStatus | null>(null);

  // Initialize adventure status for this word
  React.useEffect(() => {
    let status = adventureService.getWordAdventureStatus(word.id.toString());
    if (!status) {
      status = adventureService.initializeWordAdventure(word.id.toString());
    }
    setAdventureStatus(status);
  }, [word.id]);

  const handlePronounce = async () => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Use real speech synthesis for pronunciation
    audioService.pronounceWord(word.word, {
      onStart: () => {
        console.log("Started pronunciation");
      },
      onEnd: () => {
        setIsPlaying(false);
        setShowSparkles(false);
        onPronounce?.(word);
      },
      onError: () => {
        setIsPlaying(false);
        setShowSparkles(false);
        // Fallback to sound effect
        playSoundIfEnabled.pronunciation();
      },
    });

    // Safety timeout in case speech synthesis doesn't fire events
    setTimeout(() => {
      setIsPlaying(false);
      setShowSparkles(false);
    }, 3000);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      audioService.playCheerSound();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);
    } else {
      playSoundIfEnabled.click();
    }
    onFavorite?.(word);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-educational-green text-white";
      case "medium":
        return "bg-educational-orange text-white";
      case "hard":
        return "bg-educational-pink text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      animals: "bg-educational-blue",
      food: "bg-educational-orange",
      nature: "bg-educational-green",
      general: "bg-educational-purple",
      science: "bg-educational-pink",
      sports: "bg-educational-yellow",
    };
    return colors[category as keyof typeof colors] || "bg-educational-blue";
  };

  return (
    <div className={`relative w-full max-w-xs mx-auto ${className}`}>
      <Card
        className={`h-[320px] md:h-[360px] cursor-pointer transition-all duration-700 transform-gpu md:hover:scale-105 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        } ${
          adventureStatus && adventureStatus.health < 30
            ? "ring-2 ring-red-400/50 shadow-red-400/20 shadow-xl animate-pulse"
            : adventureStatus && adventureStatus.health < 50
              ? "ring-2 ring-orange-400/50 shadow-orange-400/20 shadow-lg"
              : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
        onClick={() => {
          setIsFlipped(!isFlipped);
          audioService.playWhooshSound();
        }}
      >
        {/* Front of card */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-2 md:p-3 flex flex-col text-white`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col gap-1 md:flex-row md:gap-2">
            <Badge
              className={`${getDifficultyColor(word.difficulty)} text-xs md:text-sm`}
            >
              {word.difficulty === "easy"
                ? "🌟 Easy"
                : word.difficulty === "medium"
                  ? "⭐ Medium"
                  : "🔥 Hard"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-white/20 border-white/30 text-white text-xs md:text-sm"
            >
              {word.category}
            </Badge>

            {/* Adventure Health Status */}
            {adventureStatus && (
              <Badge
                variant="outline"
                className={`text-xs md:text-sm flex items-center gap-1 ${
                  adventureStatus.health >= 80
                    ? "bg-green-500/20 border-green-400/50 text-green-200"
                    : adventureStatus.health >= 50
                      ? "bg-yellow-500/20 border-yellow-400/50 text-yellow-200"
                      : adventureStatus.health >= 30
                        ? "bg-orange-500/20 border-orange-400/50 text-orange-200"
                        : "bg-red-500/20 border-red-400/50 text-red-200 animate-pulse"
                }`}
              >
                {adventureStatus.health >= 80 ? (
                  <>
                    <Crown className="w-3 h-3" />
                    <span className="hidden md:inline">Strong</span>
                  </>
                ) : adventureStatus.health >= 50 ? (
                  <>
                    <Shield className="w-3 h-3" />
                    <span className="hidden md:inline">Good</span>
                  </>
                ) : adventureStatus.health >= 30 ? (
                  <>
                    <Target className="w-3 h-3" />
                    <span className="hidden md:inline">Weak</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3 h-3" />
                    <span className="hidden md:inline">Critical</span>
                  </>
                )}
                <span>{adventureStatus.health}%</span>
              </Badge>
            )}
          </div>

          <div className="absolute top-2 right-2 md:top-3 md:right-3">
            <Button
              size="sm"
              variant="ghost"
              className={`text-white hover:bg-white/20 p-1.5 md:p-2 h-auto transition-all duration-300 ${
                isFavorited ? "scale-110 text-red-300" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
            >
              <Heart
                className={`w-3 h-3 md:w-4 md:h-4 transition-all duration-300 ${
                  isFavorited ? "fill-current animate-pulse" : ""
                }`}
              />
              {showSparkles && isFavorited && (
                <Star className="w-2 h-2 md:w-3 md:h-3 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
              )}
            </Button>
          </div>

          {/* Reduced spacing for mobile */}
          <div className="mt-6 md:mt-8"></div>

          {word.imageUrl ? (
            <div className="relative mx-auto mt-2 mb-3">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/30 flex items-center justify-center overflow-hidden">
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto mt-2 mb-3">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-2xl ring-4 ring-white/30 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1 left-1 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/15 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/2 right-1 w-2 h-2 bg-white/25 rounded-full animate-ping delay-700"></div>

                {/* Main emoji */}
                <span className="text-3xl md:text-4xl relative z-10 drop-shadow-lg animate-gentle-float">
                  {word.emoji || "📚"}
                </span>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-1">
            <h2 className="text-lg md:text-xl font-bold tracking-wide drop-shadow-md">
              {word.word}
            </h2>

            {word.pronunciation && (
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base opacity-90 font-medium">
                  {word.pronunciation}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePronounce();
                  }}
                  disabled={isPlaying}
                  className={`text-white hover:bg-white/20 p-2 h-auto transition-all duration-300 ${
                    isPlaying ? "scale-110 bg-white/30" : ""
                  }`}
                >
                  <Volume2
                    className={`w-4 h-4 lg:w-5 lg:h-5 ${isPlaying ? "animate-pulse text-yellow-300" : ""}`}
                  />
                  {showSparkles && (
                    <Sparkles className="w-3 h-3 lg:w-4 lg:h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="text-center">
            {/* Adventure Last Practice Info */}
            {adventureStatus && (
              <p className="text-xs opacity-60 mb-1">
                Last seen:{" "}
                {new Date(adventureStatus.last_seen).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs md:text-sm opacity-75 mb-2">
              <RotateCcw className="w-3 h-3 md:w-4 md:h-4 inline mr-1" />
              Tap to see definition
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>

        {/* Back of card */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 md:p-6 flex flex-col justify-center text-white"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="absolute top-4 right-4">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-center">
            {word.word} {word.emoji}
          </h3>

          <div className="space-y-3 md:space-y-4 flex-1">
            <div>
              <h4 className="text-xs md:text-sm font-medium mb-2 text-yellow-300">
                Definition:
              </h4>
              <p className="text-base md:text-lg leading-relaxed">
                {word.definition}
              </p>
            </div>

            {word.example && (
              <div>
                <h4 className="text-xs md:text-sm font-medium mb-2 text-green-300">
                  Example:
                </h4>
                <p className="text-sm md:text-base italic opacity-90">
                  "{word.example}"
                </p>
              </div>
            )}

            {word.funFact && (
              <div>
                <h4 className="text-xs md:text-sm font-medium mb-2 text-pink-300">
                  Fun Fact:
                </h4>
                <p className="text-xs md:text-sm opacity-90">{word.funFact}</p>
              </div>
            )}
          </div>

          {/* Vocabulary Builder Features */}
          {showVocabularyBuilder && (
            <div className="border-t border-white/20 pt-4 mt-4">
              {/* Adventure Word Health */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs md:text-sm font-medium text-blue-300 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Word Health
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        (adventureStatus?.health || 100) >= 80
                          ? "text-green-300"
                          : (adventureStatus?.health || 100) >= 50
                            ? "text-yellow-300"
                            : (adventureStatus?.health || 100) >= 30
                              ? "text-orange-300"
                              : "text-red-300"
                      }`}
                    >
                      {adventureStatus?.health || 100}%
                    </span>
                    {(adventureStatus?.health || 100) < 50 && (
                      <AlertTriangle className="w-3 h-3 text-orange-300 animate-pulse" />
                    )}
                  </div>
                </div>
                <Progress
                  value={adventureStatus?.health || 100}
                  className={`h-2 ${
                    (adventureStatus?.health || 100) >= 50
                      ? "bg-green-100/20"
                      : (adventureStatus?.health || 100) >= 30
                        ? "bg-orange-100/20"
                        : "bg-red-100/20"
                  }`}
                />

                {/* Adventure Status */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {(adventureStatus?.health || 100) < 30 ? (
                      <>
                        <Flame className="w-3 h-3 text-red-400 animate-pulse" />
                        <span className="text-red-300 font-medium">
                          Needs Rescue!
                        </span>
                      </>
                    ) : (adventureStatus?.health || 100) < 50 ? (
                      <>
                        <Target className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-300">Needs Practice</span>
                      </>
                    ) : (adventureStatus?.health || 100) < 80 ? (
                      <>
                        <Shield className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-300">Good</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3 h-3 text-green-400" />
                        <span className="text-green-300">Mastered</span>
                      </>
                    )}
                  </div>
                  <span className="text-white/60">
                    Forgot {adventureStatus?.forget_count || 0}x
                  </span>
                </div>
              </div>

              {/* Adventure Rating Buttons */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-medium text-purple-300 mb-2 flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  Rate Your Knowledge
                </h4>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-all hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          false, // incorrect/hard
                          false,
                        );
                      setAdventureStatus(updatedStatus);
                      // Also call the original handler
                      onWordMastered?.(word.id, "hard");
                    }}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Forgot
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/30 transition-all hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system with hesitation
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true, // correct but with hesitation
                          true,
                        );
                      setAdventureStatus(updatedStatus);
                      // Also call the original handler
                      onWordMastered?.(word.id, "medium");
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Kinda
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-500/30 transition-all hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Track in adventure system as correct
                      const updatedStatus =
                        adventureService.trackWordInteraction(
                          word.id.toString(),
                          true, // correct
                          false,
                        );
                      setAdventureStatus(updatedStatus);
                      // Also call the original handler
                      onWordMastered?.(word.id, "easy");
                    }}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Easy!
                  </Button>
                </div>

                {/* Adventure Quick Actions */}
                {(adventureStatus?.health || 100) < 50 && (
                  <div className="mt-3 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300 font-medium">
                          This word needs practice!
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/30 px-2 py-1 h-auto text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Trigger adventure rescue - this could open adventure dashboard
                          console.log(
                            "Opening rescue mission for word:",
                            word.word,
                          );
                        }}
                      >
                        <Sword className="w-3 h-3 mr-1" />
                        Rescue
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
