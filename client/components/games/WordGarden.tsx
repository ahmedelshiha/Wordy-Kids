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

/**
 * Word Garden — Listen & Pick Game for Ages 3–5
 * -------------------------------------------------
 * 🌟 Pulls words from your website DB using existing word service
 * • Kids listen to pronunciation then pick the matching picture
 * • Every correct answer grows a plant in the garden (visual progress)
 * • Integrates with achievements + sparkle celebration hooks
 * • Mobile-first UI with large tap targets and simple visuals
 *
 * Minimal deps: React + Tailwind classes (no external UI lib required)
 */

// ---------- Types ----------
export type WordItem = {
  id: string | number;
  word: string; // vocabulary item (not shown during question)
  imageUrl: string; // correct picture
  distractorImages: string[]; // pool of wrong pictures
  audioUrl?: string; // optional mp3/ogg fallback
  category?: string;
};

export type GameFinishStats = {
  totalRounds: number;
  correct: number;
  wrong: number;
  bestStreak: number;
};

export type FetchParams = {
  limit: number;
  difficulty?: "easy" | "medium" | "hard";
  excludeMastered?: boolean;
};

export type WordGardenGameProps = {
  // CONTENT
  rounds?: number; // default 8
  optionsPerRound?: 3 | 4; // default 3 for ages 3–5
  difficulty?: "easy" | "medium" | "hard"; // default "easy"
  category?: string; // word category to focus on

  // INTEGRATIONS
  onFinish?: (stats: GameFinishStats) => void;
  onExit?: () => void;

  // EXIT DIALOG
  showExitDialog?: boolean;
  onCloseExitDialog?: () => void;

  // UX
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

// Web Speech with audio fallback
function speakWord(word: string, funny = false, fallbackUrl?: string) {
  const synth =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (synth && typeof SpeechSynthesisUtterance !== "undefined") {
    const u = new SpeechSynthesisUtterance(word);
    const voices = synth.getVoices();
    const pref =
      voices.find((v) =>
        /child|kid|english|female/i.test(v.name + " " + v.lang),
      ) || voices[0];
    if (pref) u.voice = pref;
    u.rate = funny ? 1.2 : 1.0;
    u.pitch = funny ? 1.4 : 1.0;
    synth.cancel();
    synth.speak(u);
    return;
  }
  if (fallbackUrl) {
    const audio = new Audio(fallbackUrl);
    audio.play().catch(() => {});
  }
}

// Tiny confetti (pure DOM + CSS)
function useConfetti() {
  const ref = useRef<HTMLDivElement | null>(null);
  const burst = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    for (let i = 0; i < 18; i++) {
      const d = document.createElement("div");
      d.className = "wg-confetti";
      const size = 6 + Math.random() * 6;
      d.style.width = `${size}px`;
      d.style.height = `${size}px`;
      d.style.left = `${50 + (Math.random() * 40 - 20)}%`;
      d.style.background = `hsl(${Math.floor(Math.random() * 360)},85%,60%)`;
      el.appendChild(d);
      const x = (Math.random() - 0.5) * 220;
      const y = -(100 + Math.random() * 220);
      const r = Math.random() * 540;
      d.animate(
        [
          { transform: `translate(0,0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1000 + Math.random() * 600,
          easing: "cubic-bezier(.22,.61,.36,1)",
        },
      ).finished.then(() => d.remove());
    }
  }, []);
  return { ref, burst } as const;
}

// Multiple plant types with different growth sequences
const PLANT_TYPES = [
  ["🌱", "🌿", "🌻"], // sunflower
  ["🌱", "🌵", "🌺"], // cactus-flower
  ["🌱", "🍃", "🌹"], // rose bush
  ["🌱", "🌿", "🌼"], // daisy
  ["🌱", "🌿", "🌷"], // tulip
  ["🌱", "🌿", "🌸"], // cherry blossom
  ["🌱", "🍀", "🌺"], // hibiscus
  ["🌱", "🌿", "🏵️"], // rosette
] as const;

// Generate emoji-based image using SVG data URI with larger size
function generateEmojiImage(emoji: string, fallbackText?: string): string {
  if (emoji && emoji !== "") {
    // Create SVG with large emoji for better visibility
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250">
        <rect width="250" height="250" fill="#f0fdf4" rx="25"/>
        <circle cx="125" cy="125" r="110" fill="#dcfce7" opacity="0.8"/>
        <text x="125" y="160" font-size="140" text-anchor="middle" font-family="Arial, sans-serif">${emoji}</text>
      </svg>
    `;

    // Use URL encoding instead of base64 to avoid Unicode issues
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // Fallback to placeholder if no emoji
  return `https://via.placeholder.com/250x250/4ade80/ffffff?text=${encodeURIComponent(fallbackText || "Word")}`;
}

// Convert existing Word to WordItem format with emoji images
function convertToWordItem(word: Word, allWords: Word[]): WordItem {
  // Create distractor images from other words in different categories
  const distractorWords = allWords
    .filter((w) => w.category !== word.category && w.id !== word.id)
    .slice(0, 3);

  const distractorImages =
    distractorWords.length >= 3
      ? distractorWords.map(
          (w) => w.imageUrl || generateEmojiImage(w.emoji, w.word),
        )
      : Array.from({ length: 3 }, (_, i) => {
          // Get random words for fallback distractors
          const fallbackWords = allWords
            .filter((fw) => fw.id !== word.id)
            .slice(i * 2, i * 2 + 1);
          const fallbackWord = fallbackWords[0];
          return fallbackWord
            ? generateEmojiImage(fallbackWord.emoji, fallbackWord.word)
            : generateEmojiImage("❓", `Option ${i + 1}`);
        });

  return {
    id: word.id,
    word: word.word,
    imageUrl: word.imageUrl || generateEmojiImage(word.emoji, word.word),
    distractorImages,
    audioUrl: undefined, // Will use Web Speech API
    category: word.category,
  };
}

// Fetch words function adapted to existing word database
const fetchWords = async (params: FetchParams): Promise<WordItem[]> => {
  // Use existing word database functions
  let words: Word[];

  // Get a larger pool for better distractor selection
  const allWords = getRandomWords(params.limit * 4);

  if (params.difficulty) {
    // Get words by difficulty and category
    words = allWords
      .filter((w) => w.difficulty === params.difficulty)
      .slice(0, params.limit);
  } else {
    words = allWords.slice(0, params.limit);
  }

  // Convert to WordItem format with access to all words for distractors
  return words.map((word) => convertToWordItem(word, allWords));
};

// Green-themed Garden Achievement Component
interface GardenAchievementProps {
  show: boolean;
  title: string;
  description: string;
  onClose: () => void;
  plantEmoji?: string;
}

function GardenAchievementPopup({ 
  show, 
  title, 
  description, 
  onClose, 
  plantEmoji = "🌱" 
}: GardenAchievementProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", duration: 0.5, damping: 15 }}
            className="bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 text-white rounded-3xl p-6 max-w-sm mx-4 text-center shadow-2xl border-4 border-green-300"
          >
            {/* Floating sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-300 text-lg"
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{ 
                    scale: [0, 1, 0], 
                    rotate: 360,
                    x: Math.cos((i * Math.PI * 2) / 8) * 60,
                    y: Math.sin((i * Math.PI * 2) / 8) * 60,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Main plant emoji with bounce */}
            <motion.div
              className="text-7xl mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                duration: 0.8, 
                damping: 12,
                delay: 0.2 
              }}
            >
              {plantEmoji}
            </motion.div>

            {/* Achievement text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold mb-2 text-yellow-100 drop-shadow-lg">
                🌟 {title} 🌟
              </h3>
              <p className="text-lg text-green-100 mb-4 leading-relaxed drop-shadow">
                {description}
              </p>
            </motion.div>

            {/* Garden celebration icons */}
            <motion.div
              className="flex justify-center gap-3 text-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="animate-bounce">🌻</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🌸</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🌺</span>
              <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>🌷</span>
            </motion.div>

            {/* Auto-close indicator */}
            <motion.div
              className="mt-4 text-sm text-green-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Your garden is growing! 🌱✨
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Game completion dialog
interface GameCompletionDialogProps {
  show: boolean;
  stats: GameFinishStats;
  onContinue: () => void;
  onExit: () => void;
}

function GameCompletionDialog({ show, stats, onContinue, onExit }: GameCompletionDialogProps) {
  const accuracy = stats.totalRounds > 0 ? Math.round((stats.correct / stats.totalRounds) * 100) : 0;
  
  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 to-emerald-100 border-green-300">
        <DialogHeader className="text-center">
          <div className="text-8xl mb-4 animate-bounce">🌻</div>
          <DialogTitle className="text-2xl font-bold text-green-800">
            🎉 Garden Complete! 🎉
          </DialogTitle>
          <DialogDescription className="text-green-700 text-lg">
            Look at your beautiful garden! You did amazing!
          </DialogDescription>
        </DialogHeader>

        {/* Stats display */}
        <div className="bg-green-100 rounded-xl p-4 border-2 border-green-300">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-3xl mb-1">🌱</div>
              <div className="text-2xl font-bold text-green-800">{stats.correct}</div>
              <div className="text-sm text-green-600">Plants Grown</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-green-800">{stats.bestStreak}</div>
              <div className="text-sm text-green-600">Best Streak</div>
            </div>
          </div>
          <div className="mt-3 text-center">
            <div className="text-lg font-bold text-green-800">
              {accuracy}% Accuracy! 
              {accuracy >= 90 && " 🏆"}
              {accuracy >= 75 && accuracy < 90 && " 🎓"}
            </div>
          </div>
        </div>

        {/* Garden icons */}
        <div className="flex justify-center gap-2 text-3xl my-4">
          {Array.from({ length: Math.min(stats.correct, 8) }, (_, i) => (
            <span key={i} className="animate-gentle-float" style={{ animationDelay: `${i * 0.1}s` }}>
              {PLANT_TYPES[i % PLANT_TYPES.length][2]}
            </span>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-3 mt-6">
          <Button
            onClick={onContinue}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-xl shadow-lg"
          >
            <span className="mr-2">🌱</span>
            Continue Growing Garden!
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 bg-white hover:bg-green-50 text-green-700 border-green-300 text-lg py-3 rounded-xl"
          >
            <span className="mr-2">🏠</span>
            Back to Games
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Component ----------
export default function WordGardenGame({
  rounds = 10,
  optionsPerRound = 3,
  difficulty = "easy",
  category,
  className = "",
  onFinish,
  onExit,
  showExitDialog = false,
  onCloseExitDialog,
}: WordGardenGameProps) {
  const sessionId = useMemo(() => uuid(), []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pool, setPool] = useState<WordItem[]>([]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0); // attempts for current word
  const [gameComplete, setGameComplete] = useState(false);

  // Achievement popup state
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: "",
    description: "",
    plantEmoji: "🌱"
  });

  // Garden stages with plant types
  const [gardenStages, setGardenStages] = useState<number[]>(
    Array.from({ length: rounds }, () => 0),
  );
  const [plantTypes, setPlantTypes] = useState<number[]>(
    Array.from({ length: rounds }, () => Math.floor(Math.random() * PLANT_TYPES.length)),
  );
  const [recentlyGrown, setRecentlyGrown] = useState<number | null>(null);

  const { ref: confettiRef, burst } = useConfetti();

  // Fetch words from your DB
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchWords({ limit: rounds, difficulty })
      .then((list) => {
        if (!mounted) return;
        setPool(list);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError("Failed to load words");
        setLoading(false);
        console.error(e);
      });

    return () => {
      mounted = false;
    };
  }, [rounds, difficulty]);

  const current: WordItem | undefined = pool[roundIdx];

  // Build options for the current round
  const options = useMemo(() => {
    if (!current) return [] as string[];
    const distractors = pickN(
      current.distractorImages,
      Math.max(0, optionsPerRound - 1),
    );
    return shuffle([current.imageUrl, ...distractors]);
  }, [current, optionsPerRound]);

  // Auto play prompt when round changes
  useEffect(() => {
    if (current) {
      speakWord(current.word, Math.random() < 0.2, current.audioUrl);
    }
  }, [current]);

  const handlePlay = useCallback(() => {
    if (current) {
      speakWord(current.word, Math.random() < 0.2, current.audioUrl);
    }
  }, [current]);

  const checkAchievements = useCallback(
    (nextCorrectTotal: number, nextStreak: number) => {
      // Track achievements and show green garden-themed popup
      EnhancedAchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: 1,
        accuracy: nextStreak > 0 ? 100 : 80,
        difficulty: difficulty,
        category: category,
      });

      // Show garden-specific achievements
      if (nextStreak === 3) {
        setAchievementData({
          title: "Growing Streak!",
          description: "3 plants in a row! Your garden is blooming beautifully! 🌸",
          plantEmoji: "🌸"
        });
        setShowAchievement(true);
      } else if (nextStreak === 5) {
        setAchievementData({
          title: "Garden Master!",
          description: "5 perfect plants! You're a true gardener! 🏆",
          plantEmoji: "🌻"
        });
        setShowAchievement(true);
      } else if (nextCorrectTotal === 1) {
        setAchievementData({
          title: "First Sprout!",
          description: "Your first plant has sprouted! Keep growing! 🌱",
          plantEmoji: "🌱"
        });
        setShowAchievement(true);
      }
    },
    [difficulty, category],
  );

  const choose = useCallback(
    async (img: string) => {
      if (!current || locked) return;
      setLocked(true);
      setAttempts((a) => a + 1);

      const isCorrect = img === current.imageUrl;

      if (isCorrect) {
        const nextCorrect = correctCount + 1;
        const nextStreak = streak + 1;

        setCorrectCount(nextCorrect);
        setStreak(nextStreak);
        setBestStreak((b) => Math.max(b, nextStreak));

        // Grow plant at this index up one stage (max last stage)
        const plantTypeIndex = plantTypes[roundIdx];
        const plantStages = PLANT_TYPES[plantTypeIndex];
        setGardenStages((stages) =>
          stages.map((s, i) =>
            i === roundIdx ? Math.min(s + 1, plantStages.length - 1) : s,
          ),
        );

        // Mark this plant as recently grown for special animation
        setRecentlyGrown(roundIdx);

        // Clear the recently grown state after animation
        setTimeout(() => setRecentlyGrown(null), 1200);

        // Sparkles + confetti
        burst();

        checkAchievements(nextCorrect, nextStreak);

        // Play success sound
        audioService.playSuccessSound();

        // Haptic feedback
        if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);

        // Wait longer to show the plant growth before moving to next round
        setTimeout(() => {
          setAttempts(0);
          setLocked(false);
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
        setTimeout(() => setLocked(false), 400);
      }
    },
    [
      current,
      locked,
      correctCount,
      streak,
      roundIdx,
      pool.length,
      burst,
      wrongCount,
      bestStreak,
      checkAchievements,
      plantTypes,
    ],
  );

  // Handle game continuation
  const handleContinueGarden = useCallback(() => {
    setGameComplete(false);
    setRoundIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setAttempts(0);
    setGardenStages(Array.from({ length: rounds }, () => 0));
    setPlantTypes(Array.from({ length: rounds }, () => Math.floor(Math.random() * PLANT_TYPES.length)));
    setRecentlyGrown(null);
    
    // Fetch new words
    setLoading(true);
    fetchWords({ limit: rounds, difficulty })
      .then((list) => {
        setPool(list);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to load new words");
        setLoading(false);
        console.error(e);
      });
  }, [rounds, difficulty]);

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
        <div className="rounded-3xl bg-gradient-to-b from-emerald-200 to-emerald-100 p-8 shadow-xl text-center">
          <div className="text-6xl mb-2 animate-bounce">🌱</div>
          <div className="font-bold">Growing your words…</div>
          <div className="text-sm opacity-70">Fetching kid‑friendly words</div>
        </div>
      </Wrapper>
    );

  if (error || !current)
    return (
      <Wrapper className={className}>
        <div className="rounded-3xl bg-gradient-to-b from-rose-100 to-rose-50 p-8 shadow-xl text-center">
          <div className="text-6xl mb-2">🪴</div>
          <div className="font-bold">No words to play</div>
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
        ref={confettiRef}
        className="pointer-events-none absolute inset-0 overflow-hidden"
      />

      <div className="relative rounded-3xl shadow-xl p-4 md:p-6 bg-gradient-to-b from-green-600 to-emerald-700 text-white">
        {/* Top bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm opacity-90">
            <span>
              Plant {roundIdx + 1} / {pool.length}
            </span>
            <span>Best Streak: {bestStreak}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-3 rounded-full bg-white/90"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Mascot + Play */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🦋</span>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wide opacity-90">
                Word Garden
              </div>
              <div className="font-bold">Listen & pick the seed!</div>
            </div>
          </div>
          <button
            onClick={handlePlay}
            className="rounded-full px-5 py-3 bg-white text-emerald-700 font-bold active:scale-95 transition-transform min-w-[56px] min-h-[56px]"
            aria-label="Play sound"
          >
            🔊 Play
          </button>
        </div>

        {/* Options grid */}
        <div
          className={`grid gap-4 ${optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {options.map((img, i) => (
            <button
              key={i}
              onClick={() => choose(img)}
              disabled={locked}
              className="relative aspect-square rounded-3xl bg-white/95 hover:bg-white active:scale-95 transition-all duration-300 shadow-mobile-lg overflow-hidden border-4 border-transparent focus:outline-none focus:ring-4 focus:ring-yellow-300 touch-target mobile-optimized disabled:opacity-50"
              style={{
                animationDelay: `${i * 100}ms`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <img
                  src={img}
                  alt="option"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </div>
              <div className="absolute top-2 left-2">
                <span className="text-lg animate-sparkle">���</span>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom: XP + streak */}
        <div className="mt-5">
          <div className="text-sm flex items-center justify-between">
            <span>Garden XP</span>
            <span>Streak: {streak}</span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-3 rounded-full bg-lime-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Garden row (visual progress) */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        {gardenStages.map((stage, idx) => {
          const isActive = idx === roundIdx;
          const isCompleted = idx < roundIdx;
          const hasGrown = stage > 0;
          const justGrew = recentlyGrown === idx;
          const plantTypeIndex = plantTypes[idx];
          const plantStages = PLANT_TYPES[plantTypeIndex];

          return (
            <div
              key={idx}
              className={`rounded-3xl h-20 flex items-center justify-center transition-all duration-300 ${
                justGrew
                  ? "bg-yellow-200 ring-4 ring-yellow-400 shadow-lg"
                  : isActive
                    ? "bg-emerald-200 ring-2 ring-emerald-400"
                    : isCompleted && hasGrown
                      ? "bg-emerald-100"
                      : "bg-emerald-50"
              }`}
            >
              <span
                className={`text-4xl transition-all duration-500 ${
                  justGrew
                    ? "animate-bounce scale-125 drop-shadow-lg"
                    : isActive
                      ? "animate-bounce scale-110"
                      : hasGrown
                        ? "scale-105"
                        : ""
                }`}
              >
                {plantStages[stage]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Styles for confetti dots */}
      <style>{`.wg-confetti{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}`}</style>

      {/* Green Garden Achievement Popup */}
      <GardenAchievementPopup
        show={showAchievement}
        title={achievementData.title}
        description={achievementData.description}
        plantEmoji={achievementData.plantEmoji}
        onClose={() => setShowAchievement(false)}
      />

      {/* Game Completion Dialog */}
      <GameCompletionDialog
        show={gameComplete}
        stats={{
          totalRounds: pool.length,
          correct: correctCount,
          wrong: wrongCount,
          bestStreak: bestStreak,
        }}
        onContinue={handleContinueGarden}
        onExit={() => {
          handleGameFinish();
          onExit?.();
        }}
      />

      {/* Enhanced Exit Confirmation Dialog */}
      <Dialog open={showExitDialog} onOpenChange={onCloseExitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="text-6xl mb-2">🌱</div>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Leave your garden?
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your plants will be waiting for you! Are you sure you want to exit
              Word Garden?
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 mt-4">
            {/* Garden Progress Summary */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-sm text-green-800 font-medium mb-1">
                🌱 Garden Progress
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Plants grown: {correctCount}</span>
                <span>Best streak: {bestStreak}</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                Round {roundIdx + 1} of {pool.length}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => onCloseExitDialog?.()}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            >
              <span className="mr-2">🌱</span>
              Keep Growing!
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCloseExitDialog?.();
                onExit?.();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <span className="mr-2">🚪</span>
              Exit Garden
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
    <div className={`relative w-full max-w-md mx-auto p-4 ${className}`}>
      {children}
    </div>
  );
}
