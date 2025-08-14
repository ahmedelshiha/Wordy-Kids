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
import { AchievementTracker } from "@/lib/achievementTracker";
import { EnhancedAchievementPopup } from "@/components/EnhancedAchievementPopup";

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
  const [wordAchievements, setWordAchievements] = useState<any[]>([]);

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

        // Track pronunciation activity for journey achievements
        const pronunciationAchievements = AchievementTracker.trackActivity({
          type: "wordLearning",
          wordsLearned: 0, // Just listening, not learning
          category: word.category,
          timeSpent: 0.1, // Just a few seconds
        });

        if (pronunciationAchievements.length > 0) {
          setTimeout(() => {
            setWordAchievements(pronunciationAchievements);
          }, 1000);
        }
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
      // Core categories
      animals: "bg-gradient-to-br from-blue-400 to-blue-600",
      food: "bg-gradient-to-br from-red-400 to-orange-500",
      nature: "bg-gradient-to-br from-green-400 to-green-600",
      objects: "bg-gradient-to-br from-purple-400 to-purple-600",
      body: "bg-gradient-to-br from-pink-400 to-pink-600",

      // Extended categories
      clothes: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      family: "bg-gradient-to-br from-yellow-400 to-amber-500",
      feelings: "bg-gradient-to-br from-rose-400 to-rose-600",
      colors: "bg-gradient-to-br from-violet-400 to-purple-500",
      numbers: "bg-gradient-to-br from-cyan-400 to-blue-500",

      // Additional categories
      greetings: "bg-gradient-to-br from-emerald-400 to-green-500",
      technology: "bg-gradient-to-br from-slate-400 to-gray-600",
      actions: "bg-gradient-to-br from-orange-400 to-red-500",
      weather: "bg-gradient-to-br from-sky-400 to-blue-500",
      transportation: "bg-gradient-to-br from-yellow-500 to-orange-500",

      // Educational categories
      school: "bg-gradient-to-br from-blue-500 to-indigo-600",
      emotions: "bg-gradient-to-br from-pink-500 to-rose-500",
      toys: "bg-gradient-to-br from-purple-500 to-pink-500",
      music: "bg-gradient-to-br from-violet-500 to-purple-600",
      sports: "bg-gradient-to-br from-green-500 to-emerald-600",

      // Legacy support
      general: "bg-gradient-to-br from-purple-400 to-purple-600",
      science: "bg-gradient-to-br from-pink-400 to-pink-600",
    };
    return colors[category as keyof typeof colors] || "bg-gradient-to-br from-blue-400 to-purple-600";
  };

  return (
    <div
      className={`relative w-full max-w-xs sm:max-w-sm mx-auto ${className}`}
    >
      <Card
        className={`h-[400px] sm:h-[380px] md:h-[360px] cursor-pointer transition-all duration-500 transform-gpu active:scale-95 ${
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
        {/* Front of card - Mobile Optimized */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-3 sm:p-4 flex flex-col text-white`}
          style={{ backfaceVisibility: "hidden" }}
        >
          {/* Mobile-First Header with Badges */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge
                className={`${getDifficultyColor(word.difficulty)} text-xs font-medium px-2 py-1`}
              >
                {word.difficulty === "easy"
                  ? "🌟 Easy"
                  : word.difficulty === "medium"
                    ? "⭐ Medium"
                    : "🔥 Hard"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/20 border-white/30 text-white text-xs px-2 py-1"
              >
                {word.category}
              </Badge>

              {/* Mobile-Optimized Adventure Health Status */}
              {adventureStatus && (
                <Badge
                  variant="outline"
                  className={`text-xs flex items-center gap-1 px-2 py-1 ${
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
                    <Crown className="w-3 h-3" />
                  ) : adventureStatus.health >= 50 ? (
                    <Shield className="w-3 h-3" />
                  ) : adventureStatus.health >= 30 ? (
                    <Target className="w-3 h-3" />
                  ) : (
                    <Flame className="w-3 h-3" />
                  )}
                  <span className="font-medium">{adventureStatus.health}%</span>
                </Badge>
              )}
            </div>

            {/* Mobile-Optimized Favorite Button */}
            <Button
              size="sm"
              variant="ghost"
              className={`text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] transition-all duration-300 rounded-full ${
                isFavorited ? "scale-110 text-red-300" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleFavorite();
              }}
            >
              <Heart
                className={`w-4 h-4 transition-all duration-300 ${
                  isFavorited ? "fill-current animate-pulse" : ""
                }`}
              />
              {showSparkles && isFavorited && (
                <Star className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-bounce" />
              )}
            </Button>
          </div>

          {/* Mobile-Optimized Image/Emoji Container */}
          {word.imageUrl ? (
            <div className="relative mx-auto mb-3">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white/20 backdrop-blur-sm shadow-2xl ring-4 ring-white/30 flex items-center justify-center overflow-hidden">
                <img
                  src={word.imageUrl}
                  alt={word.word}
                  className="w-full h-full object-cover rounded-full shadow-lg"
                />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto mb-3">
              <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-2xl ring-4 ring-white/30 flex items-center justify-center relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1 left-1 w-3 h-3 bg-white/20 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-white/15 rounded-full animate-bounce delay-300"></div>
                <div className="absolute top-1/2 right-1 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping delay-700"></div>

                {/* Main emoji - Mobile optimized sizing */}
                <span className="text-5xl sm:text-6xl md:text-7xl relative z-10 drop-shadow-lg">
                  {word.emoji || "📚"}
                </span>

                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/10"></div>
              </div>
            </div>
          )}

          {/* Mobile-Optimized Word and Pronunciation */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-wide drop-shadow-md">
              {word.word}
            </h2>

            {word.pronunciation && (
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                <span className="text-sm sm:text-base opacity-90 font-medium">
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
                  className={`text-white hover:bg-white/30 hover:scale-110 p-3 h-auto min-w-[48px] min-h-[48px] rounded-full transition-all duration-300 border-2 border-white/40 bg-white/10 backdrop-blur-sm shadow-lg ${
                    isPlaying
                      ? "scale-125 bg-yellow-400/30 border-yellow-300/60 shadow-yellow-300/30 animate-bounce"
                      : "hover:border-white/60"
                  }`}
                >
                  <Volume2
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${isPlaying ? "text-yellow-200 animate-pulse scale-110" : "text-white"}`}
                  />
                  {showSparkles && (
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  )}
                  {isPlaying && (
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-300/50 animate-ping"></div>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile-Optimized Footer */}
          <div className="text-center">
            {adventureStatus && (
              <p className="text-xs opacity-60 mb-2">
                Last seen:{" "}
                {new Date(adventureStatus.last_seen).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs sm:text-sm opacity-75 mb-2">
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
              Tap to see definition
            </p>
            <div className="flex justify-center gap-1.5">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </CardContent>

        {/* Back of card - Mobile Optimized */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 sm:p-5 flex flex-col text-white"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Mobile-Optimized Back Button */}
          <div className="absolute top-3 right-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2 h-auto min-w-[44px] min-h-[44px] rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-lg sm:text-xl font-semibold mb-3 text-center pr-12">
            {word.word} {word.emoji}
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto">
            <div>
              <h4 className="text-xs font-medium mb-1 text-yellow-300">
                Definition:
              </h4>
              <p className="text-sm sm:text-base leading-relaxed">
                {word.definition}
              </p>
            </div>

            {word.example && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-green-300">
                  Example:
                </h4>
                <p className="text-sm italic opacity-90 leading-relaxed">
                  "{word.example}"
                </p>
              </div>
            )}

            {word.funFact && (
              <div>
                <h4 className="text-xs font-medium mb-1 text-pink-300">
                  Fun Fact:
                </h4>
                <p className="text-xs sm:text-sm opacity-90 leading-relaxed">
                  {word.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Mobile-Optimized Vocabulary Builder Features */}
          {showVocabularyBuilder && (
            <div className="border-t border-white/20 pt-3 mt-3">
              {/* Adventure Word Health - Mobile Optimized */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-blue-300 flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    Word Health
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
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

                {/* Mobile-Optimized Adventure Status */}
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

              {/* Mobile-Optimized Adventure Rating Buttons */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-purple-300 mb-2 flex items-center gap-1">
                  <Sword className="w-3 h-3" />
                  Rate Your Knowledge
                </h4>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 text-red-200 border border-red-500/30 transition-all active:scale-95 min-h-[44px] text-xs"
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

                      // Track word mastery for journey achievements (hard/needs practice)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 0, // Not considered learned if marked as hard
                          accuracy: 0,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

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
                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 active:bg-yellow-500/40 text-yellow-200 border border-yellow-500/30 transition-all active:scale-95 min-h-[44px] text-xs"
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

                      // Track word mastery for journey achievements (medium/kinda)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 0.5, // Partial learning
                          accuracy: 50,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

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
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-200 border border-green-500/30 transition-all active:scale-95 min-h-[44px] text-xs"
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

                      // Track word mastery for journey achievements (easy/learned!)
                      const masteryAchievements =
                        AchievementTracker.trackActivity({
                          type: "wordLearning",
                          wordsLearned: 1, // Fully learned
                          accuracy: 100,
                          category: word.category,
                          timeSpent: 1,
                        });

                      if (masteryAchievements.length > 0) {
                        setTimeout(() => {
                          setWordAchievements(masteryAchievements);
                        }, 1000);
                      }

                      // Also call the original handler
                      onWordMastered?.(word.id, "easy");
                    }}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Easy!
                  </Button>
                </div>

                {/* Mobile-Optimized Adventure Quick Actions */}
                {(adventureStatus?.health || 100) < 50 && (
                  <div className="mt-3 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-xs text-orange-300 font-medium text-center sm:text-left">
                          This word needs practice!
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 text-orange-200 border border-orange-500/30 px-3 py-2 h-auto text-xs min-h-[40px] transition-all active:scale-95"
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

      {/* Enhanced Achievement Popup for Word Mastery */}
      {wordAchievements.length > 0 && (
        <EnhancedAchievementPopup
          achievements={wordAchievements}
          onClose={() => setWordAchievements([])}
          onAchievementClaim={(achievement) => {
            console.log("Word mastery achievement claimed:", achievement);
            // Could add additional reward logic here
          }}
          autoCloseDelay={5000} // Auto-close after 5 seconds for word achievements
        />
      )}
    </div>
  );
};
