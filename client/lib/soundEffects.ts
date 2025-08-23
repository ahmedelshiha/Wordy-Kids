// Sound effects utility using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (e) {
      console.log("Web Audio API not supported");
    }
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType = "sine",
  ): OscillatorNode | null {
    if (!this.audioContext) return null;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime,
    );
    oscillator.type = type;

    return oscillator;
  }

  // Success sound (correct answer, achievement)
  playSuccess(): void {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(523, "sine"); // C5
    const gainNode = this.audioContext.createGain();

    if (!oscillator) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Envelope
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1,
      this.audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.3,
    );

    // Play chord progression for success
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);

    // Add harmony
    setTimeout(() => {
      const harmony = this.createOscillator(659, "sine"); // E5
      if (harmony) {
        const harmonyGain = this.audioContext!.createGain();
        harmony.connect(harmonyGain);
        harmonyGain.connect(this.audioContext!.destination);

        harmonyGain.gain.setValueAtTime(0, this.audioContext!.currentTime);
        harmonyGain.gain.linearRampToValueAtTime(
          0.08,
          this.audioContext!.currentTime + 0.01,
        );
        harmonyGain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext!.currentTime + 0.2,
        );

        harmony.start();
        harmony.stop(this.audioContext!.currentTime + 0.2);
      }
    }, 100);
  }

  // Error sound (wrong answer)
  playError(): void {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(200, "sawtooth");
    const gainNode = this.audioContext.createGain();

    if (!oscillator) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Quick drop in frequency
    oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      150,
      this.audioContext.currentTime + 0.2,
    );

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.1,
      this.audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.2,
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Click sound (button press, card flip)
  playClick(): void {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(800, "square");
    const gainNode = this.audioContext.createGain();

    if (!oscillator) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.05,
      this.audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.1,
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.1);
  }

  // Level up sound (achievement, progress milestone)
  playLevelUp(): void {
    if (!this.audioContext) return;

    const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6

    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.createOscillator(freq, "sine");
        const gainNode = this.audioContext!.createGain();

        if (!oscillator) return;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
        gainNode.gain.linearRampToValueAtTime(
          0.08,
          this.audioContext!.currentTime + 0.05,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext!.currentTime + 0.3,
        );

        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.3);
      }, index * 150);
    });
  }

  // Hover sound (subtle feedback)
  playHover(): void {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(1000, "sine");
    const gainNode = this.audioContext.createGain();

    if (!oscillator) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.02,
      this.audioContext.currentTime + 0.01,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.05,
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Pronunciation helper (simple beep to indicate audio playback)
  playPronunciation(): void {
    if (!this.audioContext) return;

    const oscillator = this.createOscillator(440, "triangle"); // A4
    const gainNode = this.audioContext.createGain();

    if (!oscillator) return;

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.06,
      this.audioContext.currentTime + 0.1,
    );
    gainNode.gain.linearRampToValueAtTime(
      0.06,
      this.audioContext.currentTime + 0.3,
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioContext.currentTime + 0.4,
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.4);
  }
}

// Create singleton instance
export const soundEffects = new SoundEffects();

// Helper functions for easy usage
export const playSound = {
  success: () => soundEffects.playSuccess(),
  error: () => soundEffects.playError(),
  click: () => soundEffects.playClick(),
  levelUp: () => soundEffects.playLevelUp(),
  hover: () => soundEffects.playHover(),
  pronunciation: () => soundEffects.playPronunciation(),
};

// Enable/disable sound effects
let soundEnabled = true;
let uiInteractionSoundsEnabled = false; // Disabled by default

export const setSoundEnabled = (enabled: boolean) => {
  soundEnabled = enabled;
};

export const isSoundEnabled = () => soundEnabled;

export const setUIInteractionSoundsEnabled = (enabled: boolean) => {
  uiInteractionSoundsEnabled = enabled;
  localStorage.setItem("uiInteractionSoundsEnabled", enabled.toString());
};

export const isUIInteractionSoundsEnabled = () => {
  // Load from localStorage on first call
  const saved = localStorage.getItem("uiInteractionSoundsEnabled");
  if (saved !== null) {
    uiInteractionSoundsEnabled = saved === "true";
  }
  return uiInteractionSoundsEnabled;
};

// Wrapped functions that check if sound is enabled
export const playSoundIfEnabled = {
  success: () => soundEnabled && soundEffects.playSuccess(),
  error: () => soundEnabled && soundEffects.playError(),
  click: () => soundEnabled && soundEffects.playClick(),
  levelUp: () => soundEnabled && soundEffects.playLevelUp(),
  hover: () => soundEnabled && soundEffects.playHover(),
  pronunciation: () => soundEnabled && soundEffects.playPronunciation(),
};

// UI interaction sounds (category selection, card interactions) - separate setting
export const playUIInteractionSoundIfEnabled = {
  cheer: () => isUIInteractionSoundsEnabled() && soundEffects.playSuccess(),
  whoosh: () => isUIInteractionSoundsEnabled() && soundEffects.playHover(),
  click: () => isUIInteractionSoundsEnabled() && soundEffects.playClick(),
};

// Enhanced Audio Functions using AssetManager
import { AudioManager, EducationalAudioHelper } from './assetManager';

// Educational sound helpers that use actual audio files with fallbacks
export const playEducationalSoundIfEnabled = {
  success: async () => {
    if (soundEnabled) {
      try {
        await EducationalAudioHelper.playSuccess();
      } catch (error) {
        // Fallback to synthesized sound
        soundEffects.playSuccess();
      }
    }
  },

  encouragement: async () => {
    if (soundEnabled) {
      try {
        await EducationalAudioHelper.playEncouragement();
      } catch (error) {
        // Fallback to synthesized sound
        soundEffects.playError();
      }
    }
  },

  uiSound: async (soundType: 'open' | 'close' | 'click' = 'click') => {
    if (isUIInteractionSoundsEnabled()) {
      try {
        await EducationalAudioHelper.playUISound(soundType);
      } catch (error) {
        // Fallback to synthesized sound
        soundEffects.playClick();
      }
    }
  },

  animalSound: async (animalName: string) => {
    if (soundEnabled) {
      try {
        await AudioManager.playAnimalSound(animalName);
      } catch (error) {
        console.warn(`Could not play animal sound for ${animalName}:`, error);
        // Fallback to general success sound
        soundEffects.playSuccess();
      }
    }
  },

  ambientStart: async () => {
    if (soundEnabled) {
      try {
        await EducationalAudioHelper.playAmbientSound(true);
      } catch (error) {
        console.warn('Could not start ambient sounds:', error);
      }
    }
  },

  ambientStop: () => {
    try {
      EducationalAudioHelper.stopAmbientSounds();
    } catch (error) {
      console.warn('Could not stop ambient sounds:', error);
    }
  }
};

// Backward compatibility helpers - these use the new system but maintain old interface
export const playAnimalSoundSafe = async (animalName: string, volume: number = 0.7) => {
  try {
    await AudioManager.playAnimalSound(animalName, volume);
  } catch (error) {
    console.warn(`Failed to play ${animalName} sound:`, error);
    // Fallback to synthesized sound
    if (soundEnabled) {
      soundEffects.playSuccess();
    }
  }
};

export const playAudioFileSafe = async (audioPath: string, volume: number = 0.7) => {
  try {
    await AudioManager.playAudio(audioPath, { volume });
  } catch (error) {
    console.warn(`Failed to play audio file ${audioPath}:`, error);
    // Fallback to synthesized sound
    if (soundEnabled) {
      soundEffects.playClick();
    }
  }
};
