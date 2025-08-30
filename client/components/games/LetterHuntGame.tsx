import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GameRewardOverlay } from "@/components/games/GameRewardOverlay";

export interface LetterHuntGameProps {
  options: {
    word?: { word: string };
    difficulty?: "easy" | "medium" | "hard";
    ageGroup?: "3-5" | "6-8" | "9-12";
  };
  onSuccess: () => void;
  onFail: () => void;
}

export const LetterHuntGame: React.FC<LetterHuntGameProps> = ({ options, onSuccess, onFail }) => {
  const word = (options.word?.word || "Cat").trim();
  const firstLetter = word[0]?.toUpperCase() || "C";
  const age = options.ageGroup || "6-8";

  const setSize = useMemo(() => (age === "3-5" ? 3 : 3), [age]);
  const [choices, setChoices] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<null | boolean>(null);

  useEffect(() => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    const others = alphabet.filter((l) => l !== firstLetter).sort(() => Math.random() - 0.5);
    const arr = [firstLetter, ...others.slice(0, setSize - 1)].sort(() => Math.random() - 0.5);
    setChoices(arr);
  }, [firstLetter, setSize]);

  const pick = (l: string) => {
    const ok = l === firstLetter;
    setFeedback(ok);
    if (ok) onSuccess(); else onFail();
    setTimeout(() => setFeedback(null), 800);
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-sm text-gray-700" aria-live="polite">Find the first letter!</div>
      <div className="grid grid-cols-3 gap-3">
        {choices.map((l, i) => (
          <button key={i} onClick={() => pick(l)} className="w-[90px] h-[90px] text-4xl bg-white rounded-2xl shadow-lg border focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label={`Letter ${l}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="text-gray-600">Word: <span className="font-bold">{word}</span></div>
      <Button onClick={() => pick(firstLetter)} variant="outline" className="mt-1">Hint 💡</Button>
      <GameRewardOverlay show={feedback !== null} correct={!!feedback} message={feedback ? "Great! +💎" : "Try again"} />
    </div>
  );
};
