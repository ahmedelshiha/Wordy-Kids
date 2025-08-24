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
import {
  Sparkles,
  Star,
  Crown,
  Zap,
  Leaf,
  TreePine,
  Compass,
  Mountain,
  Home,
} from "lucide-react";

/**
 * Jungle Adventure Word Garden — Immersive Listen & Pick Game for Ages 3–5
 * --------------------------------------------------------------------------
 * 🌟 Comprehensive jungle adventure theme with enhanced visuals and interactions
 * • Kids listen to pronunciation then pick the matching jungle treasure picture
 * • Every correct answer grows a plant in the jungle adventure garden (visual progress)
 * • Integrates with achievements + jungle celebration hooks
 * • Mobile-first UI with large tap targets and immersive jungle visuals
 * • Perfect optimization for both desktop and mobile devices
 *
 * Enhanced jungle features: animated jungle elements, treasure hunting theme,
 * monkey guide, adventure progress tracking, jungle sound effects
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

export type WordGardenProps = {
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
  // Import sanitization helper to prevent "[object Object]" errors
  const { sanitizeTTSInput, logSpeechError } = require("@/lib/speechUtils");

  if (synth && typeof SpeechSynthesisUtterance !== "undefined") {
    // Sanitize input to prevent errors
    const sanitizedWord = sanitizeTTSInput(word);
    if (!sanitizedWord) {
      logSpeechError("WordGarden.speakWord", word, "Empty word after sanitization");
      return;
    }

    const u = new SpeechSynthesisUtterance(sanitizedWord);
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
    imageUrl: generateEmojiImage(word.emoji, word.word), // Generate large SVG emoji for better garden visuals
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
    .map((w) => generateEmojiImage(w.emoji, w.word)); // Generate large SVG emojis for better garden visuals
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

// Jungle Adventure Achievement Component
interface JungleAchievementProps {
  show: boolean;
  title: string;
  description: string;
  onClose: () => void;
  plantEmoji?: string;
}

function JungleAchievementPopup({
  show,
  title,
  description,
  onClose,
  plantEmoji = "🌱",
}: JungleAchievementProps) {
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
            className="bg-gradient-to-br from-jungle-DEFAULT via-jungle-light to-emerald-600 text-white rounded-3xl p-6 max-w-sm mx-4 text-center shadow-2xl border-4 border-jungle-light/50"
          >
            {/* Floating jungle sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-sunshine-DEFAULT text-lg"
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
              <h3 className="text-2xl font-bold mb-2 text-sunshine-light drop-shadow-lg">
                🌟 {title} 🌟
              </h3>
              <p className="text-lg text-jungle-light mb-4 leading-relaxed drop-shadow">
                {description}
              </p>
            </motion.div>

            {/* Jungle celebration icons */}
            <motion.div
              className="flex justify-center gap-3 text-2xl"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="animate-bounce">🐒</span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.1s" }}
              >
                🌺
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                🦋
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.3s" }}
              >
                🌴
              </span>
            </motion.div>

            {/* Auto-close indicator */}
            <motion.div
              className="mt-4 text-sm text-jungle-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Your jungle adventure continues! 🐒✨
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Jungle Adventure Game completion dialog
interface JungleGameCompletionDialogProps {
  show: boolean;
  stats: GameFinishStats;
  onContinue: () => void;
  onExit: () => void;
}

function JungleGameCompletionDialog({
  show,
  stats,
  onContinue,
  onExit,
}: JungleGameCompletionDialogProps) {
  const accuracy =
    stats.totalRounds > 0
      ? Math.round((stats.correct / stats.totalRounds) * 100)
      : 0;

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm max-w-[90vw] max-h-[85vh] overflow-y-auto p-3 relative border-jungle-light border-4 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        {/* Magical Jungle Background with deep emerald-to-moss gradient */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          {/* Deep emerald-to-moss gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-800" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-emerald-800/50 to-teal-700/40" />

          {/* Misty blue-green horizon */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-teal-600/50 via-emerald-600/30 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-32 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.4),transparent_70%)]" />

          {/* Soft golden sunlight rays through leaves */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={`completion-sunray-${i}`}
                className="absolute opacity-30"
                style={{
                  left: `${5 + i * 8}%`,
                  top: `-5%`,
                  width: "1px",
                  height: "110%",
                  background:
                    "linear-gradient(to bottom, rgba(255, 215, 0, 0.8), rgba(255, 235, 59, 0.4), transparent)",
                  transform: `rotate(${-15 + i * 3}deg)`,
                  animationName: "sunlight-shimmer",
                  animationDuration: `${3 + Math.random() * 1.5}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Dark leafy silhouettes in foreground */}
          <div className="absolute bottom-0 left-0 right-0 h-24">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={`completion-silhouette-${i}`}
                className="absolute text-black/70"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 25}%`,
                  fontSize: `${1 + Math.random() * 0.8}rem`,
                  transform: `rotate(${-30 + Math.random() * 60}deg)`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <span className="animate-jungle-sway drop-shadow-lg">
                  {
                    ["✨", "🍃", "🌱", "🌾", "🪴"][
                      Math.floor(Math.random() * 5)
                    ]
                  }
                </span>
              </div>
            ))}
          </div>

          {/* Jungle vines as dark silhouettes */}
          <div className="absolute inset-0">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`completion-vine-${i}`}
                className="absolute opacity-50"
                style={{
                  left: `${i * 12.5}%`,
                  top: "0%",
                  width: "2px",
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0, 40, 20, 0.9), rgba(0, 60, 30, 0.7))",
                  animationName: "vine-sway",
                  animationDuration: `${2.5 + Math.random() * 1.5}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>

          {/* Magical fireflies */}
          <div className="absolute inset-0">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={`completion-firefly-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full opacity-90"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background:
                    "radial-gradient(circle, rgba(255, 255, 0, 1), rgba(255, 215, 0, 0.5))",
                  boxShadow: "0 0 6px rgba(255, 255, 0, 0.8)",
                  animationName: "firefly-celebration",
                  animationDuration: `${3 + Math.random() * 2}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>

          {/* Drifting leaves with subtle parallax */}
          <div className="absolute inset-0">
            {Array.from({ length: 25 }, (_, i) => (
              <div
                key={`completion-drifting-leaf-${i}`}
                className="absolute text-emerald-400/80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${0.5 + Math.random() * 0.6}rem`,
                  animationName: "leaf-drift",
                  animationDuration: `${6 + Math.random() * 3}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationDelay: `${Math.random() * 6}s`,
                }}
              >
                <span className="drop-shadow-md">
                  {["🍃", "🌿", "🍂", "🌱"][Math.floor(Math.random() * 4)]}
                </span>
              </div>
            ))}
          </div>

          {/* Soft ambient glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-green-600/15" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(34,197,94,0.2),transparent_60%)]" />
        </div>
        <DialogHeader className="text-center pb-2 relative z-10">
          <div className="text-6xl mb-3 animate-jungle-celebration drop-shadow-2xl">
            🏆
          </div>
          <DialogTitle className="text-xl font-bold text-white drop-shadow-2xl bg-emerald-900/70 backdrop-blur-md rounded-lg px-4 py-2 border-2 border-yellow-400/60 shadow-2xl relative">
            {/* Magical glow effect behind text */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-300/30 to-yellow-400/20 rounded-lg blur-sm" />
            <span className="relative z-10">
              🏆 🎉 Jungle Quest Complete! 🐒
            </span>
          </DialogTitle>
          <DialogDescription className="text-emerald-100 text-sm drop-shadow-lg">
            Outstanding adventure! The monkey is so proud! 🍌
          </DialogDescription>
        </DialogHeader>

        {/* Compact Jungle Stats */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 rounded-lg p-3 border border-yellow-400/40 backdrop-blur-md shadow-lg relative z-10">
          <div className="flex justify-between items-center text-center">
            <div className="flex-1">
              <div className="text-3xl animate-pulse">🏆</div>
              <div className="text-lg font-bold text-white">
                {stats.correct}
              </div>
              <div className="text-xs text-emerald-200">Treasures</div>
            </div>
            <div className="flex-1">
              <div className="text-3xl animate-bounce">🔥</div>
              <div className="text-lg font-bold text-white">
                {stats.bestStreak}
              </div>
              <div className="text-xs text-emerald-200">Best Streak</div>
            </div>
            <div className="flex-1">
              <div className="text-3xl">
                {accuracy >= 90 ? "🏆" : accuracy >= 75 ? "🏖️" : "🌟"}
              </div>
              <div className="text-lg font-bold text-white">{accuracy}%</div>
              <div className="text-xs text-emerald-200">Adventure Score</div>
            </div>
          </div>
        </div>

        {/* Jungle Treasure Collection Preview */}
        <div className="flex justify-center gap-2 text-2xl my-4 p-2 bg-emerald-900/30 rounded-lg border border-yellow-400/30 backdrop-blur-sm shadow-md relative z-10">
          {Array.from({ length: Math.min(stats.correct, 5) }, (_, i) => (
            <div
              key={i}
              className="relative animate-jungle-float"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <span className="drop-shadow-lg">
                {PLANT_TYPES[i % PLANT_TYPES.length][2]}
              </span>
              <div className="absolute -top-1 -right-1 text-xs animate-sparkle">
                <span>✨</span>
              </div>
            </div>
          ))}
          {stats.correct > 5 && (
            <div className="text-emerald-200 animate-jungle-float flex items-center gap-1">
              <span className="text-lg">🎒</span>
              <span className="text-sm font-semibold">
                +{stats.correct - 5} more!
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 pt-2 relative z-10">
          <Button
            onClick={onContinue}
            className="flex-1 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white text-sm py-3 px-4 rounded-lg shadow-xl border border-yellow-400/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm"
          >
            <span className="mr-2">🐒</span>
            New Adventure!
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            className="flex-1 bg-yellow-400/20 hover:bg-yellow-400/30 text-emerald-900 border-yellow-400/50 text-sm py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm font-semibold"
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Home Base</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Jungle Adventure Component ----------
export default function WordGarden({
  rounds = 10,
  optionsPerRound = 3,
  difficulty = "easy",
  category,
  className = "",
  onFinish,
  onExit,
  showExitDialog = false,
  onCloseExitDialog,
}: WordGardenProps) {
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
      // Track achievements and show jungle-themed popup
      EnhancedAchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: 1,
        accuracy: nextStreak > 0 ? 100 : 80,
        difficulty: difficulty,
        category: category,
      });

      // Show jungle-specific achievements - ALL DISABLED for cleaner experience
      // Users will see achievements through the main achievement system
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
        <div className="rounded-3xl bg-gradient-to-br from-jungle-light to-jungle-DEFAULT p-4 md:p-8 shadow-xl text-center border-2 border-jungle-light/30">
          <div className="text-4xl md:text-6xl mb-2 md:mb-4 animate-jungle-float">
            🐒
          </div>
          <div className="font-bold text-white text-base md:text-lg drop-shadow-lg">
            Growing your jungle words…
          </div>
          <div className="text-xs md:text-sm text-jungle-light mt-1 md:mt-2">
            The monkey is preparing your adventure!
          </div>
        </div>
      </Wrapper>
    );

  if (error || !current)
    return (
      <Wrapper className={className}>
        <div className="rounded-3xl bg-gradient-to-br from-coral-red/20 to-orange-500/20 p-8 shadow-xl text-center border-2 border-coral-red/30">
          <div className="text-6xl mb-4">🐒</div>
          <div className="font-bold text-jungle-dark text-lg">
            No jungle words to explore
          </div>
          <div className="text-sm text-jungle-DEFAULT mt-2">
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

      <div className="relative rounded-3xl shadow-2xl p-2 md:p-4 pb-6 md:pb-8 text-white border-2 border-emerald-500/40 backdrop-blur-sm overflow-hidden">
        {/* Magical Jungle Background - Deep emerald-to-moss gradient */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          {/* Main jungle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-800 rounded-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-900/80 via-emerald-800/40 to-blue-green-600/30 rounded-3xl" />

          {/* Misty blue-green horizon */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-600/40 via-emerald-600/20 to-transparent rounded-t-3xl" />
          <div className="absolute top-0 left-0 right-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.3),transparent_70%)] rounded-t-3xl" />

          {/* Golden sunlight rays through leaves */}
          <div className="absolute inset-0">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`sunray-${i}`}
                className="absolute opacity-20"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `-10%`,
                  width: "2px",
                  height: "120%",
                  background:
                    "linear-gradient(to bottom, rgba(255, 215, 0, 0.6), rgba(255, 235, 59, 0.3), transparent)",
                  transform: `rotate(${-20 + i * 5}deg)`,
                  animationName: "sunlight-shimmer",
                  animationDuration: `${4 + Math.random() * 2}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>

          {/* Dark leafy silhouettes in foreground */}
          <div className="absolute bottom-0 left-0 right-0 h-40">
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={`silhouette-${i}`}
                className="absolute text-black/60"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `${Math.random() * 30}%`,
                  fontSize: `${1.5 + Math.random() * 1}rem`,
                  transform: `rotate(${-30 + Math.random() * 60}deg)`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                <span className="animate-jungle-sway drop-shadow-lg">
                  {["🌿", "🍃", "🌱", "🌾"][Math.floor(Math.random() * 4)]}
                </span>
              </div>
            ))}
          </div>

          {/* Jungle vines as dark silhouettes */}
          <div className="absolute inset-0">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={`vine-silhouette-${i}`}
                className="absolute opacity-40"
                style={{
                  left: `${i * 12.5}%`,
                  top: "0%",
                  width: "3px",
                  height: "100%",
                  background:
                    "linear-gradient(to bottom, transparent, rgba(0, 40, 20, 0.8), rgba(0, 60, 30, 0.6))",
                  animationName: "vine-sway",
                  animationDuration: `${3 + Math.random() * 2}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Magical fireflies */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={`firefly-${i}`}
                className="absolute w-2 h-2 rounded-full opacity-80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background:
                    "radial-gradient(circle, rgba(255, 255, 0, 0.9), rgba(255, 215, 0, 0.4))",
                  boxShadow: "0 0 8px rgba(255, 255, 0, 0.6)",
                  animationName: "firefly-dance",
                  animationDuration: `${4 + Math.random() * 3}s`,
                  animationTimingFunction: "ease-in-out",
                  animationIterationCount: "infinite",
                  animationDelay: `${Math.random() * 4}s`,
                }}
              />
            ))}
          </div>

          {/* Drifting leaves with parallax */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={`drifting-leaf-${i}`}
                className="absolute text-emerald-400/70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${0.6 + Math.random() * 0.8}rem`,
                  animationName: "leaf-drift",
                  animationDuration: `${8 + Math.random() * 4}s`,
                  animationTimingFunction: "linear",
                  animationIterationCount: "infinite",
                  animationDelay: `${Math.random() * 8}s`,
                }}
              >
                <span className="drop-shadow-md">
                  {["🍃", "🌿", "🍂"][Math.floor(Math.random() * 3)]}
                </span>
              </div>
            ))}
          </div>

          {/* Soft ambient glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-600/10 rounded-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(34,197,94,0.15),transparent_60%)] rounded-3xl" />
        </div>

        {/* Jungle Adventure Top Bar */}
        <div className="mb-2 md:mb-4 relative z-10">
          <div className="flex items-center justify-between text-sm mb-2">
            <div className="flex items-center gap-2 bg-emerald-800/30 rounded-full px-3 py-1 border border-emerald-500/40 backdrop-blur-sm shadow-lg">
              <TreePine className="w-4 h-4 text-emerald-200" />
              <span className="text-emerald-100 font-semibold drop-shadow-lg">
                Seed {roundIdx + 1} / {pool.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-800/30 rounded-full px-3 py-1 border border-yellow-500/40 backdrop-blur-sm shadow-lg">
              <Zap className="w-4 h-4 text-yellow-200" />
              <span className="text-yellow-100 font-semibold drop-shadow-lg">
                Streak: {bestStreak}
              </span>
            </div>
          </div>

          {/* Jungle Path Progress Bar */}
          <div className="relative">
            <div className="h-4 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-sunshine-DEFAULT to-sunshine-light transition-all duration-500 ease-out relative overflow-hidden"
                style={{ width: `${progressPct}%` }}
              >
                {/* Animated progress sparkles */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-jungle-glow" />
              </div>
            </div>

            {/* Jungle milestone markers */}
            <div className="absolute top-0 w-full h-4 flex justify-between px-1">
              {Array.from({ length: Math.min(5, pool.length) }, (_, i) => {
                const position = ((i + 1) / Math.min(5, pool.length)) * 100;
                const reached = progressPct >= position;
                return (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${reached ? "bg-sunshine-light border-white scale-110" : "bg-jungle-dark/50 border-jungle-light/40"}`}
                    style={{ marginLeft: i === 0 ? "0" : "-6px" }}
                  >
                    {reached && (
                      <span className="text-[8px] leading-none">🌟</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Jungle Guide + Play */}
        <div className="flex items-center justify-between gap-2 md:gap-3 mb-3 md:mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-5xl md:text-6xl animate-jungle-float">
                🌵
              </span>
              <div className="absolute -top-1 -right-1 text-lg animate-bounce">
                <span>🍌</span>
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wider text-yellow-300 font-bold mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3" />
                Jungle Word Quest
              </div>
              <div className="font-bold text-lg md:text-xl text-white drop-shadow-md">
                Listen & find the treasure! 🗺️
              </div>
              <div className="text-xs text-emerald-200 mt-1 opacity-90">
                Help the monkey collect jungle words
              </div>
            </div>
          </div>

          <button
            onClick={handlePlay}
            className="relative rounded-full px-3 py-3 md:px-6 md:py-4 bg-gradient-to-br from-sunshine-DEFAULT to-sunshine-dark text-navy font-bold active:scale-95 transition-all duration-200 min-w-[56px] min-h-[56px] md:min-w-[64px] md:min-h-[64px] shadow-lg border-2 border-sunshine-light hover:shadow-xl hover:scale-105 group"
            aria-label="Play jungle sound"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl md:text-2xl group-hover:animate-pulse">
                🔊
              </span>
              <span className="hidden md:inline text-sm font-bold">Play</span>
            </div>

            {/* Sound wave animation */}
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-sunshine-light rounded-full animate-ping" />
                <div
                  className="w-1 h-1 bg-sunshine-light rounded-full animate-ping"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-1 h-1 bg-sunshine-light rounded-full animate-ping"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </button>
        </div>

        {/* Sparkle explosion effect */}
        {showSparkleExplosion && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <div className="absolute top-1/4 left-1/4 animate-ping">
              <Sparkles className="w-8 h-8 text-sunshine-DEFAULT" />
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

        {/* Jungle Treasure Options Grid */}
        <div
          className={`grid gap-2 md:gap-4 relative z-10 ${optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
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
                className={`relative aspect-square rounded-3xl bg-gradient-to-br from-white via-light-background to-white/95 hover:from-sunshine-light/20 hover:via-light-background hover:to-white active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden border-4 focus:outline-none focus:ring-4 focus:ring-sunshine-DEFAULT touch-target mobile-optimized backdrop-blur-sm ${
                  shouldHighlight
                    ? isCorrect
                      ? "border-jungle-DEFAULT ring-4 ring-jungle-light animate-jungle-celebration shadow-jungle-success"
                      : "border-coral-red ring-4 ring-coral-red/50 animate-wiggle shadow-jungle-error"
                    : "border-transparent hover:border-sunshine-DEFAULT hover:shadow-jungle-hover animate-fade-in"
                } ${locked ? "cursor-not-allowed" : "cursor-pointer hover:shadow-xl hover:scale-105"}`}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Jungle treasure frame */}
                <div className="absolute inset-2 rounded-2xl bg-gradient-to-br from-jungle-light/10 to-transparent border border-jungle-light/20" />

                <div className="w-full h-full flex items-center justify-center p-3 relative z-10">
                  <div className="relative w-full h-full">
                    <img
                      src={img}
                      alt="jungle treasure option"
                      className="w-full h-full object-contain rounded-2xl drop-shadow-md"
                    />

                    {/* Jungle treasure glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-sunshine-DEFAULT/0 via-sunshine-light/5 to-sunshine-DEFAULT/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Jungle adventure corner badge */}
                <div className="absolute top-2 left-2 z-20">
                  <div className="relative">
                    <span className="text-lg animate-jungle-sparkle drop-shadow-lg">
                      🌟
                    </span>
                    {sparkleCount > 3 && (
                      <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-4 h-4 text-sunshine-DEFAULT animate-spin" />
                        <span className="absolute inset-0 text-xs animate-pulse">
                          🎋
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Jungle vine decoration */}
                  <div className="absolute -top-1 -left-1 text-jungle-light opacity-50">
                    <span className="text-xs animate-jungle-sway">🌿</span>
                  </div>
                </div>

                {/* Jungle success/failure feedback */}
                {showAnswer && isCorrect && (
                  <div className="absolute inset-0 bg-gradient-to-br from-jungle-DEFAULT/40 via-jungle-light/30 to-sunshine-DEFAULT/20 flex items-center justify-center backdrop-blur-sm rounded-3xl border-2 border-jungle-light/50">
                    <div className="text-center relative">
                      {/* Success explosion effect */}
                      <div className="absolute inset-0 -m-8">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute text-sunshine-DEFAULT animate-jungle-celebration"
                            style={{
                              left: `${50 + Math.cos((i * Math.PI * 2) / 6) * 30}%`,
                              top: `${50 + Math.sin((i * Math.PI * 2) / 6) * 30}%`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          >
                            <span className="text-2xl">🎉</span>
                          </div>
                        ))}
                      </div>

                      <span className="text-6xl animate-jungle-celebration drop-shadow-lg">
                        🏆
                      </span>
                      <div className="text-white font-bold text-sm md:text-base mt-1 md:mt-2 drop-shadow-lg bg-jungle-dark/50 rounded-full px-2 md:px-3 py-1">
                        <span className="mr-2">🐒</span>Treasure found!
                      </div>
                    </div>
                  </div>
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <div className="absolute inset-0 bg-gradient-to-br from-coral-red/40 via-coral-red/30 to-orange-500/20 flex items-center justify-center backdrop-blur-sm rounded-3xl border-2 border-coral-red/50">
                    <div className="text-center relative">
                      <span className="text-5xl animate-wiggle drop-shadow-lg">
                        🔍
                      </span>
                      <div className="text-white font-bold text-xs md:text-sm mt-1 md:mt-2 drop-shadow-lg bg-coral-red/50 rounded-full px-2 md:px-3 py-1">
                        <span className="mr-2">🗺️</span>Keep exploring!
                      </div>
                    </div>
                  </div>
                )}

                {/* Jungle discovery effects */}
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-all duration-300 group-hover:scale-110 z-20">
                  <div className="relative">
                    <span className="text-sm animate-jungle-sparkle drop-shadow-md">
                      🌺
                    </span>
                    {showSparkleExplosion && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                          <Sparkles className="w-6 h-6 text-sunshine-DEFAULT animate-ping" />
                          <span className="absolute inset-0 flex items-center justify-center text-xs animate-jungle-glow">
                            🎋
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Jungle hover trail effect */}
                <div className="absolute bottom-2 left-2 opacity-0 hover:opacity-60 transition-opacity z-10">
                  <div className="flex gap-1">
                    <span
                      className="text-xs animate-jungle-float"
                      style={{ animationDelay: "0s" }}
                    >
                      🍃
                    </span>
                    <span
                      className="text-xs animate-jungle-float"
                      style={{ animationDelay: "0.2s" }}
                    >
                      🌿
                    </span>
                    <span
                      className="text-xs animate-jungle-float"
                      style={{ animationDelay: "0.4s" }}
                    >
                      🦋
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Jungle Adventure XP + Streak */}
        <div className="mt-3 md:mt-6 relative z-10 mb-1 md:mb-2">
          <div className="text-sm flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-yellow-300">
              <Mountain className="w-4 h-4" />
              <span className="font-semibold">Jungle XP</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-200">
              <span className="animate-pulse">🔥</span>
              <span className="font-semibold">Adventure Streak: {streak}</span>
            </div>
          </div>

          <div className="relative mb-3 md:mb-6">
            <div className="h-4 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-jungle-DEFAULT via-jungle-light to-sunshine-DEFAULT transition-all duration-700 ease-out relative overflow-hidden"
                style={{ width: `${xpPct}%` }}
              >
                {/* XP progress sparkle trail */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-jungle-glow" />

                {/* XP milestone celebration */}
                {xpPct > 75 && (
                  <div className="absolute top-0 right-0 -mr-2 -mt-1">
                    <span className="text-xs animate-bounce">🎊</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Jungle adventure level indicators with better visibility */}
            <div className="flex justify-between mt-2 md:mt-4 px-1 md:px-2 gap-1">
              <div
                className={`flex flex-col items-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-xl border-2 transition-all duration-300 ${
                  xpPct >= 25
                    ? "bg-gradient-to-b from-yellow-400/20 to-yellow-500/30 border-yellow-400/60 text-yellow-200 shadow-lg transform scale-105"
                    : "bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50"
                }`}
              >
                <span className="text-xl drop-shadow-lg">🌱</span>
                <span className="text-xs font-bold drop-shadow-md">Sprout</span>
                {xpPct >= 25 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>
              <div
                className={`flex flex-col items-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-xl border-2 transition-all duration-300 ${
                  xpPct >= 50
                    ? "bg-gradient-to-b from-yellow-400/20 to-yellow-500/30 border-yellow-400/60 text-yellow-200 shadow-lg transform scale-105"
                    : "bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50"
                }`}
              >
                <span className="text-xl drop-shadow-lg">🌿</span>
                <span className="text-xs font-bold drop-shadow-md">
                  Explorer
                </span>
                {xpPct >= 50 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>
              <div
                className={`flex flex-col items-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-xl border-2 transition-all duration-300 ${
                  xpPct >= 75
                    ? "bg-gradient-to-b from-yellow-400/20 to-yellow-500/30 border-yellow-400/60 text-yellow-200 shadow-lg transform scale-105"
                    : "bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50"
                }`}
              >
                <span className="text-xl drop-shadow-lg">🌳</span>
                <span className="text-xs font-bold drop-shadow-md">Ranger</span>
                {xpPct >= 75 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>
              <div
                className={`flex flex-col items-center gap-1 md:gap-2 px-1 md:px-2 py-2 md:py-3 rounded-xl border-2 transition-all duration-300 relative ${
                  xpPct >= 100
                    ? "bg-gradient-to-b from-yellow-400/30 to-yellow-500/40 border-yellow-300/80 text-yellow-100 shadow-xl transform scale-110 animate-pulse"
                    : "bg-emerald-900/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-800/50"
                }`}
              >
                <span className="text-xl drop-shadow-lg">👑</span>
                <span className="text-xs font-bold drop-shadow-md">Legend</span>
                {xpPct >= 100 && (
                  <>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-transparent to-yellow-600/20 rounded-xl animate-pulse"></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Jungle Adventure Progress Trail */}
      <div className="mt-2 md:mt-4 relative mb-2 md:mb-4">
        {/* Rich jungle path background */}
        <div className="absolute inset-0 -mx-2 h-24 bg-gradient-to-r from-emerald-200/80 via-green-100/90 to-lime-200/80 rounded-2xl border-2 border-emerald-300/60 shadow-lg" />
        {/* Jungle path texture overlay */}
        <div className="absolute inset-0 -mx-2 h-24 bg-[radial-gradient(circle_at_25%_50%,rgba(34,197,94,0.15),transparent_40%)] rounded-2xl" />
        <div className="absolute inset-0 -mx-2 h-24 bg-[radial-gradient(circle_at_75%_50%,rgba(132,204,22,0.15),transparent_40%)] rounded-2xl" />

        <div className="relative grid grid-cols-5 gap-2 p-2">
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
                className={`relative rounded-3xl h-20 flex items-center justify-center transition-all duration-500 overflow-hidden ${
                  justGrew
                    ? "bg-gradient-to-br from-sunshine-light via-sunshine-DEFAULT to-sunshine-dark ring-4 ring-sunshine-light shadow-2xl scale-110"
                    : isActive
                      ? "bg-gradient-to-br from-jungle-light via-jungle-DEFAULT to-jungle-dark ring-3 ring-jungle-light shadow-xl animate-jungle-glow"
                      : isCompleted && hasGrown
                        ? "bg-gradient-to-br from-jungle-light/30 via-jungle-DEFAULT/20 to-jungle-dark/30 shadow-lg"
                        : "bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 border-2 border-dashed border-gray-300"
                }`}
              >
                {/* Jungle station background effects */}
                {(isActive || justGrew) && (
                  <div className="absolute inset-0">
                    {/* Animated jungle particles */}
                    {Array.from({ length: 4 }, (_, i) => (
                      <div
                        key={i}
                        className="absolute text-jungle-light/40"
                        style={{
                          left: `${25 + i * 25}%`,
                          top: `${20 + Math.sin(i) * 20}%`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      >
                        <span className="text-xs animate-jungle-float">🌿</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adventure station marker */}
                <div className="relative z-10 text-center">
                  <span
                    className={`text-4xl transition-all duration-700 drop-shadow-lg ${
                      justGrew
                        ? "animate-jungle-celebration scale-125 filter brightness-125"
                        : isActive
                          ? "animate-jungle-float scale-110"
                          : hasGrown
                            ? "scale-105 hover:scale-110 transition-transform"
                            : "opacity-50 scale-90"
                    }`}
                  >
                    {plantStages[stage]}
                  </span>

                  {/* Adventure station number */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-jungle-dark text-white text-xs rounded-full flex items-center justify-center font-bold border border-jungle-light">
                    {idx + 1}
                  </div>

                  {/* Completion sparkle */}
                  {isCompleted && hasGrown && (
                    <div className="absolute -top-2 -right-2 text-sunshine-DEFAULT animate-pulse">
                      <span className="text-lg">✨</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced jungle path connecting trail */}
        <div className="absolute top-1/2 left-2 right-2 h-2 bg-gradient-to-r from-emerald-600/70 via-green-500/80 to-lime-600/70 rounded-full -translate-y-1/2 -z-10 shadow-md" />
        <div className="absolute top-1/2 left-2 right-2 h-1 bg-gradient-to-r from-emerald-400 via-green-300 to-lime-400 rounded-full -translate-y-1/2 -z-10" />

        {/* Enhanced Adventure progress indicators with better visibility */}
        <div className="flex justify-between mt-2 md:mt-3 px-2 md:px-3 gap-1">
          <div className="text-center flex flex-col items-center bg-emerald-900/50 border border-emerald-600/40 rounded-lg px-1 md:px-2 py-1 md:py-2 backdrop-blur-sm hover:bg-emerald-800/60 transition-all duration-300">
            <span className="block text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg">
              🚀
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-200 drop-shadow-md">
              Start
            </span>
          </div>
          <div className="text-center flex flex-col items-center bg-emerald-900/50 border border-emerald-600/40 rounded-lg px-1 md:px-2 py-1 md:py-2 backdrop-blur-sm hover:bg-emerald-800/60 transition-all duration-300">
            <span className="block text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg">
              🌿
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-200 drop-shadow-md">
              Jungle
            </span>
          </div>
          <div className="text-center flex flex-col items-center bg-emerald-900/50 border border-emerald-600/40 rounded-lg px-1 md:px-2 py-1 md:py-2 backdrop-blur-sm hover:bg-emerald-800/60 transition-all duration-300">
            <span className="block text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg">
              🏔️
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-200 drop-shadow-md">
              Peak
            </span>
          </div>
          <div className="text-center flex flex-col items-center bg-emerald-900/50 border border-emerald-600/40 rounded-lg px-1 md:px-2 py-1 md:py-2 backdrop-blur-sm hover:bg-emerald-800/60 transition-all duration-300">
            <span className="block text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg">
              🏆
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-200 drop-shadow-md">
              Victory
            </span>
          </div>
          <div className="text-center flex flex-col items-center bg-emerald-900/50 border border-emerald-600/40 rounded-lg px-1 md:px-2 py-1 md:py-2 backdrop-blur-sm hover:bg-emerald-800/60 transition-all duration-300">
            <span className="block text-sm md:text-lg mb-0.5 md:mb-1 drop-shadow-lg">
              👑
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-emerald-200 drop-shadow-md">
              Legend
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced styles for magical jungle effects */}
      <style>{`
        .wg-confetti{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}

        /* Jungle Adventure Shadow Effects */
        .shadow-jungle-success {
          box-shadow: 0 0 20px rgba(76, 175, 80, 0.5), 0 0 40px rgba(139, 195, 74, 0.3);
        }

        .shadow-jungle-error {
          box-shadow: 0 0 20px rgba(255, 87, 34, 0.5), 0 0 40px rgba(255, 152, 0, 0.3);
        }

        .shadow-jungle-hover {
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.4), 0 0 30px rgba(255, 235, 59, 0.2);
        }

        /* Magical Jungle Animations */
        @keyframes sunlight-shimmer {
          0%, 100% {
            opacity: 0.2;
            transform: translateY(0) rotate(var(--rotation));
          }
          50% {
            opacity: 0.4;
            transform: translateY(-10px) rotate(var(--rotation));
          }
        }

        @keyframes firefly-dance {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(20px, -15px) scale(1.2);
            opacity: 1;
          }
          50% {
            transform: translate(-10px, -25px) scale(0.8);
            opacity: 0.8;
          }
          75% {
            transform: translate(-20px, 10px) scale(1.1);
            opacity: 0.9;
          }
        }

        @keyframes leaf-drift {
          0% {
            transform: translateX(-20px) translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateX(100vw) translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes vine-sway {
          0%, 100% {
            transform: translateX(0) skewX(0deg);
          }
          50% {
            transform: translateX(5px) skewX(2deg);
          }
        }

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

        /* Parallax effect for deeper immersion */
        @keyframes parallax-float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          33% {
            transform: translateY(-8px) translateX(3px);
          }
          66% {
            transform: translateY(5px) translateX(-2px);
          }
        }

        /* Enhanced magical jungle completion animations */
        @keyframes magical-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }

        @keyframes mystical-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.6), 0 0 50px rgba(34, 197, 94, 0.2);
          }
        }

        @keyframes jungle-breeze {
          0%, 100% {
            transform: translateX(0) skewX(0deg);
          }
          25% {
            transform: translateX(2px) skewX(1deg);
          }
          75% {
            transform: translateX(-2px) skewX(-1deg);
          }
        }

        /* Additional firefly animation for completion dialog */
        @keyframes firefly-celebration {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          20% {
            transform: translate(15px, -10px) scale(1.3);
            opacity: 1;
          }
          40% {
            transform: translate(-8px, -20px) scale(0.9);
            opacity: 0.9;
          }
          60% {
            transform: translate(-15px, 8px) scale(1.2);
            opacity: 1;
          }
          80% {
            transform: translate(10px, 12px) scale(0.8);
            opacity: 0.8;
          }
        }
      `}</style>

      {/* Jungle Adventure Achievement Popup */}
      <JungleAchievementPopup
        show={showAchievement}
        title={achievementData.title}
        description={achievementData.description}
        plantEmoji={achievementData.plantEmoji}
        onClose={() => setShowAchievement(false)}
      />

      {/* Jungle Game Completion Dialog */}
      <JungleGameCompletionDialog
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

      {/* Enhanced Jungle Exit Confirmation Dialog - Overflow Prevention */}
      <Dialog open={showExitDialog} onOpenChange={onCloseExitDialog}>
        <DialogContent className="sm:max-w-sm max-w-[95vw] max-h-[90vh] overflow-y-auto p-3 sm:p-4 mx-2 my-4">
          <DialogHeader className="text-center pb-2 space-y-2">
            <div className="text-3xl sm:text-4xl mb-1 animate-bounce">🐒</div>
            <DialogTitle className="text-base sm:text-lg font-bold text-jungle-dark leading-tight">
              Leave jungle adventure?
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-jungle-DEFAULT leading-relaxed px-2">
              The monkey needs your help to find more treasures!
            </DialogDescription>
          </DialogHeader>

          {/* Responsive Jungle Progress Summary */}
          <div className="bg-gradient-to-r from-emerald-100/80 via-green-50/90 to-lime-100/80 rounded-lg p-2 sm:p-3 border border-emerald-300/50 my-2 sm:my-3 backdrop-blur-sm">
            <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm">
              <div className="text-emerald-700">
                <div className="text-base sm:text-lg">🏆</div>
                <div className="font-medium">{correctCount}</div>
                <div className="text-[10px] sm:text-xs opacity-80">
                  treasures
                </div>
              </div>
              <div className="text-emerald-600">
                <div className="text-base sm:text-lg">🔥</div>
                <div className="font-medium">{bestStreak}</div>
                <div className="text-[10px] sm:text-xs opacity-80">streak</div>
              </div>
              <div className="text-emerald-600">
                <div className="text-base sm:text-lg">🗺️</div>
                <div className="font-medium text-emerald-100 drop-shadow">
                  {roundIdx + 1}/{pool.length}
                </div>
                <div className="text-[10px] sm:text-xs text-emerald-200 opacity-90">
                  progress
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 space-y-0">
            <Button
              variant="outline"
              onClick={() => onCloseExitDialog?.()}
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 hover:border-emerald-400 text-xs sm:text-sm py-2.5 sm:py-2 transition-all duration-200 font-medium min-h-[40px]"
            >
              <span className="mr-1.5">🐒</span>
              Continue Adventure
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onCloseExitDialog?.();
                onExit?.();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm py-2.5 sm:py-2 transition-all duration-200 font-medium min-h-[40px]"
            >
              <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Exit Jungle
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
      className={`relative w-full max-w-md mx-auto p-4 bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 rounded-2xl border-2 border-emerald-300 shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}
