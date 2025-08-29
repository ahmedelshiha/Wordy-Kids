import { useCallback } from "react";
import { WordProgressEvent, WordPracticeEvent } from "../types";
import { useWordCardState } from "./useWordCardState";

export function useProgressDispatch(wordId: number) {
  const { state, actions } = useWordCardState();

  const dispatchProgressUpdate = useCallback((delta: number, reason: string) => {
    actions.addScore(delta, reason);
    
    try {
      const event = new CustomEvent("wordProgressUpdate", {
        detail: {
          wordId,
          delta,
          reason,
          score: state.score + delta,
        } as WordProgressEvent,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn("Failed to dispatch progress update event:", error);
    }
  }, [wordId, state.score, actions]);

  const dispatchPracticeNeeded = useCallback(() => {
    actions.setPracticeNeeded(true);
    
    try {
      const event = new CustomEvent("wordPracticeNeeded", {
        detail: { wordId } as WordPracticeEvent,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.warn("Failed to dispatch practice needed event:", error);
    }
  }, [wordId, actions]);

  const addScore = useCallback((delta: number, reason: string) => {
    dispatchProgressUpdate(delta, reason);
  }, [dispatchProgressUpdate]);

  return {
    addScore,
    dispatchPracticeNeeded,
    currentScore: state.score,
  };
}

