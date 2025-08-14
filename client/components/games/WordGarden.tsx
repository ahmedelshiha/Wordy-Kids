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

/**
 * Word Garden — Listen & Pick Game for Ages 3–5
 * -------------------------------------------------
 * • Pulls words from your website DB using existing word service
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

// Garden plant stage visuals (simple emojis; swap with your images if desired)
const STAGES = ["🌱", "🌿", "🌸"]; // sprout -> leaf -> blossom

// Generate emoji-based image using SVG data URI
function generateEmojiImage(emoji: string, fallbackText?: string): string {
  if (emoji && emoji !== "") {
    // Create SVG with emoji
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#f0fdf4" rx="20"/>
        <text x="100" y="120" font-size="80" text-anchor="middle" font-family="Arial, sans-serif">${emoji}</text>
      </svg>
    `;

    // Use URL encoding instead of base64 to avoid Unicode issues
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  // Fallback to placeholder if no emoji
  return `https://via.placeholder.com/200x200/4ade80/ffffff?text=${encodeURIComponent(fallbackText || "Word")}`;
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

// ---------- Component ----------
export default function WordGardenGame({
  rounds = 8,
  optionsPerRound = 3,
  difficulty = "easy",
  category,
  className = "",
  onFinish,
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

  const [gardenStages, setGardenStages] = useState<number[]>(
    Array.from({ length: rounds }, () => 0),
  );

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
      // Use audioService for consistency with other games
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
      // Use the EnhancedAchievementTracker static methods directly
      EnhancedAchievementTracker.trackActivity({
        type: "wordLearning",
        wordsLearned: 1,
        accuracy: nextStreak > 0 ? 100 : 80, // Assume good accuracy for correct answers
        difficulty: difficulty,
        category: category,
      });
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
        setGardenStages((stages) =>
          stages.map((s, i) =>
            i === roundIdx ? Math.min(s + 1, STAGES.length - 1) : s,
          ),
        );

        // Sparkles + confetti
        burst();

        checkAchievements(nextCorrect, nextStreak);

        // Play success sound
        audioService.playCorrectSound();

        // Haptic feedback
        if (navigator && "vibrate" in navigator) (navigator as any).vibrate(30);

        // Proceed next round after a short delay
        setTimeout(() => {
          console.log('WordGarden: Proceeding to next round', {
            currentRound: roundIdx,
            nextRound: roundIdx + 1,
            poolLength: pool.length
          });
          setAttempts(0);
          setLocked(false);
          const nextRound = roundIdx + 1;
          if (nextRound < pool.length) {
            setRoundIdx(nextRound);
            console.log('WordGarden: Advanced to round', nextRound);
          } else {
            console.log('WordGarden: Game complete');
            onFinish?.({
              totalRounds: pool.length,
              correct: nextCorrect,
              wrong: wrongCount,
              bestStreak: Math.max(bestStreak, nextStreak),
            });
          }
        }, 900);
      } else {
        setWrongCount((w) => w + 1);
        setStreak(0);

        // Play incorrect sound
        audioService.playIncorrectSound();

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
      onFinish,
      wrongCount,
      bestStreak,
      checkAchievements,
    ],
  );

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

      <div className="rounded-3xl shadow-xl p-4 md:p-6 bg-gradient-to-b from-green-600 to-emerald-700 text-white">
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
          className={`grid gap-3 ${optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
        >
          {options.map((img, i) => (
            <button
              key={i}
              onClick={() => choose(img)}
              disabled={locked}
              className="relative aspect-square rounded-2xl bg-white/95 hover:bg-white active:scale-95 transition-all shadow-lg overflow-hidden border-4 border-transparent focus:outline-none focus:ring-4 focus:ring-yellow-300 disabled:opacity-50"
            >
              <img
                src={img}
                alt="option"
                className="w-full h-full object-contain p-3"
              />
              <span className="absolute top-1 left-1 text-lg">✨</span>
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
      <div className="mt-4 grid grid-cols-4 gap-2">
        {gardenStages.map((stage, idx) => (
          <div
            key={idx}
            className={`rounded-2xl h-16 flex items-center justify-center text-2xl ${idx === roundIdx ? "bg-emerald-100" : "bg-emerald-50"}`}
          >
            <span className={idx === roundIdx ? "animate-bounce" : ""}>
              {STAGES[stage]}
            </span>
          </div>
        ))}
      </div>

      {/* Styles for confetti dots */}
      <style>{`.wg-confetti{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}`}</style>
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
