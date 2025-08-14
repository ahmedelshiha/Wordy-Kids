interface UserStats {
  wordsLearned: number;
  wordsRemembered: number;
  averageAccuracy: number;
  sessionCount: number;
  streakDays: number;
  preferredCategories: string[];
  weakCategories: string[];
  peakLearningTimes: string[];
}

interface GoalTemplate {
  id: string;
  type: "daily" | "weekly" | "monthly";
  category: string;
  targetMetric: "words" | "accuracy" | "sessions" | "streak";
  baseTarget: number;
  difficulty: "easy" | "medium" | "hard";
  adaptiveRules: AdaptiveRule[];
  description: string;
  motivationalMessage: string;
  prerequisites?: string[];
}

interface AdaptiveRule {
  condition: {
    metric: string;
    operator: ">" | "<" | ">=" | "<=" | "=";
    value: number;
    timeframe?: "day" | "week" | "month";
  };
  adjustment: {
    type: "increase" | "decrease" | "maintain";
    amount: number | "percentage";
    max?: number;
    min?: number;
  };
}

interface Goal {
  id: string;
  templateId: string;
  type: "daily" | "weekly" | "monthly";
  target: number;
  current: number;
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  streak: number;
  bestStreak: number;
  startDate: string;
  endDate?: string;
  description: string;
  completionRate: number;
  lastAdjusted: string;
  adaptations: GoalAdaptation[];
}

interface GoalAdaptation {
  date: string;
  reason: string;
  oldTarget: number;
  newTarget: number;
  triggerMetric: string;
  triggerValue: number;
}

interface GoalRecommendation {
  goalTemplate: GoalTemplate;
  reasoning: string;
  priority: "high" | "medium" | "low";
  estimatedDifficulty: "easy" | "medium" | "hard";
  expectedCompletionTime: number;
}

class GoalManagementSystem {
  private static GOAL_TEMPLATES: GoalTemplate[] = [
    {
      id: "daily-words-beginner",
      type: "daily",
      category: "vocabulary",
      targetMetric: "words",
      baseTarget: 5,
      difficulty: "easy",
      adaptiveRules: [
        {
          condition: { metric: "accuracyRate", operator: ">=", value: 80 },
          adjustment: { type: "increase", amount: 1, max: 15 },
        },
        {
          condition: { metric: "streakDays", operator: ">=", value: 7 },
          adjustment: { type: "increase", amount: 2, max: 15 },
        },
      ],
      description: "Learn new words every day",
      motivationalMessage: "Small steps lead to big achievements! 🌟",
    },
    {
      id: "daily-words-intermediate",
      type: "daily",
      category: "vocabulary",
      targetMetric: "words",
      baseTarget: 10,
      difficulty: "medium",
      adaptiveRules: [
        {
          condition: { metric: "accuracyRate", operator: ">=", value: 85 },
          adjustment: { type: "increase", amount: 2, max: 25 },
        },
        {
          condition: { metric: "accuracyRate", operator: "<", value: 70 },
          adjustment: { type: "decrease", amount: 2, min: 5 },
        },
      ],
      description: "Build your vocabulary consistently",
      motivationalMessage: "You're making excellent progress! 🚀",
      prerequisites: ["daily-words-beginner"],
    },
    {
      id: "daily-words-advanced",
      type: "daily",
      category: "vocabulary",
      targetMetric: "words",
      baseTarget: 20,
      difficulty: "hard",
      adaptiveRules: [
        {
          condition: { metric: "accuracyRate", operator: ">=", value: 90 },
          adjustment: { type: "increase", amount: 3, max: 50 },
        },
        {
          condition: { metric: "accuracyRate", operator: "<", value: 75 },
          adjustment: { type: "decrease", amount: 3, min: 10 },
        },
      ],
      description: "Master vocabulary at an advanced pace",
      motivationalMessage: "You're becoming a vocabulary champion! 🏆",
      prerequisites: ["daily-words-intermediate"],
    },
    {
      id: "weekly-accuracy",
      type: "weekly",
      category: "performance",
      targetMetric: "accuracy",
      baseTarget: 80,
      difficulty: "medium",
      adaptiveRules: [
        {
          condition: {
            metric: "averageAccuracy",
            operator: ">=",
            value: 85,
            timeframe: "week",
          },
          adjustment: { type: "increase", amount: 5, max: 95 },
        },
      ],
      description: "Maintain high accuracy in your learning",
      motivationalMessage: "Precision is the key to mastery! 🎯",
    },
    {
      id: "monthly-streak",
      type: "monthly",
      category: "consistency",
      targetMetric: "streak",
      baseTarget: 15,
      difficulty: "medium",
      adaptiveRules: [
        {
          condition: { metric: "streakDays", operator: ">=", value: 20 },
          adjustment: { type: "increase", amount: 5, max: 30 },
        },
      ],
      description: "Maintain a consistent learning streak",
      motivationalMessage: "Consistency builds excellence! 🔥",
    },
    {
      id: "category-explorer",
      type: "weekly",
      category: "exploration",
      targetMetric: "words",
      baseTarget: 30,
      difficulty: "easy",
      adaptiveRules: [
        {
          condition: { metric: "categoriesExplored", operator: ">=", value: 5 },
          adjustment: { type: "increase", amount: 10, max: 50 },
        },
      ],
      description: "Explore words from different categories",
      motivationalMessage: "Discover the richness of language! 🌈",
    },
  ];

  private static CATEGORY_DIFFICULTIES = {
    animals: { easy: 0.9, medium: 0.7, hard: 0.5 },
    food: { easy: 0.95, medium: 0.8, hard: 0.6 },
    colors: { easy: 0.98, medium: 0.9, hard: 0.7 },
    numbers: { easy: 0.92, medium: 0.75, hard: 0.55 },
    science: { easy: 0.7, medium: 0.5, hard: 0.3 },
    space: { easy: 0.65, medium: 0.45, hard: 0.25 },
    nature: { easy: 0.85, medium: 0.65, hard: 0.45 },
    body: { easy: 0.9, medium: 0.7, hard: 0.5 },
  };

  static analyzeUserLevel(
    stats: UserStats,
  ): "beginner" | "intermediate" | "advanced" {
    const { wordsLearned, averageAccuracy, sessionCount, streakDays } = stats;

    let score = 0;

    // Words learned (0-40 points)
    if (wordsLearned >= 100) score += 40;
    else if (wordsLearned >= 50) score += 30;
    else if (wordsLearned >= 20) score += 20;
    else if (wordsLearned >= 10) score += 10;

    // Accuracy (0-30 points)
    if (averageAccuracy >= 90) score += 30;
    else if (averageAccuracy >= 80) score += 25;
    else if (averageAccuracy >= 70) score += 20;
    else if (averageAccuracy >= 60) score += 15;
    else if (averageAccuracy >= 50) score += 10;

    // Session count (0-20 points)
    if (sessionCount >= 50) score += 20;
    else if (sessionCount >= 30) score += 15;
    else if (sessionCount >= 15) score += 10;
    else if (sessionCount >= 5) score += 5;

    // Streak (0-10 points)
    if (streakDays >= 14) score += 10;
    else if (streakDays >= 7) score += 8;
    else if (streakDays >= 3) score += 5;
    else if (streakDays >= 1) score += 2;

    if (score >= 80) return "advanced";
    if (score >= 40) return "intermediate";
    return "beginner";
  }

  static recommendGoals(
    stats: UserStats,
    currentGoals: Goal[],
  ): GoalRecommendation[] {
    const userLevel = this.analyzeUserLevel(stats);
    const recommendations: GoalRecommendation[] = [];

    // Get completed goal templates to check prerequisites
    const completedTemplateIds = currentGoals
      .filter((goal) => goal.completionRate >= 100)
      .map((goal) => goal.templateId);

    this.GOAL_TEMPLATES.forEach((template) => {
      // Skip if prerequisites not met
      if (
        template.prerequisites?.some(
          (prereq) => !completedTemplateIds.includes(prereq),
        )
      ) {
        return;
      }

      // Skip if user already has this type of goal active
      const hasActiveGoal = currentGoals.some(
        (goal) => goal.templateId === template.id && goal.isActive,
      );
      if (hasActiveGoal) return;

      let priority: "high" | "medium" | "low" = "medium";
      let reasoning = "";

      // Determine priority based on user stats and level
      if (template.category === "vocabulary") {
        if (userLevel === "beginner" && template.difficulty === "easy") {
          priority = "high";
          reasoning = "Perfect starting point for building vocabulary habits";
        } else if (
          userLevel === "intermediate" &&
          template.difficulty === "medium"
        ) {
          priority = "high";
          reasoning = "Ideal for your current skill level";
        } else if (userLevel === "advanced" && template.difficulty === "hard") {
          priority = "high";
          reasoning = "Challenge yourself with advanced vocabulary goals";
        }
      }

      if (template.category === "performance" && stats.averageAccuracy < 80) {
        priority = "high";
        reasoning = "Focus on accuracy to improve learning effectiveness";
      }

      if (template.category === "consistency" && stats.streakDays < 7) {
        priority = "high";
        reasoning = "Build consistent learning habits for better results";
      }

      if (
        template.category === "exploration" &&
        stats.preferredCategories.length <= 2
      ) {
        priority = "medium";
        reasoning = "Expand your vocabulary by exploring new categories";
      }

      // Estimate difficulty based on user's weak areas
      let estimatedDifficulty = template.difficulty;
      if (
        template.category === "vocabulary" &&
        stats.weakCategories.length > 2
      ) {
        estimatedDifficulty =
          estimatedDifficulty === "easy" ? "medium" : "hard";
      }

      // Estimate completion time based on user's session frequency
      const avgSessionsPerWeek =
        stats.sessionCount > 0 ? Math.max(stats.sessionCount / 4, 1) : 1; // Assume 4 weeks of data

      let expectedCompletionTime = 7; // days
      if (template.type === "weekly") expectedCompletionTime = 7;
      else if (template.type === "monthly") expectedCompletionTime = 30;
      else if (template.type === "daily") {
        expectedCompletionTime = Math.ceil(
          template.baseTarget / avgSessionsPerWeek,
        );
      }

      recommendations.push({
        goalTemplate: template,
        reasoning,
        priority,
        estimatedDifficulty,
        expectedCompletionTime,
      });
    });

    // Sort by priority and user level match
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });
  }

  static adaptGoal(goal: Goal, stats: UserStats): Goal {
    const template = this.GOAL_TEMPLATES.find((t) => t.id === goal.templateId);
    if (!template) return goal;

    let newTarget = goal.target;
    let adaptationReason = "";

    for (const rule of template.adaptiveRules) {
      const { condition, adjustment } = rule;
      let metricValue = 0;

      // Get metric value from stats
      switch (condition.metric) {
        case "accuracyRate":
          metricValue = stats.averageAccuracy;
          break;
        case "streakDays":
          metricValue = stats.streakDays;
          break;
        case "wordsLearned":
          metricValue = stats.wordsLearned;
          break;
        case "sessionCount":
          metricValue = stats.sessionCount;
          break;
        case "categoriesExplored":
          metricValue = stats.preferredCategories.length;
          break;
        default:
          continue;
      }

      // Check if condition is met
      let conditionMet = false;
      switch (condition.operator) {
        case ">":
          conditionMet = metricValue > condition.value;
          break;
        case "<":
          conditionMet = metricValue < condition.value;
          break;
        case ">=":
          conditionMet = metricValue >= condition.value;
          break;
        case "<=":
          conditionMet = metricValue <= condition.value;
          break;
        case "=":
          conditionMet = metricValue === condition.value;
          break;
      }

      if (conditionMet) {
        const oldTarget = newTarget;

        if (adjustment.type === "increase") {
          if (typeof adjustment.amount === "number") {
            newTarget = Math.min(
              newTarget + adjustment.amount,
              adjustment.max || Infinity,
            );
          } else if (adjustment.amount === "percentage") {
            newTarget = Math.min(newTarget * 1.2, adjustment.max || Infinity);
          }
          adaptationReason = `Increased due to ${condition.metric} being ${metricValue}`;
        } else if (adjustment.type === "decrease") {
          if (typeof adjustment.amount === "number") {
            newTarget = Math.max(
              newTarget - adjustment.amount,
              adjustment.min || 1,
            );
          } else if (adjustment.amount === "percentage") {
            newTarget = Math.max(newTarget * 0.8, adjustment.min || 1);
          }
          adaptationReason = `Decreased due to ${condition.metric} being ${metricValue}`;
        }

        // Record adaptation if target changed
        if (newTarget !== oldTarget) {
          const adaptation: GoalAdaptation = {
            date: new Date().toISOString(),
            reason: adaptationReason,
            oldTarget,
            newTarget,
            triggerMetric: condition.metric,
            triggerValue: metricValue,
          };

          goal.adaptations.push(adaptation);
          goal.lastAdjusted = new Date().toISOString();
        }

        break; // Apply only the first matching rule
      }
    }

    return {
      ...goal,
      target: newTarget,
    };
  }

  static createGoalFromTemplate(
    template: GoalTemplate,
    customizations?: {
      target?: number;
      category?: string;
      difficulty?: "easy" | "medium" | "hard";
    },
  ): Goal {
    const now = new Date().toISOString();

    return {
      id: `goal-${template.id}-${Date.now()}`,
      templateId: template.id,
      type: template.type,
      target: customizations?.target || template.baseTarget,
      current: 0,
      category: customizations?.category || template.category,
      difficulty: customizations?.difficulty || template.difficulty,
      isActive: true,
      streak: 0,
      bestStreak: 0,
      startDate: now,
      description: template.description,
      completionRate: 0,
      lastAdjusted: now,
      adaptations: [],
    };
  }

  static updateGoalProgress(goal: Goal, progress: number): Goal {
    const updatedGoal = { ...goal };
    const previousCurrent = updatedGoal.current;

    updatedGoal.current = Math.min(progress, updatedGoal.target);
    updatedGoal.completionRate = Math.round(
      (updatedGoal.current / updatedGoal.target) * 100,
    );

    // Update streak
    if (
      updatedGoal.current > previousCurrent &&
      updatedGoal.current >= updatedGoal.target
    ) {
      updatedGoal.streak += 1;
      updatedGoal.bestStreak = Math.max(
        updatedGoal.bestStreak,
        updatedGoal.streak,
      );
    }

    return updatedGoal;
  }

  static getAdaptiveDifficulty(
    category: string,
    userStats: UserStats,
  ): "easy" | "medium" | "hard" {
    const categoryDifficulty =
      this.CATEGORY_DIFFICULTIES[
        category as keyof typeof this.CATEGORY_DIFFICULTIES
      ];
    if (!categoryDifficulty) return "medium";

    // Adjust based on user's accuracy in this category
    const isWeakCategory = userStats.weakCategories.includes(category);
    const isStrongCategory = userStats.preferredCategories.includes(category);

    if (isWeakCategory) {
      return "easy";
    } else if (isStrongCategory && userStats.averageAccuracy >= 85) {
      return "hard";
    } else {
      return "medium";
    }
  }

  static generateSmartGoalPlan(
    stats: UserStats,
    timeframe: "week" | "month",
  ): Goal[] {
    const recommendations = this.recommendGoals(stats, []);
    const plan: Goal[] = [];

    // Always include a daily vocabulary goal
    const dailyVocabTemplate = recommendations.find(
      (r) =>
        r.goalTemplate.targetMetric === "words" &&
        r.goalTemplate.type === "daily",
    );
    if (dailyVocabTemplate) {
      plan.push(this.createGoalFromTemplate(dailyVocabTemplate.goalTemplate));
    }

    // Add a performance goal if accuracy is low
    if (stats.averageAccuracy < 80) {
      const accuracyTemplate = recommendations.find(
        (r) => r.goalTemplate.targetMetric === "accuracy",
      );
      if (accuracyTemplate) {
        plan.push(this.createGoalFromTemplate(accuracyTemplate.goalTemplate));
      }
    }

    // Add an exploration goal if user is advanced or has limited category exploration
    if (
      this.analyzeUserLevel(stats) === "advanced" ||
      stats.preferredCategories.length <= 2
    ) {
      const explorationTemplate = recommendations.find(
        (r) => r.goalTemplate.category === "exploration",
      );
      if (explorationTemplate) {
        plan.push(
          this.createGoalFromTemplate(explorationTemplate.goalTemplate),
        );
      }
    }

    // Add a consistency goal for longer timeframes
    if (timeframe === "month") {
      const consistencyTemplate = recommendations.find(
        (r) => r.goalTemplate.category === "consistency",
      );
      if (consistencyTemplate) {
        plan.push(
          this.createGoalFromTemplate(consistencyTemplate.goalTemplate),
        );
      }
    }

    return plan;
  }

  static analyzeGoalPerformance(goals: Goal[]): {
    overallCompletionRate: number;
    strongAreas: string[];
    improvementAreas: string[];
    insights: string[];
  } {
    if (goals.length === 0) {
      return {
        overallCompletionRate: 0,
        strongAreas: [],
        improvementAreas: [],
        insights: [
          "No goals set yet. Consider creating your first learning goal!",
        ],
      };
    }

    const completionRates = goals.map((g) => g.completionRate);
    const overallCompletionRate =
      completionRates.reduce((sum, rate) => sum + rate, 0) / goals.length;

    const strongAreas: string[] = [];
    const improvementAreas: string[] = [];
    const insights: string[] = [];

    // Analyze by category
    const categoryPerformance = goals.reduce(
      (acc, goal) => {
        if (!goal.category) return acc;
        if (!acc[goal.category]) acc[goal.category] = [];
        acc[goal.category].push(goal.completionRate);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    Object.entries(categoryPerformance).forEach(([category, rates]) => {
      const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      if (avgRate >= 80) {
        strongAreas.push(category);
      } else if (avgRate < 60) {
        improvementAreas.push(category);
      }
    });

    // Generate insights
    if (overallCompletionRate >= 80) {
      insights.push(
        "🌟 Excellent goal achievement! You're building strong learning habits.",
      );
    } else if (overallCompletionRate >= 60) {
      insights.push("👍 Good progress on your goals. Keep up the momentum!");
    } else {
      insights.push(
        "💪 Room for improvement. Consider adjusting your goals to be more achievable.",
      );
    }

    const dailyGoals = goals.filter((g) => g.type === "daily");
    if (dailyGoals.length > 0) {
      const dailyAvg =
        dailyGoals.reduce((sum, g) => sum + g.completionRate, 0) /
        dailyGoals.length;
      if (dailyAvg > overallCompletionRate * 1.2) {
        insights.push(
          "🎯 You excel at daily goals! Consider adding more consistent habits.",
        );
      }
    }

    const adaptiveGoals = goals.filter((g) => g.adaptations.length > 0);
    if (adaptiveGoals.length > 0) {
      insights.push(
        "🔄 Your goals are adapting to your progress - that's smart learning!",
      );
    }

    return {
      overallCompletionRate: Math.round(overallCompletionRate),
      strongAreas,
      improvementAreas,
      insights,
    };
  }
}

export {
  GoalManagementSystem,
  type Goal,
  type GoalTemplate,
  type GoalRecommendation,
  type UserStats,
  type GoalAdaptation,
  type AdaptiveRule,
};
