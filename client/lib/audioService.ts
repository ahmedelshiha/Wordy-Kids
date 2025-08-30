// Audio service for pronunciation and sound effects
export type VoiceType = "man" | "woman" | "kid";

// Import UI interaction sounds setting
import { isUIInteractionSoundsEnabled } from "./soundEffects";

export class AudioService {
  private static instance: AudioService;
  private speechSynthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isEnabled: boolean = true;
  private selectedVoiceType: VoiceType = "woman";
  private isSupported: boolean = false;
  private voicesLoaded: boolean = false;
  private lastCancelAt: number = 0;

  private constructor() {
    // Check if speech synthesis is supported
    this.isSupported = this.checkBrowserSupport();

    if (!this.isSupported) {
      console.warn("Speech Synthesis API not supported in this browser");
      this.isEnabled = false;
      return;
    }

    this.speechSynthesis = window.speechSynthesis;
    this.loadVoices();

    // Load saved voice preference
    const savedVoiceType = localStorage.getItem(
      "preferred-voice-type",
    ) as VoiceType;
    if (savedVoiceType && ["man", "woman", "kid"].includes(savedVoiceType)) {
      this.selectedVoiceType = savedVoiceType;
    }

    // Listen for voices changed event with error handling
    this.speechSynthesis.onvoiceschanged = () => {
      try {
        this.loadVoices();
      } catch (error) {
        console.error("Error loading voices:", error);
      }
    };

    // Wait for voices to load if they're not immediately available
    this.waitForVoices();
  }

  private checkBrowserSupport(): boolean {
    // Check for basic speech synthesis support
    if (!("speechSynthesis" in window)) {
      return false;
    }

    // Check for SpeechSynthesisUtterance support
    if (!("SpeechSynthesisUtterance" in window)) {
      return false;
    }

    // Additional checks for known problematic environments
    const userAgent = navigator.userAgent.toLowerCase();

    // Check if running in certain environments that might have issues
    if (userAgent.includes("jsdom") || userAgent.includes("node")) {
      return false;
    }

    return true;
  }

  private async waitForVoices(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 100;

    const checkVoices = () => {
      this.loadVoices();
      if (this.voices.length > 0) {
        this.voicesLoaded = true;
        console.log(
          `Voices loaded successfully: ${this.voices.length} voices available`,
        );
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkVoices, delay * attempts); // Increasing delay
      } else {
        console.warn("No voices loaded after maximum attempts");
        this.voicesLoaded = false;
      }
    };

    // Start checking immediately and then with delays
    checkVoices();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private loadVoices() {
    try {
      if (!this.speechSynthesis) {
        this.voices = [];
        return;
      }

      const availableVoices = this.speechSynthesis.getVoices();
      this.voices = availableVoices;

      if (this.voices.length > 0) {
        this.voicesLoaded = true;
        console.log(
          `Loaded ${this.voices.length} voices:`,
          this.voices.map((v) => `${v.name} (${v.lang})`).slice(0, 5),
        );
      } else {
        console.log("No voices loaded yet, voices may still be loading...");
      }
    } catch (error) {
      console.error("Error loading voices:", error);
      this.voices = [];
      this.voicesLoaded = false;
    }
  }

  private getVoiceByType(voiceType: VoiceType): SpeechSynthesisVoice | null {
    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en"),
    );

    let filteredVoices: SpeechSynthesisVoice[] = [];

    switch (voiceType) {
      case "woman":
        // First try explicit female voice names/indicators
        filteredVoices = englishVoices.filter(
          (voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman") ||
            voice.name.toLowerCase().includes("karen") ||
            voice.name.toLowerCase().includes("samantha") ||
            voice.name.toLowerCase().includes("susan") ||
            voice.name.toLowerCase().includes("allison") ||
            voice.name.toLowerCase().includes("zira") ||
            voice.name.toLowerCase().includes("hazel") ||
            voice.name.toLowerCase().includes("serena") ||
            voice.name.toLowerCase().includes("victoria") ||
            voice.name.toLowerCase().includes("catherine") ||
            voice.name.toLowerCase().includes("amelie") ||
            voice.name.toLowerCase().includes("ava") ||
            voice.name.toLowerCase().includes("emma") ||
            voice.name.toLowerCase().includes("sophia") ||
            (voice.name.toLowerCase().includes("google") &&
              voice.name.toLowerCase().includes("female")),
        );
        break;

      case "man":
        // Enhanced male voice detection with more comprehensive patterns
        filteredVoices = englishVoices.filter((voice) => {
          const name = voice.name.toLowerCase();
          return (
            name.includes("male") ||
            name.includes("man") ||
            name.includes("david") ||
            name.includes("mark") ||
            name.includes("alex") ||
            name.includes("daniel") ||
            name.includes("thomas") ||
            name.includes("james") ||
            name.includes("michael") ||
            name.includes("william") ||
            name.includes("robert") ||
            name.includes("john") ||
            name.includes("richard") ||
            name.includes("christopher") ||
            name.includes("matthew") ||
            name.includes("anthony") ||
            name.includes("donald") ||
            name.includes("steven") ||
            name.includes("paul") ||
            name.includes("andrew") ||
            name.includes("joshua") ||
            name.includes("kenny") ||
            name.includes("fred") ||
            name.includes("ralph") ||
            name.includes("jorge") ||
            name.includes("aaron") ||
            name.includes("oliver") ||
            name.includes("evan") ||
            (name.includes("google") && name.includes("male"))
          );
        });

        // If still no male voices found, use heuristics based on voice properties
        if (filteredVoices.length === 0) {
          // Filter out obvious female names and get remaining voices
          const nonFemaleVoices = englishVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            const hasObviousFemaleIndicators =
              name.includes("female") ||
              name.includes("woman") ||
              name.includes("karen") ||
              name.includes("samantha") ||
              name.includes("susan") ||
              name.includes("allison") ||
              name.includes("zira") ||
              name.includes("hazel") ||
              name.includes("serena") ||
              name.includes("victoria") ||
              name.includes("catherine") ||
              name.includes("amelie") ||
              name.includes("ava") ||
              name.includes("emma") ||
              name.includes("sophia");

            return !hasObviousFemaleIndicators;
          });

          // Prefer voices that sound more neutral or could be male
          filteredVoices = nonFemaleVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            return (
              name.includes("english") ||
              name.includes("default") ||
              name.includes("us") ||
              name.includes("uk") ||
              name.includes("british") ||
              name.includes("american")
            );
          });

          // If still nothing, take the first non-female voice
          if (filteredVoices.length === 0 && nonFemaleVoices.length > 0) {
            filteredVoices = [nonFemaleVoices[0]];
          }
        }
        break;

      case "kid":
        // Look for higher-pitched or child-specific voices
        filteredVoices = englishVoices.filter((voice) => {
          const name = voice.name.toLowerCase();
          return (
            name.includes("child") ||
            name.includes("kid") ||
            name.includes("junior") ||
            name.includes("young") ||
            name.includes("boy") ||
            name.includes("girl") ||
            // Some voices that tend to sound younger
            name.includes("kate") ||
            name.includes("vicki") ||
            name.includes("sara") ||
            name.includes("lily") ||
            name.includes("grace")
          );
        });

        // If no kid-specific voices, try to find higher-pitched female voices
        if (filteredVoices.length === 0) {
          const femaleVoices = englishVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            return (
              name.includes("female") ||
              name.includes("woman") ||
              name.includes("sara") ||
              name.includes("lily") ||
              name.includes("grace") ||
              name.includes("kate") ||
              name.includes("vicki")
            );
          });

          // Prefer the first available female voice for kid mode
          if (femaleVoices.length > 0) {
            filteredVoices = [femaleVoices[0]];
          }
        }
        break;
    }

    // Return the first matching voice, or fall back to any English voice
    if (filteredVoices.length > 0) {
      return filteredVoices[0];
    }

    return englishVoices.length > 0 ? englishVoices[0] : null;
  }

  private getChildFriendlyVoice(): SpeechSynthesisVoice | null {
    return this.getVoiceByType(this.selectedVoiceType);
  }

  private getVoiceDefaults(voiceType: VoiceType): {
    rate: number;
    pitch: number;
  } {
    switch (voiceType) {
      case "kid":
        return { rate: 0.9, pitch: 1.4 };
      case "woman":
        return { rate: 0.8, pitch: 1.2 };
      case "man":
        return { rate: 0.8, pitch: 0.9 };
      default:
        return { rate: 0.8, pitch: 1.2 };
    }
  }

  public pronounceWord(
    word: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): void {
    if (!this.isEnabled || !word?.trim()) return;

    // Check if speech synthesis is supported and available
    if (!this.isSupported || !this.speechSynthesis) {
      console.warn("Speech synthesis not supported or available");
      const supportError = {
        type: "unsupported_browser",
        word: word,
        isSupported: this.isSupported,
        hasSpeechSynthesis: !!this.speechSynthesis,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      options.onError?.(supportError);
      return;
    }

    // Check if voices are loaded, wait if necessary
    if (!this.voicesLoaded && this.voices.length === 0) {
      console.log("Voices not loaded yet, attempting to load...");
      this.waitForVoices().then(() => {
        // Retry after voices are loaded
        if (this.voicesLoaded || this.voices.length > 0) {
          this.pronounceWord(word, options);
        } else {
          console.warn(
            "Could not load voices, proceeding without voice selection",
          );
          this.pronounceWordWithoutVoiceSelection(word, options);
        }
      });
      return;
    }

    try {
      // Get voice-type specific defaults
      const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);

      // Validate and clamp parameters to safe ranges
      const rate = Math.max(
        0.1,
        Math.min(10, options.rate ?? voiceDefaults.rate),
      );
      const pitch = Math.max(
        0,
        Math.min(2, options.pitch ?? voiceDefaults.pitch),
      );
      const volume = Math.max(0, Math.min(1, options.volume ?? 1.0));

      const { onStart, onEnd, onError } = options;

      // Cancel any ongoing speech safely
      try {
        this.speechSynthesis.cancel();
      } catch (cancelError) {
        console.warn("Error canceling previous speech:", cancelError);
      }

      // Ensure voices are loaded
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      const utterance = new SpeechSynthesisUtterance(word.trim());

      // Set voice properties with validation
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Use child-friendly voice if available
      const voice = this.getChildFriendlyVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // Set event handlers with error protection
      utterance.onstart = () => {
        console.log(`Starting pronunciation: ${word}`);
        try {
          onStart?.();
        } catch (error) {
          console.error("Error in onStart callback:", error);
        }
      };

      utterance.onend = () => {
        console.log(`Finished pronunciation: ${word}`);
        try {
          onEnd?.();
        } catch (error) {
          console.error("Error in onEnd callback:", error);
        }
      };

      utterance.onerror = (event: any) => {
        const errorPayload = {
          error: event?.error || null,
          message: event?.message || "unknown",
          eventType: event?.type || "error",
          word: word,
          voice: voice?.name,
          voiceURI: voice?.voiceURI,
          rate,
          pitch,
          volume,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent.substring(0, 120),
          speechState: {
            speaking: this.speechSynthesis.speaking,
            pending: this.speechSynthesis.pending,
            paused: this.speechSynthesis.paused,
          },
          voiceInfo: {
            voicesCount: this.voices.length,
            voicesLoaded: this.voicesLoaded,
            selectedVoiceType: this.selectedVoiceType,
          },
        };
        try {
          console.error(
            "Speech synthesis error:",
            JSON.stringify(errorPayload),
          );
        } catch {
          console.error("Speech synthesis error:", errorPayload);
        }

        try {
          onError?.(errorPayload);
        } catch (error) {
          console.error("Error in onError callback:", error);
        }
      };

      // Additional error handling for browser-specific issues
      utterance.onboundary = (event) => {
        // This can help detect if speech is actually working
        console.log(
          `Speech boundary event: ${event.name} at ${event.charIndex}`,
        );
      };

      // Speak the word with additional error handling
      try {
        this.speechSynthesis.speak(utterance);
      } catch (speakError) {
        console.error("Error calling speak:", speakError);
        const speakCallError = {
          type: "speak_call_error",
          word: word,
          originalError:
            speakError instanceof Error
              ? {
                  name: speakError.name,
                  message: speakError.message,
                  stack: speakError.stack,
                }
              : speakError,
          timestamp: new Date().toISOString(),
        };
        onError?.(speakCallError);
      }
    } catch (error) {
      console.error("Error in pronounceWord:", error);
      const generalError = {
        type: "general_error",
        word: word,
        originalError:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        timestamp: new Date().toISOString(),
      };
      options.onError?.(generalError);
    }
  }

  private pronounceWordWithoutVoiceSelection(
    word: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): void {
    try {
      const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);

      // Validate and clamp parameters to safe ranges
      const rate = Math.max(
        0.1,
        Math.min(10, options.rate ?? voiceDefaults.rate),
      );
      const pitch = Math.max(
        0,
        Math.min(2, options.pitch ?? voiceDefaults.pitch),
      );
      const volume = Math.max(0, Math.min(1, options.volume ?? 1.0));

      const utterance = new SpeechSynthesisUtterance(word.trim());
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      // Don't set a specific voice, let the browser use default
      console.log("Using default browser voice for speech synthesis");

      utterance.onstart = () => {
        console.log(`Starting pronunciation (default voice): ${word}`);
        try {
          options.onStart?.();
        } catch (error) {
          console.error("Error in onStart callback:", error);
        }
      };

      utterance.onend = () => {
        console.log(`Finished pronunciation (default voice): ${word}`);
        try {
          options.onEnd?.();
        } catch (error) {
          console.error("Error in onEnd callback:", error);
        }
      };

      utterance.onerror = (event: any) => {
        const errorPayload = {
          error: event?.error || null,
          message: event?.message || "unknown",
          type: event?.type || "error",
          timeStamp: event?.timeStamp || Date.now(),
          word: word,
          voice: voice?.name || "default",
          voiceURI: voice?.voiceURI,
          speechState: {
            speaking: this.speechSynthesis.speaking,
            pending: this.speechSynthesis.pending,
            paused: this.speechSynthesis.paused,
          },
          timestamp: new Date().toISOString(),
        };
        try {
          console.error(
            "Speech synthesis error (default voice):",
            JSON.stringify(errorPayload),
          );
        } catch {
          console.error(
            "Speech synthesis error (default voice):",
            errorPayload,
          );
        }
        try {
          options.onError?.(errorPayload);
        } catch (error) {
          console.error("Error in onError callback:", error);
        }
      };

      this.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Error in fallback pronunciation:", error);
      options.onError?.();
    }
  }

  public pronounceDefinition(
    definition: string,
    options: {
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
    } = {},
  ): void {
    if (!this.isEnabled) return;

    // Get voice-type specific defaults, but slower for definitions
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);

    const {
      rate = voiceDefaults.rate * 0.85, // Slightly slower for definitions
      onStart,
      onEnd,
    } = options;

    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(definition);
    utterance.rate = rate;
    utterance.pitch = voiceDefaults.pitch * 0.95; // Slightly lower pitch for definitions
    utterance.volume = 1.0;

    const voice = this.getChildFriendlyVoice();
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = onStart;
    utterance.onend = onEnd;

    this.speechSynthesis.speak(utterance);
  }

  public playSuccessSound(): void {
    if (!this.isEnabled) return;

    // Create a cheerful success sound using speech synthesis
    const successPhrases = [
      "Great job!",
      "Excellent!",
      "Well done!",
      "Fantastic!",
      "Amazing work!",
      "You did it!",
      "Wonderful!",
      "Perfect!",
    ];

    const phrase =
      successPhrases[Math.floor(Math.random() * successPhrases.length)];
    const utterance = new SpeechSynthesisUtterance(phrase);

    // Use voice type defaults with celebratory adjustments
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);
    utterance.rate = Math.min(voiceDefaults.rate + 0.2, 1.2); // Slightly faster for excitement
    utterance.pitch = Math.min(voiceDefaults.pitch + 0.1, 1.5); // Slightly higher for celebration
    utterance.volume = 0.8;

    const voice = this.getChildFriendlyVoice();
    if (voice) {
      utterance.voice = voice;
    }

    this.speechSynthesis.speak(utterance);
  }

  public playEncouragementSound(): void {
    if (!this.isEnabled) return;

    const encouragementPhrases = [
      "Try again!",
      "You can do it!",
      "Keep going!",
      "Almost there!",
      "Don't give up!",
      "You're learning!",
    ];

    const phrase =
      encouragementPhrases[
        Math.floor(Math.random() * encouragementPhrases.length)
      ];
    const utterance = new SpeechSynthesisUtterance(phrase);

    // Use voice type defaults with encouraging tone
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);
    utterance.rate = voiceDefaults.rate;
    utterance.pitch = voiceDefaults.pitch;
    utterance.volume = 0.7;

    const voice = this.getChildFriendlyVoice();
    if (voice) {
      utterance.voice = voice;
    }

    this.speechSynthesis.speak(utterance);
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.speechSynthesis.cancel();
    }
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public areVoicesLoaded(): boolean {
    return this.voicesLoaded;
  }

  public getVoiceCount(): number {
    return this.voices.length;
  }

  public async ensureVoicesLoaded(): Promise<boolean> {
    if (this.voicesLoaded) {
      return true;
    }

    await this.waitForVoices();
    return this.voicesLoaded;
  }

  public stop(): void {
    this.speechSynthesis.cancel();
  }

  public setVoiceType(voiceType: VoiceType): void {
    this.selectedVoiceType = voiceType;
    // Save to localStorage for persistence
    localStorage.setItem("preferred-voice-type", voiceType);
  }

  public getVoiceType(): VoiceType {
    return this.selectedVoiceType;
  }

  public getAvailableVoices(): {
    type: VoiceType;
    voice: SpeechSynthesisVoice | null;
    available: boolean;
  }[] {
    return [
      {
        type: "woman",
        voice: this.getVoiceByType("woman"),
        available: this.getVoiceByType("woman") !== null,
      },
      {
        type: "man",
        voice: this.getVoiceByType("man"),
        available: this.getVoiceByType("man") !== null,
      },
      {
        type: "kid",
        voice: this.getVoiceByType("kid"),
        available: this.getVoiceByType("kid") !== null,
      },
    ];
  }

  public previewVoice(
    voiceType: VoiceType,
    text: string = "Hello! This is how I sound.",
  ): void {
    if (!this.isEnabled) return;

    const voice = this.getVoiceByType(voiceType);
    if (!voice) {
      console.warn(`No voice found for type: ${voiceType}`);
      return;
    }

    console.log(`Preview voice for ${voiceType}:`, voice.name, voice.lang);

    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;

    // Adjust settings based on voice type
    switch (voiceType) {
      case "kid":
        utterance.rate = 0.9;
        utterance.pitch = 1.4;
        break;
      case "woman":
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        break;
      case "man":
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
        break;
    }

    utterance.volume = 1.0;
    this.speechSynthesis.speak(utterance);
  }

  // Debug method to see all available voices
  public debugVoices(): void {
    console.log("=== Available Voices Debug ===");
    console.log("Total voices:", this.voices.length);

    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en"),
    );
    console.log("English voices:", englishVoices.length);

    englishVoices.forEach((voice, index) => {
      console.log(
        `${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`,
      );
    });

    console.log("\n=== Voice Type Assignments ===");
    ["woman", "man", "kid"].forEach((type) => {
      const voice = this.getVoiceByType(type as VoiceType);
      console.log(
        `${type}: ${voice ? `${voice.name} (${voice.lang})` : "None found"}`,
      );
    });
  }

  // Comprehensive diagnostic method for troubleshooting
  public diagnostics(): void {
    console.log("=== Speech Synthesis Diagnostics ===");

    // Browser support
    console.log("Browser Support:");
    console.log("- speechSynthesis:", "speechSynthesis" in window);
    console.log(
      "- SpeechSynthesisUtterance:",
      "SpeechSynthesisUtterance" in window,
    );
    console.log("- isSupported:", this.isSupported);
    console.log("- userAgent:", navigator.userAgent);

    // Service state
    console.log("\nService State:");
    console.log("- isEnabled:", this.isEnabled);
    console.log("- voicesLoaded:", this.voicesLoaded);
    console.log("- selectedVoiceType:", this.selectedVoiceType);
    console.log("- voices count:", this.voices.length);

    // Voice availability by type
    console.log("\nVoice Availability:");
    ["woman", "man", "kid"].forEach((type) => {
      const voice = this.getVoiceByType(type as VoiceType);
      console.log(
        `- ${type}:`,
        voice ? `${voice.name} (${voice.lang})` : "❌ None found",
      );
    });

    // Speech synthesis state
    if (this.speechSynthesis) {
      console.log("\nSpeech Synthesis State:");
      console.log("- speaking:", this.speechSynthesis.speaking);
      console.log("- pending:", this.speechSynthesis.pending);
      console.log("- paused:", this.speechSynthesis.paused);
    }

    // Test pronunciation
    console.log("\n=== Running Test ===");
    this.testPronunciation();
  }

  private testPronunciation(): void {
    if (!this.isSupported) {
      console.log("❌ Cannot test: Speech synthesis not supported");
      return;
    }

    console.log("🔊 Testing pronunciation with 'hello'...");
    this.pronounceWord("hello", {
      onStart: () => console.log("✅ Test: Speech started successfully"),
      onEnd: () => console.log("✅ Test: Speech completed successfully"),
      onError: () => console.log("❌ Test: Speech failed"),
    });
  }

  // Get detailed voice information for settings panel
  public getVoiceInfo(voiceType: VoiceType): {
    name: string;
    language: string;
    isLocal: boolean;
  } | null {
    const voice = this.getVoiceByType(voiceType);
    if (!voice) return null;

    return {
      name: voice.name,
      language: voice.lang,
      isLocal: voice.localService,
    };
  }

  // Fun sound effects using Web Audio API for better child engagement
  public playCheerSound(): void {
    if (!this.isEnabled || !isUIInteractionSoundsEnabled()) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create a cheerful ascending melody
      const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      let startTime = audioContext.currentTime;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, startTime + index * 0.1);
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0, startTime + index * 0.1);
        gainNode.gain.linearRampToValueAtTime(
          0.3,
          startTime + index * 0.1 + 0.02,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          startTime + index * 0.1 + 0.15,
        );

        oscillator.start(startTime + index * 0.1);
        oscillator.stop(startTime + index * 0.1 + 0.15);
      });
    } catch (error) {
      console.log(
        "Web Audio API not supported, falling back to speech synthesis",
      );
      this.playSuccessSound();
    }
  }

  public playWhooshSound(): void {
    if (!this.isEnabled || !isUIInteractionSoundsEnabled()) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a whoosh effect
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        audioContext.currentTime + 0.3,
      );
      oscillator.type = "sawtooth";

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.2,
        audioContext.currentTime + 0.05,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Web Audio API not supported");
    }
  }

  public playClickSound(): void {
    if (!this.isEnabled || !isUIInteractionSoundsEnabled()) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Create a subtle click sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.05,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch (error) {
      console.log("Web Audio API not supported for click sound");
    }
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
