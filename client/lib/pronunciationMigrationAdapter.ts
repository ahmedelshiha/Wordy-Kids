/**
 * Migration Adapter for Unified Pronunciation System
 *
 * This adapter provides backward compatibility for existing components
 * while they are gradually migrated to the new unified system.
 */

import { VoiceType, VOICE_TYPES } from "./unifiedPronunciationService";

// Global reference to the pronunciation context (will be injected by the provider)
let pronunciationContext: any = null;

export const setPronunciationContext = (context: any) => {
  pronunciationContext = context;
};

// Legacy AudioService compatibility layer
export const audioService = {
  pronounceWord: async (
    word: any,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): Promise<void> => {
    if (!pronunciationContext) {
      const errorMsg = "Pronunciation context not available";
      console.warn(errorMsg + ", skipping pronunciation");
      options.onError?.(errorMsg);
      return;
    }

    try {
      await pronunciationContext.speak(word, {
        rate: options.rate,
        pitch: options.pitch,
        volume: options.volume,
        onStart: options.onStart,
        onEnd: options.onEnd,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(
        "Legacy audioService pronunciation failed:",
        errorMsg,
        error,
      );
      options.onError?.(errorMsg);
    }
  },

  pronounceDefinition: async (
    definition: any,
    options: {
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
    } = {},
  ): Promise<void> => {
    if (!pronunciationContext) {
      console.warn("Pronunciation context not available");
      return;
    }

    try {
      await pronunciationContext.speak(definition, {
        rate: (options.rate || 0.8) * 0.85, // Slightly slower for definitions
        onStart: options.onStart,
        onEnd: options.onEnd,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Legacy definition pronunciation failed:", errorMsg, error);
    }
  },

  setVoiceType: (voiceType: VoiceType): void => {
    if (pronunciationContext) {
      pronunciationContext.setVoicePreference(voiceType);
    } else {
      // Fallback to localStorage
      localStorage.setItem("preferred-voice-type", voiceType);
    }
  },

  getVoiceType: (): VoiceType => {
    if (pronunciationContext) {
      return pronunciationContext.voicePreference;
    }
    // Fallback to localStorage
    const saved = localStorage.getItem("preferred-voice-type") as VoiceType;
    return saved && Object.values(VOICE_TYPES).includes(saved)
      ? saved
      : VOICE_TYPES.WOMAN;
  },

  setEnabled: (enabled: boolean): void => {
    // Store in localStorage for now
    localStorage.setItem("audio-enabled", enabled.toString());
  },

  isAudioEnabled: (): boolean => {
    if (pronunciationContext) {
      return pronunciationContext.isSupported;
    }
    const saved = localStorage.getItem("audio-enabled");
    return saved !== "false";
  },

  stop: (): void => {
    if (pronunciationContext) {
      pronunciationContext.stop();
    } else {
      window.speechSynthesis?.cancel();
    }
  },

  previewVoice: async (voiceType: VoiceType, text?: string): Promise<void> => {
    if (!pronunciationContext) {
      console.warn("Pronunciation context not available");
      return;
    }

    const currentPreference = pronunciationContext.voicePreference;
    pronunciationContext.setVoicePreference(voiceType);

    try {
      await pronunciationContext.quickSpeak(
        text || "Hello! This is how I sound.",
      );
    } catch (error) {
      console.error("Voice preview failed:", error);
    } finally {
      // Restore original preference
      pronunciationContext.setVoicePreference(currentPreference);
    }
  },

  // Diagnostic methods for compatibility
  diagnostics: (): void => {
    if (pronunciationContext) {
      console.log("=== Unified Pronunciation System Diagnostics ===");
      console.log("Supported:", pronunciationContext.isSupported);
      console.log("Voices loaded:", pronunciationContext.isVoicesLoaded);
      console.log("Available voices:", pronunciationContext.voices.length);
      console.log(
        "Current voice preference:",
        pronunciationContext.voicePreference,
      );
      console.log("Selected voice:", pronunciationContext.selectedVoice?.name);
    } else {
      console.log("Pronunciation context not available");
    }
  },
};

// Enhanced Audio Service compatibility layer
export const enhancedAudioService = {
  pronounceWord: async (
    word: any,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceType?: VoiceType;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): Promise<void> => {
    if (!pronunciationContext) {
      const errorMsg = "Pronunciation context not available";
      console.warn(errorMsg);
      options.onError?.(errorMsg);
      return;
    }

    // Temporarily switch voice type if specified
    const originalVoiceType = pronunciationContext.voicePreference;
    if (options.voiceType && options.voiceType !== originalVoiceType) {
      pronunciationContext.setVoicePreference(options.voiceType);
    }

    try {
      await pronunciationContext.speak(word, {
        rate: options.rate,
        pitch: options.pitch,
        volume: options.volume,
        onStart: options.onStart,
        onEnd: () => {
          // Restore original voice type
          if (options.voiceType && options.voiceType !== originalVoiceType) {
            pronunciationContext.setVoicePreference(originalVoiceType);
          }
          options.onEnd?.();
        },
      });
    } catch (error) {
      // Restore original voice type on error
      if (options.voiceType && options.voiceType !== originalVoiceType) {
        pronunciationContext.setVoicePreference(originalVoiceType);
      }
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error("Enhanced pronunciation failed:", errorMsg, error);
      options.onError?.(errorMsg);
    }
  },

  setVoiceType: (voiceType: VoiceType): void => {
    audioService.setVoiceType(voiceType);
  },

  getVoiceType: (): VoiceType => {
    return audioService.getVoiceType();
  },

  setEnabled: (enabled: boolean): void => {
    audioService.setEnabled(enabled);
  },

  isAudioEnabled: (): boolean => {
    return audioService.isAudioEnabled();
  },

  stop: (): void => {
    audioService.stop();
  },

  previewVoice: (voiceType: VoiceType, text?: string): Promise<void> => {
    return audioService.previewVoice(voiceType, text);
  },

  getVoiceInfo: (voiceType: VoiceType) => {
    if (!pronunciationContext) {
      return null;
    }

    const categorized = pronunciationContext.categorizeVoices();
    const voices = categorized[voiceType] || [];
    const voice = voices[0];

    if (!voice) return null;

    return {
      name: voice.name,
      language: voice.lang,
      isLocal: voice.localService,
    };
  },

  speakText: (text: string, options: any = {}): Promise<void> => {
    return enhancedAudioService.pronounceWord(text, options);
  },
};

// Enhanced Jungle Audio System compatibility (simplified)
export const enhancedJungleAudioSystem = {
  speakWordWithEffects: async (
    word: any,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      useJungleEcho?: boolean;
      useMagicalEffect?: boolean;
    } = {},
  ): Promise<void> => {
    // For now, just use regular pronunciation
    // TODO: Add jungle effects in future version
    return enhancedAudioService.pronounceWord(word, {
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume,
    });
  },

  speakWord: (word: any, options: any = {}): Promise<void> => {
    return enhancedAudioService.pronounceWord(word, options);
  },

  playGameSound: async (soundId: string, options: any = {}): Promise<void> => {
    // Placeholder for game sounds - will use existing sound effects system
    console.log(`Playing game sound: ${soundId}`);
  },

  updateSettings: (settings: any): void => {
    console.log("Jungle audio settings updated:", settings);
  },
};

// Sound effects compatibility
export const playSoundIfEnabled = {
  success: () => {
    // Keep using existing sound effects for UI feedback
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const { soundEffects } = require("./soundEffects");
        soundEffects.playSuccess();
      } catch (error) {
        console.warn("Sound effects not available");
      }
    }
  },

  error: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const { soundEffects } = require("./soundEffects");
        soundEffects.playError();
      } catch (error) {
        console.warn("Sound effects not available");
      }
    }
  },

  pronunciation: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const { soundEffects } = require("./soundEffects");
        soundEffects.playPronunciation();
      } catch (error) {
        console.warn("Sound effects not available");
      }
    }
  },

  click: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const { soundEffects } = require("./soundEffects");
        soundEffects.playClick();
      } catch (error) {
        console.warn("Sound effects not available");
      }
    }
  },
};

// Migration utility to help with component updates
export const migrationHelpers = {
  // Convert old options to new format
  convertLegacyOptions: (oldOptions: any) => {
    return {
      rate: oldOptions.rate,
      pitch: oldOptions.pitch,
      volume: oldOptions.volume,
      onStart: oldOptions.onStart,
      onEnd: oldOptions.onEnd,
      onError: oldOptions.onError,
    };
  },

  // Create a pronunciation component wrapper for easy migration
  createPronunciationWrapper: (word: string, options: any = {}) => {
    return {
      word,
      pronounce: () => audioService.pronounceWord(word, options),
      isPlaying: pronunciationContext?.isPlaying || false,
      isSupported: pronunciationContext?.isSupported || false,
    };
  },

  // Batch migration helper for multiple components
  migrateComponentPronunciation: (components: string[]) => {
    console.log("Components ready for migration:", components);
    console.log("Use the PronounceableWord component for easy migration");
  },
};

// Export singleton instances for compatibility
export const AudioService = audioService;
export const EnhancedAudioService = enhancedAudioService;

// Export all for easy importing
export default {
  audioService,
  enhancedAudioService,
  enhancedJungleAudioSystem,
  playSoundIfEnabled,
  migrationHelpers,
  setPronunciationContext,
};
