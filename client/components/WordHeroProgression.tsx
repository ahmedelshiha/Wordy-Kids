import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Crown,
  Star,
  Trophy,
  Gift,
  Sparkles,
  Zap,
  Shield,
  Heart,
  Coins,
  TrendingUp,
  Award,
  X,
} from "lucide-react";
import { WordHero, Badge as AdventureBadge } from "@shared/adventure";

interface WordHeroProgressionProps {
  hero: WordHero;
  newBadges?: AdventureBadge[];
  levelUp?: boolean;
  xpGained?: number;
  coinsGained?: number;
  onClose: () => void;
}

export const WordHeroProgression: React.FC<WordHeroProgressionProps> = ({
  hero,
  newBadges = [],
  levelUp = false,
  xpGained = 0,
  coinsGained = 0,
  onClose,
}) => {
  const [showLevelUp, setShowLevelUp] = useState(levelUp);
  const [showBadges, setShowBadges] = useState(newBadges.length > 0);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);

  const nextLevelXP = hero.level * 100; // Simple progression formula
  const currentLevelProgress = hero.experience % 100;

  const handleNextBadge = () => {
    if (currentBadgeIndex < newBadges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      setShowBadges(false);
      if (!showLevelUp) {
        onClose();
      }
    }
  };

  const handleLevelUpComplete = () => {
    setShowLevelUp(false);
    if (!showBadges) {
      onClose();
    }
  };

  if (showLevelUp) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20"></div>
            <div className="absolute top-4 left-4 w-8 h-8 bg-yellow-300/30 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-6 w-6 h-6 bg-pink-300/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-8 w-4 h-4 bg-blue-300/30 rounded-full animate-bounce"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Crown className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-4xl font-bold mb-4 animate-bounce">
                LEVEL UP! 🎉
              </h2>

              <div className="space-y-4 mb-8">
                <div className="text-6xl font-bold text-yellow-300">
                  {hero.level}
                </div>
                <div className="text-xl">
                  You are now a Level {hero.level} Word Hero!
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <div className="font-bold text-yellow-300">
                      +{xpGained} XP
                    </div>
                    <div className="text-sm opacity-90">Experience</div>
                  </div>
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                    <Coins className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                    <div className="font-bold text-yellow-300">
                      +{50 + hero.level * 10}
                    </div>
                    <div className="text-sm opacity-90">Bonus Coins</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLevelUpComplete}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-8 py-3 text-lg font-bold"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Continue Adventure!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showBadges && newBadges.length > 0) {
    const currentBadge = newBadges[currentBadgeIndex];

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-green-500 via-blue-500 to-purple-600 text-white border-0">
          <CardContent className="p-8 text-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20"></div>
            <div className="absolute top-2 left-2 w-6 h-6 bg-yellow-300/30 rounded-full animate-ping"></div>
            <div className="absolute top-6 right-4 w-8 h-8 bg-pink-300/30 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-6 w-5 h-5 bg-blue-300/30 rounded-full animate-bounce"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin-slow">
                <Trophy className="w-12 h-12 text-white" />
              </div>

              <h2 className="text-3xl font-bold mb-4">Achievement Unlocked! 🏆</h2>

              <div className="space-y-4 mb-8">
                <div className="text-6xl mb-4">{currentBadge.icon}</div>
                <div className="text-2xl font-bold text-yellow-300">
                  {currentBadge.name}
                </div>
                <div className="text-lg opacity-90">
                  {currentBadge.description}
                </div>

                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="font-bold text-yellow-300 capitalize">
                      {currentBadge.tier} Tier
                    </span>
                  </div>
                  <div className="text-sm opacity-90">
                    Progress: {currentBadge.criteria.current_progress}/
                    {currentBadge.criteria.threshold}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {currentBadgeIndex < newBadges.length - 1 ? (
                  <>
                    <Button
                      onClick={handleNextBadge}
                      className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                    >
                      <Star className="w-5 h-5 mr-2" />
                      Next Badge
                    </Button>
                    <div className="text-xs opacity-75 self-center">
                      {currentBadgeIndex + 1} of {newBadges.length}
                    </div>
                  </>
                ) : (
                  <Button
                    onClick={handleNextBadge}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Continue Adventure!
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular progression display (no modals)
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{hero.name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Level {hero.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">🪙</span>
                  <span>{hero.coins}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>{hero.rescued_words_count} Rescued</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Next Level</div>
            <div className="flex items-center gap-2">
              <Progress value={currentLevelProgress} className="w-24 h-2" />
              <span className="text-xs text-gray-500">
                {currentLevelProgress}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {(xpGained > 0 || coinsGained > 0) && (
          <div className="border-t border-purple-200 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Recent Activity:</span>
              <div className="flex items-center gap-4">
                {xpGained > 0 && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+{xpGained} XP</span>
                  </div>
                )}
                {coinsGained > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins className="w-4 h-4" />
                    <span>+{coinsGained}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Utility component for small progression updates
export const ProgressionToast: React.FC<{
  xp: number;
  coins: number;
  onClose: () => void;
}> = ({ xp, coins, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <Card className="bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold">Progress Made!</div>
            <div className="text-sm opacity-90">
              +{xp} XP, +{coins} coins
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
