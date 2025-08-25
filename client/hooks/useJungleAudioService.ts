import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

// Types and interfaces
interface AudioSettings {
  enabled: boolean;
  volume: number;
  speechRate: number;
  speechPitch: number;
  voicePreference: "child-friendly" | "default" | "dramatic";
  ambientVolume: number;
  effectsVolume: number;
  pronunciationAutoPlay: boolean;
  backgroundSoundsEnabled: boolean;
}

interface SoundEffect {
  id: string;
  name: string;
  url: string;
  category: "ui" | "celebration" | "ambient" | "pronunciation" | "notification";
  volume?: number;
  loop?: boolean;
  fadeDuration?: number;
}

interface Voice {
  voice: SpeechSynthesisVoice;
  name: string;
  language: string;
  isChildFriendly: boolean;
  quality: "high" | "medium" | "low";
}

interface AudioContext {
  context: AudioContext | null;
  isInitialized: boolean;
  nodes: {
    masterGain: GainNode | null;
    effectsGain: GainNode | null;
    ambientGain: GainNode | null;
    speechGain: GainNode | null;
  };
}

// Sound effect library configuration
const SOUND_LIBRARY: { [key: string]: SoundEffect } = {
  // UI Sounds
  "button-click": {
    id: "button-click",
    name: "Button Click",
    url: "/sounds/ui/button-click.mp3",
    category: "ui",
    volume: 0.3,
  },
  navigation: {
    id: "navigation",
    name: "Navigation",
    url: "/sounds/ui/navigation-whoosh.mp3",
    category: "ui",
    volume: 0.4,
  },
  "category-select": {
    id: "category-select",
    name: "Category Selection",
    url: "/sounds/ui/category-select.mp3",
    category: "ui",
    volume: 0.5,
  },
  "view-change": {
    id: "view-change",
    name: "View Change",
    url: "/sounds/ui/view-transition.mp3",
    category: "ui",
    volume: 0.3,
  },

  // Celebration Sounds
  achievement: {
    id: "achievement",
    name: "Achievement Unlocked",
    url: "/sounds/ui/achievement-fanfare.mp3",
    category: "celebration",
    volume: 0.7,
  },
  "word-mastered": {
    id: "word-mastered",
    name: "Word Mastered",
    url: "/sounds/ui/word-mastered.mp3",
    category: "celebration",
    volume: 0.6,
  },
  "level-up": {
    id: "level-up",
    name: "Level Up",
    url: "/sounds/ui/level-up.mp3",
    category: "celebration",
    volume: 0.8,
  },
  "gem-collected": {
    id: "gem-collected",
    name: "Gem Collected",
    url: "/sounds/ui/gem-sparkle.mp3",
    category: "celebration",
    volume: 0.4,
  },

  // Discovery Sounds by Rarity
  "common-discovery": {
    id: "common-discovery",
    name: "Common Discovery",
    url: "/sounds/ui/common-chime.mp3",
    category: "celebration",
    volume: 0.3,
  },
  "rare-discovery": {
    id: "rare-discovery",
    name: "Rare Discovery",
    url: "/sounds/ui/rare-sparkle.mp3",
    category: "celebration",
    volume: 0.4,
  },
  "epic-discovery": {
    id: "epic-discovery",
    name: "Epic Discovery",
    url: "/sounds/ui/epic-flourish.mp3",
    category: "celebration",
    volume: 0.5,
  },
  "legendary-discovery": {
    id: "legendary-discovery",
    name: "Legendary Discovery",
    url: "/sounds/ui/legendary-fanfare.mp3",
    category: "celebration",
    volume: 0.6,
  },
  "mythical-discovery": {
    id: "mythical-discovery",
    name: "Mythical Discovery",
    url: "/sounds/ui/mythical-magic.mp3",
    category: "celebration",
    volume: 0.7,
  },

  // Interaction Sounds
  "heart-add": {
    id: "heart-add",
    name: "Add to Favorites",
    url: "/sounds/ui/heart-add.mp3",
    category: "ui",
    volume: 0.3,
  },
  "heart-remove": {
    id: "heart-remove",
    name: "Remove from Favorites",
    url: "/sounds/ui/heart-remove.mp3",
    category: "ui",
    volume: 0.2,
  },
  success: {
    id: "success",
    name: "Success",
    url: "/sounds/ui/success-ding.mp3",
    category: "ui",
    volume: 0.4,
  },
  error: {
    id: "error",
    name: "Error",
    url: "/sounds/ui/gentle-error.mp3",
    category: "ui",
    volume: 0.3,
  },

  // Ambient Jungle Sounds
  "jungle-background": {
    id: "jungle-background",
    name: "Jungle Ambience",
    url: "/sounds/ambient/jungle-birds-water.mp3",
    category: "ambient",
    volume: 0.2,
    loop: true,
    fadeDuration: 3000,
  },
  "forest-morning": {
    id: "forest-morning",
    name: "Forest Morning",
    url: "/sounds/ambient/forest-morning.mp3",
    category: "ambient",
    volume: 0.15,
    loop: true,
    fadeDuration: 2000,
  },
  "river-flow": {
    id: "river-flow",
    name: "River Flow",
    url: "/sounds/ambient/gentle-river.mp3",
    category: "ambient",
    volume: 0.1,
    loop: true,
    fadeDuration: 2500,
  },
};

// Default audio settings
const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  enabled: true,
  volume: 0.7,
  speechRate: 1.0,
  speechPitch: 1.0,
  voicePreference: "child-friendly",
  ambientVolume: 0.3,
  effectsVolume: 0.6,
  pronunciationAutoPlay: true,
  backgroundSoundsEnabled: true,
};

const STORAGE_KEY = "jungle_audio_settings";

export const useJungleAudioService = () => {
  // State management
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(
    DEFAULT_AUDIO_SETTINGS,
  );
  const [availableVoices, setAvailableVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAmbientSound, setCurrentAmbientSound] = useState<string | null>(
    null,
  );

  // Refs for audio management
  const audioContextRef = useRef<AudioContext>({
    context: null,
    isInitialized: false,
    nodes: {
      masterGain: null,
      effectsGain: null,
      ambientGain: null,
      speechGain: null,
    },
  });

  const audioElementsRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const fadeTimeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load audio settings on initialization
  useEffect(() => {
    loadAudioSettings();
    initializeAudioContext();
    loadAvailableVoices();
    preloadSoundEffects();
  }, []);

  // Load voices when they become available
  useEffect(() => {
    const handleVoicesChanged = () => {
      loadAvailableVoices();
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Load audio settings from localStorage
  const loadAudioSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setAudioSettings({ ...DEFAULT_AUDIO_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Error loading audio settings:", error);
      setAudioSettings(DEFAULT_AUDIO_SETTINGS);
    }
  }, []);

  // Save audio settings to localStorage
  const saveAudioSettings = useCallback((settings: AudioSettings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setAudioSettings(settings);
    } catch (error) {
      console.error("Error saving audio settings:", error);
    }
  }, []);

  // Initialize Web Audio API context
  const initializeAudioContext = useCallback(async () => {
    try {
      if (!audioContextRef.current.context) {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current.context = new AudioContextClass();

        // Create gain nodes for different audio types
        const masterGain = audioContextRef.current.context.createGain();
        const effectsGain = audioContextRef.current.context.createGain();
        const ambientGain = audioContextRef.current.context.createGain();
        const speechGain = audioContextRef.current.context.createGain();

        // Connect gain nodes
        effectsGain.connect(masterGain);
        ambientGain.connect(masterGain);
        speechGain.connect(masterGain);
        masterGain.connect(audioContextRef.current.context.destination);

        // Store references
        audioContextRef.current.nodes = {
          masterGain,
          effectsGain,
          ambientGain,
          speechGain,
        };

        audioContextRef.current.isInitialized = true;
        setIsInitialized(true);
      }

      // Resume context if suspended (required for Chrome)
      if (audioContextRef.current.context.state === "suspended") {
        await audioContextRef.current.context.resume();
      }
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  }, []);

  // Load available voices and categorize them
  const loadAvailableVoices = useCallback(() => {
    const voices = speechSynthesis.getVoices();

    const categorizedVoices: Voice[] = voices.map((voice) => {
      // Detect child-friendly voices (heuristic based on voice names)
      const isChildFriendly =
        /child|kid|young|junior|samantha|karen|victoria/i.test(voice.name) ||
        (voice.name.includes("en-US") && /female|woman/i.test(voice.name));

      // Assess quality based on voice type
      const quality = voice.localService
        ? "high"
        : voice.default
          ? "medium"
          : "low";

      return {
        voice,
        name: voice.name,
        language: voice.lang,
        isChildFriendly,
        quality,
      };
    });

    // Sort: child-friendly first, then by quality
    categorizedVoices.sort((a, b) => {
      if (a.isChildFriendly && !b.isChildFriendly) return -1;
      if (!a.isChildFriendly && b.isChildFriendly) return 1;

      const qualityOrder = { high: 3, medium: 2, low: 1 };
      return qualityOrder[b.quality] - qualityOrder[a.quality];
    });

    setAvailableVoices(categorizedVoices);

    // Auto-select the best voice
    if (categorizedVoices.length > 0 && !selectedVoice) {
      const preferredVoice =
        audioSettings.voicePreference === "child-friendly"
          ? categorizedVoices.find((v) => v.isChildFriendly)
          : categorizedVoices[0];

      setSelectedVoice(preferredVoice?.voice || categorizedVoices[0].voice);
    }
  }, [audioSettings.voicePreference, selectedVoice]);

  // Preload sound effects for better performance
  const preloadSoundEffects = useCallback(async () => {
    setIsLoading(true);

    try {
      const loadPromises = Object.values(SOUND_LIBRARY).map(async (sound) => {
        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = (sound.volume || 0.5) * audioSettings.effectsVolume;

        return new Promise<void>((resolve, reject) => {
          audio.addEventListener("canplaythrough", () => {
            audioElementsRef.current[sound.id] = audio;
            resolve();
          });
          audio.addEventListener("error", () => {
            console.warn(`Failed to load sound: ${sound.name}`);
            resolve(); // Don't reject to avoid blocking other sounds
          });
          audio.src = sound.url;
        });
      });

      await Promise.all(loadPromises);
    } catch (error) {
      console.error("Error preloading sound effects:", error);
    } finally {
      setIsLoading(false);
    }
  }, [audioSettings.effectsVolume]);

  // Play sound effect
  const playSound = useCallback(
    async (soundId: string, options?: { volume?: number; loop?: boolean }) => {
      if (!audioSettings.enabled) return;

      const sound = SOUND_LIBRARY[soundId];
      if (!sound) {
        console.warn(`Sound not found: ${soundId}`);
        return;
      }

      try {
        // Ensure audio context is initialized
        await initializeAudioContext();

        const audioElement = audioElementsRef.current[soundId];
        if (audioElement) {
          // Reset the audio to beginning
          audioElement.currentTime = 0;

          // Set volume
          const volume =
            (options?.volume ?? sound.volume ?? 0.5) *
            audioSettings.effectsVolume;
          audioElement.volume = Math.min(1, Math.max(0, volume));

          // Set loop
          audioElement.loop = options?.loop ?? sound.loop ?? false;

          // Play the sound
          const playPromise = audioElement.play();

          if (playPromise !== undefined) {
            await playPromise;
          }
        }
      } catch (error) {
        console.error(`Error playing sound ${soundId}:`, error);
      }
    },
    [
      audioSettings.enabled,
      audioSettings.effectsVolume,
      initializeAudioContext,
    ],
  );

  // Play ambient background sounds
  const playAmbientSounds = useCallback(
    async (soundId: string, fadeIn: boolean = true) => {
      if (!audioSettings.enabled || !audioSettings.backgroundSoundsEnabled)
        return;

      const sound = SOUND_LIBRARY[soundId];
      if (!sound || sound.category !== "ambient") {
        console.warn(`Ambient sound not found: ${soundId}`);
        return;
      }

      try {
        // Stop current ambient sound
        if (currentAmbientSound && currentAmbientSound !== soundId) {
          await stopAmbientSounds();
        }

        await initializeAudioContext();

        const audioElement = audioElementsRef.current[soundId];
        if (audioElement) {
          audioElement.loop = true;
          audioElement.volume = fadeIn
            ? 0
            : (sound.volume || 0.2) * audioSettings.ambientVolume;

          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            await playPromise;
          }

          setCurrentAmbientSound(soundId);

          // Fade in if requested
          if (fadeIn && sound.fadeDuration) {
            const targetVolume =
              (sound.volume || 0.2) * audioSettings.ambientVolume;
            const fadeSteps = 20;
            const stepDuration = sound.fadeDuration / fadeSteps;
            const volumeStep = targetVolume / fadeSteps;

            for (let i = 1; i <= fadeSteps; i++) {
              setTimeout(() => {
                if (audioElement) {
                  audioElement.volume = Math.min(targetVolume, volumeStep * i);
                }
              }, stepDuration * i);
            }
          }
        }
      } catch (error) {
        console.error(`Error playing ambient sound ${soundId}:`, error);
      }
    },
    [
      audioSettings.enabled,
      audioSettings.backgroundSoundsEnabled,
      audioSettings.ambientVolume,
      currentAmbientSound,
      initializeAudioContext,
    ],
  );

  // Stop ambient sounds
  const stopAmbientSounds = useCallback(
    async (fadeOut: boolean = true) => {
      if (!currentAmbientSound) return;

      const sound = SOUND_LIBRARY[currentAmbientSound];
      const audioElement = audioElementsRef.current[currentAmbientSound];

      if (audioElement && sound) {
        if (fadeOut && sound.fadeDuration) {
          const currentVolume = audioElement.volume;
          const fadeSteps = 20;
          const stepDuration = sound.fadeDuration / fadeSteps;
          const volumeStep = currentVolume / fadeSteps;

          for (let i = 1; i <= fadeSteps; i++) {
            setTimeout(() => {
              if (audioElement) {
                audioElement.volume = Math.max(
                  0,
                  currentVolume - volumeStep * i,
                );
                if (i === fadeSteps) {
                  audioElement.pause();
                  audioElement.currentTime = 0;
                }
              }
            }, stepDuration * i);
          }
        } else {
          audioElement.pause();
          audioElement.currentTime = 0;
        }
      }

      setCurrentAmbientSound(null);
    },
    [currentAmbientSound],
  );

  // Pronounce word with enhanced features
  const pronounceWord = useCallback(
    async (
      word: string,
      options?: {
        speed?: number;
        pitch?: number;
        voice?: string;
        onStart?: () => void;
        onEnd?: () => void;
        onError?: (error: any) => void;
      },
    ) => {
      if (!audioSettings.enabled || !word) return;

      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(word);

        // Configure voice
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        // Configure speech parameters
        utterance.rate = options?.speed || audioSettings.speechRate;
        utterance.pitch = options?.pitch || audioSettings.speechPitch;
        utterance.volume = audioSettings.volume;

        // Set up event handlers
        utterance.onstart = () => {
          speechUtteranceRef.current = utterance;
          options?.onStart?.();
        };

        utterance.onend = () => {
          speechUtteranceRef.current = null;
          options?.onEnd?.();
        };

        utterance.onerror = (event) => {
          speechUtteranceRef.current = null;
          console.error("Speech synthesis error:", event);
          options?.onError?.(event);
        };

        // Speak the word
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error pronouncing word:", error);
        options?.onError?.(error);
      }
    },
    [
      audioSettings.enabled,
      audioSettings.speechRate,
      audioSettings.speechPitch,
      audioSettings.volume,
      selectedVoice,
    ],
  );

  // Stop current speech
  const stopSpeech = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    speechUtteranceRef.current = null;
  }, []);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    const newSettings = { ...audioSettings, enabled: !audioSettings.enabled };
    saveAudioSettings(newSettings);

    if (!newSettings.enabled) {
      stopSpeech();
      stopAmbientSounds(false);
    }

    toast({
      title: newSettings.enabled ? "🔊 Audio Enabled" : "🔇 Audio Disabled",
      description: newSettings.enabled
        ? "Jungle sounds are back!"
        : "Audio has been turned off",
      duration: 2000,
    });
  }, [audioSettings, saveAudioSettings, stopSpeech, stopAmbientSounds]);

  // Set volume
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.min(1, Math.max(0, volume));
      const newSettings = { ...audioSettings, volume: clampedVolume };
      saveAudioSettings(newSettings);
    },
    [audioSettings, saveAudioSettings],
  );

  // Set speech rate
  const setSpeechRate = useCallback(
    (rate: number) => {
      const clampedRate = Math.min(2, Math.max(0.5, rate));
      const newSettings = { ...audioSettings, speechRate: clampedRate };
      saveAudioSettings(newSettings);
    },
    [audioSettings, saveAudioSettings],
  );

  // Load sound pack (for theme changes)
  const loadSoundPack = useCallback(
    async (packName: string) => {
      setIsLoading(true);

      try {
        // In a real implementation, this would load different sound packs
        // For now, we'll just reinitialize with the current sounds
        await preloadSoundEffects();

        toast({
          title: "🎵 Sound Pack Loaded",
          description: `Loaded ${packName} sounds!`,
          duration: 2000,
        });
      } catch (error) {
        console.error("Error loading sound pack:", error);
        toast({
          title: "❌ Sound Pack Error",
          description: "Failed to load sound pack",
          duration: 2000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [preloadSoundEffects],
  );

  // Update audio settings
  const updateAudioSettings = useCallback(
    (updates: Partial<AudioSettings>) => {
      const newSettings = { ...audioSettings, ...updates };
      saveAudioSettings(newSettings);
    },
    [audioSettings, saveAudioSettings],
  );

  // Get audio status
  const getAudioStatus = useCallback(() => {
    return {
      isInitialized,
      isLoading,
      audioEnabled: audioSettings.enabled,
      currentAmbientSound,
      isSpeaking: speechSynthesis.speaking,
      availableVoicesCount: availableVoices.length,
      selectedVoiceName: selectedVoice?.name || "Default",
    };
  }, [
    isInitialized,
    isLoading,
    audioSettings.enabled,
    currentAmbientSound,
    availableVoices.length,
    selectedVoice,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      stopAmbientSounds(false);

      // Clear fade timeouts
      Object.values(fadeTimeoutsRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });

      // Close audio context
      if (audioContextRef.current.context) {
        audioContextRef.current.context.close();
      }
    };
  }, [stopSpeech, stopAmbientSounds]);

  return {
    // State
    audioSettings,
    availableVoices,
    selectedVoice,
    isInitialized,
    isLoading,
    currentAmbientSound,

    // Audio control
    audioEnabled: audioSettings.enabled,
    toggleAudio,
    setVolume,
    setSpeechRate,
    updateAudioSettings,

    // Sound effects
    playSound,
    playAmbientSounds,
    stopAmbientSounds,

    // Speech synthesis
    pronounceWord,
    stopSpeech,
    setSelectedVoice,

    // Utilities
    loadSoundPack,
    getAudioStatus,
    initializeAudioContext,
  };
};

export default useJungleAudioService;
