import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameResult, WordItem } from "../../types/vowel-adventure";
import {
  wordsDatabase,
  Word,
  getWordsByCategory,
  getRandomWords,
} from "../../data/wordsDatabase";
import { Button } from "../ui/button";
import { Volume2, VolumeX, Home, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import { EnhancedAchievementTracker } from "../../lib/enhancedAchievementTracker";
import { audioService } from "../../lib/audioService";
import { CelebrationEffect } from "../CelebrationEffect";
import { EnhancedAchievementPopup } from "../EnhancedAchievementPopup";
import "../../styles/balloon-rescue-adventure.css";

type Props = {
  words?: WordItem[];
  totalQuestions?: number;
  category?: string;
  onFinish?: (result: GameResult) => void;
  onHome?: () => void;
};

type Screen = "loading" | "play" | "result";

interface Question {
  id: string;
  word: string;
  emoji: string;
  missingVowel: string;
  missingIndex: number;
  displayWord: string;
  difficulty: "easy" | "medium" | "hard";
  distractors: string[];
}

const VOWELS = ["A", "E", "I", "O", "U"];

// Smart distractor generation - only uses vowels present in the word
const generateSmartDistractors = (
  correctVowel: string,
  word: string,
  difficulty: "easy" | "medium" | "hard",
): string[] => {
  // Find all vowels present in the word
  const upperWord = word.toUpperCase();
  const vowelsInWord = [
    ...new Set(upperWord.split("").filter((char) => VOWELS.includes(char))),
  ];

  // Ensure we have the correct vowel
  const distractors = [correctVowel];

  // Add other vowels that are actually in the word first
  vowelsInWord.forEach((vowel) => {
    if (vowel !== correctVowel && distractors.length < 4) {
      distractors.push(vowel);
    }
  });

  // If we need more distractors and there aren't enough vowels in the word,
  // add similar sounding vowels based on difficulty
  if (distractors.length < 4) {
    const similar = {
      A: difficulty === "easy" ? ["E"] : ["E", "I"],
      E: difficulty === "easy" ? ["A"] : ["A", "I"],
      I: difficulty === "easy" ? ["E"] : ["E", "A"],
      O: difficulty === "easy" ? ["U"] : ["U", "A"],
      U: difficulty === "easy" ? ["O"] : ["O", "E"],
    };

    const similarVowels = similar[correctVowel as keyof typeof similar] || [];
    similarVowels.forEach((vowel) => {
      if (distractors.length < 4 && !distractors.includes(vowel)) {
        distractors.push(vowel);
      }
    });
  }

  // If still need more, add any remaining vowels (for very complex words)
  if (distractors.length < 4) {
    VOWELS.forEach((vowel) => {
      if (distractors.length < 4 && !distractors.includes(vowel)) {
        distractors.push(vowel);
      }
    });
  }

  // Shuffle to randomize order
  return distractors.sort(() => Math.random() - 0.5);
};

export const BalloonRescueVowelAdventure: React.FC<Props> = ({
  totalQuestions = 10,
  category = "all",
  onFinish,
  onHome,
}) => {
  const [screen, setScreen] = useState<Screen>("loading");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [balloonsRescued, setBalloonsRescued] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [balloonPositions, setBalloonPositions] = useState<number[]>([]);
  const [showAchievement, setShowAchievement] = useState<any>(null);
  const [celebrationType, setCelebrationType] = useState<
    "confetti" | "stars" | "fireworks"
  >("stars");
  const [currentDifficultyLevel, setCurrentDifficultyLevel] = useState<
    "easy" | "medium" | "hard"
  >("easy");

  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef(crypto.randomUUID());

  // Memoized filtered words for performance with category support
  const filteredWords = useMemo(() => {
    let words: Word[] = [];

    // Get words by category or all words
    if (category && category !== "all") {
      words = getWordsByCategory(category);
    } else {
      words = wordsDatabase;
    }

    // Filter to only include words with vowels
    return words.filter((word) => {
      const upperWord = word.word.toUpperCase();
      return VOWELS.some((vowel) => upperWord.includes(vowel));
    });
  }, [category]);

  // Progressive difficulty calculation
  const calculateDifficulty = useCallback(
    (questionIndex: number): "easy" | "medium" | "hard" => {
      if (questionIndex < 3) return "easy";
      if (questionIndex < 7) return "medium";
      return "hard";
    },
    [],
  );

  // Generate questions with smart distractors
  const generateQuestions = useCallback(() => {
    const difficultyQuestions: { [key: string]: Word[] } = {
      easy: filteredWords.filter((w) => w.difficulty === "easy"),
      medium: filteredWords.filter((w) => w.difficulty === "medium"),
      hard: filteredWords.filter((w) => w.difficulty === "hard"),
    };

    const gameQuestions: Question[] = [];

    for (let i = 0; i < totalQuestions; i++) {
      const targetDifficulty = calculateDifficulty(i);
      const availableWords = difficultyQuestions[targetDifficulty];

      if (availableWords.length === 0) {
        // Fallback to any difficulty
        const allWords = Object.values(difficultyQuestions).flat();
        const wordItem = allWords[Math.floor(Math.random() * allWords.length)];
        gameQuestions.push(createQuestion(wordItem, i, targetDifficulty));
      } else {
        const wordItem =
          availableWords[Math.floor(Math.random() * availableWords.length)];
        gameQuestions.push(createQuestion(wordItem, i, targetDifficulty));
      }
    }

    setQuestions(gameQuestions);
  }, [filteredWords, totalQuestions, calculateDifficulty]);

  const createQuestion = useCallback(
    (
      wordItem: Word,
      index: number,
      difficulty: "easy" | "medium" | "hard",
    ): Question => {
      const word = wordItem.word.toUpperCase();
      const vowelPositions = [...word]
        .map((char, i) => (VOWELS.includes(char) ? i : -1))
        .filter((i) => i !== -1);

      if (vowelPositions.length === 0) {
        return {
          id: `q${index}`,
          word: "CAT",
          emoji: "🐱",
          missingVowel: "A",
          missingIndex: 1,
          displayWord: "C_T",
          difficulty,
          distractors: ["A", "E", "I", "O"],
        };
      }

      const randomVowelIndex =
        vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
      const missingVowel = word[randomVowelIndex];
      const displayWord =
        word.slice(0, randomVowelIndex) +
        "_" +
        word.slice(randomVowelIndex + 1);
      const distractors = generateSmartDistractors(
        missingVowel,
        word,
        difficulty,
      );

      return {
        id: `q${index}`,
        word: word,
        emoji: wordItem.emoji || "🎯",
        missingVowel: missingVowel,
        missingIndex: randomVowelIndex,
        displayWord: displayWord,
        difficulty,
        distractors,
      };
    },
    [],
  );

  // Initialize game with loading animation
  useEffect(() => {
    const initGame = async () => {
      setScreen("loading");

      // Show loading for at least 2 seconds for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      generateQuestions();
      startedAtRef.current = Date.now();
      setBalloonsRescued(0);
      setBalloonPositions(Array(totalQuestions).fill(0));
      setScreen("play");

      // Auto-pronounce first word after a delay
      setTimeout(() => {
        if (questions.length > 0) {
          audioService.pronounceWord(questions[0].word);
        }
      }, 1000);
    };

    initGame();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // Handle vowel selection with retry mechanism
  const handleVowelClick = useCallback(
    async (vowel: string) => {
      if (isAnimating || !currentQuestion) return;

      setSelectedAnswer(vowel);
      const correct = vowel === currentQuestion.missingVowel;
      setIsCorrect(correct);
      setIsAnimating(true);

      if (correct) {
        setCorrectCount((prev) => prev + 1);
        setBalloonsRescued((prev) => prev + 1);
        setCurrentStreak((prev) => prev + 1);
        setShowCelebration(true);
        setShowRetry(false);

        // Update balloon position for visual feedback
        setBalloonPositions((prev) => {
          const newPositions = [...prev];
          newPositions[currentQuestionIndex] = 100; // Balloon floats up
          return newPositions;
        });

        // Play success sound and celebrate
        await audioService.playSuccessSound();
        audioService.playEncouragementSound();

        // Track achievement progress
        try {
          const achievement = await EnhancedAchievementTracker.updateProgress(
            sessionIdRef.current,
            {
              type: "vowel_rescue",
              correct: true,
              difficulty: currentQuestion.difficulty,
              streak: currentStreak + 1,
              timeSpent: 3000,
              category: "vowel_adventure",
            },
          );

          if (achievement) {
            setShowAchievement(achievement);
          }
        } catch (error) {
          console.error("Achievement tracking error:", error);
        }

        // Celebration type based on streak
        if (currentStreak + 1 >= 10) setCelebrationType("fireworks");
        else if (currentStreak + 1 >= 5) setCelebrationType("confetti");
        else setCelebrationType("stars");

        // Auto-advance after celebration
        setTimeout(() => {
          nextQuestion();
        }, 2500);
      } else {
        setCurrentStreak(0);
        setShowRetry(true);
        audioService.playEncouragementSound();

        // Track failed attempt
        try {
          await EnhancedAchievementTracker.updateProgress(
            sessionIdRef.current,
            {
              type: "vowel_rescue",
              correct: false,
              difficulty: currentQuestion.difficulty,
              streak: 0,
              timeSpent: 2000,
              category: "vowel_adventure",
            },
          );
        } catch (error) {
          console.error("Achievement tracking error:", error);
        }

        // Reset after feedback
        setTimeout(() => {
          setSelectedAnswer(null);
          setIsCorrect(null);
          setIsAnimating(false);
          setShowRetry(false);
        }, 1500);
      }
    },
    [currentQuestion, currentStreak, isAnimating],
  );

  const retryQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnimating(false);
    setShowRetry(false);

    // Re-pronounce the word
    if (currentQuestion) {
      audioService.pronounceWord(currentQuestion.word);
    }
  }, [currentQuestion]);

  const nextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      finishGame();
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnimating(false);
    setShowCelebration(false);
    setCurrentDifficultyLevel(calculateDifficulty(nextIndex));

    // Speak the new word
    setTimeout(() => {
      if (questions[nextIndex]) {
        audioService.pronounceWord(questions[nextIndex].word);
      }
    }, 500);
  }, [currentQuestionIndex, questions, calculateDifficulty]);

  const finishGame = useCallback(async () => {
    const timeElapsed = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : 0;
    const accuracy = questions.length > 0 ? correctCount / questions.length : 0;

    let starRating = 1;
    if (accuracy >= 0.9) starRating = 3;
    else if (accuracy >= 0.7) starRating = 2;

    const result: GameResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      mistakes: [],
      timeElapsed,
      difficulty: "medium",
      starRating,
      bestStreak: Math.max(currentStreak, 0),
    };

    // Final achievement check
    try {
      const finalAchievement = await EnhancedAchievementTracker.updateProgress(
        sessionIdRef.current,
        {
          type: "session_complete",
          correct: true,
          difficulty: "mixed",
          streak: currentStreak,
          timeSpent: timeElapsed,
          category: "vowel_adventure",
          totalCorrect: correctCount,
          accuracy: accuracy * 100,
        },
      );

      if (finalAchievement) {
        setShowAchievement(finalAchievement);
      }
    } catch (error) {
      console.error("Final achievement tracking error:", error);
    }

    if (onFinish) {
      onFinish(result);
    }

    setScreen("result");
  }, [correctCount, questions.length, currentStreak, onFinish]);

  const playAgain = useCallback(() => {
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setBalloonsRescued(0);
    setCurrentStreak(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnimating(false);
    setShowCelebration(false);
    setShowRetry(false);
    setBalloonPositions(Array(totalQuestions).fill(0));
    setCurrentDifficultyLevel("easy");
    sessionIdRef.current = crypto.randomUUID();

    generateQuestions();
    setScreen("play");
    startedAtRef.current = Date.now();
  }, [totalQuestions, generateQuestions]);

  // Loading screen with balloon theme
  if (screen === "loading") {
    return (
      <div className="vowel-adventure-v2">
        <div className="game-container">
          <motion.div
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="loading-balloons"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎈🎈🎈
            </motion.div>
            <motion.h2
              className="loading-title"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Preparing your balloons...
            </motion.h2>
            <motion.div
              className="loading-subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Get ready to rescue some vowels! 🌟
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Result screen with fireworks
  if (screen === "result") {
    const accuracy =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;
    const starRating = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    return (
      <div className="vowel-adventure-v2">
        <div className="game-container result-screen">
          <CelebrationEffect type="fireworks" />

          <motion.div
            className="result-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="result-title"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉 All Balloons Rescued! 🎉
            </motion.div>

            <motion.div
              className="result-emoji"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              🎈
            </motion.div>

            <motion.div className="stars">
              {Array.from({ length: 3 }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: i < starRating ? 1 : 0.3 }}
                  transition={{ delay: i * 0.2, type: "spring" }}
                >
                  {i < starRating ? "⭐" : "☆"}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              className="result-stats"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="big-number">{balloonsRescued}</div>
              <div className="stat-label">Balloons Rescued!</div>
            </motion.div>

            <motion.div
              className="result-accuracy"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {accuracy}% Accuracy
            </motion.div>

            <motion.div
              className="result-actions"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button className="big-action-btn" onClick={playAgain} size="lg">
                <RotateCcw size={20} />
                Rescue More Balloons!
              </Button>
              {onHome && (
                <Button variant="outline" onClick={onHome} size="lg">
                  <Home size={18} />
                  Home
                </Button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Game screen
  if (!currentQuestion) {
    return (
      <div className="vowel-adventure-v2">
        <div className="game-container">
          <div className="loading">Starting balloon rescue...</div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const filledWord =
    isCorrect && selectedAnswer
      ? currentQuestion.displayWord.replace("_", selectedAnswer)
      : currentQuestion.displayWord;

  return (
    <div className="vowel-adventure-v2">
      <div className="game-container">
        {/* Achievement popup */}
        <AnimatePresence>
          {showAchievement && (
            <EnhancedAchievementPopup
              achievement={showAchievement}
              onClose={() => setShowAchievement(null)}
            />
          )}
        </AnimatePresence>

        {/* Celebration effects */}
        <AnimatePresence>
          {showCelebration && <CelebrationEffect type={celebrationType} />}
        </AnimatePresence>

        {/* Header with balloon progress */}
        <motion.div
          className="game-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="progress-section">
            <motion.div
              className="progress-label"
              animate={{ scale: showCelebration ? [1, 1.1, 1] : 1 }}
            >
              🎈 Balloons Rescued: {balloonsRescued}
            </motion.div>

            {/* Balloon progress visualization */}
            <div className="balloon-progress">
              {Array.from({ length: Math.min(totalQuestions, 10) }, (_, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    "balloon-indicator",
                    balloonPositions[i] > 0 && "rescued",
                  )}
                  animate={{
                    y: balloonPositions[i] > 0 ? -20 : 0,
                    scale: i === currentQuestionIndex ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  🎈
                </motion.div>
              ))}
            </div>

            <div className="progress-text">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="game-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => audioService.pronounceWord(currentQuestion.word)}
              aria-label="Say word"
            >
              🔊
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              aria-label={ttsEnabled ? "Disable voice" : "Enable voice"}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={finishGame}
              aria-label="End game"
            >
              🏁
            </Button>
          </div>
        </motion.div>

        {/* Main game area */}
        <div className="game-main">
          {/* Difficulty indicator */}
          <motion.div
            className="difficulty-indicator"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={currentDifficultyLevel}
          >
            <span className={cn("difficulty-badge", currentDifficultyLevel)}>
              {currentDifficultyLevel.toUpperCase()}
            </span>
          </motion.div>

          {/* Large emoji with balloon animation */}
          <motion.div className="emoji-section">
            <motion.div
              className={cn("emoji-display", showCelebration && "celebrating")}
              animate={{
                scale: showCelebration ? [1, 1.2, 1] : 1,
                rotate: showCelebration ? [0, 5, -5, 0] : 0,
              }}
              transition={{ duration: 0.5 }}
            >
              {currentQuestion.emoji}
            </motion.div>
          </motion.div>

          {/* Word puzzle with dancing letters */}
          <div className="word-section">
            <motion.div
              className={cn(
                "word-display",
                isCorrect && "word-success",
                isCorrect === false && "word-error",
                showCelebration && "word-dancing",
              )}
              animate={
                showCelebration
                  ? {
                      y: [0, -10, 0],
                      transition: { duration: 0.5, repeat: 3 },
                    }
                  : {}
              }
            >
              {filledWord.split("").map((char, index) => (
                <motion.span
                  key={index}
                  className={cn(
                    "word-letter",
                    char === "_" && "missing-letter",
                    char === selectedAnswer && isCorrect && "filled-letter",
                  )}
                  animate={
                    showCelebration
                      ? {
                          y: [0, -Math.random() * 20, 0],
                          rotate: [0, Math.random() * 10 - 5, 0],
                          transition: {
                            duration: 0.6,
                            delay: index * 0.1,
                            repeat: 2,
                          },
                        }
                      : {}
                  }
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Smart vowel buttons with dynamic layout */}
          <div className="vowels-section">
            <motion.div className="vowels-grid" layout>
              {currentQuestion.distractors.map((vowel, index) => (
                <motion.button
                  key={vowel}
                  className={cn(
                    "vowel-btn",
                    selectedAnswer === vowel && isCorrect && "vowel-correct",
                    selectedAnswer === vowel &&
                      isCorrect === false &&
                      "vowel-incorrect",
                  )}
                  onClick={() => handleVowelClick(vowel)}
                  disabled={isAnimating}
                  aria-label={`Choose vowel ${vowel}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {vowel}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {/* Retry button */}
          <AnimatePresence>
            {showRetry && (
              <motion.div
                className="retry-section"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Button
                  onClick={retryQuestion}
                  className="retry-btn"
                  variant="outline"
                >
                  <RotateCcw size={16} />
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration overlay with sparkles */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="celebration-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="sparkles"
                animate={{
                  scale: [1, 1.5, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 1 }}
              >
                ✨✨✨
              </motion.div>
              <motion.div
                className="celebration-text"
                animate={{
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                Balloon Rescued! 🎈
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
