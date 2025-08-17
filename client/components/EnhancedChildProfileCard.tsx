import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Star,
  Trophy,
  BookOpen,
  TrendingUp,
  Calendar,
  Crown,
  Heart,
  Zap,
  Target,
  Award,
  Sparkles,
  Timer,
  Volume2,
  Settings,
  Edit,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChildProfile {
  id: string;
  name: string;
  avatar: {
    emoji: string;
    name: string;
    color: string;
  };
  level: number;
  points: number;
  streak: number;
  wordsLearned: number;
  interests?: string[];
  theme?: {
    gradient: string;
  };
  totalTimeSpent?: number;
  favoriteCategory?: string;
  achievements?: Array<{
    id: string;
    name: string;
    icon: string;
    unlocked: boolean;
    date?: string;
  }>;
  weeklyGoal?: {
    target: number;
    current: number;
  };
  dailyStreak?: {
    current: number;
    best: number;
  };
  recentActivity?: Array<{
    type: string;
    description: string;
    points: number;
    timestamp: string;
  }>;
}

interface ChildStats {
  totalWordsLearned: number;
  correctAnswers: number;
  totalAnswers: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  timeSpentToday: number;
  sessionsToday: number;
  favoriteWords: string[];
  strugglingWords: string[];
  recentAchievements: Array<{
    name: string;
    date: string;
    icon: string;
  }>;
}

interface EnhancedChildProfileCardProps {
  profile: ChildProfile;
  stats?: ChildStats;
  className?: string;
  isCompact?: boolean;
  showQuickActions?: boolean;
  onProfileEdit?: () => void;
  onQuickAction?: (action: string) => void;
  animationEnabled?: boolean;
}

export const EnhancedChildProfileCard: React.FC<EnhancedChildProfileCardProps> = ({
  profile,
  stats,
  className,
  isCompact = false,
  showQuickActions = true,
  onProfileEdit,
  onQuickAction,
  animationEnabled = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [motivationalMessage, setMotivationalMessage] = useState("");

  // Update time every minute for real-time feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate motivational messages based on progress
  useEffect(() => {
    const messages = [
      `Amazing progress, ${profile.name}! 🌟`,
      `Keep up the great work! 🚀`,
      `You're doing fantastic! 💪`,
      `Learning superstar! ⭐`,
      `Vocabulary champion! 🏆`,
    ];

    const timeBasedMessages = {
      morning: `Good morning, ${profile.name}! Ready to learn? 🌅`,
      afternoon: `Great afternoon learning, ${profile.name}! 🌞`,
      evening: `Evening study session, ${profile.name}! 🌙`,
    };

    const hour = currentTime.getHours();
    let timeMessage = "";
    if (hour < 12) timeMessage = timeBasedMessages.morning;
    else if (hour < 18) timeMessage = timeBasedMessages.afternoon;
    else timeMessage = timeBasedMessages.evening;

    const randomMessage = Math.random() > 0.7 ? 
      messages[Math.floor(Math.random() * messages.length)] : timeMessage;
    
    setMotivationalMessage(randomMessage);
  }, [profile.name, currentTime]);

  // Calculate accuracy percentage
  const accuracy = stats?.totalAnswers 
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 0;

  // Calculate level progress (assuming 100 words per level)
  const levelProgress = ((profile.wordsLearned % 100) / 100) * 100;
  const nextLevelWords = 100 - (profile.wordsLearned % 100);

  // Calculate weekly goal progress
  const weeklyProgress = profile.weeklyGoal 
    ? (profile.weeklyGoal.current / profile.weeklyGoal.target) * 100
    : 0;

  // Format time spent
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const cardVariants = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  const contentVariants = {
    collapsed: { height: "auto", opacity: 1 },
    expanded: { height: "auto", opacity: 1 },
  };

  return (
    <motion.div
      variants={animationEnabled ? cardVariants : undefined}
      initial={animationEnabled ? "initial" : undefined}
      animate={animationEnabled ? "animate" : undefined}
      whileHover={animationEnabled ? "hover" : undefined}
      className={cn("w-full max-w-sm", className)}
    >
      <Card className="bg-gradient-to-br from-white to-purple-50/30 border-2 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header with Avatar and Basic Info */}
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md",
                  "bg-gradient-to-r",
                  profile.avatar?.color || "from-purple-400 to-pink-400"
                )}
              >
                {profile.avatar?.emoji || "🎯"}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 leading-tight">
                  {profile.name}
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="text-xs bg-purple-100 text-purple-700"
                  >
                    <Crown className="w-3 h-3 mr-1" />
                    Level {profile.level}
                  </Badge>
                  {profile.streak > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs border-orange-200 text-orange-600"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {profile.streak}🔥
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {showQuickActions && (
              <div className="flex flex-col space-y-1">
                {onProfileEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onProfileEdit}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Motivational Message */}
          <motion.div
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 mt-3"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 8 }}
          >
            <p className="text-xs text-purple-700 font-medium text-center">
              {motivationalMessage}
            </p>
          </motion.div>
        </CardHeader>

        {/* Expandable Content */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-0 space-y-4">
                {/* Quick Progress Overview */}
                <div className="space-y-3">
                  {/* Words Learned Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        Level Progress
                      </span>
                      <span className="text-xs text-gray-500">
                        {nextLevelWords} words to next level
                      </span>
                    </div>
                    <Progress
                      value={levelProgress}
                      className="h-2 bg-purple-100"
                    />
                  </div>

                  {/* Accuracy */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        Accuracy
                      </span>
                      <span className="text-xs text-gray-500">{accuracy}%</span>
                    </div>
                    <Progress
                      value={accuracy}
                      className="h-2 bg-green-100"
                    />
                  </div>

                  {/* Weekly Goal */}
                  {profile.weeklyGoal && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">
                          Weekly Goal
                        </span>
                        <span className="text-xs text-gray-500">
                          {profile.weeklyGoal.current}/{profile.weeklyGoal.target}
                        </span>
                      </div>
                      <Progress
                        value={weeklyProgress}
                        className="h-2 bg-blue-100"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 rounded-lg p-3 text-center border border-purple-100">
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-gray-800">
                      {profile.wordsLearned}
                    </div>
                    <div className="text-xs text-gray-600">Words</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center border border-orange-100">
                    <Trophy className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                    <div className="text-lg font-bold text-gray-800">
                      {profile.points}
                    </div>
                    <div className="text-xs text-gray-600">Points</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center border border-green-100">
                    <Target className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-gray-800">
                      {stats?.currentStreak || profile.streak}
                    </div>
                    <div className="text-xs text-gray-600">Streak</div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 text-center border border-blue-100">
                    <Timer className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-gray-800">
                      {stats?.timeSpentToday ? formatTime(stats.timeSpentToday) : "0m"}
                    </div>
                    <div className="text-xs text-gray-600">Today</div>
                  </div>
                </div>

                {/* Recent Achievements */}
                {stats?.recentAchievements && stats.recentAchievements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Recent Achievements
                    </h4>
                    <div className="space-y-2">
                      {stats.recentAchievements.slice(0, 2).map((achievement, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-2 border border-yellow-200"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="text-lg">{achievement.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">
                              {achievement.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {achievement.date}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                {showQuickActions && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickAction?.("continue_learning")}
                      className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:from-purple-100 hover:to-pink-100"
                    >
                      <BookOpen className="w-3 h-3 mr-1" />
                      Continue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickAction?.("practice_words")}
                      className="text-xs bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 hover:from-blue-100 hover:to-cyan-100"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Practice
                    </Button>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default EnhancedChildProfileCard;
