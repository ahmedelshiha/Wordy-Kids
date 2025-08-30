import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { telemetry } from "@/lib/telemetry";
import { useReward } from "@/contexts/RewardContext";
import { MiniGameShell } from "@/components/games/MiniGameShell";
import { SoundMatchGame } from "@/components/games/SoundMatchGame";
import { EmojiBuilderGame } from "@/components/games/EmojiBuilderGame";
import { LetterHuntGame } from "@/components/games/LetterHuntGame";

export type MiniGameType = "sound-match" | "emoji-builder" | "letter-hunt";

export interface MiniGameStartOptions {
  word?: {
    id: number;
    word: string;
    emoji?: string;
    category?: string;
    pronunciation?: string;
    soundUrl?: string;
  };
  difficulty?: "easy" | "medium" | "hard";
  rewardMultiplier?: 1 | 2 | 3;
  ageGroup?: "3-5" | "6-8" | "9-12";
}

interface MiniGamesContextType {
  activeGame: MiniGameType | null;
  options: MiniGameStartOptions | null;
  score: number;
  attempts: number;
  startGame: (type: MiniGameType, options?: MiniGameStartOptions) => void;
  endGame: () => void;
  reportSuccess: (meta?: Record<string, any>) => void;
  reportFail: (meta?: Record<string, any>) => void;
}

const MiniGamesContext = createContext<MiniGamesContextType | null>(null);

export const MiniGamesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeGame, setActiveGame] = useState<MiniGameType | null>(null);
  const [options, setOptions] = useState<MiniGameStartOptions | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const { showReward } = useReward();

  const startGame = useCallback((type: MiniGameType, opts?: MiniGameStartOptions) => {
    setActiveGame(type);
    setOptions(opts || null);
    setScore(0);
    setAttempts(0);
    telemetry.log("feature_usage", { action: "game_start", game: type, opts });
  }, []);

  const endGame = useCallback(() => {
    telemetry.log("feature_usage", { action: "game_complete", game: activeGame, score, attempts });
    setActiveGame(null);
    setOptions(null);
  }, [activeGame, score, attempts]);

  const reportSuccess = useCallback((meta?: Record<string, any>) => {
    setScore((s) => s + 1);
    telemetry.log("feature_usage", { action: "game_success", game: activeGame, meta });

    // Reward logic (gems; optional crown for streaks can be built on top)
    const multiplier = (options?.rewardMultiplier ?? 1);
    const gems = Math.max(1, multiplier);
    showReward({
      title: "Great job!",
      message: "You got it right!",
      icon: "✨",
      gemsEarned: gems,
      type: "game",
    });
  }, [activeGame, options?.rewardMultiplier, showReward]);

  const reportFail = useCallback((meta?: Record<string, any>) => {
    setAttempts((a) => a + 1);
    telemetry.log("feature_usage", { action: "game_fail", game: activeGame, meta });
  }, [activeGame]);

  const value = useMemo(() => ({
    activeGame,
    options,
    score,
    attempts,
    startGame,
    endGame,
    reportSuccess,
    reportFail,
  }), [activeGame, options, score, attempts, startGame, endGame, reportSuccess, reportFail]);

  return (
    <MiniGamesContext.Provider value={value}>
      {children}
      {/* Overlay renderer */}
      {activeGame && (
        <MiniGameShell onClose={endGame} title="Mini Game" reducedMotion={false}>
          {activeGame === "sound-match" && (
            <SoundMatchGame options={options || {}} onSuccess={() => reportSuccess()} onFail={() => reportFail()} />
          )}
          {activeGame === "emoji-builder" && (
            <EmojiBuilderGame options={options || {}} onSuccess={() => reportSuccess()} onFail={() => reportFail()} />
          )}
          {activeGame === "letter-hunt" && (
            <LetterHuntGame options={options || {}} onSuccess={() => reportSuccess()} onFail={() => reportFail()} />
          )}
        </MiniGameShell>
      )}
    </MiniGamesContext.Provider>
  );
};

export const useMiniGamesContext = () => {
  const ctx = useContext(MiniGamesContext);
  if (!ctx) throw new Error("useMiniGamesContext must be used within MiniGamesProvider");
  return ctx;
};
