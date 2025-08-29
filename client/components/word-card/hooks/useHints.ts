import { useCallback } from "react";
import { useWordCardState } from "./useWordCardState";

// Mock AI word recommendations hook
const useAIWordRecommendations = (config: { userId: string; enableAnalytics: boolean }) => {
  return [
    {}, // state
    {
      requestHint: async (wordId: number): Promise<string> => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        return `Here's a helpful hint for word ${wordId}: Think about the context and try to remember similar words you know!`;
      }
    }
  ];
};

export function useHints(wordId: number) {
  const { state, actions } = useWordCardState();
  const [aiState, aiActions] = useAIWordRecommendations({
    userId: "local-card",
    enableAnalytics: false,
  });

  const requestHint = useCallback(async () => {
    if (state.showHint) return;

    try {
      const hint = await aiActions.requestHint(wordId);
      actions.setHint(true, hint);
      actions.incrementHints();
    } catch (error) {
      console.error("Failed to get hint:", error);
      actions.setHint(true, "Try breaking down the word into smaller parts or think about what it reminds you of!");
    }
  }, [wordId, state.showHint, actions, aiActions]);

  const clearHint = useCallback(() => {
    actions.setHint(false, null);
  }, [actions]);

  return {
    showHint: state.showHint,
    hintText: state.hintText,
    hintsUsed: state.hintsUsed,
    requestHint,
    clearHint,
  };
}

