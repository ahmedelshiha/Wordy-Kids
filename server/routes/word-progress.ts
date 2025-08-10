import { RequestHandler } from "express";
import {
  WordProgress,
  LearningSession,
  ChildWordStats,
  RecordWordProgressRequest,
  RecordWordProgressResponse,
  StartLearningSessionRequest,
  StartLearningSessionResponse,
  EndLearningSessionRequest,
  EndLearningSessionResponse,
  GetChildStatsRequest,
  GetChildStatsResponse,
} from "@shared/api";

// In-memory storage for demo purposes
// In production, this would use a real database
const wordProgressStore = new Map<string, WordProgress>();
const learningSessionsStore = new Map<string, LearningSession>();
const childStatsStore = new Map<string, ChildWordStats>();

// Helper function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to calculate spaced repetition interval
const calculateSpacedRepetitionInterval = (
  accuracy: number,
  currentInterval: number,
): number => {
  if (accuracy >= 90) return Math.min(currentInterval * 2.5, 30); // Max 30 days
  if (accuracy >= 75) return Math.min(currentInterval * 1.8, 14); // Max 14 days
  if (accuracy >= 60) return Math.min(currentInterval * 1.3, 7); // Max 7 days
  return Math.max(currentInterval * 0.8, 1); // Min 1 day
};

// Helper function to calculate mastery level
const calculateMasteryLevel = (
  timesCorrect: number,
  timesReviewed: number,
  accuracy: number,
): number => {
  if (timesReviewed === 0) return 0;

  const baseScore = (accuracy / 100) * 60; // 60 points for accuracy
  const experienceScore = Math.min(timesReviewed * 2, 30); // 30 points for experience
  const consistencyScore = timesCorrect >= 3 ? 10 : timesCorrect * 3; // 10 points for consistency

  return Math.min(
    Math.round(baseScore + experienceScore + consistencyScore),
    100,
  );
};

// Helper function to update child stats
const updateChildStats = (
  childId: string,
  wordProgress: WordProgress[],
): ChildWordStats => {
  const stats: ChildWordStats = {
    childId,
    totalWordsLearned: wordProgress.length,
    wordsRemembered: wordProgress.filter((wp) => wp.status === "remembered")
      .length,
    wordsNeedingPractice: wordProgress.filter(
      (wp) => wp.status === "needs_practice",
    ).length,
    averageAccuracy:
      wordProgress.length > 0
        ? Math.round(
            wordProgress.reduce((sum, wp) => sum + wp.accuracy, 0) /
              wordProgress.length,
          )
        : 0,
    totalReviewSessions: wordProgress.reduce(
      (sum, wp) => sum + wp.timesReviewed,
      0,
    ),
    strongestCategories: [],
    weakestCategories: [],
    recentProgress: [],
    masteryByCategory: [],
  };

  // Calculate category statistics
  const categoryMap = new Map<
    string,
    { total: number; accuracy: number; mastered: number; needsPractice: number }
  >();

  wordProgress.forEach((wp) => {
    if (!categoryMap.has(wp.category)) {
      categoryMap.set(wp.category, {
        total: 0,
        accuracy: 0,
        mastered: 0,
        needsPractice: 0,
      });
    }
    const catStats = categoryMap.get(wp.category)!;
    catStats.total++;
    catStats.accuracy += wp.accuracy;
    if (wp.masteryLevel >= 80) catStats.mastered++;
    if (wp.status === "needs_practice") catStats.needsPractice++;
  });

  // Process category data
  stats.masteryByCategory = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      totalWords: data.total,
      masteredWords: data.mastered,
      needsPracticeWords: data.needsPractice,
      averageAccuracy: Math.round(data.accuracy / data.total),
    }),
  );

  // Sort categories by performance
  const sortedCategories = stats.masteryByCategory.sort(
    (a, b) => b.averageAccuracy - a.averageAccuracy,
  );
  stats.strongestCategories = sortedCategories
    .slice(0, 3)
    .map((cat) => cat.category);
  stats.weakestCategories = sortedCategories
    .slice(-3)
    .reverse()
    .map((cat) => cat.category);

  // Store updated stats
  childStatsStore.set(childId, stats);
  return stats;
};

// Start Learning Session
export const startLearningSession: RequestHandler = async (req, res) => {
  try {
    const {
      childId,
      sessionType,
      category,
      difficulty,
    }: StartLearningSessionRequest = req.body;

    if (!childId || !sessionType) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: childId, sessionType",
      });
    }

    const sessionId = generateId();

    // Get words to review for this child (simplified for demo)
    const wordsToReview = [
      {
        id: "1",
        word: "elephant",
        category: "Animals",
        definition: "A large mammal with a trunk",
        example: "The elephant at the zoo was huge.",
        lastAccuracy: 85,
      },
      {
        id: "2",
        word: "microscope",
        category: "Science",
        definition: "An instrument for viewing very small objects",
        example: "We used a microscope to look at cells.",
        lastAccuracy: 70,
      },
      {
        id: "3",
        word: "rainbow",
        category: "Nature",
        definition: "An arc of colors in the sky",
        example: "After the rain, we saw a beautiful rainbow.",
        lastAccuracy: 95,
      },
      {
        id: "4",
        word: "volcano",
        category: "Geography",
        definition: "A mountain that can erupt lava",
        example: "The volcano erupted with great force.",
        lastAccuracy: 60,
      },
      {
        id: "5",
        word: "orchestra",
        category: "Music",
        definition: "A large group of musicians",
        example: "The orchestra played a beautiful symphony.",
        lastAccuracy: 45,
      },
    ].filter((word) => !category || word.category === category);

    const response: StartLearningSessionResponse = {
      success: true,
      sessionId,
      wordsToReview,
    };

    res.json(response);
  } catch (error) {
    console.error("Error starting learning session:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Record Word Progress
export const recordWordProgress: RequestHandler = async (req, res) => {
  try {
    const {
      childId,
      sessionId,
      wordId,
      word,
      category,
      status,
      responseTime = 0,
      difficulty = "medium",
    }: RecordWordProgressRequest = req.body;

    if (!childId || !wordId || !word || !status) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const progressKey = `${childId}-${wordId}`;
    const existingProgress = wordProgressStore.get(progressKey);
    const now = new Date();

    let wordProgress: WordProgress;

    if (existingProgress) {
      // Update existing progress
      const timesCorrect =
        existingProgress.timesCorrect + (status === "remembered" ? 1 : 0);
      const timesIncorrect =
        existingProgress.timesIncorrect + (status === "needs_practice" ? 1 : 0);
      const timesReviewed = existingProgress.timesReviewed + 1;
      const accuracy = Math.round((timesCorrect / timesReviewed) * 100);
      const masteryLevel = calculateMasteryLevel(
        timesCorrect,
        timesReviewed,
        accuracy,
      );
      const currentInterval = existingProgress.spacedRepetitionInterval;
      const newInterval = calculateSpacedRepetitionInterval(
        accuracy,
        currentInterval,
      );

      wordProgress = {
        ...existingProgress,
        status,
        timesReviewed,
        timesCorrect,
        timesIncorrect,
        accuracy,
        lastReviewed: now,
        masteryLevel,
        spacedRepetitionInterval: newInterval,
        nextReviewDate: new Date(
          now.getTime() + newInterval * 24 * 60 * 60 * 1000,
        ),
        averageResponseTime:
          (existingProgress.averageResponseTime + responseTime) / 2,
        learningSessionIds: [...existingProgress.learningSessionIds, sessionId],
        updatedAt: now,
      };
    } else {
      // Create new progress record
      const masteryLevel = calculateMasteryLevel(
        status === "remembered" ? 1 : 0,
        1,
        status === "remembered" ? 100 : 0,
      );
      const initialInterval = status === "remembered" ? 3 : 1; // 3 days if remembered, 1 day if needs practice

      wordProgress = {
        id: generateId(),
        childId,
        wordId,
        word,
        category,
        status,
        difficulty,
        timesReviewed: 1,
        timesCorrect: status === "remembered" ? 1 : 0,
        timesIncorrect: status === "needs_practice" ? 1 : 0,
        accuracy: status === "remembered" ? 100 : 0,
        lastReviewed: now,
        firstLearned: now,
        masteryLevel,
        spacedRepetitionInterval: initialInterval,
        nextReviewDate: new Date(
          now.getTime() + initialInterval * 24 * 60 * 60 * 1000,
        ),
        averageResponseTime: responseTime,
        learningSessionIds: [sessionId],
        createdAt: now,
        updatedAt: now,
      };
    }

    // Store updated progress
    wordProgressStore.set(progressKey, wordProgress);

    // Update child stats
    const allProgressForChild = Array.from(wordProgressStore.values()).filter(
      (wp) => wp.childId === childId,
    );
    const updatedStats = updateChildStats(childId, allProgressForChild);

    // Check for achievements and level ups
    const achievements: string[] = [];
    let levelUp = false;

    if (wordProgress.masteryLevel >= 80 && !existingProgress) {
      achievements.push("Word Master");
    }
    if (
      updatedStats.totalWordsLearned % 10 === 0 &&
      updatedStats.totalWordsLearned > 0
    ) {
      achievements.push(`${updatedStats.totalWordsLearned} Words Learned`);
    }
    if (updatedStats.averageAccuracy >= 90) {
      achievements.push("Accuracy Expert");
    }

    const response: RecordWordProgressResponse = {
      success: true,
      wordProgress,
      updatedStats,
      levelUp,
      achievements,
    };

    res.json(response);
  } catch (error) {
    console.error("Error recording word progress:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// End Learning Session
export const endLearningSession: RequestHandler = async (req, res) => {
  try {
    const {
      sessionId,
      wordsRemembered,
      wordsNeedPractice,
      totalWords,
      pointsEarned = 0,
    }: EndLearningSessionRequest = req.body;

    if (!sessionId || !wordsRemembered || !wordsNeedPractice) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const session = learningSessionsStore.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    // Update session with results
    const endTime = new Date();
    const duration = Math.round(
      (endTime.getTime() - session.startTime.getTime()) / 1000,
    );
    const correctAnswers = wordsRemembered.length;
    const incorrectAnswers = wordsNeedPractice.length;
    const accuracy =
      totalWords > 0 ? Math.round((correctAnswers / totalWords) * 100) : 0;

    const updatedSession: LearningSession = {
      ...session,
      endTime,
      duration,
      wordsRemembered,
      wordsNeedPractice,
      totalWords,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      pointsEarned,
    };

    learningSessionsStore.set(sessionId, updatedSession);

    // Get updated child stats
    const allProgressForChild = Array.from(wordProgressStore.values()).filter(
      (wp) => wp.childId === session.childId,
    );
    const updatedStats = updateChildStats(session.childId, allProgressForChild);

    const response: EndLearningSessionResponse = {
      success: true,
      session: updatedSession,
      updatedStats,
      achievements: [],
    };

    res.json(response);
  } catch (error) {
    console.error("Error ending learning session:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get Child Stats
export const getChildStats: RequestHandler = async (req, res) => {
  try {
    const { childId } = req.params;
    const { dateRange = "all" }: GetChildStatsRequest = req.query as any;

    if (!childId) {
      return res.status(400).json({
        success: false,
        error: "Missing childId parameter",
      });
    }

    // Get all progress for child
    const allProgressForChild = Array.from(wordProgressStore.values()).filter(
      (wp) => wp.childId === childId,
    );
    const stats = updateChildStats(childId, allProgressForChild);

    // Get recent sessions
    const recentSessions = Array.from(learningSessionsStore.values())
      .filter((session) => session.childId === childId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10);

    // Get top performing words
    const topWords = allProgressForChild
      .filter((wp) => wp.accuracy >= 80)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10)
      .map((wp) => ({
        word: wp.word,
        category: wp.category,
        accuracy: wp.accuracy,
        timesReviewed: wp.timesReviewed,
      }));

    // Get struggling words
    const strugglingWords = allProgressForChild
      .filter((wp) => wp.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 10)
      .map((wp) => ({
        word: wp.word,
        category: wp.category,
        accuracy: wp.accuracy,
        timesReviewed: wp.timesReviewed,
      }));

    const response: GetChildStatsResponse = {
      success: true,
      stats,
      recentSessions,
      topWords,
      strugglingWords,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting child stats:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Get all children's progress summary (for parent dashboard)
export const getAllChildrenProgress: RequestHandler = async (req, res) => {
  try {
    const childrenStats = new Map<string, ChildWordStats>();

    // Group progress by child
    const progressByChild = new Map<string, WordProgress[]>();
    for (const progress of wordProgressStore.values()) {
      if (!progressByChild.has(progress.childId)) {
        progressByChild.set(progress.childId, []);
      }
      progressByChild.get(progress.childId)!.push(progress);
    }

    // Calculate stats for each child
    for (const [childId, progressList] of progressByChild) {
      const stats = updateChildStats(childId, progressList);
      childrenStats.set(childId, stats);
    }

    res.json({
      success: true,
      childrenStats: Object.fromEntries(childrenStats),
    });
  } catch (error) {
    console.error("Error getting all children progress:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};
