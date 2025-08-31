import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CategoryTile, Category } from "./CategoryTile";
import { useReward } from "@/contexts/RewardContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  RotateCcw,
  Star,
  Lock,
  CheckCircle,
  Play,
  Trophy,
} from "lucide-react";

interface CategoryGridProps {
  categories: Category[];
  onCategorySelect: (category: Category) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  showFilters?: boolean;
  selectedFilters?: string[];
  onFiltersChange?: (filters: string[]) => void;
  userProgress?: {
    masteredWords: Set<number>;
    favoriteCategories: Set<string>;
  };
  className?: string;
  reducedMotion?: boolean;
  tileSize?: "sm" | "md" | "lg";
  // Age-appropriate settings
  ageGroup?: "3-5" | "6-8" | "9-12";
  showDifficulty?: boolean;
  showProgress?: boolean;
  maxCategories?: number;
  // Overall learning journey progress (moved here from ExplorerShell footer)
  progress?: {
    current: number;
    total: number;
  };
}

type FilterType =
  | "all"
  | "recommended"
  | "locked"
  | "completed"
  | "in-progress"
  | "favorites";

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategorySelect,
  searchQuery = "",
  onSearchChange,
  viewMode = "grid",
  onViewModeChange,
  showFilters = true,
  selectedFilters = [],
  onFiltersChange,
  userProgress,
  className,
  reducedMotion = false,
  tileSize = "md",
  ageGroup = "6-8",
  showDifficulty = true,
  showProgress = true,
  maxCategories,
  progress,
}) => {
  const { showReward } = useReward();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Filter and search logic
  const filteredCategories = useMemo(() => {
    let filtered = [...categories];

    // Apply search filter
    if (localSearch.trim()) {
      const query = localSearch.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.description?.toLowerCase().includes(query) ||
          category.id.toLowerCase().includes(query),
      );
    }

    // Apply active filter
    switch (activeFilter) {
      case "recommended":
        filtered = filtered.filter((cat) => cat.recommended);
        break;
      case "locked":
        filtered = filtered.filter((cat) => cat.locked);
        break;
      case "completed":
        filtered = filtered.filter((cat) => cat.completed);
        break;
      case "in-progress":
        filtered = filtered.filter((cat) => cat.inProgress && !cat.completed);
        break;
      case "favorites":
        filtered = filtered.filter((cat) =>
          userProgress?.favoriteCategories?.has(cat.id),
        );
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    // Apply additional filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter((cat) => {
        if (selectedFilters.includes("beginner") && cat.difficultyMix) {
          const total =
            cat.difficultyMix.easy +
            cat.difficultyMix.medium +
            cat.difficultyMix.hard;
          return total > 0 && cat.difficultyMix.easy / total > 0.7;
        }
        if (selectedFilters.includes("advanced") && cat.difficultyMix) {
          const total =
            cat.difficultyMix.easy +
            cat.difficultyMix.medium +
            cat.difficultyMix.hard;
          return total > 0 && cat.difficultyMix.hard / total > 0.3;
        }
        return true;
      });
    }

    // Sort by priority: recommended first, then by completion status
    filtered.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      if (a.locked && !b.locked) return 1;
      if (!a.locked && b.locked) return -1;
      return a.name.localeCompare(b.name);
    });

    // Limit categories if specified
    if (maxCategories && filtered.length > maxCategories) {
      filtered = filtered.slice(0, maxCategories);
    }

    return filtered;
  }, [
    categories,
    localSearch,
    activeFilter,
    selectedFilters,
    userProgress,
    maxCategories,
  ]);

  // Handle category selection with rewards
  const handleCategorySelect = useCallback(
    (category: Category) => {
      if (category.locked) {
        showReward({
          title: "Category Locked! 🔒",
          message: `Complete more words to unlock ${category.name}`,
          icon: "🔒",
          type: "category",
        });
        return;
      }

      // Show encouraging message for new categories
      if (!category.inProgress && !category.completed) {
        showReward({
          title: "New Adventure! 🌟",
          message: `Welcome to ${category.name} - let's learn together!`,
          icon: category.emoji,
          type: "category",
        });
      }

      onCategorySelect(category);
    },
    [onCategorySelect, showReward],
  );

  // Handle search changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      onSearchChange?.(value);
    },
    [onSearchChange],
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setActiveFilter("all");
    setLocalSearch("");
    onSearchChange?.("");
    onFiltersChange?.([]);
  }, [onSearchChange, onFiltersChange]);

  // Get filter counts
  const getFilterCounts = useMemo(() => {
    return {
      all: categories.length,
      recommended: categories.filter((cat) => cat.recommended).length,
      locked: categories.filter((cat) => cat.locked).length,
      completed: categories.filter((cat) => cat.completed).length,
      "in-progress": categories.filter(
        (cat) => cat.inProgress && !cat.completed,
      ).length,
      favorites: categories.filter((cat) =>
        userProgress?.favoriteCategories?.has(cat.id),
      ).length,
    };
  }, [categories, userProgress]);

  // Grid layout classes
  const getGridClasses = () => {
    if (viewMode === "list") {
      return "flex flex-col gap-3";
    }

    switch (tileSize) {
      case "sm":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-items-center";
      case "lg":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 justify-items-center";
    }
  };

  const filterButtons: {
    key: FilterType;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: "all", label: "All", icon: <Grid3X3 className="w-3 h-3" /> },
    {
      key: "recommended",
      label: "For You",
      icon: <Star className="w-3 h-3" />,
    },
    {
      key: "in-progress",
      label: "Continue",
      icon: <Play className="w-3 h-3" />,
    },
    {
      key: "completed",
      label: "Completed",
      icon: <Trophy className="w-3 h-3" />,
    },
    { key: "locked", label: "Locked", icon: <Lock className="w-3 h-3" /> },
  ];

  if (
    userProgress?.favoriteCategories &&
    userProgress.favoriteCategories.size > 0
  ) {
    filterButtons.splice(-1, 0, {
      key: "favorites",
      label: "Favorites",
      icon: <Star className="w-3 h-3 fill-current" />,
    });
  }

  // Calculate overall progress percent for themed progress bar
  const progressPercent = useMemo(() => {
    if (!progress) return 0;
    const pct = (progress.current / Math.max(progress.total || 1, 1)) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [progress?.current, progress?.total]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters Header */}
      {(onSearchChange || showFilters) && (
        <div className="space-y-3">
          {/* Search Bar */}
          {onSearchChange && (
            <div className="relative max-w-md mx-auto md:max-w-none md:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search categories..."
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 rounded-full border-2 focus:border-green-400"
                aria-label="Search categories"
              />
              {localSearch && (
                <Button
                  onClick={() => handleSearchChange("")}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-6 h-6 p-0"
                  aria-label="Clear search"
                >
                  ✕
                </Button>
              )}
            </div>
          )}

          {/* Filter Buttons */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              {filterButtons.map(({ key, label, icon }) => {
                const count = getFilterCounts[key];
                const isActive = activeFilter === key;

                if (count === 0 && key !== "all") return null;

                return (
                  <Button
                    key={key}
                    onClick={() => setActiveFilter(key)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "rounded-full transition-all duration-200",
                      isActive && "shadow-md scale-105",
                    )}
                    aria-label={`Filter by ${label}`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-center gap-1">
                      {icon}
                      <span>{label}</span>
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 min-w-5 text-xs bg-white/20"
                        >
                          {count}
                        </Badge>
                      )}
                    </div>
                  </Button>
                );
              })}

              {/* Clear Filters */}
              {(activeFilter !== "all" || localSearch) && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  aria-label="Clear all filters"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex justify-center md:justify-end">
              <div className="flex border border-gray-200 rounded-full p-1 bg-white">
                <Button
                  onClick={() => onViewModeChange("grid")}
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onViewModeChange("list")}
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      {(localSearch || activeFilter !== "all") && (
        <div className="text-center text-sm text-gray-600">
          {filteredCategories.length === 0 ? (
            <div className="py-8">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium">No categories found</p>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <p>
              Showing {filteredCategories.length} of {categories.length}{" "}
              categories
              {localSearch && ` for "${localSearch}"`}
            </p>
          )}
        </div>
      )}

      {/* Categories Grid */}
      <AnimatePresence mode="wait">
        {filteredCategories.length > 0 ? (
          <motion.div
            key={`${viewMode}-${activeFilter}-${localSearch}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={getGridClasses()}
          >
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3,
                  delay: reducedMotion ? 0 : Math.min(index * 0.05, 0.3),
                }}
              >
                <CategoryTile
                  category={category}
                  onClick={handleCategorySelect}
                  reducedMotion={reducedMotion}
                  size={tileSize}
                  className={cn(
                    viewMode === "list" && "w-full max-w-md mx-auto",
                  )}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          filteredCategories.length === 0 &&
          categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🌿</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No categories match your search
              </h3>
              <p className="text-gray-500 mb-4">
                Try a different search term or clear your filters
              </p>
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="rounded-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Clear filters
              </Button>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No categories available
          </h3>
          <p className="text-gray-500">
            Categories will appear here once they're loaded
          </p>
        </div>
      )}

      {/* Quick Stats Footer */}
      {categories.length > 0 && (
        <div className="jungle-progress-container">
          {/* Jungle quick stats - playful badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 jungle-achievements-grid">
            <div className="jungle-achievement-item">
              <div className="jungle-achievement-icon">🌿</div>
              <div className="achievement-content">
                <div className="font-bold text-jungle-green text-sm">Completed</div>
                <div className="font-bold text-sunshine-yellow text-lg">{getFilterCounts.completed}</div>
              </div>
            </div>
            <div className="jungle-achievement-item">
              <div className="jungle-achievement-icon">🧭</div>
              <div className="achievement-content">
                <div className="font-bold text-jungle-green text-sm">In Progress</div>
                <div className="font-bold text-sunshine-yellow text-lg">{getFilterCounts["in-progress"]}</div>
              </div>
            </div>
            <div className="jungle-achievement-item">
              <div className="jungle-achievement-icon">⭐</div>
              <div className="achievement-content">
                <div className="font-bold text-jungle-green text-sm">Recommended</div>
                <div className="font-bold text-sunshine-yellow text-lg">{getFilterCounts.recommended}</div>
              </div>
            </div>
          </div>

          {/* Learning Journey Progress (immersive jungle style) */}
          {progress && (
            <div className="mt-3 w-full max-w-3xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1">
                <span className="text-sm sm:text-base font-semibold text-emerald-800 flex items-center gap-1">
                  <span className="select-none">🌿</span> Learning Journey
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-900">
                  {progress.current} of {progress.total} completed
                </span>
              </div>
              <div className="relative h-3 sm:h-3.5 bg-emerald-200 rounded-full overflow-hidden border border-emerald-400">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-400 via-green-500 to-emerald-600 rounded-full relative overflow-hidden"
                  aria-label="Learning journey progress"
                >
                  {/* Vine pattern overlay */}
                  <div className="absolute inset-0 opacity-30">
                    <div
                      className="h-full w-full bg-repeat-x bg-center"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg width='20' height='12' viewBox='0 0 20 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 6c2-2 4-2 6 0s4 2 6 0' stroke='%23ffffff' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
                      }}
                    />
                  </div>
                </motion.div>
                {/* Floating leaf marker */}
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: -6 }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-1/2 -translate-y-1/2 text-base sm:text-lg drop-shadow-md"
                  style={{ left: `calc(${progressPercent}% - 10px)` }}
                  aria-hidden
                >
                  🍃
                </motion.div>
              </div>
              {/* Milestone gems */}
              <div className="flex justify-between text-emerald-700 text-[10px] sm:text-xs mt-1 px-0.5">
                {[0,25,50,75,100].map((m) => (
                  <span key={m} className="opacity-70 select-none">{m}%</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryGrid;
