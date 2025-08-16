import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Word, getWordsByCategory, getRandomWords } from "@/data/wordsDatabase";
import { audioService } from "@/lib/audioService";
import { ensureValidEmoji, getCategoryFallbackEmoji } from "@/lib/emojiUtils";
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
  optionsPerRound: number;
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

// Multiple plant types with diverse growth sequences - each with unique intermediate stages
const PLANT_TYPES = [
  ["🌱", "🌿", "🌻"], // sunflower - leafy to bright sunflower
  ["🌱", "🌵", "🌺"], // cactus-flower - spiky cactus to hibiscus
  ["🌱", "🍃", "🌹"], // rose bush - small leaves to red rose
  ["🌱", "🌾", "🌼"], // daisy field - grain to white daisy
  ["🌱", "💚", "🌷"], // tulip - green heart to pink tulip
  ["🌱", "🌳", "🌸"], // cherry tree - tree to cherry blossom
  ["🌱", "🍀", "🌺"], // clover hibiscus - clover to tropical flower
  ["🌱", "🎋", "🏵️"], // bamboo rosette - bamboo to decorative flower
  ["🌱", "🌲", "🍄"], // forest mushroom - pine to mushroom
  ["🌱", "🪴", "🌻"], // potted sunflower - pot plant to big sunflower
  ["🌱", "🌿", "💐"], // bouquet garden - leaves to flower bouquet
  ["🌱", "🎍", "🌸"], // bamboo cherry - bamboo decoration to blossom
  ["🌱", "🌳", "🍃"], // tree leaves - tree to fresh leaves
  ["🌱", "🪷", "🌺"], // lotus hibiscus - lotus to hibiscus
  ["🌱", "🌾", "🌻"], // wheat sunflower - grain field to sunflower
  ["🌱", "🎄", "🌟"], // christmas tree star - evergreen to star
  ["🌱", "🌿", "🌈"], // rainbow plant - leaves to rainbow
  ["🌱", "🍂", "🍁"], // autumn leaves - brown to red maple
  ["🌱", "🌴", "🥥"], // palm coconut - palm tree to coconut
  ["🌱", "🌵", "🌵"], // growing cactus - small to big cactus
] as const;

// Generate emoji-based image using SVG data URI with larger size
function generateEmojiImage(emoji: string, fallbackText?: string, category?: string): string {
  // Use emoji utility to ensure we have a valid emoji
  const validEmoji = ensureValidEmoji(emoji, category);

  if (validEmoji) {
    // Create SVG with large emoji for better visibility
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250">
        <rect width="250" height="250" fill="#f0fdf4" rx="25"/>
        <circle cx="125" cy="125" r="110" fill="#dcfce7" opacity="0.8"/>
        <text x="125" y="160" font-size="140" text-anchor="middle" font-family="Arial, sans-serif">${validEmoji}</text>
      </svg>
    `;

    // Use URL encoding instead of base64 to avoid Unicode issues
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // Enhanced fallback with better category-specific placeholder
  const fallbackEmoji = category ? getCategoryFallbackEmoji(category) : "🌱";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250">
      <rect width="250" height="250" fill="#f0fdf4" rx="25"/>
      <circle cx="125" cy="125" r="110" fill="#dcfce7" opacity="0.8"/>
      <text x="125" y="160" font-size="140" text-anchor="middle" font-family="Arial, sans-serif">${fallbackEmoji}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Enhanced word generation using database words with emojis (same as Listen & Guess)
const generateDatabaseWords = (
  count: number,
  optionsPerRound: number,
  category?: string,
  difficulty?: "easy" | "medium" | "hard",
): WordItem[] => {
  let dbWords: Word[] = [];

  if (category && category !== "all") {
    dbWords = getWordsByCategory(category);
  } else {
    dbWords = getRandomWords(count * 3); // Get more words to have options
  }

  if (difficulty) {
    dbWords = dbWords.filter((w) => w.difficulty === difficulty);
  }

  // Convert database words to WordItem format using emojis (same as Listen & Guess)
  return dbWords.slice(0, count).map((word) => ({
    id: word.id,
    word: word.word,
    imageUrl: generateEmojiImage(word.emoji, word.word, word.category), // Generate large SVG emoji for better garden visuals
    distractorImages: generateDistractorEmojis(word, dbWords, optionsPerRound),
    category: word.category,
    difficulty: word.difficulty,
  }));
};

// Generate distractor emojis from the same category or similar words (same as Listen & Guess)
const generateDistractorEmojis = (
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
    .map((w) => generateEmojiImage(w.emoji, w.word, w.category)); // Generate large SVG emojis for better garden visuals
};

// Fetch words function using the same logic as Listen & Guess
const fetchWords = async (
  params: FetchParams & { optionsPerRound: number },
): Promise<WordItem[]> => {
  // Use database-based word generation with emojis (same approach as Listen & Guess)
  const difficultyLevel = params.difficulty || "easy";
  return generateDatabaseWords(
    params.limit,
    params.optionsPerRound,
    undefined,
    difficultyLevel,
  );
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
  plantEmoji = "🌱",
}: GardenAchievementProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 2000);
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
                    repeatDelay: 3,
                  }}
                  style={{
                    left: "50%",
                    top: "50%",
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
                delay: 0.2,
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
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.1s" }}
              >
                🌸
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                🌺
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.3s" }}
              >
                🌷
              </span>
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
      <DialogContent className="sm:max-w-xs max-w-[90vw] p-3 bg-gradient-to-br from-green-400 via-green-500 to-emerald-600 border-green-300 border-4">
        <DialogHeader className="text-center pb-2">
          <div className="text-5xl mb-2 animate-bounce">🌻</div>
          <DialogTitle className="text-lg font-bold text-white drop-shadow-lg">
            🎉 Garden Done! 🌸
          </DialogTitle>
          <DialogDescription className="text-green-100 text-sm">
            Amazing job growing your garden!
          </DialogDescription>
        </DialogHeader>

        {/* Compact Stats */}
        <div className="bg-white/20 rounded-lg p-2 border border-green-300/50 backdrop-blur-sm">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-2xl">🌱</div>
              <div className="text-lg font-bold text-white">
                {stats.correct}
              </div>
              <div className="text-xs text-green-100">Plants</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl">⭐</div>
              <div className="text-lg font-bold text-white">
                {stats.bestStreak}
              </div>
              <div className="text-xs text-green-100">Streak</div>
            </div>
            <div className="flex-1">
              <div className="text-2xl">
                {accuracy >= 90 ? "🏆" : accuracy >= 75 ? "🎓" : "👍"}
              </div>
              <div className="text-lg font-bold text-white">{accuracy}%</div>
              <div className="text-xs text-green-100">Score</div>
            </div>
          </div>
        </div>

        {/* Compact Garden Preview - Show only first 5 plants */}
        <div className="flex justify-center gap-1 text-xl my-3">
          {Array.from({ length: Math.min(stats.correct, 5) }, (_, i) => (
            <span
              key={i}
              className="animate-gentle-float"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {PLANT_TYPES[i % PLANT_TYPES.length][2]}
            </span>
          ))}
          {stats.correct > 5 && (
            <span className="text-green-200 animate-gentle-float">
              +{stats.correct - 5} more!
            </span>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            onClick={onContinue}
            className="flex-1 bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-3 rounded-lg shadow-lg border border-white/30"
          >
            <span className="mr-1">🌱</span>
            Play Again!
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 bg-white/10 hover:bg-white/20 text-white border-white/30 text-sm py-2 px-3 rounded-lg"
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
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showSparkleExplosion, setShowSparkleExplosion] = useState(false);
  const [sparkleCount, setSparkleCount] = useState(0);

  // Achievement popup state
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState({
    title: "",
    description: "",
    plantEmoji: "🌱",
  });

  // Generate diverse plant types ensuring variety
  const generateDiversePlantTypes = useCallback((count: number) => {
    const types: number[] = [];
    const usedTypes = new Set<number>();

    // First, try to use unique plant types
    for (let i = 0; i < count; i++) {
      let plantType;
      let attempts = 0;

      do {
        plantType = Math.floor(Math.random() * PLANT_TYPES.length);
        attempts++;
      } while (
        usedTypes.has(plantType) &&
        attempts < 10 &&
        usedTypes.size < PLANT_TYPES.length
      );

      types.push(plantType);
      usedTypes.add(plantType);
    }

    return types;
  }, []);

  // Garden stages with plant types
  const [gardenStages, setGardenStages] = useState<number[]>(
    Array.from({ length: rounds }, () => 0),
  );
  const [plantTypes, setPlantTypes] = useState<number[]>(
    generateDiversePlantTypes(rounds),
  );
  const [recentlyGrown, setRecentlyGrown] = useState<number | null>(null);

  const { ref: confettiRef, burst } = useConfetti();

  // Fetch words from your DB
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchWords({ limit: rounds, difficulty, optionsPerRound })
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
  }, [rounds, difficulty, optionsPerRound]);

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

      // Show garden-specific achievements - ALL DISABLED
      // Disabled: Growing Streak popup at 3 correct answers
      // if (nextStreak === 3) {
      //   setAchievementData({
      //     title: "Growing Streak!",
      //     description:
      //       "3 plants in a row! Your garden is blooming beautifully! 🌸",
      //     plantEmoji: "🌸",
      //   });
      //   setShowAchievement(true);
      // } else
      // Disabled: Garden Master popup at 5 streak
      // if (nextStreak === 5) {
      //   setAchievementData({
      //     title: "Garden Master!",
      //     description: "5 perfect plants! You're a true gardener! 🏆",
      //     plantEmoji: "🌻",
      //   });
      //   setShowAchievement(true);
      // } else
      // Disabled: First Sprout popup at 1 correct
      // if (nextCorrectTotal === 1) {
      //   setAchievementData({
      //     title: "First Sprout!",
      //     description: "Your first plant has sprouted! Keep growing! 🌱",
      //     plantEmoji: "🌱",
      //   });
      //   setShowAchievement(true);
      // }
    },
    [difficulty, category],
  );

  const choose = useCallback(
    async (img: string) => {
      if (!current || locked) return;
      setLocked(true);
      setAttempts((a) => a + 1);
      setSelectedAnswer(img);
      setShowAnswer(true);

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

        // Enhanced celebration effects with sparkles
        setShowSparkleExplosion(true);
        setSparkleCount((prev) => prev + 1);
        burst();

        // Auto-hide sparkle explosion after animation
        setTimeout(() => setShowSparkleExplosion(false), 1500);

        checkAchievements(nextCorrect, nextStreak);

        // Play success sound
        audioService.playSuccessSound();

        // Haptic feedback
        if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);

        // Wait longer to show the plant growth before moving to next round
        setTimeout(() => {
          setAttempts(0);
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
    setPlantTypes(generateDiversePlantTypes(rounds));
    setRecentlyGrown(null);

    // Fetch new words
    setLoading(true);
    fetchWords({ limit: rounds, difficulty, optionsPerRound })
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

        {/* Options grid */}
        <div
          className={`grid gap-4 ${optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {options.map((img, i) => {
            const isCorrect = img === current.imageUrl;
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
                <div className="w-full h-full flex items-center justify-center p-2">
                  <img
                    src={img}
                    alt="option"
                    className="w-full h-full object-contain rounded-2xl"
                  />
                </div>
                {/* Enhanced fun corner badge with dynamic sparkles */}
                <div className="absolute top-2 left-2">
                  <span className="text-lg animate-sparkle">✨</span>
                  {sparkleCount > 3 && (
                    <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-400 animate-spin" />
                  )}
                </div>

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

                {/* Enhanced sparkle effects for hover and interaction */}
                <div className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-xs animate-mobile-sparkle">⭐</span>
                  {showSparkleExplosion && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-yellow-300 animate-ping" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
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
      <div className="mt-4 grid grid-cols-5 gap-2">
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

      {/* Enhanced styles for confetti, sparkles, and animations */}
      <style>{`
        .wg-confetti{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}

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

      {/* Enhanced Exit Confirmation Dialog - Mobile Optimized */}
      <Dialog open={showExitDialog} onOpenChange={onCloseExitDialog}>
        <DialogContent className="sm:max-w-xs max-w-[90vw] p-4">
          <DialogHeader className="text-center pb-2">
            <div className="text-4xl mb-1">🌱</div>
            <DialogTitle className="text-lg font-bold text-gray-800">
              Leave garden?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Your plants are waiting!
            </DialogDescription>
          </DialogHeader>

          {/* Compact Garden Progress Summary */}
          <div className="bg-green-50 rounded-lg p-2 border border-green-200 my-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-green-800">
                <span className="font-medium">🌱 {correctCount}</span>
                <span className="text-xs ml-1">grown</span>
              </div>
              <div className="text-green-700">
                <span className="font-medium">⭐ {bestStreak}</span>
                <span className="text-xs ml-1">streak</span>
              </div>
              <div className="text-green-600 text-xs">
                {roundIdx + 1}/{pool.length}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onCloseExitDialog?.()}
              className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-300 text-sm py-2"
            >
              🌱 Stay
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCloseExitDialog?.();
                onExit?.();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-sm py-2"
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
    <div className={`relative w-full max-w-md mx-auto p-4 ${className}`}>
      {children}
    </div>
  );
}
