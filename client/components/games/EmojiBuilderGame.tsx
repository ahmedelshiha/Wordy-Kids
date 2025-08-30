import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameRewardOverlay } from "@/components/games/GameRewardOverlay";

export interface EmojiBuilderGameProps {
  options: {
    word?: { word: string; emoji?: string };
    difficulty?: "easy" | "medium" | "hard";
    ageGroup?: "3-5" | "6-8" | "9-12";
  };
  onSuccess: () => void;
  onFail: () => void;
}

export const EmojiBuilderGame: React.FC<EmojiBuilderGameProps> = ({ options, onSuccess, onFail }) => {
  const target = options.word?.emoji || "😀";
  // Simple parts
  const parts = useMemo(() => ["👁️", "👄", "😀"], []);
  const [assembled, setAssembled] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | boolean>(null);

  const addPart = (p: string) => {
    const next = [...assembled, p].slice(-3);
    setAssembled(next);
  };

  const check = () => {
    const ok = assembled.includes("👁️") && assembled.includes("👄");
    setFeedback(ok);
    if (ok) onSuccess(); else onFail();
    setTimeout(() => setFeedback(null), 800);
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-sm text-gray-700" aria-live="polite">Build the emoji!</div>
      <div className="flex gap-3">
        {parts.map((p, i) => (
          <button key={i} onClick={() => addPart(p)} className="w-[90px] h-[90px] text-5xl bg-white rounded-2xl shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label={`${p} part button`}>
            <span aria-hidden>{p}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 text-6xl" aria-label="assembled emoji preview">{assembled.join(" ") || "_ _ _"}</div>
      <Button onClick={check} className="mt-2">Check ✅</Button>
      <div className="mt-1 text-4xl" aria-label="target silhouette" title="target">{target}</div>
      <GameRewardOverlay show={feedback !== null} correct={!!feedback} message={feedback ? "Nice! +💎" : "Try again"} />
    </div>
  );
};
