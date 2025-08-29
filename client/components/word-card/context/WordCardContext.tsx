import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { WordCardState, WordCardAction, DiscoveryMode } from "../types";

const initialState: WordCardState = {
  isFlipped: false,
  isPressed: false,
  mode: "learn" as DiscoveryMode,
  quizRevealed: true,
  score: 0,
  explorerXP: 0,
  showLevelUp: false,
  showParticles: false,
  currentAnimation: "",
  showHint: false,
  hintText: null,
  hintsUsed: 0,
  practiceNeeded: false,
  ratedAs: null,
  isPlaying: false,
};

function wordCardReducer(state: WordCardState, action: WordCardAction): WordCardState {
  switch (action.type) {
    case "FLIP_CARD":
      return { ...state, isFlipped: !state.isFlipped };
    
    case "SET_PRESSED":
      return { ...state, isPressed: action.payload };
    
    case "SET_MODE":
      return { 
        ...state, 
        mode: action.payload,
        quizRevealed: action.payload !== "quiz"
      };
    
    case "SET_QUIZ_REVEALED":
      return { ...state, quizRevealed: action.payload };
    
    case "ADD_SCORE":
      return { ...state, score: state.score + action.payload.delta };
    
    case "ADD_XP":
      const newXP = state.explorerXP + action.payload;
      const shouldLevelUp = newXP > 0 && newXP % 200 === 0;
      return { 
        ...state, 
        explorerXP: newXP,
        showLevelUp: shouldLevelUp
      };
    
    case "SET_LEVEL_UP":
      return { ...state, showLevelUp: action.payload };
    
    case "SET_PARTICLES":
      return { ...state, showParticles: action.payload };
    
    case "SET_ANIMATION":
      return { ...state, currentAnimation: action.payload };
    
    case "SET_HINT":
      return { 
        ...state, 
        showHint: action.payload.show,
        hintText: action.payload.text ?? state.hintText
      };
    
    case "INCREMENT_HINTS":
      return { ...state, hintsUsed: state.hintsUsed + 1 };
    
    case "SET_PRACTICE_NEEDED":
      return { ...state, practiceNeeded: action.payload };
    
    case "SET_RATED_AS":
      return { ...state, ratedAs: action.payload };
    
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    
    case "RESET_STATE":
      return { ...initialState, mode: state.mode };
    
    default:
      return state;
  }
}

interface WordCardContextType {
  state: WordCardState;
  dispatch: React.Dispatch<WordCardAction>;
}

const WordCardContext = createContext<WordCardContextType | undefined>(undefined);

export function WordCardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wordCardReducer, initialState);

  return (
    <WordCardContext.Provider value={{ state, dispatch }}>
      {children}
    </WordCardContext.Provider>
  );
}

export function useWordCardContext() {
  const context = useContext(WordCardContext);
  if (context === undefined) {
    throw new Error("useWordCardContext must be used within a WordCardProvider");
  }
  return context;
}

