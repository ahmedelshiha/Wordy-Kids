import React, { useEffect, useRef } from 'react';
import { useWordLibraryState } from './hooks/useWordLibraryState';
import { useWordFiltering } from './hooks/useWordFiltering';
import { WordLibraryHeader } from './components/WordLibraryHeader';
import { WordLibraryAccessibilityPanel } from './components/WordLibraryAccessibilityPanel';
import { WordLibrarySearchFilters } from './components/WordLibrarySearchFilters';
import { WordLibraryContent } from './components/WordLibraryContent';
import { WordLibraryViewSwitcher } from './components/WordLibraryViewSwitcher';
import { WordLibraryFloatingActions } from './components/WordLibraryFloatingActions';
import { RewardPopup } from './components/RewardPopup';
import { audioService } from './lib/audioService';
import './App.css';

function App() {
  // Main state management
  const {
    viewMode,
    wordViewMode,
    selectedCategory,
    currentWords,
    currentWordIndex,
    showFilters,
    showAccessibilityPanel,
    showRewardPopup,
    rewardData,
    particles,
    isMobile,
    isTablet,
    accessibilitySettings,
    setViewMode,
    setWordViewMode,
    setSelectedCategory,
    setCurrentWordIndex,
    setShowFilters,
    setShowAccessibilityPanel,
    setShowRewardPopup,
    updateAccessibilitySettings,
    handleWordNavigation,
    handleWordMastery,
    handleWordFavorite,
    isWordMastered,
    isWordFavorited,
    isCategoryUnlocked,
    getGameStats
  } = useWordLibraryState();

  // Word filtering
  const {
    searchTerm,
    difficultyFilter,
    rarityFilter,
    filteredWords,
    setSearchTerm,
    setDifficultyFilter,
    setRarityFilter,
    clearAllFilters,
    hasActiveFilters,
    getFilterStats
  } = useWordFiltering(currentWords);

  // Refs
  const mainContentRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    if (accessibilitySettings.soundEnabled) {
      audioService.setSoundEnabled(true);
      // Play a subtle welcome sound
      setTimeout(() => {
        audioService.playSound('sparkle');
      }, 500);
    }
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (viewMode === 'words' && wordViewMode === 'carousel') {
        if (e.key === 'ArrowLeft') {
          handleWordNavigation('prev');
        } else if (e.key === 'ArrowRight') {
          handleWordNavigation('next');
        }
      }
      
      // Accessibility shortcuts
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
        setShowAccessibilityPanel(prev => !prev);
      } else if (e.key === 's' && !e.ctrlKey && !e.metaKey) {
        updateAccessibilitySettings({ soundEnabled: !accessibilitySettings.soundEnabled });
      } else if (e.key === 'Escape') {
        setShowAccessibilityPanel(false);
        setShowFilters(false);
        setShowRewardPopup(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, wordViewMode, currentWordIndex, filteredWords.length]);

  // Handle scroll to top
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle random word
  const handleRandomWord = () => {
    if (filteredWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredWords.length);
      setCurrentWordIndex(randomIndex);
      audioService.playSound('whoosh');
    }
  };

  // Handle vocabulary builder
  const handleVocabularyBuilder = () => {
    setViewMode('vocabulary');
    audioService.playSound('click');
  };

  // Handle sound toggle
  const handleToggleSound = () => {
    const newSoundEnabled = !accessibilitySettings.soundEnabled;
    updateAccessibilitySettings({ soundEnabled: newSoundEnabled });
    
    if (newSoundEnabled) {
      audioService.playSound('click');
    }
  };

  // Get current game stats
  const gameStats = getGameStats();

  return (
    <div className={`min-h-screen ${
      accessibilitySettings.highContrast ? 'bg-black text-white' : 'bg-gradient-to-br from-green-50 to-emerald-50'
    }`}>
      {/* Floating particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed text-2xl animate-ping pointer-events-none z-10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      {/* Header */}
      <WordLibraryHeader
        viewMode={viewMode}
        selectedCategory={selectedCategory}
        gameStats={gameStats}
        isMobile={isMobile}
        accessibilitySettings={accessibilitySettings}
        onToggleAccessibility={() => setShowAccessibilityPanel(prev => !prev)}
        onToggleSound={handleToggleSound}
      />
      
      {/* Main content */}
      <main 
        ref={mainContentRef}
        className={`container mx-auto px-4 py-6 ${
          accessibilitySettings.largeText ? 'text-lg' : ''
        }`}
      >
        {/* View switcher (desktop) */}
        {!isMobile && (
          <WordLibraryViewSwitcher
            viewMode={viewMode}
            wordViewMode={wordViewMode}
            onViewModeChange={setViewMode}
            onWordViewModeChange={setWordViewMode}
            accessibilitySettings={accessibilitySettings}
            isMobile={isMobile}
          />
        )}
        
        {/* Search filters */}
        {viewMode === 'words' && (showFilters || !isMobile) && (
          <div className="mb-6">
            <WordLibrarySearchFilters
              isOpen={showFilters || !isMobile}
              onClose={() => setShowFilters(false)}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              difficultyFilter={difficultyFilter}
              onDifficultyChange={setDifficultyFilter}
              rarityFilter={rarityFilter}
              onRarityChange={setRarityFilter}
              filteredWordsCount={filteredWords.length}
              totalWordsCount={currentWords.length}
              onRandomWord={handleRandomWord}
              onVocabularyBuilder={handleVocabularyBuilder}
              onClearFilters={clearAllFilters}
              hasActiveFilters={hasActiveFilters()}
              accessibilitySettings={accessibilitySettings}
              isMobile={isMobile}
            />
          </div>
        )}
        
        {/* Main content area */}
        <WordLibraryContent
          viewMode={viewMode}
          wordViewMode={wordViewMode}
          selectedCategory={selectedCategory}
          filteredWords={filteredWords}
          currentWordIndex={currentWordIndex}
          onCategorySelect={setSelectedCategory}
          onWordNavigation={handleWordNavigation}
          onWordMastery={handleWordMastery}
          onWordFavorite={handleWordFavorite}
          onWordShare={() => {}}
          onViewModeChange={setViewMode}
          isWordMastered={isWordMastered}
          isWordFavorited={isWordFavorited}
          isCategoryUnlocked={isCategoryUnlocked}
          accessibilitySettings={accessibilitySettings}
          gameStats={gameStats}
          isMobile={isMobile}
        />
      </main>
      
      {/* Floating action buttons */}
      {viewMode === 'words' && (
        <WordLibraryFloatingActions
          onToggleFilters={() => setShowFilters(prev => !prev)}
          onRandomWord={handleRandomWord}
          onVocabularyBuilder={handleVocabularyBuilder}
          onScrollToTop={handleScrollToTop}
          onToggleSound={handleToggleSound}
          accessibilitySettings={accessibilitySettings}
          showScrollToTop={true}
          isMobile={isMobile}
        />
      )}
      
      {/* View switcher (mobile) */}
      {isMobile && (
        <WordLibraryViewSwitcher
          viewMode={viewMode}
          wordViewMode={wordViewMode}
          onViewModeChange={setViewMode}
          onWordViewModeChange={setWordViewMode}
          accessibilitySettings={accessibilitySettings}
          isMobile={isMobile}
        />
      )}
      
      {/* Accessibility panel */}
      <WordLibraryAccessibilityPanel
        isOpen={showAccessibilityPanel}
        onClose={() => setShowAccessibilityPanel(false)}
        accessibilitySettings={accessibilitySettings}
        onUpdateSettings={updateAccessibilitySettings}
        isMobile={isMobile}
      />
      
      {/* Reward popup */}
      <RewardPopup
        isOpen={showRewardPopup}
        onClose={() => setShowRewardPopup(false)}
        rewardData={rewardData}
        accessibilitySettings={accessibilitySettings}
      />
      
      {/* Skip link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-500 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
    </div>
  );
}

export default App;

