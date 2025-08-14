import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
export type WordItem = {
  id: string | number;
  word: string; // the vocabulary item (won't be shown during question)
  imageUrl: string; // correct picture
  distractorImages: string[]; // pool of wrong pictures
  audioUrl?: string; // optional mp3/ogg fallback
  category?: string;
};

export type GameFinishStats = {
  totalRounds: number;
  correct: number;
  wrong: number;
  coins: number;
  streakBest: number;
};

export type ListenAndGuessProps = {
  words: WordItem[];
  rounds?: number; // default 10
  optionsPerRound?: 3 | 4 | 5;
  funnyVoiceChance?: number; // 0..1 (chance to use a silly voice variant)
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

  const { containerRef, fire } = useConfetti();

  // Precompute the sequence of rounds
  const sequence = useMemo(() => {
    const pool = shuffle(words);
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
  }, [words, rounds, optionsPerRound]);

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
          return ns;
        });
        fire();
      } else {
        setWrongCount((w) => w + 1);
        setStreak(0);
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
          const stats: GameFinishStats = {
            totalRounds: sequence.length,
            correct: correctCount + (isCorrect ? 1 : 0),
            wrong: wrongCount + (isCorrect ? 0 : 1),
            coins: coins + (isCorrect ? 5 : 0),
            streakBest: Math.max(
              bestStreak,
              isCorrect ? streak + 1 : bestStreak,
            ),
          };
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

      {/* Card container */}
      <div className="rounded-3xl shadow-xl p-4 md:p-6 bg-gradient-to-b from-sky-600 to-blue-700 text-white">
        {/* Exit Button */}
        {onExit && (
          <button
            onClick={onExit}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
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
            <span className="text-4xl animate-bounce">🦊</span>
            <div className="leading-tight">
              <div className="text-xs uppercase tracking-wide opacity-90">
                Listen & Guess
              </div>
              <div className="font-bold">What did I say?</div>
            </div>
          </div>

          <button
            onClick={playPrompt}
            className="shrink-0 rounded-full px-5 py-3 bg-white text-blue-700 font-bold active:scale-95 transition-transform min-w-[56px] min-h-[56px] hover:shadow-lg"
            aria-label="Play sound"
            disabled={locked}
          >
            🔊 Play
          </button>
        </div>

        {/* Options grid */}
        <div
          className={`grid gap-3 ${optionsPerRound === 5 ? "grid-cols-3" : optionsPerRound === 4 ? "grid-cols-2" : "grid-cols-3"}`}
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
                className={`relative aspect-square rounded-2xl bg-white/90 hover:bg-white active:scale-95 transition-all shadow-lg overflow-hidden border-4 focus:outline-none focus:ring-4 focus:ring-yellow-300 ${
                  shouldHighlight
                    ? isCorrect
                      ? "border-green-400 ring-4 ring-green-300 animate-pulse"
                      : "border-red-400 ring-4 ring-red-300 animate-pulse"
                    : "border-transparent hover:border-yellow-300"
                } ${locked ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <img
                  src={img}
                  alt="option"
                  className="w-full h-full object-contain p-2"
                />
                {/* fun corner badge */}
                <span className="absolute top-1 left-1 text-lg">✨</span>

                {/* Answer feedback */}
                {showAnswer && isCorrect && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                    <span className="text-4xl animate-bounce">✅</span>
                  </div>
                )}
                {showAnswer && isSelected && !isCorrect && (
                  <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                    <span className="text-4xl animate-bounce">❌</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom: XP + streak */}
        <div className="mt-5">
          <div className="text-sm flex items-center justify-between">
            <span>XP</span>
            <span>
              Streak: {streak} (Best {bestStreak})
            </span>
          </div>
          <div className="mt-2 h-3 rounded-full bg-white/20">
            <div
              className="h-3 rounded-full bg-emerald-300 transition-all duration-300"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Styles for confetti dots */}
      <style>{`
        .confetti-dot{position:absolute;top:60%;border-radius:9999px;box-shadow:0 0 0 1px rgba(255,255,255,.15) inset}
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
    word: "star",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
  {
    id: 2,
    word: "banana",
    imageUrl:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
  {
    id: 3,
    word: "ball",
    imageUrl:
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
  {
    id: 4,
    word: "bird",
    imageUrl:
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
  {
    id: 5,
    word: "sun",
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
  {
    id: 6,
    word: "car",
    imageUrl:
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=200&h=200&fit=crop&auto=format",
    distractorImages: [
      "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=200&h=200&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop&auto=format",
    ],
    audioUrl: undefined,
  },
];
