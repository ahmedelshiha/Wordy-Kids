import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  ChevronLeft,
  Filter,
  Sparkles,
  Star,
  BookOpen,
  Zap,
  Volume2,
  X,
  Menu,
  Grid3X3,
  List,
} from "lucide-react";
import { wordsDatabase, getWordsByCategory } from "@/data/wordsDatabase";

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  wordCount: number;
  description: string;
  difficulty: string;
}

interface EnhancedMobileWordLibraryHeaderProps {
  title?: string;
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  onBack?: () => void;
  onSearch?: (searchTerm: string) => void;
  onViewModeToggle?: () => void;
  viewMode?: "grid" | "list";
  showQuickCategories?: boolean;
  showSearch?: boolean;
  showStats?: boolean;
  totalWords?: number;
  completedWords?: number;
  streakDays?: number;
  className?: string;
  highContrastMode?: boolean;
  reducedMotion?: boolean;
  largeTextMode?: boolean;
}

// Enhanced categories with jungle adventure theme
const adventureCategories: Category[] = [
  {
    id: "animals",
    name: "Jungle Animals",
    icon: "🦁",
    color: "jungle",
    gradient: "from-jungle to-jungle-light",
    wordCount: getWordsByCategory("animals").length,
    description: "Meet amazing jungle creatures",
    difficulty: "Easy",
  },
  {
    id: "food",
    name: "Tropical Food",
    icon: "🥭",
    color: "sunshine",
    gradient: "from-sunshine to-sunshine-light",
    wordCount: getWordsByCategory("food").length,
    description: "Delicious jungle treats",
    difficulty: "Easy",
  },
  {
    id: "nature",
    name: "Nature Explorer",
    icon: "🌿",
    color: "jungle",
    gradient: "from-jungle-light to-jungle",
    wordCount: getWordsByCategory("nature").length,
    description: "Discover jungle wonders",
    difficulty: "Medium",
  },
  {
    id: "colors",
    name: "Rainbow Colors",
    icon: "🌈",
    color: "educational-purple",
    gradient: "from-educational-purple to-educational-purple-light",
    wordCount: getWordsByCategory("colors").length,
    description: "Paint the jungle with colors",
    difficulty: "Easy",
  },
  {
    id: "shapes",
    name: "Magic Shapes",
    icon: "⭐",
    color: "educational-blue",
    gradient: "from-educational-blue to-educational-blue-light",
    wordCount: getWordsByCategory("shapes").length,
    description: "Geometric jungle patterns",
    difficulty: "Easy",
  },
  {
    id: "family",
    name: "Jungle Family",
    icon: "👨‍👩‍👧‍👦",
    color: "educational-pink",
    gradient: "from-educational-pink to-educational-pink-light",
    wordCount: getWordsByCategory("family").length,
    description: "Meet the jungle family",
    difficulty: "Easy",
  },
  {
    id: "emotions",
    name: "Adventure Feelings",
    icon: "😊",
    color: "educational-orange",
    gradient: "from-educational-orange to-educational-orange-light",
    wordCount: getWordsByCategory("emotions").length,
    description: "Express jungle emotions",
    difficulty: "Medium",
  },
  {
    id: "transportation",
    name: "Jungle Journey",
    icon: "🚁",
    color: "sky",
    gradient: "from-sky to-sky-light",
    wordCount: getWordsByCategory("transportation").length,
    description: "Travel through the jungle",
    difficulty: "Medium",
  },
];

export const EnhancedMobileWordLibraryHeader: React.FC<
  EnhancedMobileWordLibraryHeaderProps
> = ({
  title = "🌿 Jungle Word Adventure Library 🦋",
  selectedCategory,
  onCategorySelect,
  onBack,
  onSearch,
  onViewModeToggle,
  viewMode = "grid",
  showQuickCategories = true,
  showSearch = true,
  showStats = true,
  totalWords = wordsDatabase.length,
  completedWords = 0,
  streakDays = 0,
  className,
  highContrastMode = false,
  reducedMotion = false,
  largeTextMode = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  // Handle category selection with haptic feedback
  const handleCategorySelect = (categoryId: string) => {
    // Haptic feedback for category selection
    if (navigator.vibrate) {
      navigator.vibrate([50, 30, 50]);
    }

    onCategorySelect?.(categoryId);

    // Auto-scroll to show selected category
    if (categoryScrollRef.current) {
      const selectedElement = categoryScrollRef.current.querySelector(
        `[data-category="${categoryId}"]`,
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  // Expand search on focus
  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  // Collapse search on blur (if empty)
  const handleSearchBlur = () => {
    if (!searchTerm) {
      setIsSearchExpanded(false);
    }
  };

  // Calculate progress percentage
  const progressPercentage = totalWords > 0 ? (completedWords / totalWords) * 100 : 0;

  return (
    <div
      className={cn(
        "relative bg-gradient-to-br from-jungle via-jungle-light to-sunshine",
        "border-b border-white/20 shadow-xl overflow-hidden",
        className,
      )}
    >
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
      
      {/* Floating Jungle Elements */}
      <div className="absolute top-4 right-4 text-2xl animate-gentle-emoji-float opacity-30">
        🦋
      </div>
      <div className="absolute bottom-4 left-4 text-lg animate-gentle-emoji-float opacity-25" style={{ animationDelay: "1s" }}>
        🌿
      </div>

      <div className="relative z-10 p-4 pb-2">
        {/* Top Row: Back Button, Title, Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {onBack && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBack}
                className="min-h-[44px] min-w-[44px] p-0 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <h1
                className={cn(
                  "font-bold leading-tight text-white drop-shadow-md",
                  largeTextMode ? "text-xl" : "text-lg",
                  highContrastMode && "text-white",
                )}
              >
                {title}
              </h1>
              
              {showStats && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 backdrop-blur-sm border border-white/30">
                    🌳 {totalWords} Words
                  </Badge>
                  <Badge className="bg-white/20 text-white text-xs px-2 py-0.5 backdrop-blur-sm border border-white/30">
                    ⭐ {completedWords} Learned
                  </Badge>
                  {streakDays > 0 && (
                    <Badge className="bg-sunshine/80 text-jungle-dark text-xs px-2 py-0.5 backdrop-blur-sm border border-sunshine/50 animate-gentle-bounce">
                      🔥 {streakDays} Days
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewModeToggle && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onViewModeToggle}
                className="min-h-[44px] min-w-[44px] p-0 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
              >
                {viewMode === "grid" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="min-h-[44px] min-w-[44px] p-0 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {showStats && progressPercentage > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-white/90 text-xs mb-1">
              <span>Learning Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-sunshine to-sunshine-light rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: reducedMotion ? 0 : 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Search Bar */}
        {showSearch && (
          <motion.div
            className="mb-4"
            initial={false}
            animate={{
              scale: isSearchExpanded ? 1.02 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="🔍 Search jungle adventures..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={cn(
                  "pl-12 pr-12 py-3 rounded-2xl border-2 transition-all duration-300",
                  "bg-white/90 backdrop-blur-md text-jungle-dark placeholder:text-jungle/60",
                  "border-white/50 focus:border-white focus:ring-2 focus:ring-white/30",
                  isSearchExpanded && "shadow-2xl bg-white",
                  highContrastMode && "bg-black text-white border-white",
                )}
                aria-label="Search jungle categories and words"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-jungle/60" />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleSearch("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-jungle/10 text-jungle/60"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Categories Selection */}
        {showQuickCategories && (
          <div className="mb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Quick Adventure Paths
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategorySelect("")}
                className="text-white/80 hover:text-white text-xs h-auto py-1 px-2 hover:bg-white/10"
              >
                View All
              </Button>
            </div>

            {/* Scrollable Categories Container */}
            <div className="relative">
              {/* Premium Container with Glass Morphism */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Gradient Fade Edges */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-jungle/30 via-jungle/15 to-transparent z-20 pointer-events-none rounded-l-2xl" />
                <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-sunshine/30 via-sunshine/15 to-transparent z-20 pointer-events-none rounded-r-2xl" />

                {/* Scroll Indicators */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse shadow-md" />
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 pointer-events-none">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse shadow-md" style={{ animationDelay: "0.5s" }} />
                </div>

                {/* Categories Scroll Container */}
                <div
                  ref={categoryScrollRef}
                  className="flex gap-3 overflow-x-auto overflow-y-hidden py-4 px-6 scroll-smooth scrollbar-none"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {adventureCategories.map((category, index) => (
                    <Button
                      key={category.id}
                      data-category={category.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCategorySelect(category.id)}
                      className={cn(
                        "flex-shrink-0 h-20 w-20 flex-col gap-1 transition-all duration-300 group relative",
                        "border-2 backdrop-blur-sm shadow-lg hover:shadow-xl",
                        selectedCategory === category.id
                          ? "bg-white/30 hover:bg-white/40 text-white border-white/70 scale-110 shadow-2xl"
                          : "bg-white/15 hover:bg-white/25 text-white border-white/40 hover:border-white/60 hover:scale-105",
                      )}
                      style={{
                        animationDelay: `${index * 75}ms`,
                      }}
                    >
                      {/* Premium Selection Indicator */}
                      {selectedCategory === category.id && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 bg-sunshine rounded-full shadow-lg border-2 border-white flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <Star className="w-2 h-2 text-white" />
                        </motion.div>
                      )}

                      {/* Category Icon */}
                      <span
                        className={cn(
                          "text-2xl drop-shadow-md transition-transform duration-300",
                          selectedCategory === category.id
                            ? "scale-110"
                            : "group-hover:scale-105",
                        )}
                      >
                        {category.icon}
                      </span>

                      {/* Category Name */}
                      <span className="text-xs font-bold text-center leading-tight drop-shadow-sm tracking-wide">
                        {category.name.split(" ")[0]}
                      </span>

                      {/* Word Count Badge */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-white/80 text-jungle-dark text-xs px-1.5 py-0.5 font-semibold border border-white/50 shadow-sm">
                          {category.wordCount}
                        </Badge>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    </Button>
                  ))}
                </div>

                {/* Premium Bottom Shine Effect */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export default EnhancedMobileWordLibraryHeader;
