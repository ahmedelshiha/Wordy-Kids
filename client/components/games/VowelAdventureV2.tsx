import React, { useEffect, useRef, useState } from "react";
import { GameResult, WordItem } from "../../types/vowel-adventure";
import { defaultWords } from "../../lib/vowelEngine";
import { Button } from "../ui/button";
import { Volume2, VolumeX, Home, RotateCcw } from "lucide-react";
import { cn } from "../../lib/utils";
import "../../styles/vowel-adventure-v2.css";

type Props = {
  words?: WordItem[];
  totalQuestions?: number;
  onFinish?: (result: GameResult) => void;
  onHome?: () => void;
};

type Screen = "play" | "result";

interface Question {
  id: string;
  word: string;
  emoji: string;
  missingVowel: string;
  missingIndex: number;
  displayWord: string;
}

const VOWELS = ["A", "E", "I", "O", "U"];

export const VowelAdventureV2: React.FC<Props> = ({
  words = defaultWords,
  totalQuestions = 10,
  onFinish,
  onHome,
}) => {
  const [screen, setScreen] = useState<Screen>("play");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wordsRescued, setWordsRescued] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const startedAtRef = useRef<number | null>(null);

  // Text-to-speech function
  function speak(text: string) {
    if (!ttsEnabled) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    synth.cancel();
    synth.speak(utterance);
  }

  // Generate questions with progressive difficulty
  const generateQuestions = () => {
    // Filter words that have vowels
    const validWords = words.filter((wordItem) => {
      const word = wordItem.word.toUpperCase();
      return VOWELS.some((vowel) => word.includes(vowel));
    });

    // Ensure we have enough valid words
    const wordsToUse =
      validWords.length >= totalQuestions
        ? validWords
        : [...validWords, ...validWords];
    const shuffledWords = [...wordsToUse].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, totalQuestions);

    const gameQuestions: Question[] = selectedWords.map((wordItem, index) => {
      const word = wordItem.word.toUpperCase();
      const vowelPositions = [...word]
        .map((char, i) => (VOWELS.includes(char) ? i : -1))
        .filter((i) => i !== -1);

      if (vowelPositions.length === 0) {
        // Fallback - this shouldn't happen with filtering above
        return {
          id: `q${index}`,
          word: "CAT",
          emoji: "🐱",
          missingVowel: "A",
          missingIndex: 1,
          displayWord: "C_T",
        };
      }

      const randomVowelIndex =
        vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
      const missingVowel = word[randomVowelIndex];
      const displayWord =
        word.slice(0, randomVowelIndex) +
        "_" +
        word.slice(randomVowelIndex + 1);

      return {
        id: `q${index}`,
        word: word,
        emoji: wordItem.emoji || "🎯",
        missingVowel: missingVowel,
        missingIndex: randomVowelIndex,
        displayWord: displayWord,
      };
    });

    setQuestions(gameQuestions);
  };

  // Initialize game
  useEffect(() => {
    generateQuestions();
    startedAtRef.current = Date.now();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // Handle vowel selection
  const handleVowelClick = (vowel: string) => {
    if (isAnimating || !currentQuestion) return;

    setSelectedAnswer(vowel);
    const correct = vowel === currentQuestion.missingVowel;
    setIsCorrect(correct);
    setIsAnimating(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      setWordsRescued((prev) => prev + 1);
      setShowCelebration(true);
      speak("Correct! Well done!");

      // Auto-advance after celebration
      setTimeout(() => {
        nextQuestion();
      }, 2000);
    } else {
      speak("Try again!");

      // Reset after feedback
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsAnimating(false);
      }, 1000);
    }
  };

  const nextQuestion = () => {
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

    // Speak the new word
    setTimeout(() => {
      if (questions[nextIndex]) {
        speak(questions[nextIndex].word);
      }
    }, 300);
  };

  const finishGame = () => {
    const timeElapsed = startedAtRef.current
      ? Date.now() - startedAtRef.current
      : 0;
    const accuracy = questions.length > 0 ? correctCount / questions.length : 0;

    // Calculate star rating
    let starRating = 1;
    if (accuracy >= 0.8) starRating = 3;
    else if (accuracy >= 0.6) starRating = 2;

    const result: GameResult = {
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      mistakes: [],
      timeElapsed,
      difficulty: "easy",
      starRating,
      bestStreak: correctCount,
    };

    if (onFinish) {
      onFinish(result);
    }

    setScreen("result");
  };

  const playAgain = () => {
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setWordsRescued(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsAnimating(false);
    setShowCelebration(false);
    generateQuestions();
    setScreen("play");
    startedAtRef.current = Date.now();
  };

  // Show result screen
  if (screen === "result") {
    const accuracy =
      questions.length > 0
        ? Math.round((correctCount / questions.length) * 100)
        : 0;
    const starRating = accuracy >= 80 ? 3 : accuracy >= 60 ? 2 : 1;

    return (
      <div className="vowel-adventure-v2">
        <div className="game-container result-screen">
          <div className="result-content">
            <div className="result-title">🎉 Adventure Complete!</div>

            <div className="result-emoji">🏆</div>

            <div className="stars">
              {"⭐".repeat(starRating)}
              {"☆".repeat(3 - starRating)}
            </div>

            <div className="result-stats">
              <div className="big-number">{wordsRescued}</div>
              <div className="stat-label">Vowels Rescued!</div>
            </div>

            <div className="result-accuracy">{accuracy}% Accuracy</div>

            <div className="result-actions">
              <button className="big-action-btn" onClick={playAgain}>
                <RotateCcw size={20} />
                Rescue More Vowels!
              </button>
              {onHome && (
                <button className="secondary-btn" onClick={onHome}>
                  <Home size={18} />
                  Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show game screen
  if (!currentQuestion) {
    return (
      <div className="vowel-adventure-v2">
        <div className="game-container">
          <div className="loading">Loading adventure...</div>
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
        {/* Header with progress */}
        <div className="game-header">
          <div className="progress-section">
            <div className="progress-label">
              🏆 Vowels Rescued: {wordsRescued}
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="game-controls">
            <button
              className="control-btn"
              onClick={() => speak(currentQuestion.word)}
              aria-label="Say word"
            >
              🔊
            </button>
            <button
              className="control-btn"
              onClick={() => setTtsEnabled(!ttsEnabled)}
              aria-label={ttsEnabled ? "Disable voice" : "Enable voice"}
            >
              {ttsEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              className="control-btn"
              onClick={finishGame}
              aria-label="End game"
            >
              🏁
            </button>
          </div>
        </div>

        {/* Main game area */}
        <div className="game-main">
          {/* Large emoji */}
          <div className="emoji-section">
            <div
              className={cn("emoji-display", showCelebration && "celebrating")}
            >
              {currentQuestion.emoji}
            </div>
          </div>

          {/* Word puzzle */}
          <div className="word-section">
            <div
              className={cn(
                "word-display",
                isCorrect && "word-success",
                isCorrect === false && "word-error",
                showCelebration && "word-dancing",
              )}
            >
              {filledWord.split("").map((char, index) => (
                <span
                  key={index}
                  className={cn(
                    "word-letter",
                    char === "_" && "missing-letter",
                    char === selectedAnswer && isCorrect && "filled-letter",
                  )}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Vowel buttons */}
          <div className="vowels-section">
            <div className="vowels-grid">
              {VOWELS.map((vowel) => (
                <button
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
                >
                  {vowel}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Celebration overlay */}
        {showCelebration && (
          <div className="celebration-overlay">
            <div className="sparkles">✨</div>
            <div className="celebration-text">Vowel Rescued! 🎉</div>
          </div>
        )}
      </div>
    </div>
  );
};
