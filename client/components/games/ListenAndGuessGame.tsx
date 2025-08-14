import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { CelebrationEffect } from "@/components/CelebrationEffect";
import { audioService } from "@/lib/audioService";
import {
  generateListenAndGuessWords,
  getProgressiveListenAndGuessWords,
  getCategoryListenAndGuessWords,
  ListenAndGuessWord,
} from "@/lib/listenAndGuessGeneration";
import { getWordsByCategory, getRandomWords, Word } from "@/data/wordsDatabase";

/**
 * Listen & Guess — Kid‑friendly vocabulary game
 * -------------------------------------------------
 * What it does:
 *  - Plays a word via Web Speech (fallback <audio>)
 *  - Shows 3–4 big picture cards; the child taps the correct one
 *  - Instant feedback with animations, confetti, XP, coins
 *  - 10 quick rounds by default
 *  - Fully mobile‑first with large tap targets
 *
 * Usage:
 *  <ListenAndGuessGame
 *     words={[{ id: 1, word: "apple", imageUrl: "/img/apple.png", distractorImages: ["/img/orange.png","/img/ball.png"], audioUrl: "/audio/apple.mp3" }, ...]}
 *     rounds={10}
 *     optionsPerRound={3}
 *     onFinish={(stats)=>console.log(stats)}
 *  />
 */

// ---------- Types ----------
// Use the new ListenAndGuessWord type from the generation service
export type WordItem = ListenAndGuessWord;

export type GameFinishStats = {
  totalRounds: number;
  correct: number;
  wrong: number;
  coins: number;
  streakBest: number;
};

export type ListenAndGuessProps = {
  words?: WordItem[]; // Now optional - will generate from database if not provided
  rounds?: number; // default 10
  optionsPerRound?: 3 | 4 | 5;
  funnyVoiceChance?: number; // 0..1 (chance to use a silly voice variant)
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  playerLevel?: number;
  onFinish?: (stats: GameFinishStats) => void;
  onExit?: () => void;
  className?: string;
};

// ---------- Helpers ----------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// A tiny confetti burst (pure CSS + DOM, no deps)
function useConfetti() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fire = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("div");
      dot.className = "confetti-dot";
      const size = 6 + Math.random() * 6;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${50 + (Math.random() * 40 - 20)}%`;
      dot.style.background = `hsl(${Math.floor(Math.random() * 360)}, 80%, 60%)`;
      container.appendChild(dot);
      const x = (Math.random() - 0.5) * 200;
      const y = -(100 + Math.random() * 200);
      const rot = Math.random() * 720;
      dot
        .animate(
          [
            { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
            {
              transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
              opacity: 0,
            },
          ],
          {
            duration: 900 + Math.random() * 600,
            easing: "cubic-bezier(.22,.61,.36,1)",
          },
        )
        .finished.then(() => dot.remove());
    }
  }, []);
  return { containerRef, fire } as const;
}

// --------- Speech ---------
function speakWord(word: string, funny = false, fallback?: string) {
  const synth =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (synth && typeof SpeechSynthesisUtterance !== "undefined") {
    const u = new SpeechSynthesisUtterance(word);
    // Kid‑friendly voices if available
    const voices = synth.getVoices();
    // Try a child‑like voice (heuristic)
    const pref =
      voices.find((v) =>
        /child|kid|female|english/i.test(v.name + " " + v.lang),
      ) || voices[0];
    if (pref) u.voice = pref;
    u.rate = funny ? 1.2 : 1;
    u.pitch = funny ? 1.4 : 1;
    synth.cancel();
    synth.speak(u);
    return;
  }
  // Fallback audio element
  if (fallback) {
    const audio = new Audio(fallback);
    audio.play().catch(() => {});
  }
}

// --------- Component ---------
export default function ListenAndGuessGame({
  words,
  rounds = 10,
  optionsPerRound = 3,
  funnyVoiceChance = 0.25,
  difficulty,
  category,
  playerLevel = 1,
  onFinish,
  onExit,
  className = "",
}: ListenAndGuessProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [locked, setLocked] = useState(false); // prevent double taps
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const { containerRef, fire } = useConfetti();

  // Enhanced word generation using database words with emojis
  const generateDatabaseWords = useCallback((count: number, category?: string, difficulty?: "easy" | "medium" | "hard"): WordItem[] => {
    let dbWords: Word[] = [];

    if (category && category !== "all") {
      dbWords = getWordsByCategory(category);
    } else {
      dbWords = getRandomWords(count * 3); // Get more words to have options
    }

    if (difficulty) {
      dbWords = dbWords.filter(w => w.difficulty === difficulty);
    }

    // Convert database words to ListenAndGuessWord format using emojis
    return dbWords.slice(0, count).map(word => ({
      id: word.id,
      word: word.word,
      imageUrl: word.emoji, // Use emoji instead of external image
      distractorImages: generateDistractorEmojis(word, dbWords),
      category: word.category,
      difficulty: word.difficulty,
    }));
  }, []);

  // Generate distractor emojis from the same category or similar words
  const generateDistractorEmojis = useCallback((targetWord: Word, allWords: Word[]): string[] => {
    const sameCategory = allWords.filter(w =>
      w.category === targetWord.category &&
      w.id !== targetWord.id
    );

    const otherWords = allWords.filter(w => w.id !== targetWord.id);
    const distractors = sameCategory.length >= 3 ? sameCategory : otherWords;

    return shuffle(distractors)
      .slice(0, optionsPerRound - 1)
      .map(w => w.emoji);
  }, [optionsPerRound]);

  // Generate or use provided words
  const gameWords = useMemo(() => {
    if (words && words.length > 0) {
      return words;
    }

    // Generate words systematically from database
    if (category && category !== "all") {
      return getCategoryListenAndGuessWords(category, rounds);
    } else if (difficulty) {
      return generateListenAndGuessWords(rounds, difficulty);
    } else {
      // Use progressive difficulty based on player level
      return getProgressiveListenAndGuessWords(playerLevel, 1);
    }
  }, [words, rounds, category, difficulty, playerLevel]);

  // Precompute the sequence of rounds
  const sequence = useMemo(() => {
    const pool = shuffle(gameWords);
    const roundsArr = [] as { word: WordItem; options: string[] }[];
    for (let i = 0; i < Math.min(rounds, pool.length); i++) {
      const w = pool[i];
      const distractors = pickN(
        w.distractorImages,
        Math.max(0, optionsPerRound - 1),
      );
      const opts = shuffle([w.imageUrl, ...distractors]);
      roundsArr.push({ word: w, options: opts });
    }
    return roundsArr;
  }, [gameWords, rounds, optionsPerRound]);

  const current = sequence[roundIdx];

  const playPrompt = useCallback(() => {
    if (!current) return;
    const funny = Math.random() < funnyVoiceChance;
    speakWord(current.word.word, funny, current.word.audioUrl);
    // gentle vibration for feedback
    if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);
  }, [current, funnyVoiceChance]);

  useEffect(() => {
    // auto play each round prompt
    playPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIdx]);

  const choose = useCallback(
    (img: string) => {
      if (!current || locked) return;
      setLocked(true);
      setSelectedAnswer(img);
      setShowAnswer(true);

      const isCorrect = img === current.word.imageUrl;

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        setCoins((c) => c + 5);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));

          // Track real-time achievement progress for correct answers
          try {
            EnhancedAchievementTracker.updateJourneyProgress({
              wordsLearned: 1,
              sessionStats: {
                totalSessions: 1,
                perfectSessions: 0,
                averageWordsPerSession: 1,
                fastestSession: 1,
                longestStreak: ns,
              },
            });
          } catch (error) {
            console.error("Error tracking real-time achievements:", error);
          }

          return ns;
        });
        fire();
      } else {
        setWrongCount((w) => w + 1);
        setStreak(0);

        // Track wrong answers for achievement progress
        try {
          EnhancedAchievementTracker.updateJourneyProgress({
            sessionStats: {
              totalSessions: 1,
              perfectSessions: 0,
              averageWordsPerSession: 1,
              fastestSession: 1,
              longestStreak: 0,
            },
          });
        } catch (error) {
          console.error("Error tracking achievement progress:", error);
        }

        // gentle buzz
        if (navigator && "vibrate" in navigator)
          (navigator as any).vibrate([40, 60, 40]);
      }

      // After a brief pause, move to next round or finish
      setTimeout(() => {
        setLocked(false);
        setShowAnswer(false);
        setSelectedAnswer(null);

        if (roundIdx + 1 < sequence.length) setRoundIdx((r) => r + 1);
        else {
          const finalCorrect = correctCount + (isCorrect ? 1 : 0);
          const finalWrong = wrongCount + (isCorrect ? 0 : 1);
          const finalCoins = coins + (isCorrect ? 5 : 0);
          const finalBestStreak = Math.max(
            bestStreak,
            isCorrect ? streak + 1 : bestStreak,
          );

          const stats: GameFinishStats = {
            totalRounds: sequence.length,
            correct: finalCorrect,
            wrong: finalWrong,
            coins: finalCoins,
            streakBest: finalBestStreak,
          };

          // Track achievements for Listen & Guess completion
          const accuracy = (finalCorrect / sequence.length) * 100;
          const achievementUpdates = {
            wordsLearned: finalCorrect, // Each correct answer = word learned
            totalAccuracy: accuracy,
            quizzesPerfect: accuracy >= 90 ? 1 : 0,
            streakDays: finalBestStreak >= 5 ? 1 : 0,
            sessionStats: {
              totalSessions: 1,
              perfectSessions: accuracy >= 90 ? 1 : 0,
              averageWordsPerSession: finalCorrect,
              fastestSession: 1, // Simple session tracking
              longestStreak: finalBestStreak,
            },
            difficultyStats: {
              easy: playerLevel <= 5 ? { completed: finalCorrect, total: sequence.length, accuracy } : { completed: 0, total: 0, accuracy: 0 },
              medium: playerLevel > 5 && playerLevel <= 10 ? { completed: finalCorrect, total: sequence.length, accuracy } : { completed: 0, total: 0, accuracy: 0 },
              hard: playerLevel > 10 ? { completed: finalCorrect, total: sequence.length, accuracy } : { completed: 0, total: 0, accuracy: 0 },
            },
          };

          try {
            const newAchievements =
              EnhancedAchievementTracker.updateJourneyProgress(achievementUpdates);

            if (newAchievements.length > 0) {
              console.log(
                `🎉 Listen & Guess: ${newAchievements.length} new achievements unlocked!`,
              );
              // Show achievement notification (could be enhanced with UI feedback)
              newAchievements.forEach((achievement) => {
                console.log(
                  `✨ Achievement: ${achievement.name} - ${achievement.description}`,
                );
              });
            }
          } catch (error) {
            console.error("Error tracking achievements:", error);
          }

          onFinish?.(stats);
        }
      }, 1500);
    },
    [
      current,
      locked,
      roundIdx,
      sequence.length,
      correctCount,
      wrongCount,
      coins,
      bestStreak,
      streak,
      fire,
      onFinish,
    ],
  );

  // Fallback demo words if generation fails
  const fallbackWords: WordItem[] = [
    {
      id: "fallback-1",
      word: "apple",
      imageUrl:
        "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format",
      distractorImages: [
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=200&h=200&fit=crop&auto=format",
      ],
      category: "food",
      difficulty: "easy",
    },
    {
      id: "fallback-2",
      word: "cat",
      imageUrl:
        "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format",
      distractorImages: [
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format",
        "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format",
      ],
      category: "animals",
      difficulty: "easy",
    },
  ];

  // If no words available, use fallback
  if (sequence.length === 0) {
    console.warn("No words available for Listen & Guess, using fallback words");
    // Regenerate sequence with fallback words
    const fallbackSequence = fallbackWords.map((w) => ({
      word: w,
      options: shuffle([w.imageUrl, ...w.distractorImages]),
    }));

    if (fallbackSequence.length === 0) {
      return (
        <div className={`w-full max-w-md mx-auto p-4 ${className}`}>
          <EmptyState />
        </div>
      );
    }
  }

  if (!current) {
    return (
      <div className={`w-full max-w-md mx-auto p-4 ${className}`}>
        <EmptyState />
      </div>
    );
  }

  const progressPct = ((roundIdx + 1) / sequence.length) * 100;
  const xpPct = Math.min(100, (correctCount / sequence.length) * 100);

  return (
    <div
      className={`relative w-full max-w-md mx-auto select-none ${className}`}
    >
      {/* Confetti layer */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />

      {/* Card container with enhanced mobile styling */}
      <div className="rounded-3xl shadow-mobile-xl p-4 md:p-6 bg-gradient-to-br from-sky-600 via-blue-600 to-purple-700 text-white mobile-optimized card-entrance relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-xl animate-gentle-float"></div>
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-lg animate-kid-float-delayed"></div>
        <div className="absolute bottom-0 left-1/2 w-28 h-28 bg-pink-300/15 rounded-full blur-xl animate-kid-float"></div>
        {/* Exit Button with enhanced mobile styling */}
        {onExit && (
          <button
            onClick={onExit}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all duration-200 z-20 touch-target active:scale-90 text-white font-bold text-lg"
            aria-label="Exit game"
          >
            ✕
          </button>
        )}

        {/* Top bar: progress + round */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>
              Round {roundIdx + 1} / {sequence.length}
            </span>
            <span>⭐ {coins}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20">
            <div
              className="h-3 rounded-full bg-white/80 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mascot + play button */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl animate-gentle-float">🦊</span>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wide opacity-90">
                Listen & Guess
              </div>
              <div className="font-bold">What did I say?</div>
            </div>
          </div>

          <button
            onClick={playPrompt}
            className="shrink-0 rounded-full px-6 py-4 bg-white text-blue-700 font-bold active:scale-95 transition-all duration-200 min-w-[64px] min-h-[64px] hover:shadow-lg animate-mobile-pulse border-3 border-yellow-300 touch-target"
            aria-label="Play sound"
            disabled={locked}
          >
            🔊 Play
          </button>
        </div>

        {/* Options grid */}
        <div
          className={`grid gap-4 ${optionsPerRound === 5 ? "grid-cols-3" : optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {current.options.map((img, i) => {
            const isCorrect = img === current.word.imageUrl;
            const isSelected = img === selectedAnswer;
            const shouldHighlight = showAnswer && (isCorrect || isSelected);

            return (
              <button
                key={i}
                onClick={() => choose(img)}
                disabled={locked}
                className={`relative aspect-square rounded-3xl bg-white/95 hover:bg-white active:scale-95 transition-all duration-300 shadow-mobile-lg overflow-hidden border-4 focus:outline-none focus:ring-4 focus:ring-yellow-300 touch-target mobile-optimized ${
                  shouldHighlight
                    ? isCorrect
                      ? "border-green-400 ring-4 ring-green-300 animate-gentle-bounce border-rainbow"
                      : "border-red-400 ring-4 ring-red-300 animate-wiggle"
                    : "border-transparent hover:border-yellow-300 animate-fade-in"
                } ${locked ? "cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:scale-105"}`}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <img
                  src={img}
                  alt="option"
                  className="w-full h-full object-contain p-3"
                  loading="lazy"
                />
                {/* fun corner badge with animation */}
                <span className="absolute top-2 left-2 text-lg animate-sparkle">
                  ✨
                </span>

                {/* Answer feedback with enhanced animations */}
                {showAnswer && isCorrect && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <span className="text-5xl animate-gentle-bounce">✅</span>
                      <div className="text-white font-bold text-sm mt-1 text-shadow">
                        Correct!
                      </div>
                    </div>
                  </div>
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center">
                      <span className="text-5xl animate-wiggle">❌</span>
                      <div className="text-white font-bold text-sm mt-1 text-shadow">
                        Try again!
                      </div>
                    </div>
                  </div>
                )}

                {/* Sparkle effects for hover */}
                <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs animate-mobile-sparkle">⭐</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom: XP + streak with enhanced visuals */}
        <div className="mt-6">
          <div className="text-sm flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <span>XP Progress</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
              <span className="text-lg">🔥</span>
              <span>
                Streak: {streak} (Best {bestStreak})
              </span>
            </div>
          </div>
          <div className="mt-2 h-4 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-emerald-300 to-green-400 transition-all duration-500 ease-out animate-mobile-slide-in"
              style={{ width: `${xpPct}%` }}
            />
          </div>
          <div className="text-center mt-2 text-xs opacity-90">
            {correctCount}/{sequence.length} questions answered correctly!
          </div>
        </div>
      </div>

      {/* Enhanced styles for confetti dots and animations */}
      <style>{`
        .confetti-dot{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset;}

        @keyframes celebrationPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes cardEntrance {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .card-entrance {
          animation: cardEntrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .celebration-pulse {
          animation: celebrationPulse 0.8s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// ---------- Empty State (fallback) ----------
function EmptyState() {
  return (
    <div className="rounded-3xl bg-gradient-to-b from-slate-100 to-slate-50 p-6 text-center shadow-xl">
      <div className="text-5xl mb-2">🎧</div>
      <h2 className="text-xl font-bold mb-1">Add some words to start!</h2>
      <p className="text-slate-600">
        Provide words with images (and optional audio) to play the game.
      </p>
    </div>
  );
}

// ---------- Demo data (optional) ----------
// Remove or replace with your real data
export const DemoWords: WordItem[] = [
  {
    id: 1,
    word: "apple",
    imageUrl:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format", // car
    ],
    audioUrl: undefined,
    category: "fruits",
  },
  {
    id: 2,
    word: "banana",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
    ],
    audioUrl: undefined,
    category: "fruits",
  },
  {
    id: 3,
    word: "cat",
    imageUrl:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format", // bird
    ],
    audioUrl: undefined,
    category: "animals",
  },
  {
    id: 4,
    word: "dog",
    imageUrl:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format", // car
    ],
    audioUrl: undefined,
    category: "animals",
  },
  {
    id: 5,
    word: "bird",
    imageUrl:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
    ],
    audioUrl: undefined,
    category: "animals",
  },
  {
    id: 6,
    word: "car",
    imageUrl:
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format", // dog
    ],
    audioUrl: undefined,
    category: "vehicles",
  },
  {
    id: 7,
    word: "ball",
    imageUrl:
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format", // car
    ],
    audioUrl: undefined,
    category: "toys",
  },
  {
    id: 8,
    word: "sun",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format", // cat
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format", // banana
    ],
    audioUrl: undefined,
    category: "nature",
  },
  {
    id: 9,
    word: "flower",
    imageUrl:
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format", // sun
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=200&h=200&fit=crop&auto=format", // apple
    ],
    audioUrl: undefined,
    category: "nature",
  },
  {
    id: 10,
    word: "tree",
    imageUrl:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format", // flower
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format", // ball
    ],
    audioUrl: undefined,
    category: "nature",
  },
];
