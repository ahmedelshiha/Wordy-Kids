import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap
} from "lucide-react";

// Import enhanced components
import { JungleWordCard } from "./JungleWordCard";
import { JungleWordLibraryHeader } from "./JungleWordLibraryHeader";
import { JungleWordLibraryContent } from "./JungleWordLibraryContent";
import { JungleWordLibraryFilters } from "./JungleWordLibraryFilters";
import { JungleAchievementPopup } from "./JungleAchievementPopup";
import { JungleCategorySelector } from "./JungleCategorySelector";
import { JungleVocabularyBuilder } from "./JungleVocabularyBuilder";
import { JungleAccessibilityPanel } from "./JungleAccessibilityPanel";
import { JungleFloatingActions } from "./JungleFloatingActions";

// Import enhanced services and hooks
import { useJungleGameState } from "@/hooks/useJungleGameState";
import { useJungleAudioService } from "@/hooks/useJungleAudioService";
import { useJungleWordFiltering } from "@/hooks/useJungleWordFiltering";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { useJungleAccessibility } from "@/hooks/useJungleAccessibility";
import { useJungleAnimations } from "@/hooks/useJungleAnimations";

// Import data and utilities
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";
import { jungleThemeConfig } from "@/lib/jungleThemeConfig";
import { enhancedAnalytics } from "@/lib/enhancedAnalytics";

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

type ViewMode = "categories" | "words" | "vocabulary" | "achievements" | "settings";
type WordViewMode = "grid" | "list" | "carousel" | "adventure";

export const JungleWordLibrary: React.FC<JungleWordLibraryProps> = ({
  onBack,
  userProfile = {},
  enableAdvancedFeatures = true,
  showMobileOptimizations = true,
  gameMode = "exploration",
  initialCategory = "all"
}) => {
  // Enhanced state management with custom hooks
  const {
    gameState,
    score,
    streak,
    jungleGems,
    sparkleSeeds,
    explorerBadges,
    masteredWords,
    favoriteWords,
    currentSession,
    updateScore,
    addJungleGems,
    masterWord,
    toggleFavorite,
    unlockAchievement,
    getPlayerStats,
    saveProgress,
    resetSession
  } = useJungleGameState();

  const {
    audioEnabled,
    playSound,
    pronounceWord,
    playAmbientSounds,
    stopAmbientSounds,
    setVolume,
    loadSoundPack,
    toggleAudio
  } = useJungleAudioService();

  const {
    isMobile,
    isTablet,
    isLandscape,
    screenSize,
    touchCapabilities,
    optimizeForMobile
  } = useMobileOptimization();

  const {
    accessibilitySettings,
    announceForScreenReader,
    handleKeyboardNavigation,
    updateAccessibilitySettings,
    getAccessibilityStatus
  } = useJungleAccessibility();

  const {
    animationsEnabled,
    createParticles,
    triggerCelebration,
    animateWordCard,
    animateTransition,
    clearAnimations
  } = useJungleAnimations();

  // Core state
  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [wordViewMode, setWordViewMode] = useState<WordViewMode>("adventure");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced word filtering with custom hook
  const {
    filteredWords,
    searchTerm,
    difficultyFilter,
    rarityFilter,
    masteryFilter,
    favoriteFilter,
    setSearchTerm,
    setDifficultyFilter,
    setRarityFilter,
    setMasteryFilter,
    setFavoriteFilter,
    clearAllFilters,
    hasActiveFilters,
    getFilterStats,
    getSuggestedTerms
  } = useJungleWordFiltering(currentWords, {
    masteredWords,
    favoriteWords,
    userProfile
  });

  // Refs for performance and accessibility
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Initialize component
  useEffect(() => {
    const initializeJungleLibrary = async () => {
      setIsLoading(true);
      
      try {
        // Load initial data
        await loadSoundPack("jungle-adventure");
        
        // Set initial words
        if (selectedCategory === "all") {
          setCurrentWords(wordsDatabase);
        } else {
          setCurrentWords(getWordsByCategory(selectedCategory));
        }

        // Start ambient sounds if enabled
        if (audioEnabled && !accessibilitySettings.reducedMotion) {
          playAmbientSounds("jungle-background");
        }

        // Track session start
        enhancedAnalytics.trackEvent("jungle_library_session_start", {
          gameMode,
          selectedCategory,
          userAge: userProfile.age,
          isMobile
        });

        // Announce for screen readers
        announceForScreenReader("Welcome to the Jungle Word Adventure! Explore amazing words in the jungle.");

      } catch (error) {
        console.error("Error initializing Jungle Word Library:", error);
        toast({
          title: "🌿 Adventure Loading",
          description: "Setting up your jungle adventure...",
          duration: 2000
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeJungleLibrary();

    // Cleanup on unmount
    return () => {
      stopAmbientSounds();
      saveProgress();
      enhancedAnalytics.trackEvent("jungle_library_session_end", {
        timeSpent: currentSession.duration,
        wordsReviewed: currentSession.wordsReviewed,
        achievementsUnlocked: currentSession.achievementsUnlocked
      });
    };
  }, []);

  // Update words when category changes
  useEffect(() => {
    const updateWordsForCategory = () => {
      if (selectedCategory === "all") {
        setCurrentWords(wordsDatabase);
      } else {
        setCurrentWords(getWordsByCategory(selectedCategory));
      }
      setCurrentWordIndex(0);
      
      // Trigger transition animation
      if (animationsEnabled) {
        animateTransition("category-switch");
      }
      
      // Play category selection sound
      playSound("category-select");
      
      // Track category selection
      enhancedAnalytics.trackEvent("category_selected", {
        category: selectedCategory,
        wordCount: currentWords.length
      });
    };

    updateWordsForCategory();
  }, [selectedCategory, animationsEnabled]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    // Announce category change for screen readers
    announceForScreenReader(`Exploring ${categoryId} category`);
    
    setSelectedCategory(categoryId);
    setViewMode("words");
    
    // Haptic feedback for mobile
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate([50]);
    }
    
    // Visual feedback
    if (animationsEnabled) {
      createParticles("category-select", { count: 6, emoji: "🌿" });
    }
  }, [isMobile, animationsEnabled, announceForScreenReader, createParticles]);

  // Handle word interaction
  const handleWordInteraction = useCallback((wordId: number, action: string, data?: any) => {
    const word = currentWords.find(w => w.id === wordId);
    if (!word) return;

    switch (action) {
      case "pronounce":
        pronounceWord(word.word, {
          speed: accessibilitySettings.speechRate || 1,
          voice: userProfile.interests?.includes("animals") ? "child-friendly" : "default"
        });
        break;
        
      case "master":
        const wasNewMastery = masterWord(wordId);
        if (wasNewMastery) {
          updateScore(25);
          addJungleGems(1);
          triggerCelebration("word-mastered");
          playSound("achievement");
          
          announceForScreenReader(`Congratulations! You mastered the word ${word.word}!`);
          
          // Check for achievements
          checkAchievements();
        }
        break;
        
      case "favorite":
        const isFavorited = toggleFavorite(wordId);
        playSound(isFavorited ? "heart-add" : "heart-remove");
        announceForScreenReader(`${word.word} ${isFavorited ? "added to" : "removed from"} favorites`);
        break;
        
      case "share":
        handleWordShare(word);
        break;
    }
    
    // Track interaction
    enhancedAnalytics.trackEvent("word_interaction", {
      wordId,
      word: word.word,
      action,
      category: selectedCategory,
      difficulty: word.difficulty,
      rarity: word.rarity
    });
  }, [currentWords, selectedCategory, accessibilitySettings, userProfile, masterWord, updateScore, addJungleGems, triggerCelebration, playSound, announceForScreenReader, toggleFavorite]);

  // Handle word navigation
  const handleWordNavigation = useCallback((direction: "prev" | "next" | "random") => {
    const maxIndex = filteredWords.length - 1;
    let newIndex = currentWordIndex;

    switch (direction) {
      case "prev":
        newIndex = currentWordIndex > 0 ? currentWordIndex - 1 : maxIndex;
        break;
      case "next":
        newIndex = currentWordIndex < maxIndex ? currentWordIndex + 1 : 0;
        break;
      case "random":
        newIndex = Math.floor(Math.random() * filteredWords.length);
        break;
    }

    if (newIndex !== currentWordIndex) {
      setCurrentWordIndex(newIndex);
      playSound("navigation");
      
      if (animationsEnabled) {
        animateWordCard(direction);
      }
      
      // Announce new word for screen readers
      const newWord = filteredWords[newIndex];
      if (newWord) {
        announceForScreenReader(`Now viewing: ${newWord.word}`);
      }
    }
  }, [currentWordIndex, filteredWords, playSound, animationsEnabled, animateWordCard, announceForScreenReader]);

  // Handle word sharing
  const handleWordShare = useCallback(async (word: Word) => {
    const shareData = {
      title: `Learn the word: ${word.word}`,
      text: `🌿 ${word.definition}\n\n${word.example ? `Example: ${word.example}` : ''}${word.funFact ? `\n\nFun fact: ${word.funFact}` : ''}`,
      url: window.location.href
    };

    try {
      if (navigator.share && isMobile) {
        await navigator.share(shareData);
        playSound("success");
      } else {
        await navigator.clipboard.writeText(shareData.text);
        toast({
          title: "📋 Copied to clipboard!",
          description: `Word "${word.word}" copied successfully`,
          duration: 2000
        });
        playSound("copy");
      }
      
      enhancedAnalytics.trackEvent("word_shared", {
        wordId: word.id,
        word: word.word,
        method: navigator.share ? "native" : "clipboard"
      });
    } catch (error) {
      console.error("Error sharing word:", error);
      toast({
        title: "❌ Share failed",
        description: "Couldn't share the word. Please try again.",
        duration: 2000
      });
    }
  }, [isMobile, playSound]);

  // Check for achievements
  const checkAchievements = useCallback(() => {
    const stats = getPlayerStats();
    const newAchievements: string[] = [];

    // Word mastery achievements
    if (stats.masteredWordsCount >= 1 && !explorerBadges.has("first-word")) {
      newAchievements.push("first-word");
    }
    if (stats.masteredWordsCount >= 10 && !explorerBadges.has("word-master")) {
      newAchievements.push("word-master");
    }
    if (stats.masteredWordsCount >= 25 && !explorerBadges.has("jungle-explorer")) {
      newAchievements.push("jungle-explorer");
    }

    // Streak achievements
    if (streak >= 5 && !explorerBadges.has("streak-starter")) {
      newAchievements.push("streak-starter");
    }
    if (streak >= 10 && !explorerBadges.has("streak-master")) {
      newAchievements.push("streak-master");
    }

    // Category completion achievements
    const categoryWords = getWordsByCategory(selectedCategory);
    const masteredInCategory = categoryWords.filter(w => masteredWords.has(w.id)).length;
    if (masteredInCategory === categoryWords.length && categoryWords.length > 0) {
      const achievementId = `category-${selectedCategory}`;
      if (!explorerBadges.has(achievementId)) {
        newAchievements.push(achievementId);
      }
    }

    // Unlock new achievements
    newAchievements.forEach(achievementId => {
      unlockAchievement(achievementId);
      setShowAchievements(true);
      triggerCelebration("achievement");
      playSound("achievement-unlock");
    });

    return newAchievements;
  }, [getPlayerStats, explorerBadges, streak, masteredWords, selectedCategory, unlockAchievement, triggerCelebration, playSound]);

  // Handle view mode changes
  const handleViewModeChange = useCallback((newViewMode: ViewMode) => {
    setViewMode(newViewMode);
    playSound("view-change");
    
    if (animationsEnabled) {
      animateTransition("view-change");
    }
    
    announceForScreenReader(`Switched to ${newViewMode} view`);
    
    enhancedAnalytics.trackEvent("view_mode_changed", {
      from: viewMode,
      to: newViewMode
    });
  }, [viewMode, playSound, animationsEnabled, animateTransition, announceForScreenReader]);

  // Get current word
  const getCurrentWord = useCallback(() => {
    return filteredWords[currentWordIndex] || null;
  }, [filteredWords, currentWordIndex]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!handleKeyboardNavigation(event)) return;

      switch (event.key) {
        case "ArrowLeft":
          if (wordViewMode === "carousel") {
            handleWordNavigation("prev");
          }
          break;
        case "ArrowRight":
          if (wordViewMode === "carousel") {
            handleWordNavigation("next");
          }
          break;
        case "Space":
          event.preventDefault();
          const currentWord = getCurrentWord();
          if (currentWord) {
            handleWordInteraction(currentWord.id, "pronounce");
          }
          break;
        case "Enter":
          const currentWordForMaster = getCurrentWord();
          if (currentWordForMaster) {
            handleWordInteraction(currentWordForMaster.id, "master");
          }
          break;
        case "f":
        case "F":
          const currentWordForFavorite = getCurrentWord();
          if (currentWordForFavorite) {
            handleWordInteraction(currentWordForFavorite.id, "favorite");
          }
          break;
        case "Escape":
          setShowFilters(false);
          setShowAchievements(false);
          setShowAccessibilityPanel(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [wordViewMode, handleWordNavigation, getCurrentWord, handleWordInteraction, handleKeyboardNavigation]);

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
        fontSize: accessibilitySettings.largeText ? "1.125rem" : "1rem"
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
      <JungleWordLibraryHeader
        ref={headerRef}
        viewMode={viewMode}
        selectedCategory={selectedCategory}
        currentWord={getCurrentWord()}
        gameStats={getPlayerStats()}
        onBack={onBack}
        onViewModeChange={handleViewModeChange}
        onToggleAudio={toggleAudio}
        onToggleAccessibility={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
        audioEnabled={audioEnabled}
        accessibilitySettings={accessibilitySettings}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Main Content */}
      <main
        ref={contentRef}
        className="relative"
        id="main-content"
        role="main"
        aria-label="Jungle Word Library main content"
      >
        <JungleWordLibraryContent
          viewMode={viewMode}
          wordViewMode={wordViewMode}
          selectedCategory={selectedCategory}
          currentWords={currentWords}
          filteredWords={filteredWords}
          currentWordIndex={currentWordIndex}
          onCategorySelect={handleCategorySelect}
          onWordInteraction={handleWordInteraction}
          onWordNavigation={handleWordNavigation}
          onViewModeChange={handleViewModeChange}
          gameStats={getPlayerStats()}
          userProfile={userProfile}
          accessibilitySettings={accessibilitySettings}
          isMobile={isMobile}
          isTablet={isTablet}
          enableAdvancedFeatures={enableAdvancedFeatures}
        />
      </main>

      {/* Filters Panel */}
      {(showFilters || (!isMobile && viewMode === "words")) && (
        <JungleWordLibraryFilters
          isOpen={showFilters}
          searchTerm={searchTerm}
          difficultyFilter={difficultyFilter}
          rarityFilter={rarityFilter}
          masteryFilter={masteryFilter}
          favoriteFilter={favoriteFilter}
          onSearchChange={setSearchTerm}
          onDifficultyChange={setDifficultyFilter}
          onRarityChange={setRarityFilter}
          onMasteryChange={setMasteryFilter}
          onFavoriteChange={setFavoriteFilter}
          onClearFilters={clearAllFilters}
          onClose={() => setShowFilters(false)}
          hasActiveFilters={hasActiveFilters()}
          filterStats={getFilterStats()}
          suggestedTerms={getSuggestedTerms()}
          accessibilitySettings={accessibilitySettings}
          isMobile={isMobile}
        />
      )}

      {/* Floating Actions */}
      <JungleFloatingActions
        viewMode={viewMode}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onRandomWord={() => handleWordNavigation("random")}
        onToggleAchievements={() => setShowAchievements(!showAchievements)}
        onToggleAccessibility={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
        hasActiveFilters={hasActiveFilters()}
        accessibilitySettings={accessibilitySettings}
        isMobile={isMobile}
        isTablet={isTablet}
      />

      {/* Achievement Popup */}
      <JungleAchievementPopup
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        recentAchievements={Array.from(explorerBadges).slice(-3)}
        gameStats={getPlayerStats()}
        accessibilitySettings={accessibilitySettings}
      />

      {/* Accessibility Panel */}
      <JungleAccessibilityPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
        accessibilitySettings={accessibilitySettings}
        onUpdateSettings={updateAccessibilitySettings}
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        gameStats={getPlayerStats()}
        isMobile={isMobile}
      />

      {/* Skip links for screen readers */}
      <div className="sr-only">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <a href="#navigation" className="skip-link">
          Skip to navigation
        </a>
      </div>
    </div>
  );
};

export default JungleWordLibrary;
