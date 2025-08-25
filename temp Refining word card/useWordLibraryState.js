// Shared state management hook for Word Library
import { useState, useEffect } from 'react';
import { wordsDatabase, getWordsByCategory } from '../data/wordsDatabase';
import { gameState } from '../lib/gameState';
import { audioService } from '../lib/audioService';

export const useWordLibraryState = () => {
  // View modes
  const [viewMode, setViewMode] = useState('categories'); // categories, words, vocabulary, minigame
  const [wordViewMode, setWordViewMode] = useState('grid'); // grid, list, carousel
  
  // Word data
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentWords, setCurrentWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Game states
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const [particles, setParticles] = useState([]);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Accessibility settings
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    autoPlay: true,
    soundEnabled: true
  });

  // Initialize mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load accessibility settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('jungleWordAdventure_accessibility');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAccessibilitySettings(prev => ({ ...prev, ...settings }));
        
        // Apply settings to audio service
        audioService.setSoundEnabled(settings.soundEnabled !== false);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  // Save accessibility settings
  const updateAccessibilitySettings = (newSettings) => {
    const updatedSettings = { ...accessibilitySettings, ...newSettings };
    setAccessibilitySettings(updatedSettings);
    localStorage.setItem('jungleWordAdventure_accessibility', JSON.stringify(updatedSettings));
    
    // Apply to audio service
    if ('soundEnabled' in newSettings) {
      audioService.setSoundEnabled(newSettings.soundEnabled);
    }
  };

  // Update current words when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      const categoryWords = getWordsByCategory(selectedCategory);
      setCurrentWords(categoryWords);
      setCurrentWordIndex(0);
      
      // Only switch to words view if we're not in a mini-game
      if (viewMode !== 'minigame') {
        setViewMode('words');
      }
    } else if (selectedCategory === 'all') {
      setCurrentWords(wordsDatabase);
      setCurrentWordIndex(0);
      if (viewMode !== 'minigame') {
        setViewMode('words');
      }
    }
  }, [selectedCategory, viewMode]);

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    // Check if category is unlocked
    if (!gameState.isCategoryUnlocked(categoryId) && categoryId !== 'all') {
      // Show unlock requirement popup
      setRewardData({
        type: 'category_locked',
        categoryId,
        message: 'Complete more words to unlock this jungle area!'
      });
      setShowRewardPopup(true);
      return;
    }

    setSelectedCategory(categoryId);
    gameState.currentCategory = categoryId;
    gameState.saveState();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
    
    // Sound effect
    audioService.playSound('click');
  };

  // Handle word navigation
  const handleWordNavigation = (direction) => {
    const maxIndex = currentWords.length - 1;
    let newIndex = currentWordIndex;

    if (direction === 'next' && currentWordIndex < maxIndex) {
      newIndex = currentWordIndex + 1;
    } else if (direction === 'prev' && currentWordIndex > 0) {
      newIndex = currentWordIndex - 1;
    } else if (direction === 'random') {
      newIndex = Math.floor(Math.random() * currentWords.length);
    }

    if (newIndex !== currentWordIndex) {
      setCurrentWordIndex(newIndex);
      audioService.playSound('whoosh');
      
      // Track word review
      if (currentWords[currentWordIndex]) {
        gameState.reviewWord(currentWords[currentWordIndex].id, true);
      }
    }
  };

  // Handle word mastery
  const handleWordMastery = (wordId, rating) => {
    const wasNewMastery = gameState.masterWord(wordId);
    
    if (wasNewMastery) {
      // Show reward
      setRewardData({
        type: 'word_mastered',
        wordId,
        gems: 1,
        points: 25
      });
      setShowRewardPopup(true);
      
      // Create particles
      createParticles('mastery');
      
      // Sound effect
      audioService.playSound('celebration');
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  };

  // Handle word favorite toggle
  const handleWordFavorite = (wordId) => {
    const isFavorited = gameState.toggleFavorite(wordId);
    
    // Sound effect
    audioService.playSound(isFavorited ? 'sparkle' : 'click');
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50]);
    }
    
    return isFavorited;
  };

  // Create particle effects
  const createParticles = (type = 'default') => {
    const particleCount = type === 'mastery' ? 8 : 4;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: Math.random(),
        emoji: type === 'mastery' ? ['✨', '🌟', '💎', '🎉'][Math.floor(Math.random() * 4)] : ['✨', '⭐'][Math.floor(Math.random() * 2)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1
      });
    }
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  };

  // Handle view mode changes
  const handleViewModeChange = (newViewMode) => {
    setViewMode(newViewMode);
    audioService.playSound('click');
  };

  // Handle word view mode changes
  const handleWordViewModeChange = (newWordViewMode) => {
    setWordViewMode(newWordViewMode);
    audioService.playSound('click');
  };

  // Get current word
  const getCurrentWord = () => {
    return currentWords[currentWordIndex] || null;
  };

  // Get game statistics
  const getGameStats = () => {
    return gameState.getStats();
  };

  return {
    // View states
    viewMode,
    wordViewMode,
    selectedCategory,
    currentWords,
    currentWordIndex,
    showFilters,
    showAccessibilityPanel,
    isLoading,
    
    // Game states
    showRewardPopup,
    rewardData,
    particles,
    
    // Device states
    isMobile,
    isTablet,
    
    // Settings
    accessibilitySettings,
    
    // Actions
    setViewMode: handleViewModeChange,
    setWordViewMode: handleWordViewModeChange,
    setSelectedCategory: handleCategorySelect,
    setCurrentWordIndex,
    setShowFilters,
    setShowAccessibilityPanel,
    setShowRewardPopup,
    updateAccessibilitySettings,
    
    // Word actions
    handleWordNavigation,
    handleWordMastery,
    handleWordFavorite,
    
    // Utilities
    getCurrentWord,
    getGameStats,
    createParticles,
    
    // Game state helpers
    isWordMastered: (wordId) => gameState.isWordMastered(wordId),
    isWordFavorited: (wordId) => gameState.isWordFavorited(wordId),
    isCategoryUnlocked: (categoryId) => gameState.isCategoryUnlocked(categoryId)
  };
};

