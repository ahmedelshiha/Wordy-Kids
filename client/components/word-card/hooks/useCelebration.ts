import { useCallback } from "react";
import { Rating, Word } from "../types";
import { useWordCardState } from "./useWordCardState";

// Mock sound effects
const playSoundIfEnabled = {
  explorerVictory: () => console.log("Playing explorer victory"),
  explorerProgress: () => console.log("Playing explorer progress"),
  explorerEncouragement: () => console.log("Playing explorer encouragement"),
  explorerLevelUp: () => console.log("Playing explorer level up"),
  success: () => console.log("Playing success"),
  click: () => console.log("Playing click"),
  hover: () => console.log("Playing hover"),
  levelUp: () => console.log("Playing level up"),
  achievement: () => console.log("Playing achievement"),
};

export function useCelebration(word: Word) {
  const { actions } = useWordCardState();

  const celebrateMastery = useCallback((rating: Rating = "easy") => {
    actions.setRatedAs(rating);
    
    // Only show particles for "easy" rating (mastered)
    if (rating === "easy") {
      actions.setParticles(true);
    }

    // Calculate XP based on difficulty and rating
    let xpGained = 0;
    if (rating === "easy") {
      xpGained = word.difficulty === "hard" ? 100 : word.difficulty === "medium" ? 75 : 50;
      playSoundIfEnabled.explorerVictory() || playSoundIfEnabled.success();
      playSoundIfEnabled.levelUp();
    } else if (rating === "medium") {
      xpGained = word.difficulty === "hard" ? 60 : word.difficulty === "medium" ? 40 : 25;
      playSoundIfEnabled.explorerProgress() || playSoundIfEnabled.click();
    } else {
      xpGained = 20;
      playSoundIfEnabled.explorerEncouragement() || playSoundIfEnabled.hover();
    }

    actions.addXP(xpGained);

    // Haptic feedback
    if (navigator.vibrate) {
      if (rating === "easy") {
        navigator.vibrate([30, 10, 30, 10, 30]);
      } else if (rating === "medium") {
        navigator.vibrate([60, 30, 60]);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // Clean up after celebration
    setTimeout(() => {
      actions.setParticles(false);
    }, 800);
  }, [word.difficulty, actions]);

  const createParticles = useCallback(() => {
    actions.setParticles(true);
    setTimeout(() => actions.setParticles(false), 2000);
  }, [actions]);

  return {
    celebrateMastery,
    createParticles,
  };
}

