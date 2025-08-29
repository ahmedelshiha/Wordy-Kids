import React from "react";
import { Word } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";

interface AccessibilityAnnouncerProps {
  word: Word;
}

export function AccessibilityAnnouncer({ word }: AccessibilityAnnouncerProps) {
  const { state } = useWordCardState();

  const getAnnouncementText = () => {
    let announcement = "";
    
    if (state.isFlipped) {
      announcement += `Exploring jungle details for ${word.word}`;
    } else {
      announcement += `Jungle adventure word ${word.word}`;
    }
    
    if (state.isPlaying) {
      announcement += ` Hearing jungle pronunciation of ${word.word}`;
    }
    
    if (state.explorerXP > 0) {
      announcement += ` Explorer XP: ${state.explorerXP}`;
    }
    
    if (state.showLevelUp) {
      announcement += ` Level up achieved!`;
    }
    
    if (state.ratedAs) {
      announcement += ` Word rated as ${state.ratedAs}`;
    }
    
    if (state.practiceNeeded) {
      announcement += ` Practice needed for this word`;
    }
    
    if (state.showHint) {
      announcement += ` Hint available`;
    }

    return announcement;
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {getAnnouncementText()}
    </div>
  );
}

