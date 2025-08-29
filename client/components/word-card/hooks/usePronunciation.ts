import { useCallback } from "react";
import { Word, AccessibilitySettings } from "../types";
import { useWordCardState } from "./useWordCardState";

// Mock audio services - in real implementation these would be imported
const audioService = {
  playWordSound: (word: Word) => console.log(`Playing sound for: ${word.word}`),
};

const enhancedAudioService = {
  pronounceWord: (word: string, callbacks: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }) => {
    console.log(`Pronouncing: ${word}`);
    callbacks.onStart?.();
    setTimeout(() => callbacks.onEnd?.(), 1000);
  },
};

const playSoundIfEnabled = {
  jungleAmbient: () => console.log("Playing jungle ambient"),
  explorerReward: () => console.log("Playing explorer reward"),
  pronunciation: () => console.log("Playing pronunciation sound"),
};

export function usePronunciation(
  word: Word,
  accessibilitySettings: AccessibilitySettings,
  onPronounce?: (word: Word) => void
) {
  const { state, actions } = useWordCardState();

  const pronounce = useCallback(async () => {
    if (state.isPlaying || !accessibilitySettings.soundEnabled) return;

    actions.setPlaying(true);
    actions.setAnimation("bounce");
    actions.setParticles(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([50, 20, 50]);
    }

    try {
      if (word.sound) {
        audioService.playWordSound(word);
        setTimeout(() => {
          actions.setPlaying(false);
          actions.setAnimation("");
          actions.setParticles(false);
          onPronounce?.(word);
        }, 1000);
      } else {
        enhancedAudioService.pronounceWord(word.word, {
          onStart: () => {
            playSoundIfEnabled.jungleAmbient();
          },
          onEnd: () => {
            actions.setPlaying(false);
            actions.setAnimation("");
            actions.setParticles(false);
            actions.addXP(10);
            onPronounce?.(word);
            playSoundIfEnabled.explorerReward();
          },
          onError: () => {
            actions.setPlaying(false);
            actions.setAnimation("");
            actions.setParticles(false);
            playSoundIfEnabled.pronunciation();
          },
        });
      }
    } catch (error) {
      actions.setPlaying(false);
      actions.setAnimation("");
      actions.setParticles(false);
      playSoundIfEnabled.pronunciation();
    }

    // Safety timeout
    setTimeout(() => {
      actions.setPlaying(false);
      actions.setAnimation("");
      actions.setParticles(false);
    }, 3000);
  }, [word, state.isPlaying, accessibilitySettings.soundEnabled, actions, onPronounce]);

  return {
    pronounce,
    isPlaying: state.isPlaying,
  };
}

