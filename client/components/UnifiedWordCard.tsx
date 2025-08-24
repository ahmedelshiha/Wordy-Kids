import React, { useState, useEffect } from "react";
import {
  usePronunciation,
  PronounceableWord,
  VoiceType,
  VOICE_TYPES,
} from "../lib/unifiedPronunciationService";
import { Volume2, Star, Heart, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "../lib/utils";

interface WordCardProps {
  word: string;
  definition?: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  imageUrl?: string;
  className?: string;
  onPronounce?: (word: string) => void;
  onMastered?: (word: string) => void;
  showDefinition?: boolean;
  autoSpeak?: boolean;
  preferredVoice?: VoiceType;
}

const UnifiedWordCard: React.FC<WordCardProps> = ({
  word,
  definition = "",
  category = "General",
  difficulty = "easy",
  imageUrl,
  className = "",
  onPronounce,
  onMastered,
  showDefinition = true,
  autoSpeak = false,
  preferredVoice,
}) => {
  const {
    speak,
    quickSpeak,
    slowSpeak,
    phoneticSpeak,
    voicePreference,
    setVoicePreference,
    isPlaying,
    currentWord,
    isSupported,
  } = usePronunciation();

  const [isCardPlaying, setIsCardPlaying] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pronunciationSpeed, setPronunciationSpeed] = useState<
    "quick" | "slow" | "phonetic"
  >("quick");
  const [error, setError] = useState<string | null>(null);

  // Auto-speak on mount if enabled
  useEffect(() => {
    if (autoSpeak && word && isSupported) {
      handleQuickPronunciation();
    }
  }, [autoSpeak, word, isSupported]);

  // Track if this card's word is currently being spoken
  useEffect(() => {
    setIsCardPlaying(currentWord === word && isPlaying);
  }, [currentWord, word, isPlaying]);

  const handleQuickPronunciation = async () => {
    if (!word.trim() || !isSupported) return;

    setError(null);
    onPronounce?.(word);

    // Temporarily switch voice if preferred voice is specified
    const originalVoice = voicePreference;
    if (preferredVoice && preferredVoice !== voicePreference) {
      setVoicePreference(preferredVoice);
    }

    try {
      await quickSpeak(word);
    } catch (error) {
      console.error("Word pronunciation failed:", error);
      setError("Pronunciation unavailable");
    } finally {
      // Restore original voice
      if (preferredVoice && preferredVoice !== originalVoice) {
        setVoicePreference(originalVoice);
      }
    }
  };

  const handleSlowPronunciation = async () => {
    if (!word.trim() || !isSupported) return;

    setError(null);
    try {
      await slowSpeak(word);
    } catch (error) {
      console.error("Slow pronunciation failed:", error);
      setError("Pronunciation unavailable");
    }
  };

  const handlePhoneticPronunciation = async () => {
    if (!word.trim() || !isSupported) return;

    setError(null);
    try {
      await phoneticSpeak(word);
    } catch (error) {
      console.error("Phonetic pronunciation failed:", error);
      setError("Pronunciation unavailable");
    }
  };

  const handleDefinitionPronunciation = async () => {
    if (!definition.trim() || !isSupported) return;

    setError(null);
    try {
      await speak(definition, {
        rate: 0.8,
        pitch: 1.0,
      });
    } catch (error) {
      console.error("Definition pronunciation failed:", error);
      setError("Pronunciation unavailable");
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = () => {
    const colors = {
      Animals: "bg-green-500",
      Food: "bg-orange-500",
      Colors: "bg-purple-500",
      Numbers: "bg-blue-500",
      Nature: "bg-emerald-500",
      Objects: "bg-gray-500",
      General: "bg-indigo-500",
    };
    return colors[category as keyof typeof colors] || "bg-indigo-500";
  };

  if (!isSupported) {
    return (
      <div
        className={cn(
          "bg-gray-100 border border-gray-300 rounded-xl p-4",
          className,
        )}
      >
        <div className="text-center text-gray-600">
          <div className="text-xl font-bold mb-2">{word}</div>
          <div className="text-sm">Pronunciation not supported</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative bg-white border-2 border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden",
        isCardPlaying &&
          "ring-4 ring-yellow-300 shadow-2xl transform scale-105",
        error && "border-red-300 bg-red-50",
        className,
      )}
    >
      {/* Category Badge */}
      <div
        className={cn(
          "absolute top-3 right-3 px-2 py-1 rounded-full text-white text-xs font-semibold",
          getCategoryColor(),
        )}
      >
        {category}
      </div>

      {/* Difficulty Badge */}
      <div
        className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold border",
          getDifficultyColor(),
        )}
      >
        {difficulty}
      </div>

      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Side */}
        {!isFlipped ? (
          <div className="space-y-4">
            {/* Image placeholder */}
            {imageUrl ? (
              <div className="h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={word}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-4xl">{word.charAt(0).toUpperCase()}</div>
              </div>
            )}

            {/* Word Display */}
            <div className="text-center">
              <PronounceableWord
                className={cn(
                  "text-2xl font-bold text-gray-800 hover:text-blue-600 transition-colors",
                  isCardPlaying && "text-yellow-600 animate-pulse",
                )}
                onPronounce={handleQuickPronunciation}
                slow={pronunciationSpeed === "slow"}
                showIcon={false}
              >
                {word}
              </PronounceableWord>
            </div>

            {/* Error Display */}
            {error && (
              <div className="text-center text-red-600 text-sm">{error}</div>
            )}

            {/* Pronunciation Controls */}
            <div className="flex justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickPronunciation();
                }}
                disabled={isCardPlaying}
                className={cn(
                  "p-2 rounded-full transition-all transform hover:scale-110",
                  pronunciationSpeed === "quick"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-100",
                )}
                title="Quick pronunciation"
              >
                <Play className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSlowPronunciation();
                }}
                disabled={isCardPlaying}
                className={cn(
                  "p-2 rounded-full transition-all transform hover:scale-110",
                  pronunciationSpeed === "slow"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-green-100",
                )}
                title="Slow pronunciation"
              >
                <Volume2 className="h-4 w-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePhoneticPronunciation();
                }}
                disabled={isCardPlaying}
                className={cn(
                  "p-2 rounded-full transition-all transform hover:scale-110",
                  pronunciationSpeed === "phonetic"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-100",
                )}
                title="Phonetic pronunciation"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Voice Type Indicator */}
            <div className="text-center text-xs text-gray-500">
              Voice: {preferredVoice || voicePreference}
            </div>
          </div>
        ) : (
          /* Back Side - Definition */
          <div className="space-y-4 min-h-[200px] flex flex-col justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Definition
              </h3>
              {definition ? (
                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed">{definition}</p>
                  {showDefinition && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDefinitionPronunciation();
                      }}
                      disabled={isCardPlaying}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      <Volume2 className="h-4 w-4" />
                      Read Definition
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 italic">No definition available</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="px-6 pb-4 flex justify-between items-center">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Flip Card
        </button>

        <button
          onClick={() => onMastered?.(word)}
          className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
        >
          <Star className="h-3 w-3" />
          Mastered
        </button>
      </div>

      {/* Loading Indicator */}
      {isCardPlaying && (
        <div className="absolute inset-0 bg-yellow-100 bg-opacity-50 flex items-center justify-center rounded-xl">
          <div className="bg-yellow-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <Volume2 className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Speaking...</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Example usage component
export const UnifiedWordCardDemo: React.FC = () => {
  const [masteredWords, setMasteredWords] = useState<string[]>([]);
  const [pronunciationCount, setPronunciationCount] = useState<
    Record<string, number>
  >({});

  const sampleWords = [
    {
      word: "Elephant",
      definition: "A large mammal with a trunk, big ears, and thick gray skin.",
      category: "Animals",
      difficulty: "easy" as const,
      imageUrl: "/images/elephant.jpg",
    },
    {
      word: "Adventure",
      definition: "An exciting or unusual experience that involves some risk.",
      category: "General",
      difficulty: "medium" as const,
    },
    {
      word: "Photosynthesis",
      definition:
        "The process by which plants make food from sunlight and carbon dioxide.",
      category: "Nature",
      difficulty: "hard" as const,
    },
  ];

  const handlePronounce = (word: string) => {
    setPronunciationCount((prev) => ({
      ...prev,
      [word]: (prev[word] || 0) + 1,
    }));
  };

  const handleMastered = (word: string) => {
    setMasteredWords((prev) => [...prev, word]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Unified Word Card System
        </h1>
        <p className="text-gray-600">
          Interactive word cards with unified pronunciation system
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sampleWords.map((wordData, index) => (
          <UnifiedWordCard
            key={wordData.word}
            {...wordData}
            onPronounce={handlePronounce}
            onMastered={handleMastered}
            autoSpeak={index === 0} // Auto-speak first card
            preferredVoice={index === 1 ? VOICE_TYPES.KID : undefined} // Use kid voice for second card
          />
        ))}
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Learning Statistics
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">
              Mastered Words:
            </h4>
            <div className="space-y-1">
              {masteredWords.length > 0 ? (
                masteredWords.map((word) => (
                  <div
                    key={word}
                    className="flex items-center gap-2 text-green-700"
                  >
                    <Star className="h-4 w-4" />
                    {word}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No words mastered yet</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-600 mb-2">
              Pronunciation Count:
            </h4>
            <div className="space-y-1">
              {Object.entries(pronunciationCount).map(([word, count]) => (
                <div
                  key={word}
                  className="flex justify-between items-center text-blue-700"
                >
                  <span>{word}</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-sm">
                    {count}x
                  </span>
                </div>
              ))}
              {Object.keys(pronunciationCount).length === 0 && (
                <p className="text-gray-500 italic">No pronunciations yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedWordCard;
