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
} from "lucide-react";
import { playSoundIfEnabled } from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";

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
    <div
      className={`relative w-full max-w-xs md:max-w-sm mx-auto ${className}`}
    >
      <Card
        className={`h-72 md:h-80 cursor-pointer transition-all duration-700 transform-gpu md:hover:scale-105 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
        onClick={() => {
          setIsFlipped(!isFlipped);
          audioService.playWhooshSound();
        }}
      >
        {/* Front of card */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-4 md:p-6 flex flex-col items-center justify-center text-white`}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={getDifficultyColor(word.difficulty)}>
              {word.difficulty === "easy"
                ? "🌟 Easy"
                : word.difficulty === "medium"
                  ? "⭐ Medium"
                  : "🔥 Hard"}
            </Badge>
            <Badge
              variant="outline"
              className="bg-white/20 border-white/30 text-white"
            >
              {word.category}
            </Badge>
          </div>

          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className={`text-white hover:bg-white/20 p-2 h-auto transition-all duration-300 ${
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

          {word.imageUrl ? (
            <img
              src={word.imageUrl}
              alt={word.word}
              className="w-32 md:w-40 h-40 md:h-48 object-cover rounded-full mt-8 mb-4 md:mb-6 shadow-xl ring-4 ring-white/30"
            />
          ) : (
            <div className="w-32 md:w-40 h-40 md:h-48 rounded-full bg-white/20 flex items-center justify-center mt-8 mb-4 md:mb-6 text-6xl md:text-8xl shadow-xl ring-4 ring-white/30 backdrop-blur-sm">
              {word.emoji || "📚"}
            </div>
          )}

          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 text-center">
            {word.word}
          </h2>

          {word.pronunciation && (
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <span className="text-base md:text-lg opacity-90">
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
                  className={`w-5 h-5 ${isPlaying ? "animate-pulse text-yellow-300" : ""}`}
                />
                {showSparkles && (
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                )}
              </Button>
            </div>
          )}

          <div className="text-center mt-auto">
            <p className="text-sm opacity-75 mb-2">
              <RotateCcw className="w-4 h-4 inline mr-1" />
              Tap to see definition
            </p>
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
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
              {/* Mastery Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs md:text-sm font-medium text-blue-300 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    Mastery Level
                  </h4>
                  <span className="text-xs text-white/70">
                    {word.masteryLevel || 0}%
                  </span>
                </div>
                <Progress
                  value={word.masteryLevel || 0}
                  className="h-2 bg-white/20"
                />
              </div>

              {/* Rating Buttons */}
              <div className="space-y-2">
                <h4 className="text-xs md:text-sm font-medium text-purple-300 mb-2">
                  How well do you know this word?
                </h4>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWordMastered?.(word.id, "hard");
                    }}
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Hard
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 border border-yellow-500/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWordMastered?.(word.id, "medium");
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    OK
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-500/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onWordMastered?.(word.id, "easy");
                    }}
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Easy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
