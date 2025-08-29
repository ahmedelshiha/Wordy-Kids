import { useWordCardContext } from "../context/WordCardContext";
import { DiscoveryMode, Rating } from "../types";

export function useWordCardState() {
  const { state, dispatch } = useWordCardContext();

  const actions = {
    flipCard: () => dispatch({ type: "FLIP_CARD" }),
    
    setPressed: (pressed: boolean) => dispatch({ type: "SET_PRESSED", payload: pressed }),
    
    setMode: (mode: DiscoveryMode) => dispatch({ type: "SET_MODE", payload: mode }),
    
    setQuizRevealed: (revealed: boolean) => dispatch({ type: "SET_QUIZ_REVEALED", payload: revealed }),
    
    addScore: (delta: number, reason: string) => 
      dispatch({ type: "ADD_SCORE", payload: { delta, reason } }),
    
    addXP: (amount: number) => dispatch({ type: "ADD_XP", payload: amount }),
    
    setLevelUp: (show: boolean) => dispatch({ type: "SET_LEVEL_UP", payload: show }),
    
    setParticles: (show: boolean) => dispatch({ type: "SET_PARTICLES", payload: show }),
    
    setAnimation: (animation: string) => dispatch({ type: "SET_ANIMATION", payload: animation }),
    
    setHint: (show: boolean, text?: string | null) => 
      dispatch({ type: "SET_HINT", payload: { show, text } }),
    
    incrementHints: () => dispatch({ type: "INCREMENT_HINTS" }),
    
    setPracticeNeeded: (needed: boolean) => dispatch({ type: "SET_PRACTICE_NEEDED", payload: needed }),
    
    setRatedAs: (rating: Rating | null) => dispatch({ type: "SET_RATED_AS", payload: rating }),
    
    setPlaying: (playing: boolean) => dispatch({ type: "SET_PLAYING", payload: playing }),
    
    resetState: () => dispatch({ type: "RESET_STATE" }),
  };

  return {
    state,
    actions,
  };
}

