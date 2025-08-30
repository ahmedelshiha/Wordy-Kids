import { useMiniGamesContext } from "@/contexts/MiniGamesContext";

export const useMiniGames = () => {
  try {
    return useMiniGamesContext();
  } catch {
    // Fallback no-op implementation to avoid crashes if provider is not mounted
    return {
      activeGame: null,
      options: null,
      score: 0,
      attempts: 0,
      startGame: () => {},
      endGame: () => {},
      reportSuccess: () => {},
      reportFail: () => {},
    } as ReturnType<typeof useMiniGamesContext>;
  }
};
