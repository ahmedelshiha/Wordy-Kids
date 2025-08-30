import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GameRewardOverlay } from "@/components/games/GameRewardOverlay";
import { useMiniGamesContext } from "@/contexts/MiniGamesContext";
import { Button } from "@/components/ui/button";
import { telemetry } from "@/lib/telemetry";

export interface SoundMatchGameProps {
  options: {
    word?: { id: number; word: string; emoji?: string; soundUrl?: string };
    difficulty?: "easy" | "medium" | "hard";
    ageGroup?: "3-5" | "6-8" | "9-12";
  };
  onSuccess: () => void;
  onFail: () => void;
}

const EMOJI_POOL = [
  "🐶",
  "🐱",
  "🦁",
  "🐘",
  "🐵",
  "🐸",
  "🐼",
  "🐷",
  "🦊",
  "🦄",
  "🐤",
  "🐙",
];

export const SoundMatchGame: React.FC<SoundMatchGameProps> = ({
  options,
  onSuccess,
  onFail,
}) => {
  const { options: ctxOptions } = useMiniGamesContext();
  const baseWord = options.word || ctxOptions?.word;
  const difficulty = options.difficulty || ctxOptions?.difficulty || "easy";
  const age = options.ageGroup || ctxOptions?.ageGroup || "6-8";

  const choiceCount = useMemo(() => {
    if (age === "3-5") return 3;
    if (difficulty === "hard") return 4;
    return 3;
  }, [age, difficulty]);

  const [choices, setChoices] = useState<string[]>([]);
  const [target, setTarget] = useState<string>(baseWord?.emoji || "🔊");
  const [speaking, setSpeaking] = useState(false);
  const [feedback, setFeedback] = useState<null | { ok: boolean; msg: string }>(
    null,
  );

  // Build choices: include the target emoji + random distractors
  useEffect(() => {
    const pool = EMOJI_POOL.filter((e) => e !== baseWord?.emoji);
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, Math.max(0, choiceCount - 1));
    const arr = [baseWord?.emoji || "🦁", ...distractors].sort(
      () => Math.random() - 0.5,
    );
    setChoices(arr);
    setTarget(baseWord?.emoji || "🦁");
  }, [baseWord?.emoji, choiceCount]);

  const speak = useCallback(() => {
    if (!baseWord?.word || typeof window === "undefined") return;
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      // debounce with small delay post-cancel to avoid interrupted
      synth.cancel();
      const u = new SpeechSynthesisUtterance(baseWord.word);
      u.rate = age === "3-5" ? 0.9 : 0.8;
      u.pitch = 1.1;
      setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setTimeout(() => synth.speak(u), 80);
    } catch {}
  }, [baseWord?.word, age]);

  useEffect(() => {
    telemetry.log("feature_usage", {
      action: "game_round",
      game: "sound-match",
      word: baseWord?.word,
    });
    // auto play prompt
    setTimeout(speak, 200);
  }, [speak, baseWord?.word]);

  const onPick = (emoji: string) => {
    const ok = emoji === target;
    if (ok) {
      setFeedback({ ok: true, msg: "Yay!" });
      onSuccess();
    } else {
      setFeedback({ ok: false, msg: "Try again!" });
      onFail();
    }
    setTimeout(() => setFeedback(null), 800);
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-sm text-gray-700" aria-live="polite">
        Tap the matching sound!
      </div>
      <Button
        onClick={speak}
        aria-label={`Play the word sound for ${baseWord?.word || "the target"}`}
        className="rounded-full bg-blue-500 text-white hover:bg-blue-600 px-4 py-2"
      >
        {speaking ? "Playing..." : "�� Hear Sound"}
      </Button>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {choices.slice(0, choiceCount).map((e, idx) => (
          <button
            key={idx}
            onClick={() => onPick(e)}
            className="w-[110px] h-[110px] text-6xl bg-white rounded-2xl shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={`${e} emoji button`}
          >
            <span aria-hidden>{e}</span>
          </button>
        ))}
      </div>

      <GameRewardOverlay
        show={!!feedback}
        correct={!!feedback?.ok}
        message={feedback?.ok ? "Great! +💎" : "Try again"}
      />
    </div>
  );
};
