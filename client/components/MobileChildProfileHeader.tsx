import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Crown,
  Zap,
  Trophy,
  Target,
  Timer,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MobileChildProfileHeaderProps {
  profile: any;
  stats?: any;
  className?: string;
  onExpand?: () => void;
  showExpanded?: boolean;
}

export const MobileChildProfileHeader: React.FC<
  MobileChildProfileHeaderProps
> = ({ profile, stats, className, onExpand, showExpanded = false }) => {
  if (!profile) return null;

  const accuracy = stats?.totalAnswers
    ? Math.round((stats.correctAnswers / stats.totalAnswers) * 100)
    : 0;

  const levelProgress = ((profile.wordsLearned % 100) / 100) * 100;

  return (
    <motion.div
      className={cn(
        "bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100",
        "border-b border-purple-200/50 shadow-sm",
        className,
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="px-4 py-3">
        {/* Compact Profile Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md",
                "bg-gradient-to-r",
                profile.avatar?.color || "from-purple-400 to-pink-400",
              )}
            >
              {profile.avatar?.emoji || "🎯"}
            </div>

            {/* Name and Level */}
            <div>
              <h3 className="font-bold text-sm text-gray-800 leading-tight">
                {profile.name}
              </h3>
              <div className="flex items-center space-x-1">
                <Badge
                  variant="secondary"
                  className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 border-purple-200"
                >
                  <Crown className="w-2.5 h-2.5 mr-0.5" />L{profile.level}
                </Badge>
                {profile.streak > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1.5 py-0.5 border-orange-200 text-orange-600"
                  >
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    {profile.streak}🔥
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-3">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-800">
                {profile.wordsLearned}
              </div>
              <div className="text-xs text-gray-600">Words</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-gray-800">{accuracy}%</div>
              <div className="text-xs text-gray-600">Score</div>
            </div>
            {onExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="h-8 w-8 p-0"
              >
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    showExpanded && "rotate-180",
                  )}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Stats (Mobile) */}
        {showExpanded && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            style={{ transformOrigin: "top" }}
            className="mt-3 pt-3 border-t border-purple-200/50"
          >
            {/* Level Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">
                  Level Progress
                </span>
                <span className="text-xs text-gray-500">
                  {100 - (profile.wordsLearned % 100)} words to level{" "}
                  {profile.level + 1}
                </span>
              </div>
              <div className="w-full bg-purple-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-white/70 rounded-lg p-2 text-center border border-purple-100">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-orange-600" />
                <div className="text-sm font-bold text-gray-800">
                  {profile.points}
                </div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center border border-green-100">
                <Target className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <div className="text-sm font-bold text-gray-800">
                  {stats?.currentStreak || profile.streak}
                </div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center border border-blue-100">
                <Timer className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <div className="text-sm font-bold text-gray-800">
                  {stats?.timeSpentToday
                    ? `${Math.round(stats.timeSpentToday / 60)}h`
                    : "0h"}
                </div>
                <div className="text-xs text-gray-600">Today</div>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center border border-purple-100">
                <TrendingUp className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <div className="text-sm font-bold text-gray-800">
                  {accuracy}%
                </div>
                <div className="text-xs text-gray-600">Accuracy</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MobileChildProfileHeader;
