import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MoreVertical,
  TrendingUp,
  Calendar,
  Trophy,
  Target,
  Star,
  BookOpen,
  Zap,
  Heart,
  Edit3,
  Trash2,
  Eye,
  Play,
  Award,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  totalPoints: number;
  wordsLearned: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  favoriteCategory: string;
  interests: string[];
  parentConnection: string;
  createdAt: Date;
  lastActive?: Date;
  backgroundColor?: string;
  achievements: any[];
}

interface EnhancedChildProfileCardProps {
  child: ChildProfile;
  onSelect?: (child: ChildProfile) => void;
  onEdit?: (child: ChildProfile) => void;
  onDelete?: (child: ChildProfile) => void;
  onViewProgress?: (child: ChildProfile) => void;
  isSelected?: boolean;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
}

export function EnhancedChildProfileCard({
  child,
  onSelect,
  onEdit,
  onDelete,
  onViewProgress,
  isSelected = false,
  variant = "default",
  showActions = true,
}: EnhancedChildProfileCardProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const progressPercentage = Math.min(
    (child.weeklyProgress / child.weeklyGoal) * 100,
    100,
  );
  const levelProgress = ((child.totalPoints % 100) / 100) * 100;

  const getLastActiveText = () => {
    if (!child.lastActive) return "Never active";

    const now = new Date();
    const lastActive = new Date(child.lastActive);
    const diffInHours = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Active now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return lastActive.toLocaleDateString();
  };

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleCardClick = () => {
    handlePress();
    onSelect?.(child);
  };

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2",
          isSelected
            ? "border-purple-400 shadow-lg"
            : "border-gray-200 hover:border-purple-300",
          isPressed && "scale-95",
          child.backgroundColor && `bg-gradient-to-br ${child.backgroundColor}`,
        )}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center text-2xl">
                {child.avatar}
              </div>
              {child.currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {child.currentStreak}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {child.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{child.age} years</span>
                <span>•</span>
                <span>Level {child.level}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-purple-600">
                {child.wordsLearned} words
              </div>
              <div className="text-xs text-gray-500">{getLastActiveText()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card
        className={cn(
          "cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl border-2 overflow-hidden",
          isSelected
            ? "border-purple-400 shadow-xl ring-2 ring-purple-200"
            : "border-gray-200 hover:border-purple-300",
          isPressed && "scale-[0.98]",
        )}
        onClick={handleCardClick}
      >
        {/* Background gradient */}
        <div
          className={cn(
            "absolute inset-0 opacity-20",
            child.backgroundColor
              ? `bg-gradient-to-br ${child.backgroundColor}`
              : "bg-gradient-to-br from-purple-100 to-pink-100",
          )}
        />

        <CardContent className="relative p-6">
          {/* Header with avatar and actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-3xl ring-4 ring-white">
                  {child.avatar}
                </div>
                {child.currentStreak > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs font-bold text-white">
                      {child.currentStreak}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white text-xs px-2 py-0">
                    Lvl {child.level}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {child.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>{child.age} years old</span>
                  <span>•</span>
                  <span className="capitalize">{child.parentConnection}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{getLastActiveText()}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActionMenu(!showActionMenu);
                  }}
                  className="w-8 h-8 p-0 rounded-full hover:bg-white/50"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>

                {showActionMenu && (
                  <div className="absolute top-8 right-0 z-10 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewProgress?.(child);
                        setShowActionMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Progress
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(child);
                        setShowActionMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(child);
                        setShowActionMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Words Learned
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {child.wordsLearned}
              </div>
            </div>

            <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Points
                </span>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {child.totalPoints.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Weekly progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Weekly Goal
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {child.weeklyProgress} / {child.weeklyGoal}
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-2" />
              <div
                className="absolute top-0 left-0 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Interests */}
          {child.interests && child.interests.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-pink-600" />
                <span className="text-sm font-medium text-gray-700">
                  Interests
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {child.interests.slice(0, 4).map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="text-xs bg-white/60"
                  >
                    {interest}
                  </Badge>
                ))}
                {child.interests.length > 4 && (
                  <Badge variant="secondary" className="text-xs bg-white/60">
                    +{child.interests.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(child);
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewProgress?.(child);
              }}
              className="border-purple-200 hover:bg-purple-50"
            >
              <TrendingUp className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 overflow-hidden",
        isSelected
          ? "border-purple-400 shadow-lg ring-2 ring-purple-200"
          : "border-gray-200 hover:border-purple-300",
        isPressed && "scale-95",
      )}
      onClick={handleCardClick}
    >
      {/* Background */}
      <div
        className={cn(
          "absolute inset-0 opacity-30",
          child.backgroundColor
            ? `bg-gradient-to-br ${child.backgroundColor}`
            : "bg-gradient-to-br from-purple-100 to-pink-100",
        )}
      />

      <CardContent className="relative p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-2xl">
                {child.avatar}
              </div>
              {child.currentStreak > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {child.currentStreak}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-gray-800">{child.name}</h3>
              <p className="text-sm text-gray-600">
                {child.age} years • Level {child.level}
              </p>
            </div>
          </div>

          {showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActionMenu(!showActionMenu);
              }}
              className="w-8 h-8 p-0 rounded-full hover:bg-white/50"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="text-center bg-white/60 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">
              {child.wordsLearned}
            </div>
            <div className="text-xs text-gray-600">Words</div>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-2">
            <div className="text-lg font-bold text-yellow-600">
              {child.totalPoints}
            </div>
            <div className="text-xs text-gray-600">Points</div>
          </div>
          <div className="text-center bg-white/60 rounded-lg p-2">
            <div className="text-lg font-bold text-green-600">
              {child.currentStreak}
            </div>
            <div className="text-xs text-gray-600">Streak</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Weekly Progress</span>
            <span>
              {child.weeklyProgress}/{child.weeklyGoal}
            </span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-1.5" />
            <div
              className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Last active */}
        <div className="text-xs text-gray-500 text-center">
          {getLastActiveText()}
        </div>
      </CardContent>

      {/* Action menu overlay */}
      {showActionMenu && (
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <div className="bg-white rounded-lg p-2 space-y-1 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewProgress?.(child);
                setShowActionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Progress
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(child);
                setShowActionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 rounded flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(child);
                setShowActionMenu(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Mobile-optimized grid layout component
export function ChildProfileGrid({
  children,
  onSelect,
  onEdit,
  onDelete,
  onViewProgress,
  selectedChildId,
  variant = "default",
}: {
  children: ChildProfile[];
  onSelect?: (child: ChildProfile) => void;
  onEdit?: (child: ChildProfile) => void;
  onDelete?: (child: ChildProfile) => void;
  onViewProgress?: (child: ChildProfile) => void;
  selectedChildId?: string;
  variant?: "default" | "compact" | "detailed";
}) {
  if (children.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Children Added Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first child profile to start tracking their learning
            journey
          </p>
        </CardContent>
      </Card>
    );
  }

  const gridClassName =
    variant === "compact"
      ? "grid gap-3"
      : variant === "detailed"
        ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        : "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={gridClassName}>
      {children.map((child, index) => (
        <div
          key={child.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <EnhancedChildProfileCard
            child={child}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewProgress={onViewProgress}
            isSelected={selectedChildId === child.id}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
}
