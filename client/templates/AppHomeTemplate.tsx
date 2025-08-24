import React from "react";
import { JunglePanel, JungleCard, JungleCardHeader, JungleCardTitle, JungleCardDescription, JungleCardContent, JungleCardFooter, JungleCardIcon } from "@/components/ui/jungle-adventure";
import { AdventureButton } from "@/components/ui/adventure-button";
import { ProgressVine, type Milestone } from "@/components/ui/progress-vine";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Target, Star, Zap, Trophy, MapPin, Compass, Leaf } from "lucide-react";

/**
 * AppHomeTemplate - Immersive jungle-themed app dashboard
 * Mobile-first design with quick access to learning features
 * Uses only design tokens and approved Jungle Adventure components
 */

interface LearningStats {
  wordsLearned: number;
  totalWords: number;
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  accuracyRate: number;
  level: number;
  totalPoints: number;
  favoriteCategory: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "jungle" | "banana" | "sky" | "berry";
  onClick: () => void;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AppHomeTemplateProps {
  userName: string;
  stats: LearningStats;
  quickActions: QuickAction[];
  recentAchievements: Achievement[];
  onQuickQuiz: () => void;
  onContinueLearning: () => void;
  onViewAllAchievements: () => void;
  onSelectCategory: (category: string) => void;
}

export function AppHomeTemplate({
  userName,
  stats,
  quickActions,
  recentAchievements,
  onQuickQuiz,
  onContinueLearning,
  onViewAllAchievements,
  onSelectCategory,
}: AppHomeTemplateProps) {
  // Calculate progress milestones
  const progressMilestones: Milestone[] = [
    { id: "start", position: 0, label: "Start Journey", icon: "🌱", completed: true },
    { id: "quarter", position: 25, label: "First Steps", icon: "🌿", completed: stats.wordsLearned >= stats.totalWords * 0.25 },
    { id: "half", position: 50, label: "Halfway Explorer", icon: "🍃", completed: stats.wordsLearned >= stats.totalWords * 0.5, current: stats.wordsLearned < stats.totalWords * 0.5 && stats.wordsLearned >= stats.totalWords * 0.25 },
    { id: "three-quarter", position: 75, label: "Adventure Master", icon: "🌳", completed: stats.wordsLearned >= stats.totalWords * 0.75, current: stats.wordsLearned < stats.totalWords * 0.75 && stats.wordsLearned >= stats.totalWords * 0.5 },
    { id: "complete", position: 100, label: "Jungle Champion", icon: "🏆", completed: stats.wordsLearned >= stats.totalWords, current: stats.wordsLearned >= stats.totalWords * 0.75 && stats.wordsLearned < stats.totalWords },
  ];

  const overallProgress = Math.round((stats.wordsLearned / stats.totalWords) * 100);
  const weeklyProgress = Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <JunglePanel
        background="hero"
        padding="lg"
        pattern="leaves"
        parallaxDepth={1}
        safeArea="top"
        className="relative"
      >
        {/* Floating jungle elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 text-banana-300 motion-safe:anim-float">
            <Leaf className="w-12 h-12 opacity-40" />
          </div>
          <div className="absolute top-20 right-20 text-sky-300 motion-safe:anim-float anim-delay-700">
            <Compass className="w-8 h-8 opacity-50" />
          </div>
          <div className="absolute bottom-16 left-16 text-jungle-300 motion-safe:anim-float anim-delay-1000">
            <MapPin className="w-10 h-10 opacity-30" />
          </div>
        </div>

        <div className="relative z-10 text-center text-text-inverse">
          {/* Welcome message */}
          <div className="mb-6">
            <h1 className="text-h2-fluid font-display font-bold mb-2 motion-safe:anim-fade-in">
              Welcome back, {userName}! 🌟
            </h1>
            <p className="text-lg opacity-90 motion-safe:anim-fade-in anim-delay-200">
              Ready for another jungle adventure?
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center motion-safe:anim-fade-in anim-delay-300">
              <div className="text-2xl font-bold">{stats.level}</div>
              <div className="text-sm opacity-80">Level</div>
            </div>
            <div className="text-center motion-safe:anim-fade-in anim-delay-400">
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm opacity-80">Day Streak</div>
            </div>
            <div className="text-center motion-safe:anim-fade-in anim-delay-500">
              <div className="text-2xl font-bold">{stats.accuracyRate}%</div>
              <div className="text-sm opacity-80">Accuracy</div>
            </div>
            <div className="text-center motion-safe:anim-fade-in anim-delay-600">
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <div className="text-sm opacity-80">Points</div>
            </div>
          </div>

          {/* Primary action */}
          <AdventureButton
            intent="secondary"
            size="xl"
            roundness="full"
            glow="soft"
            animation="float"
            onClick={onContinueLearning}
            className="motion-safe:anim-fade-in anim-delay-700"
          >
            Continue Adventure
          </AdventureButton>
        </div>
      </JunglePanel>

      {/* Main Content */}
      <JunglePanel background="surface-2" padding="lg" className="relative -mt-16 z-20">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Progress Section */}
          <JungleCard tone="adventure" size="lg" elevation="medium" className="motion-safe:anim-reveal-up">
            <JungleCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <JungleCardTitle size="lg">Your Learning Journey</JungleCardTitle>
                  <JungleCardDescription>
                    Progress through the magical word jungle
                  </JungleCardDescription>
                </div>
                <Badge className="bg-jungle-500 text-text-inverse">
                  {overallProgress}% Complete
                </Badge>
              </div>
            </JungleCardHeader>
            <JungleCardContent>
              <ProgressVine
                value={overallProgress}
                variant="adventure"
                size="lg"
                texture="bark"
                milestones={progressMilestones}
                showPercentage={false}
                label="Overall Progress"
                description={`${stats.wordsLearned} of ${stats.totalWords} words mastered`}
                animated={true}
              />

              <div className="mt-6">
                <ProgressVine
                  value={weeklyProgress}
                  variant="colorful"
                  size="md"
                  label="Weekly Goal"
                  description={`${stats.weeklyProgress} of ${stats.weeklyGoal} words this week`}
                  showPercentage={true}
                  animated={true}
                />
              </div>
            </JungleCardContent>
          </JungleCard>

          {/* Quick Actions & Recent Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-h4-fluid font-display font-bold text-jungle-700 mb-6 motion-safe:anim-reveal-up anim-delay-200">
                Quick Adventures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <JungleCard
                    key={action.id}
                    tone="default"
                    size="md"
                    interactive={true}
                    elevation="medium"
                    className="motion-safe:anim-reveal-up cursor-pointer"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                    onClick={action.onClick}
                  >
                    <JungleCardContent className="text-center py-6">
                      <JungleCardIcon className={`text-${action.color}-500 mb-3 mx-auto`}>
                        <div className="w-12 h-12 bg-current/10 rounded-full flex items-center justify-center">
                          {action.icon}
                        </div>
                      </JungleCardIcon>
                      <h3 className="font-semibold text-text mb-2">{action.title}</h3>
                      <p className="text-sm text-text-secondary">{action.description}</p>
                    </JungleCardContent>
                  </JungleCard>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-h4-fluid font-display font-bold text-jungle-700 motion-safe:anim-reveal-up anim-delay-200">
                  Achievements
                </h2>
                <AdventureButton
                  intent="ghost"
                  size="sm"
                  onClick={onViewAllAchievements}
                  className="motion-safe:anim-reveal-up anim-delay-300"
                >
                  View All
                </AdventureButton>
              </div>

              <div className="space-y-3">
                {recentAchievements.slice(0, 4).map((achievement, index) => (
                  <JungleCard
                    key={achievement.id}
                    tone={achievement.earned ? "success" : "default"}
                    size="sm"
                    elevation="low"
                    className="motion-safe:anim-reveal-up"
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <JungleCardContent className="flex items-center gap-3 py-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-text truncate">
                          {achievement.name}
                        </h4>
                        <p className="text-xs text-text-secondary line-clamp-2">
                          {achievement.description}
                        </p>
                        {!achievement.earned && achievement.progress && achievement.maxProgress && (
                          <div className="mt-2">
                            <div className="w-full bg-surface-2 rounded-full h-1">
                              <div
                                className="bg-jungle-500 h-1 rounded-full transition-all"
                                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      {achievement.earned && (
                        <Star className="w-4 h-4 text-success" />
                      )}
                    </JungleCardContent>
                  </JungleCard>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Preview */}
          <JungleCard tone="jungle" size="lg" elevation="medium" className="motion-safe:anim-reveal-up anim-delay-500">
            <JungleCardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <JungleCardTitle size="lg">Explore New Categories</JungleCardTitle>
                  <JungleCardDescription>
                    Discover new word adventures waiting for you
                  </JungleCardDescription>
                </div>
                <JungleCardIcon className="text-jungle-600">
                  <Compass className="w-8 h-8" />
                </JungleCardIcon>
              </div>
            </JungleCardHeader>
            <JungleCardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Animals", icon: "🦁", color: "jungle" },
                  { name: "Nature", icon: "🌺", color: "banana" },
                  { name: "Adventure", icon: "🏔️", color: "sky" },
                  { name: "Magic", icon: "✨", color: "berry" },
                ].map((category, index) => (
                  <div
                    key={category.name}
                    onClick={() => onSelectCategory(category.name.toLowerCase())}
                    className={`text-center p-4 bg-${category.color}-100 rounded-lg cursor-pointer transition-soft hover:scale-105 motion-safe:anim-reveal-up`}
                    style={{ animationDelay: `${600 + index * 100}ms` }}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium text-text">{category.name}</div>
                  </div>
                ))}
              </div>
            </JungleCardContent>
            <JungleCardFooter>
              <AdventureButton
                intent="jungle"
                size="md"
                className="w-full"
                onClick={() => onSelectCategory("all")}
              >
                Explore All Categories
              </AdventureButton>
            </JungleCardFooter>
          </JungleCard>
        </div>
      </JunglePanel>
    </div>
  );
}

/* ========================================
 * USAGE EXAMPLE
 * ======================================== */

/*
// In your app home page component:
import { AppHomeTemplate } from "@/templates/AppHomeTemplate";

export default function AppHomePage() {
  const userName = "Alex";
  const stats = {
    wordsLearned: 125,
    totalWords: 500,
    currentStreak: 7,
    weeklyGoal: 30,
    weeklyProgress: 25,
    accuracyRate: 87,
    level: 3,
    totalPoints: 1250,
    favoriteCategory: "Animals",
  };

  const quickActions = [
    {
      id: "quick-quiz",
      title: "Quick Quiz",
      description: "Test your knowledge with a fun quiz",
      icon: <Zap className="w-6 h-6" />,
      color: "banana" as const,
      onClick: () => router.push("/quiz"),
    },
    {
      id: "word-adventure",
      title: "Word Adventure",
      description: "Explore new words in exciting stories",
      icon: <BookOpen className="w-6 h-6" />,
      color: "jungle" as const,
      onClick: () => router.push("/adventure"),
    },
    {
      id: "practice",
      title: "Practice Mode",
      description: "Review words you're learning",
      icon: <Target className="w-6 h-6" />,
      color: "sky" as const,
      onClick: () => router.push("/practice"),
    },
    {
      id: "achievements",
      title: "Achievements",
      description: "See all your jungle accomplishments",
      icon: <Trophy className="w-6 h-6" />,
      color: "berry" as const,
      onClick: () => router.push("/achievements"),
    },
  ];

  const recentAchievements = [
    {
      id: "first-word",
      name: "First Word",
      description: "Learned your first word",
      icon: "🎯",
      earned: true,
    },
    {
      id: "streak-master",
      name: "Streak Master",
      description: "7-day learning streak",
      icon: "🔥",
      earned: true,
    },
    {
      id: "word-collector",
      name: "Word Collector",
      description: "Learn 50 words",
      icon: "📚",
      earned: false,
      progress: 25,
      maxProgress: 50,
    },
  ];

  return (
    <AppHomeTemplate
      userName={userName}
      stats={stats}
      quickActions={quickActions}
      recentAchievements={recentAchievements}
      onQuickQuiz={() => router.push("/quiz")}
      onContinueLearning={() => router.push("/learn")}
      onViewAllAchievements={() => router.push("/achievements")}
      onSelectCategory={(category) => router.push(`/categories/${category}`)}
    />
  );
}
*/
