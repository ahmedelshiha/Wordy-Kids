import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  Target,
  BookOpen,
  Zap,
  Heart,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  Gift,
  Lock,
  Check,
} from "lucide-react";
import { audioService } from "@/lib/audioService";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "learning" | "streak" | "quiz" | "exploration" | "social";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: "avatar_accessory" | "theme" | "sound_effect" | "title" | "points";
    item: string;
    value?: number;
  };
}

interface UnlockableContent {
  id: string;
  name: string;
  type:
    | "avatar_hat"
    | "avatar_accessory"
    | "background_theme"
    | "sound_pack"
    | "special_effect";
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedBy?: string; // achievement id
  previewUrl?: string;
}

const achievements: Achievement[] = [
  {
    id: "first_word",
    name: "First Step",
    description: "Learn your very first word!",
    icon: "🎯",
    category: "learning",
    difficulty: "bronze",
    requirements: 1,
    currentProgress: 1,
    unlocked: true,
    dateUnlocked: new Date(),
    reward: { type: "avatar_accessory", item: "Beginner Badge" },
  },
  {
    id: "word_collector",
    name: "Word Collector",
    description: "Learn 10 words to start your collection!",
    icon: "📚",
    category: "learning",
    difficulty: "bronze",
    requirements: 10,
    currentProgress: 7,
    unlocked: false,
    reward: { type: "avatar_accessory", item: "Scholar Cap" },
  },
  {
    id: "vocabulary_master",
    name: "Vocabulary Master",
    description: "Amazing! You've learned 50 words!",
    icon: "🏆",
    category: "learning",
    difficulty: "gold",
    requirements: 50,
    currentProgress: 7,
    unlocked: false,
    reward: { type: "theme", item: "Golden Theme" },
  },
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Keep learning for 3 days in a row!",
    icon: "🔥",
    category: "streak",
    difficulty: "bronze",
    requirements: 3,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "sound_effect", item: "Fire Trail" },
  },
  {
    id: "dedication_champion",
    name: "Dedication Champion",
    description: "Incredible! 30 days of learning!",
    icon: "👑",
    category: "streak",
    difficulty: "diamond",
    requirements: 30,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "title", item: "Learning Champion" },
  },
  {
    id: "quiz_ace",
    name: "Quiz Ace",
    description: "Score 100% on 5 quizzes!",
    icon: "🧠",
    category: "quiz",
    difficulty: "silver",
    requirements: 5,
    currentProgress: 2,
    unlocked: false,
    reward: { type: "sound_effect", item: "Success Fanfare" },
  },
  {
    id: "category_explorer",
    name: "Category Explorer",
    description: "Explore 5 different word categories!",
    icon: "🗺️",
    category: "exploration",
    difficulty: "silver",
    requirements: 5,
    currentProgress: 3,
    unlocked: false,
    reward: { type: "avatar_accessory", item: "Explorer Badge" },
  },
  {
    id: "pronunciation_pro",
    name: "Pronunciation Pro",
    description: "Listen to 25 word pronunciations!",
    icon: "🔊",
    category: "learning",
    difficulty: "bronze",
    requirements: 25,
    currentProgress: 12,
    unlocked: false,
    reward: { type: "sound_effect", item: "Robot Voice Pack" },
  },
];

const unlockableContent: UnlockableContent[] = [
  {
    id: "scholar_cap",
    name: "Scholar Cap",
    type: "avatar_hat",
    description: "A wise graduation cap for dedicated learners",
    icon: "🎓",
    unlocked: false,
    unlockedBy: "word_collector",
  },
  {
    id: "golden_theme",
    name: "Golden Theme",
    type: "background_theme",
    description: "Sparkly golden backgrounds for champions",
    icon: "✨",
    unlocked: false,
    unlockedBy: "vocabulary_master",
  },
  {
    id: "fire_trail",
    name: "Fire Trail",
    type: "special_effect",
    description: "Leave a trail of fire when you learn!",
    icon: "🔥",
    unlocked: false,
    unlockedBy: "streak_starter",
  },
  {
    id: "champion_crown",
    name: "Champion Crown",
    type: "avatar_hat",
    description: "The ultimate crown for learning champions",
    icon: "👑",
    unlocked: false,
    unlockedBy: "dedication_champion",
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return "from-amber-400 to-amber-600";
    case "silver":
      return "from-gray-400 to-gray-600";
    case "gold":
      return "from-yellow-400 to-yellow-600";
    case "diamond":
      return "from-cyan-400 to-blue-600";
    default:
      return "from-gray-400 to-gray-600";
  }
};

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case "bronze":
      return <Trophy className="w-4 h-4 text-amber-600" />;
    case "silver":
      return <Star className="w-4 h-4 text-gray-600" />;
    case "gold":
      return <Crown className="w-4 h-4 text-yellow-600" />;
    case "diamond":
      return <Gem className="w-4 h-4 text-cyan-600" />;
    default:
      return <Trophy className="w-4 h-4" />;
  }
};

interface AchievementSystemProps {
  onUnlock?: (achievement: Achievement) => void;
}

export function AchievementSystem({ onUnlock }: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showUnlockables, setShowUnlockables] = useState(false);
  const [celebratingAchievement, setCelebratingAchievement] =
    useState<Achievement | null>(null);

  const categories = [
    { id: "all", name: "All", icon: "🏆" },
    { id: "learning", name: "Learning", icon: "📚" },
    { id: "streak", name: "Streaks", icon: "🔥" },
    { id: "quiz", name: "Quizzes", icon: "🧠" },
    { id: "exploration", name: "Explorer", icon: "🗺️" },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => {
    const points =
      a.difficulty === "bronze"
        ? 10
        : a.difficulty === "silver"
          ? 25
          : a.difficulty === "gold"
            ? 50
            : 100;
    return sum + points;
  }, 0);

  const handleAchievementClick = (achievement: Achievement) => {
    if (achievement.unlocked) {
      setCelebratingAchievement(achievement);
      audioService.playCheerSound();
      setTimeout(() => setCelebratingAchievement(null), 3000);
    }
  };

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min(
      (achievement.currentProgress / achievement.requirements) * 100,
      100,
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🏆 Achievement Gallery
        </h2>
        <p className="text-gray-600 mb-4">
          Unlock amazing rewards by completing learning challenges!
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <Card className="bg-gradient-to-r from-educational-blue to-educational-purple text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {unlockedAchievements.length}
              </div>
              <div className="text-sm opacity-90">Achievements</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-educational-orange to-educational-pink text-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{totalPoints}</div>
              <div className="text-sm opacity-90">Achievement Points</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center gap-2 flex-wrap">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <span>{category.icon}</span>
            {category.name}
          </Button>
        ))}
        <Button
          variant={showUnlockables ? "default" : "outline"}
          size="sm"
          onClick={() => setShowUnlockables(!showUnlockables)}
          className="flex items-center gap-2"
        >
          <Gift className="w-4 h-4" />
          Rewards
        </Button>
      </div>

      {/* Achievements Grid */}
      {!showUnlockables && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => {
            const progressPercentage = getProgressPercentage(achievement);
            const isComplete = progressPercentage >= 100;

            return (
              <Card
                key={achievement.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg`
                    : "bg-white border-2 border-dashed border-gray-300 hover:border-educational-blue"
                } ${celebratingAchievement?.id === achievement.id ? "animate-bounce" : ""}`}
                onClick={() => handleAchievementClick(achievement)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex items-center gap-1">
                      {getDifficultyIcon(achievement.difficulty)}
                      {achievement.unlocked && (
                        <Check className="w-4 h-4 text-green-300" />
                      )}
                      {!achievement.unlocked && isComplete && (
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                      )}
                      {!achievement.unlocked && !isComplete && (
                        <Lock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <CardTitle
                    className={`text-lg ${
                      achievement.unlocked ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {achievement.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p
                    className={`text-sm ${
                      achievement.unlocked ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    {achievement.description}
                  </p>

                  {!achievement.unlocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-800">
                          {achievement.currentProgress}/
                          {achievement.requirements}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      {isComplete && (
                        <div className="text-center">
                          <Badge className="bg-educational-green text-white animate-pulse">
                            Ready to Unlock! 🎉
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {achievement.unlocked && achievement.reward && (
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="text-xs font-semibold text-white/90 mb-1">
                        Reward Unlocked:
                      </div>
                      <div className="text-sm text-white">
                        🎁 {achievement.reward.item}
                      </div>
                    </div>
                  )}

                  {achievement.unlocked && achievement.dateUnlocked && (
                    <div className="text-xs text-white/70">
                      Unlocked: {achievement.dateUnlocked.toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unlockable Content */}
      {showUnlockables && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🎁 Unlockable Rewards
            </h3>
            <p className="text-gray-600">
              Complete achievements to unlock these amazing rewards!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {unlockableContent.map((content) => (
              <Card
                key={content.id}
                className={`text-center transition-all duration-300 hover:scale-105 ${
                  content.unlocked
                    ? "bg-gradient-to-br from-educational-green to-educational-blue text-white"
                    : "bg-gray-100 border-2 border-dashed border-gray-300"
                }`}
              >
                <CardContent className="p-4">
                  <div className="text-4xl mb-2">{content.icon}</div>
                  <h4
                    className={`font-semibold mb-2 ${
                      content.unlocked ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {content.name}
                  </h4>
                  <p
                    className={`text-sm mb-3 ${
                      content.unlocked ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    {content.description}
                  </p>

                  {!content.unlocked && content.unlockedBy && (
                    <Badge variant="outline" className="text-xs">
                      <Lock className="w-3 h-3 mr-1" />
                      Complete "
                      {
                        achievements.find((a) => a.id === content.unlockedBy)
                          ?.name
                      }
                      "
                    </Badge>
                  )}

                  {content.unlocked && (
                    <Badge className="bg-white/20 text-white">
                      <Check className="w-3 h-3 mr-1" />
                      Unlocked!
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Celebration Modal */}
      {celebratingAchievement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gradient-to-br from-educational-purple to-educational-pink text-white max-w-md mx-4 animate-bounce">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">{celebratingAchievement.icon}</div>
              <h3 className="text-2xl font-bold mb-2">Achievement Unlocked!</h3>
              <h4 className="text-xl mb-4">{celebratingAchievement.name}</h4>
              <p className="text-white/90 mb-4">
                {celebratingAchievement.description}
              </p>
              {celebratingAchievement.reward && (
                <div className="bg-white/20 rounded-lg p-3 mb-4">
                  <div className="text-sm font-semibold mb-1">Reward:</div>
                  <div className="text-lg">
                    🎁 {celebratingAchievement.reward.item}
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
