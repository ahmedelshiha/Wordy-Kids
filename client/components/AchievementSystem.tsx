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
  Check
} from "lucide-react";
import { audioService } from "@/lib/audioService";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'streak' | 'quiz' | 'exploration' | 'social';
  difficulty: 'bronze' | 'silver' | 'gold' | 'diamond';
  requirements: number;
  currentProgress: number;
  unlocked: boolean;
  dateUnlocked?: Date;
  reward?: {
    type: 'avatar_accessory' | 'theme' | 'sound_effect' | 'title' | 'points';
    item: string;
    value?: number;
  };
}

interface UnlockableContent {
  id: string;
  name: string;
  type: 'avatar_hat' | 'avatar_accessory' | 'background_theme' | 'sound_pack' | 'special_effect';
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedBy?: string; // achievement id
  previewUrl?: string;
}

const achievements: Achievement[] = [
  {
    id: 'first_word',
    name: 'First Step',
    description: 'Learn your very first word!',
    icon: '🎯',
    category: 'learning',
    difficulty: 'bronze',
    requirements: 1,
    currentProgress: 1,
    unlocked: true,
    dateUnlocked: new Date(),
    reward: { type: 'avatar_accessory', item: 'Beginner Badge' }
  },
  {
    id: 'word_collector',
    name: 'Word Collector',
    description: 'Learn 10 words to start your collection!',
    icon: '📚',
    category: 'learning',
    difficulty: 'bronze',
    requirements: 10,
    currentProgress: 7,
    unlocked: false,
    reward: { type: 'avatar_hat', item: 'Scholar Cap' }
  },
  {
    id: 'vocabulary_master',
    name: 'Vocabulary Master',
    description: 'Amazing! You\'ve learned 50 words!',
    icon: '🏆',
    category: 'learning',
    difficulty: 'gold',
    requirements: 50,
    currentProgress: 7,
    unlocked: false,
    reward: { type: 'theme', item: 'Golden Theme' }
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Keep learning for 3 days in a row!',
    icon: '🔥',
    category: 'streak',
    difficulty: 'bronze',
    requirements: 3,
    currentProgress: 2,
    unlocked: false,
    reward: { type: 'special_effect', item: 'Fire Trail' }
  },
  {
    id: 'dedication_champion',
    name: 'Dedication Champion',
    description: 'Incredible! 30 days of learning!',
    icon: '👑',
    category: 'streak',
    difficulty: 'diamond',
    requirements: 30,
    currentProgress: 2,
    unlocked: false,
    reward: { type: 'title', item: 'Learning Champion' }
  },
  {
    id: 'quiz_ace',
    name: 'Quiz Ace',
    description: 'Score 100% on 5 quizzes!',
    icon: '🧠',
    category: 'quiz',
    difficulty: 'silver',
    requirements: 5,
    currentProgress: 2,
    unlocked: false,
    reward: { type: 'sound_effect', item: 'Success Fanfare' }
  },
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Explore 5 different word categories!',
    icon: '🗺️',
    category: 'exploration',
    difficulty: 'silver',
    requirements: 5,
    currentProgress: 3,
    unlocked: false,
    reward: { type: 'avatar_accessory', item: 'Explorer Badge' }
  },
  {
    id: 'pronunciation_pro',
    name: 'Pronunciation Pro',
    description: 'Listen to 25 word pronunciations!',
    icon: '🔊',
    category: 'learning',
    difficulty: 'bronze',
    requirements: 25,
    currentProgress: 12,
    unlocked: false,
    reward: { type: 'sound_pack', item: 'Robot Voice Pack' }
  }
];

const unlockableContent: UnlockableContent[] = [
  {
    id: 'scholar_cap',
    name: 'Scholar Cap',
    type: 'avatar_hat',
    description: 'A wise graduation cap for dedicated learners',
    icon: '🎓',
    unlocked: false,
    unlockedBy: 'word_collector'
  },
  {
    id: 'golden_theme',
    name: 'Golden Theme',
    type: 'background_theme',
    description: 'Sparkly golden backgrounds for champions',
    icon: '✨',
    unlocked: false,
    unlockedBy: 'vocabulary_master'
  },
  {
    id: 'fire_trail',
    name: 'Fire Trail',
    type: 'special_effect',
    description: 'Leave a trail of fire when you learn!',
    icon: '🔥',
    unlocked: false,
    unlockedBy: 'streak_starter'
  },
  {
    id: 'champion_crown',
    name: 'Champion Crown',
    type: 'avatar_hat',
    description: 'The ultimate crown for learning champions',
    icon: '👑',
    unlocked: false,
    unlockedBy: 'dedication_champion'
  }
];\n\nconst getDifficultyColor = (difficulty: string) => {\n  switch (difficulty) {\n    case 'bronze': return 'from-amber-400 to-amber-600';\n    case 'silver': return 'from-gray-400 to-gray-600';\n    case 'gold': return 'from-yellow-400 to-yellow-600';\n    case 'diamond': return 'from-cyan-400 to-blue-600';\n    default: return 'from-gray-400 to-gray-600';\n  }\n};\n\nconst getDifficultyIcon = (difficulty: string) => {\n  switch (difficulty) {\n    case 'bronze': return <Trophy className=\"w-4 h-4 text-amber-600\" />;\n    case 'silver': return <Star className=\"w-4 h-4 text-gray-600\" />;\n    case 'gold': return <Crown className=\"w-4 h-4 text-yellow-600\" />;\n    case 'diamond': return <Gem className=\"w-4 h-4 text-cyan-600\" />;\n    default: return <Trophy className=\"w-4 h-4\" />;\n  }\n};\n\ninterface AchievementSystemProps {\n  onUnlock?: (achievement: Achievement) => void;\n}\n\nexport function AchievementSystem({ onUnlock }: AchievementSystemProps) {\n  const [selectedCategory, setSelectedCategory] = useState<string>('all');\n  const [showUnlockables, setShowUnlockables] = useState(false);\n  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);\n\n  const categories = [\n    { id: 'all', name: 'All', icon: '🏆' },\n    { id: 'learning', name: 'Learning', icon: '📚' },\n    { id: 'streak', name: 'Streaks', icon: '🔥' },\n    { id: 'quiz', name: 'Quizzes', icon: '🧠' },\n    { id: 'exploration', name: 'Explorer', icon: '🗺️' }\n  ];\n\n  const filteredAchievements = selectedCategory === 'all' \n    ? achievements \n    : achievements.filter(a => a.category === selectedCategory);\n\n  const unlockedAchievements = achievements.filter(a => a.unlocked);\n  const totalPoints = unlockedAchievements.reduce((sum, a) => {\n    const points = a.difficulty === 'bronze' ? 10 : a.difficulty === 'silver' ? 25 : a.difficulty === 'gold' ? 50 : 100;\n    return sum + points;\n  }, 0);\n\n  const handleAchievementClick = (achievement: Achievement) => {\n    if (achievement.unlocked) {\n      setCelebratingAchievement(achievement);\n      audioService.playCheerSound();\n      setTimeout(() => setCelebratingAchievement(null), 3000);\n    }\n  };\n\n  const getProgressPercentage = (achievement: Achievement) => {\n    return Math.min((achievement.currentProgress / achievement.requirements) * 100, 100);\n  };\n\n  return (\n    <div className=\"space-y-6\">\n      {/* Header */}\n      <div className=\"text-center\">\n        <h2 className=\"text-3xl font-bold text-gray-800 mb-2\">\n          🏆 Achievement Gallery\n        </h2>\n        <p className=\"text-gray-600 mb-4\">\n          Unlock amazing rewards by completing learning challenges!\n        </p>\n        <div className=\"flex justify-center gap-4 mb-6\">\n          <Card className=\"bg-gradient-to-r from-educational-blue to-educational-purple text-white\">\n            <CardContent className=\"p-4 text-center\">\n              <div className=\"text-2xl font-bold\">{unlockedAchievements.length}</div>\n              <div className=\"text-sm opacity-90\">Achievements</div>\n            </CardContent>\n          </Card>\n          <Card className=\"bg-gradient-to-r from-educational-orange to-educational-pink text-white\">\n            <CardContent className=\"p-4 text-center\">\n              <div className=\"text-2xl font-bold\">{totalPoints}</div>\n              <div className=\"text-sm opacity-90\">Achievement Points</div>\n            </CardContent>\n          </Card>\n        </div>\n      </div>\n\n      {/* Category Filters */}\n      <div className=\"flex justify-center gap-2 flex-wrap\">\n        {categories.map((category) => (\n          <Button\n            key={category.id}\n            variant={selectedCategory === category.id ? \"default\" : \"outline\"}\n            size=\"sm\"\n            onClick={() => setSelectedCategory(category.id)}\n            className=\"flex items-center gap-2\"\n          >\n            <span>{category.icon}</span>\n            {category.name}\n          </Button>\n        ))}\n        <Button\n          variant={showUnlockables ? \"default\" : \"outline\"}\n          size=\"sm\"\n          onClick={() => setShowUnlockables(!showUnlockables)}\n          className=\"flex items-center gap-2\"\n        >\n          <Gift className=\"w-4 h-4\" />\n          Rewards\n        </Button>\n      </div>\n\n      {/* Achievements Grid */}\n      {!showUnlockables && (\n        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">\n          {filteredAchievements.map((achievement) => {\n            const progressPercentage = getProgressPercentage(achievement);\n            const isComplete = progressPercentage >= 100;\n            \n            return (\n              <Card\n                key={achievement.id}\n                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${\n                  achievement.unlocked \n                    ? `bg-gradient-to-br ${getDifficultyColor(achievement.difficulty)} text-white shadow-lg`\n                    : 'bg-white border-2 border-dashed border-gray-300 hover:border-educational-blue'\n                } ${celebratingAchievement?.id === achievement.id ? 'animate-bounce' : ''}`}\n                onClick={() => handleAchievementClick(achievement)}\n              >\n                <CardHeader className=\"pb-2\">\n                  <div className=\"flex items-center justify-between\">\n                    <div className=\"text-4xl\">{achievement.icon}</div>\n                    <div className=\"flex items-center gap-1\">\n                      {getDifficultyIcon(achievement.difficulty)}\n                      {achievement.unlocked && (\n                        <Check className=\"w-4 h-4 text-green-300\" />\n                      )}\n                      {!achievement.unlocked && isComplete && (\n                        <Sparkles className=\"w-4 h-4 text-yellow-500 animate-pulse\" />\n                      )}\n                      {!achievement.unlocked && !isComplete && (\n                        <Lock className=\"w-4 h-4 text-gray-400\" />\n                      )}\n                    </div>\n                  </div>\n                  <CardTitle className={`text-lg ${\n                    achievement.unlocked ? 'text-white' : 'text-gray-800'\n                  }`}>\n                    {achievement.name}\n                  </CardTitle>\n                </CardHeader>\n                <CardContent className=\"space-y-3\">\n                  <p className={`text-sm ${\n                    achievement.unlocked ? 'text-white/90' : 'text-gray-600'\n                  }`}>\n                    {achievement.description}\n                  </p>\n                  \n                  {!achievement.unlocked && (\n                    <div className=\"space-y-2\">\n                      <div className=\"flex justify-between text-sm\">\n                        <span className=\"text-gray-600\">Progress</span>\n                        <span className=\"font-semibold text-gray-800\">\n                          {achievement.currentProgress}/{achievement.requirements}\n                        </span>\n                      </div>\n                      <Progress \n                        value={progressPercentage} \n                        className=\"h-2\"\n                      />\n                      {isComplete && (\n                        <div className=\"text-center\">\n                          <Badge className=\"bg-educational-green text-white animate-pulse\">\n                            Ready to Unlock! 🎉\n                          </Badge>\n                        </div>\n                      )}\n                    </div>\n                  )}\n                  \n                  {achievement.unlocked && achievement.reward && (\n                    <div className=\"bg-white/20 rounded-lg p-2\">\n                      <div className=\"text-xs font-semibold text-white/90 mb-1\">Reward Unlocked:</div>\n                      <div className=\"text-sm text-white\">\n                        🎁 {achievement.reward.item}\n                      </div>\n                    </div>\n                  )}\n                  \n                  {achievement.unlocked && achievement.dateUnlocked && (\n                    <div className=\"text-xs text-white/70\">\n                      Unlocked: {achievement.dateUnlocked.toLocaleDateString()}\n                    </div>\n                  )}\n                </CardContent>\n              </Card>\n            );\n          })}\n        </div>\n      )}\n\n      {/* Unlockable Content */}\n      {showUnlockables && (\n        <div className=\"space-y-6\">\n          <div className=\"text-center\">\n            <h3 className=\"text-2xl font-bold text-gray-800 mb-2\">\n              🎁 Unlockable Rewards\n            </h3>\n            <p className=\"text-gray-600\">\n              Complete achievements to unlock these amazing rewards!\n            </p>\n          </div>\n          \n          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">\n            {unlockableContent.map((content) => (\n              <Card\n                key={content.id}\n                className={`text-center transition-all duration-300 hover:scale-105 ${\n                  content.unlocked \n                    ? 'bg-gradient-to-br from-educational-green to-educational-blue text-white'\n                    : 'bg-gray-100 border-2 border-dashed border-gray-300'\n                }`}\n              >\n                <CardContent className=\"p-4\">\n                  <div className=\"text-4xl mb-2\">{content.icon}</div>\n                  <h4 className={`font-semibold mb-2 ${\n                    content.unlocked ? 'text-white' : 'text-gray-800'\n                  }`}>\n                    {content.name}\n                  </h4>\n                  <p className={`text-sm mb-3 ${\n                    content.unlocked ? 'text-white/90' : 'text-gray-600'\n                  }`}>\n                    {content.description}\n                  </p>\n                  \n                  {!content.unlocked && content.unlockedBy && (\n                    <Badge variant=\"outline\" className=\"text-xs\">\n                      <Lock className=\"w-3 h-3 mr-1\" />\n                      Complete \"{achievements.find(a => a.id === content.unlockedBy)?.name}\"\n                    </Badge>\n                  )}\n                  \n                  {content.unlocked && (\n                    <Badge className=\"bg-white/20 text-white\">\n                      <Check className=\"w-3 h-3 mr-1\" />\n                      Unlocked!\n                    </Badge>\n                  )}\n                </CardContent>\n              </Card>\n            ))}\n          </div>\n        </div>\n      )}\n\n      {/* Achievement Celebration Modal */}\n      {celebratingAchievement && (\n        <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center z-50\">\n          <Card className=\"bg-gradient-to-br from-educational-purple to-educational-pink text-white max-w-md mx-4 animate-bounce\">\n            <CardContent className=\"p-8 text-center\">\n              <div className=\"text-6xl mb-4\">{celebratingAchievement.icon}</div>\n              <h3 className=\"text-2xl font-bold mb-2\">Achievement Unlocked!</h3>\n              <h4 className=\"text-xl mb-4\">{celebratingAchievement.name}</h4>\n              <p className=\"text-white/90 mb-4\">{celebratingAchievement.description}</p>\n              {celebratingAchievement.reward && (\n                <div className=\"bg-white/20 rounded-lg p-3 mb-4\">\n                  <div className=\"text-sm font-semibold mb-1\">Reward:</div>\n                  <div className=\"text-lg\">🎁 {celebratingAchievement.reward.item}</div>\n                </div>\n              )}\n              <div className=\"flex justify-center\">\n                <Sparkles className=\"w-8 h-8 text-yellow-300 animate-spin\" />\n              </div>\n            </CardContent>\n          </Card>\n        </div>\n      )}\n    </div>\n  );\n}"