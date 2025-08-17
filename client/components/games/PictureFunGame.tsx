import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Word, getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";
import { audioService } from "@/lib/audioService";
import { EnhancedAchievementTracker } from "@/lib/enhancedAchievementTracker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Crown, Zap } from "lucide-react";

/**
 * Picture Fun — Kid‑friendly picture-to-word matching game
 * -------------------------------------------------
 * 🌟 Uses sophisticated word generation like Listen & Guess
 * • Kids see emoji pictures and pick the matching word
 * • Every correct answer shows celebration with sparkles
 * • Integrates with achievements + mobile-first design
 * • Compact, kid-friendly UI with large tap targets
 *
 * Enhanced from QuizGame with Listen & Guess features
 */

// ---------- Types ----------
export type PictureWordItem = {
  id: string | number;
  word: string;
  emoji: string;
  distractorWords: string[];
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
};

export type GameFinishStats = {
  totalRounds: number;
  correct: number;
  wrong: number;
  bestStreak: number;
};

export type PictureFunGameProps = {
  rounds?: number; // default 8
  optionsPerRound?: 3 | 4; // default 4 for variety
  difficulty?: "easy" | "medium" | "hard"; // default "easy"
  category?: string; // word category to focus on
  onFinish?: (stats: GameFinishStats) => void;
  onExit?: () => void;
  showExitDialog?: boolean;
  onCloseExitDialog?: () => void;
  className?: string;
};

// ---------- Utility helpers ----------
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

function uuid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// A tiny confetti burst (matching Listen & Guess)
function useConfetti() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fire = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const count = 20;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("div");
      dot.className = "pf-confetti";
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

// Enhanced word generation using database words with emojis (same as Listen & Guess)
const generateDatabaseWords = (
  count: number,
  optionsPerRound: number,
  category?: string,
  difficulty?: "easy" | "medium" | "hard",
): PictureWordItem[] => {
  let dbWords: Word[] = [];

  if (category && category !== "all") {
    dbWords = getWordsByCategory(category);
  } else {
    dbWords = getRandomWords(count * 3); // Get more words to have options
  }

  if (difficulty) {
    dbWords = dbWords.filter((w) => w.difficulty === difficulty);
  }

  // Convert database words to PictureWordItem format
  return dbWords.slice(0, count).map((word) => ({
    id: word.id,
    word: word.word,
    emoji: word.emoji,
    distractorWords: generateDistractorWords(word, dbWords, optionsPerRound),
    category: word.category,
    difficulty: word.difficulty,
  }));
};

// Generate distractor words from the same category or similar words
const generateDistractorWords = (
  targetWord: Word,
  allWords: Word[],
  optionsPerRound: number,
): string[] => {
  const sameCategory = allWords.filter(
    (w) => w.category === targetWord.category && w.id !== targetWord.id,
  );

  const otherWords = allWords.filter((w) => w.id !== targetWord.id);
  const distractors = sameCategory.length >= 3 ? sameCategory : otherWords;

  return shuffle(distractors)
    .slice(0, optionsPerRound - 1)
    .map((w) => w.word);
};

// Game completion dialog
interface GameCompletionDialogProps {
  show: boolean;
  stats: GameFinishStats;
  onContinue: () => void;
  onExit: () => void;
}

function GameCompletionDialog({
  show,
  stats,
  onContinue,
  onExit,
}: GameCompletionDialogProps) {
  const accuracy =
    stats.totalRounds > 0
      ? Math.round((stats.correct / stats.totalRounds) * 100)
      : 0;

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-xs max-w-[95vw] p-4 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 border-orange-300 border-4">
        <DialogHeader className="text-center pb-2">
          <div className="text-5xl mb-2 animate-bounce">📸</div>
          <DialogTitle className="text-lg font-bold text-white drop-shadow-lg">
            🎉 Picture Perfect! 🎉
          </DialogTitle>
          <DialogDescription className="text-orange-100 text-sm">
            Amazing job matching pictures with words!
          </DialogDescription>
        </DialogHeader>

        {/* Compact Stats */}
        <div className="bg-white/20 rounded-lg p-2 border border-orange-300/50 backdrop-blur-sm">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-2xl">📸</div>
              <div className="text-lg font-bold text-white">
                {stats.correct}
              </div>
              <div className="text-xs text-orange-100">Correct</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl">⭐</div>
              <div className="text-lg font-bold text-white">
                {stats.bestStreak}
              </div>
              <div className="text-xs text-orange-100">Streak</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl">
                {accuracy >= 90 ? "🏆" : accuracy >= 75 ? "🎓" : "👍"}
              </div>
              <div className="text-lg font-bold text-white">{accuracy}%</div>
              <div className="text-xs text-orange-100">Score</div>
            </div>
          </div>
        </div>

        {/* Fun celebration emojis */}
        <div className="flex justify-center gap-1 text-xl my-3">
          {Array.from({ length: Math.min(stats.correct, 5) }, (_, i) => (
            <span
              key={i}
              className="animate-gentle-float"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              📷
            </span>
          ))}
          {stats.correct > 5 && (
            <span className="text-orange-200 animate-gentle-float">
              +{stats.correct - 5} more!
            </span>
          )}
        </div>

        <DialogFooter className="flex gap-3 pt-3">
          <Button
            onClick={onContinue}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm sm:text-base py-3 px-4 rounded-lg shadow-lg border border-white/30 min-h-[48px] touch-target"
          >
            <span className="mr-1">📸</span>
            Play Again!
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 text-sm sm:text-base py-3 px-4 rounded-lg min-h-[48px] touch-target"
          >
            <span className="mr-1">🏠</span>
            Home
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Component ----------
export default function PictureFunGame({
  rounds = 8,
  optionsPerRound = 4,
  difficulty = "easy",
  category,
  className = "",
  onFinish,
  onExit,
  showExitDialog = false,
  onCloseExitDialog,
}: PictureFunGameProps) {
  const sessionId = useMemo(() => uuid(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<PictureWordItem[]>([]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showSparkleExplosion, setShowSparkleExplosion] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);

  const { containerRef, fire } = useConfetti();

  // Fetch words from database
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    try {
      const words = generateDatabaseWords(
        rounds,
        optionsPerRound,
        category,
        difficulty,
      );
      if (!mounted) return;
      setPool(words);
      setLoading(false);
    } catch (e) {
      if (!mounted) return;
      setError("Failed to load words");
      setLoading(false);
      console.error(e);
    }

    return () => {
      mounted = false;
    };
  }, [rounds, optionsPerRound, category, difficulty]);

  const current: PictureWordItem | undefined = pool[roundIdx];

  // Build options for the current round
  const options = useMemo(() => {
    if (!current) return [] as string[];
    const distractors = pickN(
      current.distractorWords,
      Math.max(0, optionsPerRound - 1),
    );
    return shuffle([current.word, ...distractors]);
  }, [current, optionsPerRound]);

  const choose = useCallback(
    async (word: string) => {
      if (!current || locked) return;
      setLocked(true);
      setSelectedAnswer(word);
      setShowAnswer(true);

      const isCorrect = word === current.word;

      if (isCorrect) {
        const nextCorrect = correctCount + 1;
        const nextStreak = streak + 1;

        setCorrectCount(nextCorrect);
        setStreak(nextStreak);
        setBestStreak((b) => Math.max(b, nextStreak));

        // Enhanced celebration effects with sparkles
        setShowSparkleExplosion(true);
        setSparkleCount((prev) => prev + 1);
        fire();

        // Auto-hide sparkle explosion after animation
        setTimeout(() => setShowSparkleExplosion(false), 1500);

        // Play success sound
        audioService.playSuccessSound();

        // Haptic feedback
        if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);

        setTimeout(() => {
          setLocked(false);
          setShowAnswer(false);
          setSelectedAnswer(null);
          const nextRound = roundIdx + 1;
          if (nextRound < pool.length) {
            setRoundIdx(nextRound);
          } else {
            setGameComplete(true);
          }
        }, 1500);
      } else {
        setWrongCount((w) => w + 1);
        setStreak(0);

        // Play incorrect sound
        audioService.playEncouragementSound();

        // gentle buzz
        if (navigator && "vibrate" in navigator)
          (navigator as any).vibrate([40, 60, 40]);
        setTimeout(() => {
          setLocked(false);
          setShowAnswer(false);
          setSelectedAnswer(null);
        }, 1200);
      }
    },
    [
      current,
      locked,
      correctCount,
      streak,
      roundIdx,
      pool.length,
      fire,
      wrongCount,
      bestStreak,
    ],
  );

  // Handle game continuation
  const handleContinueGame = useCallback(() => {
    setGameComplete(false);
    setRoundIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setSparkleCount(0);

    // Generate new words
    setLoading(true);
    try {
      const words = generateDatabaseWords(
        rounds,
        optionsPerRound,
        category,
        difficulty,
      );
      setPool(words);
      setLoading(false);
    } catch (e) {
      setError("Failed to load new words");
      setLoading(false);
      console.error(e);
    }
  }, [rounds, optionsPerRound, category, difficulty]);

  // Handle game completion
  const handleGameFinish = useCallback(() => {
    const stats: GameFinishStats = {
      totalRounds: pool.length,
      correct: correctCount,
      wrong: wrongCount,
      bestStreak: bestStreak,
    };
    onFinish?.(stats);
  }, [pool.length, correctCount, wrongCount, bestStreak, onFinish]);

  // --------- Render ---------
  if (loading)
    return (
      <Wrapper className={className}>
        <div className="rounded-3xl bg-gradient-to-b from-orange-200 to-orange-100 p-8 shadow-xl text-center">
          <div className="text-6xl mb-2 animate-bounce">📸</div>
          <div className="font-bold">Loading pictures…</div>
          <div className="text-sm opacity-70">Getting fun words ready</div>
        </div>
      </Wrapper>
    );

  if (error || !current)
    return (
      <Wrapper className={className}>
        <div className="rounded-3xl bg-gradient-to-b from-rose-100 to-rose-50 p-8 shadow-xl text-center">
          <div className="text-6xl mb-2">🖼️</div>
          <div className="font-bold">No pictures to show</div>
          <div className="text-sm opacity-70">
            Please add new words or try again later.
          </div>
        </div>
      </Wrapper>
    );

  const progressPct = ((roundIdx + 1) / pool.length) * 100;
  const xpPct = Math.min(100, (correctCount / pool.length) * 100);

  return (
    <Wrapper className={className}>
      {/* Confetti layer */}
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />

      <div className="relative rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 bg-gradient-to-b from-orange-600 to-red-700 text-white safe-area-padding-bottom mobile-optimized">
        {/* Top bar - Mobile Optimized */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between text-xs sm:text-sm opacity-90">
            <span className="font-medium">
              Picture {roundIdx + 1} / {pool.length}
            </span>
            <span className="font-medium">Best Streak: {bestStreak}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-3 rounded-full bg-white/90"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mascot + Picture - Mobile Responsive */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 text-center">
          <span className="text-2xl sm:text-3xl animate-gentle-float">📸</span>
          <div className="leading-tight">
            <div className="text-xs sm:text-sm uppercase tracking-wide opacity-90">
              Picture Fun
            </div>
            <div className="font-bold text-sm sm:text-base">
              Which word matches this picture?
            </div>
          </div>
        </div>

        {/* Big Picture Display - Mobile Responsive */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-block bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-3 sm:border-4 border-white/20 touch-optimized">
            <div className="text-6xl sm:text-7xl md:text-8xl animate-gentle-float">
              {current.emoji}
            </div>
          </div>
        </div>

        {/* Sparkle explosion effect */}
        {showSparkleExplosion && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute top-1/4 left-1/4 animate-ping">
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="absolute top-1/3 right-1/4 animate-pulse animation-delay-200">
              <Star className="w-6 h-6 text-pink-300" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-bounce animation-delay-100">
              <Zap className="w-7 h-7 text-blue-300" />
            </div>
            <div className="absolute top-1/2 right-1/3 animate-spin">
              <Crown className="w-5 h-5 text-purple-300" />
            </div>
          </div>
        )}

        {/* Options grid - Mobile Optimized */}
        <div
          className={`grid gap-2 sm:gap-3 px-1 ${optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}
        >
          {options.map((word, i) => {
            const isCorrect = word === current.word;
            const isSelected = word === selectedAnswer;
            const shouldHighlight = showAnswer && (isCorrect || isSelected);

            return (
              <button
                key={i}
                onClick={() => choose(word)}
                disabled={locked}
                className={`relative py-4 sm:py-5 px-3 sm:px-4 rounded-xl sm:rounded-2xl bg-white/95 hover:bg-white active:scale-95 transition-all duration-300 shadow-mobile-lg border-3 sm:border-4 focus:outline-none focus:ring-4 focus:ring-yellow-300 touch-target mobile-optimized min-h-[56px] sm:min-h-[64px] ${
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
                <div className="text-center">
                  <div className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                    {word}
                  </div>
                </div>

                {/* Enhanced fun corner badge with dynamic sparkles */}
                <div className="absolute top-1 left-1">
                  <span className="text-sm animate-sparkle">✨</span>
                  {sparkleCount > 3 && (
                    <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-400 animate-spin" />
                  )}
                </div>

                {/* Answer feedback with enhanced animations */}
                {showAnswer && isCorrect && (
                  <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl animate-gentle-bounce">✅</span>
                      <div className="text-white font-bold text-xs mt-1 text-shadow">
                        Correct!
                      </div>
                    </div>
                  </div>
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center backdrop-blur-sm rounded-2xl">
                    <div className="text-center">
                      <span className="text-2xl sm:text-3xl animate-wiggle">❌</span>
                      <div className="text-white font-bold text-xs mt-1 text-shadow">
                        Try again!
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced sparkle effects for hover and interaction */}
                <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs animate-mobile-sparkle">⭐</span>
                  {showSparkleExplosion && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-ping" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom: XP + streak - Mobile Optimized */}
        <div className="mt-4 sm:mt-5">
          <div className="text-xs sm:text-sm flex items-center justify-between">
            <span className="font-medium">Picture XP</span>
            <span className="font-medium">Streak: {streak}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-3 rounded-full bg-yellow-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Enhanced styles for confetti, sparkles, and animations */}
      <style>{`
        .pf-confetti{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}

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

        @keyframes sparkleRotate {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.2); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.2); }
          100% { transform: rotate(360deg) scale(1); }
        }

        .celebration-pulse {
          animation: celebrationPulse 0.8s ease-in-out;
        }

        .sparkle-rotate {
          animation: sparkleRotate 2s ease-in-out infinite;
        }
      `}</style>

      {/* Game Completion Dialog */}
      <GameCompletionDialog
        show={gameComplete}
        stats={{
          totalRounds: pool.length,
          correct: correctCount,
          wrong: wrongCount,
          bestStreak: bestStreak,
        }}
        onContinue={handleContinueGame}
        onExit={() => {
          handleGameFinish();
          onExit?.();
        }}
      />

      {/* Enhanced Exit Confirmation Dialog - Mobile Optimized */}
      <Dialog open={showExitDialog} onOpenChange={onCloseExitDialog}>
        <DialogContent className="sm:max-w-xs max-w-[95vw] p-4 sm:p-5">
          <DialogHeader className="text-center pb-2">
            <div className="text-4xl mb-1">📸</div>
            <DialogTitle className="text-lg font-bold text-gray-800">
              Leave picture game?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Your pictures are waiting!
            </DialogDescription>
          </DialogHeader>

          {/* Compact Progress Summary */}
          <div className="bg-orange-50 rounded-lg p-2 border border-orange-200 my-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-orange-800">
                <span className="font-medium">📸 {correctCount}</span>
                <span className="text-xs ml-1">correct</span>
              </div>
              <div className="text-orange-700">
                <span className="font-medium">⭐ {bestStreak}</span>
                <span className="text-xs ml-1">streak</span>
              </div>
              <div className="text-orange-600 text-xs">
                {roundIdx + 1}/{pool.length}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => onCloseExitDialog?.()}
              className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-300 text-sm sm:text-base py-3 min-h-[48px] touch-target"
            >
              📸 Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCloseExitDialog?.();
                onExit?.();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base py-3 min-h-[48px] touch-target"
            >
              🚪 Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Wrapper>
  );
}

function Wrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full max-w-md mx-auto p-2 sm:p-4 safe-area-padding-bottom ${className}`}
    >
      {children}
    </div>
  );
}
