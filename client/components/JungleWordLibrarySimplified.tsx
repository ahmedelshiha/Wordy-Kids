import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Accessibility,
  Trophy,
  Star,
  Gem,
  Crown,
  Sparkles,
  RefreshCw,
  Settings,
  BookOpen,
  Brain,
  Gamepad2,
  Map,
  Target,
  Heart,
  Zap,
  Filter,
  Search,
  Grid3X3,
  List,
} from "lucide-react";

// Import enhanced components (using existing Enhanced components)
import { JungleWordCard } from "./JungleWordCard";
import { JungleAchievementPopup } from "./JungleAchievementPopup";
import { EnhancedCategorySelector } from "./EnhancedCategorySelector";
import { EnhancedVocabularyBuilder } from "./EnhancedVocabularyBuilder";

// Import enhanced services and hooks
import { useJungleGameState } from "@/hooks/useJungleGameState";
import { useJungleAudioService } from "@/hooks/useJungleAudioService";
import { useJungleWordFiltering } from "@/hooks/useJungleWordFiltering";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { useJungleAccessibility } from "@/hooks/useJungleAccessibility";
import { useJungleAnimations } from "@/hooks/useJungleAnimations";

// Import data and utilities
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { enhancedAnalyticsSystem } from "@/lib/enhancedAnalyticsSystem";
import { useFeatureFlag, useFeatureFlags } from "@/lib/featureFlags";

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

interface JungleWordLibraryProps {
  onBack?: () => void;
  userProfile?: {
    name?: string;
    age?: number;
    interests?: string[];
    difficultyPreference?: string;
  };
  enableAdvancedFeatures?: boolean;
  showMobileOptimizations?: boolean;
  gameMode?: "exploration" | "learning" | "challenge";
  initialCategory?: string;
}

type ViewMode =
  | "categories"
  | "words"
  | "vocabulary"
  | "achievements"
  | "settings";
type WordViewMode = "grid" | "list" | "carousel" | "adventure";

export const JungleWordLibrary: React.FC<JungleWordLibraryProps> = ({
  onBack,
  userProfile = {},
  enableAdvancedFeatures = true,
  showMobileOptimizations = true,
  gameMode = "exploration",
  initialCategory = "all",
}) => {
  // Core state
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [wordViewMode, setWordViewMode] = useState<WordViewMode>("grid");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(initialCategory);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced hooks
  const gameState = useJungleGameState();
  const audioService = useJungleAudioService();
  const mobileOptimization = useMobileOptimization();
  const accessibilitySettings = useJungleAccessibility();
  const animations = useJungleAnimations();
  const wordFiltering = useJungleWordFiltering(currentWords, {
    searchTerm,
    difficultyFilter,
    categoryFilter: selectedCategory,
  });

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    const initializeJungleLibrary = async () => {
      try {
        setIsLoading(true);

        // Load sound pack
        await audioService.loadSoundPack("jungle-adventure");

        // Initialize words
        const words =
          selectedCategory === "all"
            ? wordsDatabase
            : getWordsByCategory(selectedCategory);
        setCurrentWords(words);

        // Start ambient sounds if enabled
        if (audioService.getAudioStatus().enabled) {
          audioService.playAmbientSounds("jungle-birds", true);
        }

        // Track initialization
        enhancedAnalyticsSystem.trackEvent({
          type: "jungle_library_initialized",
          data: {
            category: selectedCategory,
            gameMode,
            wordsCount: words.length,
          },
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize Jungle Library:", error);
        toast({
          title: "Initialization Error",
          description: "Some features may not work properly.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    initializeJungleLibrary();

    return () => {
      audioService.stopAmbientSounds();
    };
  }, [selectedCategory, gameMode]);

  // Handlers
  const handleCategorySelect = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      setCurrentWordIndex(0);

      const words =
        category === "all" ? wordsDatabase : getWordsByCategory(category);
      setCurrentWords(words);

      setViewMode("words");

      // Play category selection sound
      audioService.playSound("category-select");

      // Announce for screen readers
      if (announcementRef.current) {
        announcementRef.current.textContent = `Selected ${category} category with ${words.length} words`;
      }
    },
    [audioService],
  );

  const handleWordInteraction = useCallback(
    (word: Word, action: string) => {
      switch (action) {
        case "pronounce":
          audioService.pronounceWord(word.word, {
            rate: userProfile?.age && userProfile.age < 8 ? 0.8 : 1.0,
            pitch: 1.1,
          });
          break;
        case "master":
          gameState.masterWord(word.id);
          gameState.updateScore(10);
          gameState.addJungleGems(2);
          audioService.playSound("achievement");
          animations.triggerCelebration("word-mastered");
          break;
        case "favorite":
          gameState.toggleFavorite(word.id);
          audioService.playSound("button-click");
          break;
        case "share":
          // Implement sharing logic
          audioService.playSound("navigation");
          break;
      }

      // Track interaction
      enhancedAnalyticsSystem.trackEvent({
        type: "word_interaction",
        data: {
          wordId: word.id,
          word: word.word,
          action,
          category: word.category,
          difficulty: word.difficulty,
        },
      });
    },
    [audioService, gameState, animations, userProfile],
  );

  const handleViewModeChange = useCallback(
    (newViewMode: ViewMode) => {
      setViewMode(newViewMode);
      audioService.playSound("view-change");

      if (announcementRef.current) {
        announcementRef.current.textContent = `Changed to ${newViewMode} view`;
      }
    },
    [audioService],
  );

  const getCurrentWord = () => currentWords[currentWordIndex] || null;
  const filteredWords = wordFiltering.filteredWords;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-blue-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <div className="text-6xl mb-4 animate-bounce">🌿</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Preparing Your Jungle Adventure
            </h2>
            <p className="text-green-600 mb-4">
              Loading amazing words and sounds...
            </p>
            <Progress value={75} className="w-64 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-all duration-500 ${
        accessibilitySettings.highContrast
          ? "bg-black text-white"
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50"
      } ${accessibilitySettings.reducedMotion ? "" : "jungle-pattern-bg"}`}
      style={{
        fontSize: accessibilitySettings.largeText ? "1.125rem" : "1rem",
      }}
    >
      {/* Accessibility announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-green-700 hover:text-green-800"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <h1 className="text-2xl font-bold text-green-800 flex items-center">
                🌴 Jungle Word Library
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              {/* Game Stats */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <Badge variant="outline" className="text-green-700">
                  <Trophy className="h-3 w-3 mr-1" />
                  {gameState.getPlayerStats().totalScore}
                </Badge>
                <Badge variant="outline" className="text-blue-700">
                  <Gem className="h-3 w-3 mr-1" />
                  {gameState.getPlayerStats().jungleGems}
                </Badge>
                <Badge variant="outline" className="text-purple-700">
                  <Star className="h-3 w-3 mr-1" />
                  Level {gameState.getPlayerStats().level}
                </Badge>
              </div>

              {/* Audio Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={audioService.toggleAudio}
                className="text-green-700"
              >
                {audioService.getAudioStatus().enabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>

              {/* View Mode Toggles */}
              <div className="flex bg-green-100 rounded-lg p-1">
                <Button
                  variant={viewMode === "categories" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("categories")}
                  className="text-xs"
                >
                  <Map className="h-3 w-3 mr-1" />
                  Categories
                </Button>
                <Button
                  variant={viewMode === "words" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("words")}
                  className="text-xs"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  Words
                </Button>
                <Button
                  variant={viewMode === "achievements" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewModeChange("achievements")}
                  className="text-xs"
                >
                  <Trophy className="h-3 w-3 mr-1" />
                  Achievements
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6" role="main">
        {viewMode === "categories" && (
          <EnhancedCategorySelector
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
            userInterests={userProfile.interests}
            showCompletionStatus={true}
          />
        )}

        {viewMode === "words" && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search words..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={wordViewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWordViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={wordViewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setWordViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="all">All Levels</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* Words Grid/List */}
            <div
              className={
                wordViewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }
            >
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <JungleWordCard
                    key={word.id}
                    word={word}
                    onInteraction={handleWordInteraction}
                    isFavorite={gameState.gameState.favoriteWords.has(word.id)}
                    isMastered={gameState.gameState.masteredWords.has(word.id)}
                    compact={wordViewMode === "list"}
                    accessibilitySettings={accessibilitySettings}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No words found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === "vocabulary" && (
          <EnhancedVocabularyBuilder
            masteredWords={Array.from(gameState.gameState.masteredWords)}
            favoriteWords={Array.from(gameState.gameState.favoriteWords)}
            onWordReview={(wordId) => {
              const word = wordsDatabase.find((w) => w.id === wordId);
              if (word) handleWordInteraction(word, "pronounce");
            }}
          />
        )}

        {viewMode === "achievements" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameState.gameState.achievements.map((achievement) => (
              <Card key={achievement.id} className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">{achievement.emoji}</div>
                  <h3 className="font-bold text-lg mb-2">{achievement.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {achievement.description}
                  </p>
                  <Badge
                    variant={achievement.unlockedAt ? "default" : "secondary"}
                    className={achievement.unlockedAt ? "bg-green-500" : ""}
                  >
                    {achievement.unlockedAt ? "Unlocked!" : "Locked"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Achievement Popup */}
      <JungleAchievementPopup />
    </div>
  );
};

export default JungleWordLibrary;
