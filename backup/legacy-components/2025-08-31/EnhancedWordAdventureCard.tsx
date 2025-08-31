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
  Gamepad2,
  Headphones,
  Puzzle,
  Target,
  Zap,
  Crown,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  Trophy,
  MessageCircle,
  Lightbulb,
  PartyPopper,
} from "lucide-react";
import {
  playSoundIfEnabled,
  playUIInteractionSoundIfEnabled,
} from "@/lib/soundEffects";
import { audioService } from "@/lib/audioService";
import { enhancedAudioService } from "@/lib/enhancedAudioService";
import { adventureService } from "@/lib/adventureService";
import { WordAdventureStatus } from "@shared/adventure";
import { AchievementTracker } from "@/lib/achievementTracker";
// EnhancedAchievementPopup removed - now using LightweightAchievementProvider
import { useVoiceSettings } from "@/hooks/use-voice-settings";

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

interface EnhancedWordAdventureCardProps {
  word: Word;
  showDefinition?: boolean;
  onPronounce?: (word: Word) => void;
  onFavorite?: (word: Word) => void;
  onWordMastered?: (wordId: number, rating: "easy" | "medium" | "hard") => void;
  showVocabularyBuilder?: boolean;
  className?: string;
  enableMiniGames?: boolean;
  autoPlay?: boolean;
}

// Mini-game states
type MiniGameType = "sound-match" | "emoji-builder" | "letter-hunt" | null;

// Voice types
type VoiceType = "normal" | "funny" | "robot" | "kid";

export const EnhancedWordAdventureCard: React.FC<
  EnhancedWordAdventureCardProps
> = ({
  word,
  showDefinition = false,
  onPronounce,
  onFavorite,
  onWordMastered,
  showVocabularyBuilder = false,
  className = "",
  enableMiniGames = true,
  autoPlay = false,
}) => {
  const [isFlipped, setIsFlipped] = useState(showDefinition);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [adventureStatus, setAdventureStatus] =
    useState<WordAdventureStatus | null>(null);
  // wordAchievements state removed - now using event-based system
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [isGesturing, setIsGesturing] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);

  // New adventure features
  const [currentStars, setCurrentStars] = useState(0);
  const [maxStars] = useState(3);
  const [hasHeardPronunciation, setHasHeardPronunciation] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [hasPlayedGame, setHasPlayedGame] = useState(false);
  const [currentMiniGame, setCurrentMiniGame] = useState<MiniGameType>(null);
  const [voiceType, setVoiceType] = useState<VoiceType>("normal");
  const [showSoundPreview, setShowSoundPreview] = useState(false);
  const [funnyVoiceUnlocked, setFunnyVoiceUnlocked] = useState(false);

  // Voice settings integration
  const voiceSettings = useVoiceSettings();

  // Initialize adventure status for this word
  useEffect(() => {
    let status = adventureService.getWordAdventureStatus(word.id.toString());
    if (!status) {
      status = adventureService.initializeWordAdventure(word.id.toString());
    }
    setAdventureStatus(status);

    // Auto-play pronunciation if enabled
    if (autoPlay && !hasHeardPronunciation) {
      setTimeout(() => handlePronounce("normal"), 1000);
    }
  }, [word.id, autoPlay, hasHeardPronunciation]);

  // Update stars based on interaction
  useEffect(() => {
    let stars = 0;
    if (hasHeardPronunciation) stars++;
    if (hasFlipped) stars++;
    if (hasPlayedGame) stars++;
    setCurrentStars(stars);

    // Trigger celebration when reaching max stars
    if (stars === maxStars && !showSparkles) {
      setShowSparkles(true);
      enhancedAudioService.playSuccessSound();
      setTimeout(() => setShowSparkles(false), 2000);

      // Unlock funny voice as reward
      setFunnyVoiceUnlocked(true);

      // Track achievement
      const starAchievements = AchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: 1,
        accuracy: 100,
        category: word.category,
        timeSpent: 2,
      });

      if (starAchievements.length > 0) {
        // Trigger achievements through new lightweight popup system
        setTimeout(() => {
          starAchievements.forEach((achievement) => {
            const event = new CustomEvent("milestoneUnlocked", {
              detail: { achievement },
            });
            window.dispatchEvent(event);
          });
        }, 1500);
      }
    }
  }, [
    hasHeardPronunciation,
    hasFlipped,
    hasPlayedGame,
    maxStars,
    showSparkles,
    word.category,
  ]);

  const handlePronounce = async (voice: VoiceType = voiceType) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setShowSparkles(true);

    // Mark as heard for star progress
    if (!hasHeardPronunciation) {
      setHasHeardPronunciation(true);
      playUIInteractionSoundIfEnabled.cheer();
    }

    try {
      // Use enhanced audio service with voice type
      await enhancedAudioService.pronounceWord(word.word, {
        voice: voice === "funny" ? "funny" : "normal",
        rate: voice === "robot" ? 0.7 : voice === "kid" ? 1.2 : 1.0,
        pitch: voice === "funny" ? 1.5 : voice === "kid" ? 1.3 : 1.0,
        onStart: () => {
          console.log(`Started pronunciation with ${voice} voice`);
        },
        onEnd: () => {
          setIsPlaying(false);
          setShowSparkles(false);
          onPronounce?.(word);
        },
        onError: () => {
          setIsPlaying(false);
          setShowSparkles(false);
          playSoundIfEnabled.pronunciation();
        },
      });
    } catch (error) {
      setIsPlaying(false);
      setShowSparkles(false);
      playSoundIfEnabled.pronunciation();
    }

    // Safety timeout
    setTimeout(() => {
      setIsPlaying(false);
      setShowSparkles(false);
    }, 3000);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    audioService.playWhooshSound();

    if (!hasFlipped && !isFlipped) {
      setHasFlipped(true);
      playUIInteractionSoundIfEnabled.cheer();
    }

    // Enhanced haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([30, 20, 30]);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      enhancedAudioService.playSuccessSound();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1000);

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      playUIInteractionSoundIfEnabled.click();
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    onFavorite?.(word);
  };

  const handleMiniGame = (gameType: MiniGameType) => {
    setCurrentMiniGame(gameType);
    if (!hasPlayedGame) {
      setHasPlayedGame(true);
      playUIInteractionSoundIfEnabled.cheer();
    }

    // Play different sounds for different games
    switch (gameType) {
      case "sound-match":
        enhancedAudioService.playSuccessSound();
        break;
      case "emoji-builder":
        audioService.playWhooshSound();
        break;
      case "letter-hunt":
        playUIInteractionSoundIfEnabled.click();
        break;
    }

    // Simulate mini-game completion after 2 seconds
    setTimeout(() => {
      setCurrentMiniGame(null);
      setShowSparkles(true);
      enhancedAudioService.playSuccessSound();
      setTimeout(() => setShowSparkles(false), 1500);
    }, 2000);
  };

  const handleSoundPreview = () => {
    setShowSoundPreview(true);
    // Play a quick preview of the word
    handlePronounce("normal");
    setTimeout(() => setShowSoundPreview(false), 1000);
  };

  // Enhanced touch gesture handling
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsGesturing(true);
    setSwipeDirection(null);

    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const threshold = 20;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setSwipeDirection(deltaX > threshold ? "right" : "left");
      } else {
        setSwipeDirection(deltaY < -threshold ? "up" : "down");
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const threshold = 40;

    setIsGesturing(false);
    setSwipeDirection(null);

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        if (isFlipped) {
          handleFlip(); // Go back to front
        } else {
          handleFlip(); // Go to back
        }
      } else {
        handleFavorite(); // Swipe left to favorite
      }
    } else if (deltaY < -threshold) {
      handlePronounce(); // Swipe up to pronounce
    } else if (deltaY > threshold && isFlipped) {
      handleFlip(); // Swipe down on back to go to front
    } else if (Math.abs(deltaX) < 20 && Math.abs(deltaY) < 20) {
      if (isFlipped) {
        handleFlip(); // Tap on back to go to front
      }
    }

    setTouchStart(null);
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
      animals: "bg-gradient-to-br from-blue-400 to-blue-600",
      food: "bg-gradient-to-br from-red-400 to-orange-500",
      nature: "bg-gradient-to-br from-green-400 to-green-600",
      objects: "bg-gradient-to-br from-purple-400 to-purple-600",
      body: "bg-gradient-to-br from-pink-400 to-pink-600",
      clothes: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      family: "bg-gradient-to-br from-yellow-400 to-amber-500",
      feelings: "bg-gradient-to-br from-rose-400 to-rose-600",
      colors: "bg-gradient-to-br from-violet-400 to-purple-500",
      numbers: "bg-gradient-to-br from-cyan-400 to-blue-500",
    };
    return (
      colors[category as keyof typeof colors] ||
      "bg-gradient-to-br from-blue-400 to-purple-600"
    );
  };

  const getStarDisplay = () => {
    return Array.from({ length: maxStars }, (_, index) => (
      <Star
        key={index}
        className={`w-6 h-6 transition-all duration-300 ${
          index < currentStars
            ? "text-yellow-400 fill-yellow-400 animate-pulse"
            : "text-yellow-200/50"
        }`}
      />
    ));
  };

  return (
    <div className={`relative w-full max-w-[380px] mx-auto ${className}`}>
      <Card
        className={`h-[480px] cursor-pointer transition-all duration-500 transform-gpu active:scale-[0.97] hover:scale-[1.02] shadow-xl hover:shadow-2xl mobile-optimized ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        } ${
          isGesturing
            ? swipeDirection === "right"
              ? "scale-[1.03] ring-4 ring-green-400/60 shadow-green-400/30 shadow-2xl"
              : swipeDirection === "left"
                ? "scale-[1.03] ring-4 ring-red-400/60 shadow-red-400/30 shadow-2xl"
                : swipeDirection === "up"
                  ? "scale-[1.03] ring-4 ring-blue-400/60 shadow-blue-400/30 shadow-2xl"
                  : swipeDirection === "down"
                    ? "scale-[1.03] ring-4 ring-purple-400/60 shadow-purple-400/30 shadow-2xl"
                    : "scale-[1.03] ring-2 ring-blue-400/50"
            : ""
        }`}
        style={{
          touchAction: "manipulation",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
        onClick={handleFlip}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={`Word adventure card for ${word.word}. ${isFlipped ? "Showing games and definition" : "Showing word"}. Tap to flip or swipe for actions.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* FRONT OF CARD - Kid-Friendly Design */}
        <CardContent
          className={`absolute inset-0 w-full h-full ${getCategoryColor(word.category)} rounded-xl p-4 flex flex-col text-white`}
          style={{ willChange: "transform" }}
        >
          {/* Header with Badges and Stars */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-wrap gap-1 max-w-[60%]">
              <Badge
                className={`${getDifficultyColor(word.difficulty)} text-xs font-bold px-2 py-1`}
              >
                {word.difficulty === "easy"
                  ? "🌟 Easy"
                  : word.difficulty === "medium"
                    ? "⭐ Medium"
                    : "🔥 Hard"}
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/20 border-white/30 text-white text-xs px-2 py-1 truncate"
              >
                {word.category}
              </Badge>
            </div>

            {/* Star Progress Meter */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-2">
              {getStarDisplay()}
            </div>
          </div>

          {/* Emoji Buddy - Large and Animated */}
          <div className="relative mx-auto mb-4">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-white/30 via-white/20 to-white/10 backdrop-blur-md shadow-lg ring-2 ring-white/30 flex items-center justify-center relative overflow-hidden animate-gentle-float">
              {/* Decorative background sparkles */}
              <div className="absolute top-3 left-3 w-3 h-3 bg-white/25 rounded-full animate-sparkle"></div>
              <div className="absolute bottom-4 right-4 w-2 h-2 bg-white/20 rounded-full animate-sparkle animation-delay-200"></div>
              <div className="absolute top-1/2 right-3 w-2 h-2 bg-white/30 rounded-full animate-sparkle animation-delay-100"></div>

              {/* Main emoji - Extra large */}
              <span className="text-7xl relative z-10 drop-shadow-lg animate-kid-float">
                {word.emoji || "📚"}
              </span>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-transparent via-white/5 to-white/15"></div>
            </div>
          </div>

          {/* Word Display with Inline Controls */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3">
            {/* Large Word Text */}
            <h2 className="text-3xl font-bold tracking-wide drop-shadow-md leading-tight animate-fade-in">
              {word.word}
            </h2>

            {/* Pronunciation */}
            {word.pronunciation && (
              <div className="text-sm opacity-90 font-medium bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
                {word.pronunciation}
              </div>
            )}

            {/* Big Pronunciation Buttons */}
            <div className="flex items-center gap-3">
              {/* Normal Voice Button */}
              <Button
                size="lg"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePronounce("normal");
                }}
                disabled={isPlaying}
                className={`text-white hover:bg_white/30 hover:scale-105 active:scale-95 p-4 h-auto min-w-[60px] min-h-[60px] rounded-full transition-all duration-200 border-2 border-white/40 bg-white/15 backdrop-blur-sm shadow-lg ${
                  isPlaying && voiceType === "normal"
                    ? "scale-110 bg-yellow-400/30 border-yellow-300/60 shadow-yellow-300/30 animate-bounce"
                    : "hover:border-white/60"
                }`}
              >
                <Volume2
                  className={`w-6 h-6 transition-all duration-200 ${
                    isPlaying && voiceType === "normal"
                      ? "text-yellow-200 animate-pulse scale-110"
                      : "text-white"
                  }`}
                />
                {showSparkles && voiceType === "normal" && (
                  <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                )}
              </Button>

              {/* Funny Voice Button (unlocked after getting stars) */}
              {funnyVoiceUnlocked && (
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePronounce("funny");
                  }}
                  disabled={isPlaying}
                  className={`text_white hover:bg-white/30 hover:scale-105 active:scale-95 p-4 h-auto min-w-[60px] min-h-[60px] rounded-full transition-all duration-200 border-2 border-yellow-400/40 bg-yellow-400/15 backdrop-blur-sm shadow-lg ${
                    isPlaying && voiceType === "funny"
                      ? "scale-110 bg-yellow-400/30 border-yellow-300/60 shadow-yellow-300/30 animate-bounce"
                      : "hover:border-yellow-400/60"
                  }`}
                >
                  <span className="text-xl">😄</span>
                  {showSparkles && voiceType === "funny" && (
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-spin" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Enhanced Footer with Tap Hints */}
          <div className="text-center space-y-2">
            {/* Interactive Progress Indicators */}
            <div className="flex justify_center gap-2 mb-2">
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${hasHeardPronunciation ? "bg-yellow-400 animate-pulse" : "bg-white/30"}`}
              ></div>
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${hasFlipped ? "bg-green-400 animate-pulse" : "bg-white/30"}`}
              ></div>
              <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${hasPlayedGame ? "bg-blue-400 animate-pulse" : "bg-white/30"}`}
              ></div>
            </div>

            {/* Tap to flip hint */}
            <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 mx-auto w-fit">
              <p className="text-sm opacity-95 leading-tight font-medium flex items-center gap-2">
                <RotateCcw className="w-4 h-4 animate-gentle-bounce" />
                Tap to discover games!
                <Gamepad2 className="w-4 h-4" />
              </p>
            </div>
          </div>
        </CardContent>

        {/* BACK OF CARD - Interactive Games and Learning */}
        <CardContent
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-4 flex flex-col text-white overflow-hidden"
          style={{
            transform: "scale(-1, 1)",
          }}
        >
          {/* Back Navigation */}
          <div className="absolute top-3 right-3 z-10">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/30 active:bg-white/40 p-2 h-auto min-w-[48px] min-h-[48px] rounded-full border-2 border-white/30 bg-white/15 backdrop-blur-sm transition-all duration-200 active:scale-95 hover:scale-105 shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Word Header */}
          <h3 className="text-xl font-bold mb-4 text-center pr-12 flex items-center justify-center gap-2">
            {word.emoji && <span className="text-2xl">{word.emoji}</span>}
            {word.word}
          </h3>

          {/* Learning Content */}
          <div className="space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {/* Simple Definition */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <h4 className="text-sm font-medium mb-1 text-yellow-300 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                What it means:
              </h4>
              <p className="text-sm leading-relaxed">{word.definition}</p>
            </div>

            {/* Example Sentence */}
            {word.example && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <h4 className="text-sm font-medium mb-1 text-green-300 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  Use it like this:
                </h4>
                <p className="text-sm italic opacity-90 leading-relaxed">
                  "{word.example}"
                </p>
              </div>
            )}

            {/* Fun Fact */}
            {word.funFact && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <h4 className="text-sm font_medium mb-1 text-pink-300 flex items-center gap-1">
                  <PartyPopper className="w-4 h-4" />
                  Cool fact:
                </h4>
                <p className="text-sm opacity-90 leading-relaxed">
                  {word.funFact}
                </p>
              </div>
            )}
          </div>

          {/* Mini-Games Menu */}
          {enableMiniGames && (
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-bold text-center text-purple-300 flex items-center justify-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Fun Games!
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {/* Sound Match Game */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMiniGame("sound-match");
                  }}
                  disabled={currentMiniGame !== null}
                  className={`bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 rounded-lg p-3 h-auto flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    currentMiniGame === "sound-match"
                      ? "animate-pulse bg-blue-500/40"
                      : ""
                  }`}
                >
                  <Headphones className="w-5 h-5" />
                  <span className="text-xs">Sound Match</span>
                </Button>

                {/* Emoji Builder Game */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMiniGame("emoji-builder");
                  }}
                  disabled={currentMiniGame !== null}
                  className={`bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border border-orange-500/30 rounded-lg p-3 h-auto flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    currentMiniGame === "emoji-builder"
                      ? "animate-pulse bg-orange-500/40"
                      : ""
                  }`}
                >
                  <Puzzle className="w-5 h-5" />
                  <span className="text-xs">Emoji Build</span>
                </Button>

                {/* Letter Hunt Game */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMiniGame("letter-hunt");
                  }}
                  disabled={currentMiniGame !== null}
                  className={`bg-green-500/20 hover:bg-green-500/30 text-green-200 border border-green-500/30 rounded-lg p-3 h-auto flex flex-col items-center gap-1 transition-all active:scale-95 ${
                    currentMiniGame === "letter-hunt"
                      ? "animate-pulse bg-green-500/40"
                      : ""
                  }`}
                >
                  <Target className="w-5 h-5" />
                  <span className="text-xs">Letter Hunt</span>
                </Button>
              </div>

              {/* Game Status */}
              {currentMiniGame && (
                <div className="text-center">
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-2">
                    <p className="text-xs text-yellow-200 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Playing {currentMiniGame.replace("-", " ")}...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Star Progress and Rewards */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Adventure Progress:</span>
              <div className="flex items-center gap-1">{getStarDisplay()}</div>
            </div>

            <div className="text-xs text-white/70 space-y-1">
              <div
                className={`flex items-center gap-2 ${hasHeardPronunciation ? "text-yellow-300" : ""}`}
              >
                <Volume2 className="w-3 h-3" />
                {hasHeardPronunciation
                  ? "✓ Heard pronunciation!"
                  : "Listen to the word"}
              </div>
              <div
                className={`flex items-center gap-2 ${hasFlipped ? "text-green-300" : ""}`}
              >
                <RotateCcw className="w-3 h-3" />
                {hasFlipped ? "✓ Explored the back!" : "Flip and explore"}
              </div>
              <div
                className={`flex items-center gap-2 ${hasPlayedGame ? "text-blue-300" : ""}`}
              >
                <Gamepad2 className="w-3 h-3" />
                {hasPlayedGame ? "✓ Played a game!" : "Try a mini-game"}
              </div>
            </div>

            {/* Reward unlock message */}
            {funnyVoiceUnlocked && (
              <div className="mt-2 text-xs text-yellow-300 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Funny voice unlocked! 😄
              </div>
            )}
          </div>

          {/* Mobile Back Navigation Hint */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 flex items-center justify-center">
              <div className="flex items-center gap-3 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">←</span>
                  <span>Swipe back</span>
                </span>
                <span className="w-px h-3 bg-white/30"></span>
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">↓</span>
                  <span>or tap anywhere</span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement popups now handled by LightweightAchievementProvider */}

      {/* Swipe Direction Visual Feedback */}
      {isGesturing && swipeDirection && (
        <div className="absolute inset-0 pointer-events-none z-20 rounded-xl overflow-hidden">
          <div
            className={`absolute inset-0 transition-opacity duration-200 ${
              swipeDirection === "right"
                ? "bg-gradient-to-r from-green-400/20 via-green-400/10 to-transparent"
                : swipeDirection === "left"
                  ? "bg-gradient-to-l from-red-400/20 via-red-400/10 to-transparent"
                  : swipeDirection === "up"
                    ? "bg-gradient-to-t from-blue-400/20 via-blue-400/10 to-transparent"
                    : swipeDirection === "down"
                      ? "bg-gradient-to-b from-purple-400/20 via-purple-400/10 to-transparent"
                      : ""
            }`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 ${
                swipeDirection === "right"
                  ? "bg-green-400/30 border-green-400/60 text-green-200"
                  : swipeDirection === "left"
                    ? "bg-red-400/30 border-red-400/60 text-red-200"
                    : swipeDirection === "up"
                      ? "bg-blue-400/30 border-blue-400/60 text-blue-200"
                      : swipeDirection === "down"
                        ? "bg-purple-400/30 border-purple-400/60 text-purple-200"
                        : ""
              } animate-pulse`}
            >
              {swipeDirection === "right" &&
                (isFlipped ? (
                  <RotateCcw className="w-8 h-8" />
                ) : (
                  <Gamepad2 className="w-8 h-8" />
                ))}
              {swipeDirection === "left" && <Heart className="w-8 h-8" />}
              {swipeDirection === "up" && <Volume2 className="w-8 h-8" />}
              {swipeDirection === "down" && isFlipped && (
                <RotateCcw className="w-8 h-8" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sparkles celebration overlay */}
      {showSparkles && (
        <div className="absolute inset-0 pointer-events-none z-30 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-transparent to-yellow-400/10 animate-ping"></div>
          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-yellow-400/70 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400/70 rounded-full animate-bounce animation-delay-100"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-green-400/70 rounded-full animate-bounce animation-delay-200"></div>
          <div className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 bg-pink-400/70 rounded-full animate-bounce animation-delay-300"></div>
        </div>
      )}

      {/* Screen reader live region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isFlipped
          ? `Showing games and definition for ${word.word}`
          : `Showing word ${word.word}`}
        {isPlaying && ` Pronouncing ${word.word}`}
        {isFavorited && ` ${word.word} added to favorites`}
        {currentStars > 0 && ` ${currentStars} out of ${maxStars} stars earned`}
        {currentMiniGame &&
          ` Playing ${currentMiniGame.replace("-", " ")} game`}
      </div>
    </div>
  );
};
