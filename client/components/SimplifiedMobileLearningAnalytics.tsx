import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { goalProgressTracker } from "@/lib/goalProgressTracker";
import { CategoryCompletionTracker } from "@/lib/categoryCompletionTracker";

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  level: number;
  wordsLearned: number;
  currentStreak: number;
  accuracy: number;
  totalLearningTime: number;
  favoriteCategory: string;
}

interface CategoryProgress {
  category: string;
  totalWords: number;
  masteredWords: number;
  practiceWords: number;
  accuracy: number;
  timeSpent: number;
}

interface SimplifiedAnalyticsData {
  overview: {
    totalWordsMastered: number;
    wordsNeedPractice: number;
    overallAccuracy: number;
    totalLearningTime: number;
    activeLearningStreak: number;
  };
  categoryProgress: CategoryProgress[];
  children: ChildProfile[];
}

interface SimplifiedMobileLearningAnalyticsProps {
  children?: ChildProfile[];
}

export const SimplifiedMobileLearningAnalytics: React.FC<
  SimplifiedMobileLearningAnalyticsProps
> = ({ children: propChildren = [] }) => {
  const [activeTab, setActiveTab] = useState("progress");
  const [realTimeData, setRealTimeData] = useState<SimplifiedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get simplified analytics data
  const analyticsData = useMemo((): SimplifiedAnalyticsData => {
    try {
      const storedChildren = localStorage.getItem("parentDashboardChildren");
      const childrenData =
        propChildren.length > 0
          ? propChildren
          : storedChildren
            ? JSON.parse(storedChildren)
            : [];

      // Simplified category data
      const categoryProgress: CategoryProgress[] = [
        {
          category: "Animals",
          totalWords: 50,
          masteredWords: 35,
          practiceWords: 8,
          accuracy: 87,
          timeSpent: 120,
        },
        {
          category: "Colors",
          totalWords: 20,
          masteredWords: 18,
          practiceWords: 2,
          accuracy: 94,
          timeSpent: 45,
        },
        {
          category: "Numbers",
          totalWords: 30,
          masteredWords: 22,
          practiceWords: 5,
          accuracy: 82,
          timeSpent: 60,
        },
        {
          category: "Family",
          totalWords: 25,
          masteredWords: 20,
          practiceWords: 3,
          accuracy: 96,
          timeSpent: 40,
        },
      ];

      const totalWordsMastered = categoryProgress.reduce(
        (sum, cat) => sum + cat.masteredWords,
        0,
      );
      const wordsNeedPractice = categoryProgress.reduce(
        (sum, cat) => sum + cat.practiceWords,
        0,
      );
      const totalTimeSpent = categoryProgress.reduce(
        (sum, cat) => sum + cat.timeSpent,
        0,
      );
      const overallAccuracy = Math.round(
        categoryProgress.reduce((sum, cat) => sum + cat.accuracy, 0) /
          categoryProgress.length,
      );

      return {
        overview: {
          totalWordsMastered,
          wordsNeedPractice,
          overallAccuracy,
          totalLearningTime: totalTimeSpent,
          activeLearningStreak: 7,
        },
        categoryProgress,
        children: childrenData,
      };
    } catch (error) {
      console.error("Error calculating analytics data:", error);
      return {
        overview: {
          totalWordsMastered: 0,
          wordsNeedPractice: 0,
          overallAccuracy: 0,
          totalLearningTime: 0,
          activeLearningStreak: 0,
        },
        categoryProgress: [],
        children: [],
      };
    }
  }, [propChildren]);

  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case "animals":
        return "🐶";
      case "colors":
        return "🎨";
      case "numbers":
        return "🔢";
      case "family":
        return "👨‍👩‍👧‍👦";
      default:
        return "📚";
    }
  };

  const getAccuracyEmoji = (accuracy: number) => {
    if (accuracy >= 95) return "🌟";
    if (accuracy >= 85) return "⭐";
    if (accuracy >= 75) return "✨";
    return "💪";
  };

  return (
    <div className="mobile-analytics-container space-y-4 px-4 py-2">
      {/* Simple Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          🏆 My Learning Progress 🎉
        </h1>
        <p className="text-sm text-gray-600">
          See how amazing you're doing! 🌟
        </p>
      </div>

      {/* Big Achievement Cards - Mobile First */}
      <div className="metrics-grid-mobile mb-6">
        <Card className="bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 achievement-card-mobile">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2 mobile-emoji">🎯</div>
            <div className="text-2xl font-bold text-blue-700 mb-1 mobile-counter">
              <AnimatedCounter
                value={analyticsData.overview.totalWordsMastered}
              />
            </div>
            <p className="text-xs text-blue-600 font-medium">Words I Know!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-100 to-green-200 border-green-300 achievement-card-mobile">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2 mobile-emoji">
              {getAccuracyEmoji(analyticsData.overview.overallAccuracy)}
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1 mobile-counter">
              <AnimatedCounter value={analyticsData.overview.overallAccuracy} />
              %
            </div>
            <p className="text-xs text-green-600 font-medium">How Good I Am!</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300 achievement-card-mobile">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2 mobile-emoji">💪</div>
            <div className="text-2xl font-bold text-orange-700 mb-1 mobile-counter">
              <AnimatedCounter
                value={analyticsData.overview.wordsNeedPractice}
              />
            </div>
            <p className="text-xs text-orange-600 font-medium">Need Practice</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 achievement-card-mobile">
          <CardContent className="p-4 text-center">
            <div className="text-3xl mb-2 mobile-emoji">🔥</div>
            <div className="text-2xl font-bold text-purple-700 mb-1 mobile-counter">
              <AnimatedCounter
                value={analyticsData.overview.activeLearningStreak}
              />
            </div>
            <p className="text-xs text-purple-600 font-medium">
              Days in a Row!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="mobile-tabs-list grid w-full grid-cols-2 h-12">
          <TabsTrigger
            value="progress"
            className="mobile-tab-trigger text-sm font-medium rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <span>My Progress</span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="subjects"
            className="mobile-tab-trigger text-sm font-medium rounded-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span>Subjects</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          {/* Learning Time Card */}
          <Card className="learning-time-mobile border-indigo-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="mobile-emoji">⏰</span> Time I Spent Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2 mobile-counter">
                  <AnimatedCounter
                    value={analyticsData.overview.totalLearningTime}
                  />
                  <span className="text-lg"> minutes</span>
                </div>
                <p className="text-sm opacity-90">
                  That's amazing! 🎉 Keep it up!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200 subject-card-mobile">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="mobile-emoji">📅</span> This Week's Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="week-day-mobile">
                <span className="text-sm text-gray-600">Monday</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg mobile-emoji">✅</span>
                  <span className="text-xs text-green-600">12 words</span>
                </div>
              </div>
              <div className="week-day-mobile">
                <span className="text-sm text-gray-600">Tuesday</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg mobile-emoji">✅</span>
                  <span className="text-xs text-green-600">8 words</span>
                </div>
              </div>
              <div className="week-day-mobile">
                <span className="text-sm text-gray-600">Wednesday</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg mobile-emoji">✅</span>
                  <span className="text-xs text-green-600">15 words</span>
                </div>
              </div>
              <div className="week-day-mobile">
                <span className="text-sm text-gray-600">Today</span>
                <div className="flex items-center gap-1">
                  <span className="text-lg mobile-emoji">🎯</span>
                  <span className="text-xs text-blue-600">Let's learn!</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="grid gap-4">
            {analyticsData.categoryProgress.map((category, index) => (
              <Card
                key={index}
                className="subject-card-mobile bg-white border-2 border-gray-100 hover:border-blue-200 transition-all duration-300"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getCategoryEmoji(category.category)}
                      </span>
                      <h3 className="font-bold text-gray-800 text-base">
                        {category.category}
                      </h3>
                    </div>
                    <Badge
                      className={`achievement-badge-mobile text-xs ${
                        category.accuracy >= 90
                          ? "bg-green-100 text-green-800"
                          : category.accuracy >= 80
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {getAccuracyEmoji(category.accuracy)} {category.accuracy}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-green-50 p-2 rounded-lg text-center">
                        <div className="font-bold text-green-700 text-lg">
                          {category.masteredWords}
                        </div>
                        <div className="text-xs text-green-600">I Know</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-lg text-center">
                        <div className="font-bold text-orange-700 text-lg">
                          {category.practiceWords}
                        </div>
                        <div className="text-xs text-orange-600">Practice</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-bold">
                          {Math.round(
                            (category.masteredWords / category.totalWords) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="mobile-progress-bar">
                        <div
                          className="mobile-progress-fill"
                          style={{
                            width: `${(category.masteredWords / category.totalWords) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {category.masteredWords} out of {category.totalWords}{" "}
                        words
                      </div>
                    </div>

                    <div className="text-center">
                      <Button size="sm" className="action-button-mobile">
                        <span className="mr-1">🎮</span>
                        Practice {category.category}!
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Encouragement Message */}
      <Card className="encouragement-mobile">
        <CardContent className="p-4 text-center">
          <div className="text-3xl mb-2 mobile-emoji">🌟</div>
          <h3 className="font-bold text-orange-800 mb-1">Great Job!</h3>
          <p className="text-sm text-orange-700">
            You're doing amazing! Keep learning and having fun! 🎉
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
