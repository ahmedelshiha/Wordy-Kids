// Enhanced Audio service with improved voice detection and preview functionality
import { speechSynthesisDebugger } from "./speechSynthesisDebugger";

export type VoiceType = "man" | "woman" | "kid";

export class EnhancedAudioService {
  private static instance: EnhancedAudioService;
  private speechSynthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isEnabled: boolean = true;
  private selectedVoiceType: VoiceType = "woman";
  private voicesLoaded: boolean = false;

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.initializeVoices();

    // Load saved voice preference
    const savedVoiceType = localStorage.getItem(
      "preferred-voice-type",
    ) as VoiceType;
    if (savedVoiceType && ["man", "woman", "kid"].includes(savedVoiceType)) {
      this.selectedVoiceType = savedVoiceType;
    }
  }

  public static getInstance(): EnhancedAudioService {
    if (!EnhancedAudioService.instance) {
      EnhancedAudioService.instance = new EnhancedAudioService();
    }
    return EnhancedAudioService.instance;
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.speechSynthesis.getVoices();
        this.voicesLoaded = this.voices.length > 0;

        if (this.voicesLoaded) {
          console.log(`Loaded ${this.voices.length} voices`);
          this.debugVoices();
          resolve();
        }
      };

      // Try loading voices immediately
      loadVoices();

      // Also listen for the voiceschanged event
      this.speechSynthesis.onvoiceschanged = () => {
        loadVoices();
        resolve();
      };

      // Fallback timeout
      setTimeout(() => {
        if (!this.voicesLoaded) {
          loadVoices();
          resolve();
        }
      }, 1000);
    });
  }

  private getVoiceByType(voiceType: VoiceType): SpeechSynthesisVoice | null {
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.voices = this.speechSynthesis.getVoices();
    }

    const englishVoices = this.voices.filter(
      (voice) =>
        voice.lang.startsWith("en") ||
        voice.lang.includes("US") ||
        voice.lang.includes("GB"),
    );

    console.log(
      `Looking for ${voiceType} voice among ${englishVoices.length} English voices`,
    );

    let filteredVoices: SpeechSynthesisVoice[] = [];

    switch (voiceType) {
      case "woman":
        filteredVoices = englishVoices.filter((voice) => {
          const name = voice.name.toLowerCase();
          return (
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
            name.includes("sophia") ||
            name.includes("nova") ||
            name.includes("aria") ||
            name.includes("jenny") ||
            (name.includes("google") && name.includes("female"))
          );
        });
        break;

      case "man":
        // Enhanced male voice detection with better logic
        filteredVoices = englishVoices.filter((voice) => {
          const name = voice.name.toLowerCase();
          const uri = voice.voiceURI.toLowerCase();

          // Check for explicit male indicators
          const hasMaleIndicators =
            name.includes("male") ||
            name.includes("man") ||
            uri.includes("male") ||
            uri.includes("man");

          // Check for common male names
          const hasMaleNames =
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
            name.includes("nathan") ||
            name.includes("ryan") ||
            name.includes("jacob") ||
            name.includes("nicholas") ||
            name.includes("tyler") ||
            name.includes("jonathan") ||
            name.includes("brandon") ||
            name.includes("justin") ||
            name.includes("antonio") ||
            name.includes("kevin");

          return hasMaleIndicators || hasMaleNames;
        });

        // If no explicit male voices found, use smarter filtering
        if (filteredVoices.length === 0) {
          console.log("No explicit male voices found, using smart filtering");

          // Filter out obvious female voices and get remaining
          const nonFemaleVoices = englishVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            const uri = voice.voiceURI.toLowerCase();

            const hasObviousFemaleIndicators =
              name.includes("female") ||
              name.includes("woman") ||
              uri.includes("female") ||
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
              name.includes("sophia") ||
              name.includes("nova") ||
              name.includes("aria") ||
              name.includes("jenny");

            return !hasObviousFemaleIndicators;
          });

          // Prefer system voices or neutral-sounding names
          filteredVoices = nonFemaleVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            return (
              voice.localService ||
              name.includes("english") ||
              name.includes("default") ||
              name.includes("us") ||
              name.includes("uk") ||
              name.includes("british") ||
              name.includes("american") ||
              name.includes("microsoft")
            );
          });

          // If still no good candidates, take any non-female voice
          if (filteredVoices.length === 0 && nonFemaleVoices.length > 0) {
            filteredVoices = nonFemaleVoices.slice(0, 3); // Take first few options
          }
        }
        break;

      case "kid":
        // Enhanced kid voice detection
        filteredVoices = englishVoices.filter((voice) => {
          const name = voice.name.toLowerCase();
          return (
            name.includes("child") ||
            name.includes("kid") ||
            name.includes("junior") ||
            name.includes("young") ||
            name.includes("boy") ||
            name.includes("girl") ||
            name.includes("kate") ||
            name.includes("vicki") ||
            name.includes("sara") ||
            name.includes("lily") ||
            name.includes("grace") ||
            name.includes("anna") ||
            name.includes("chloe") ||
            name.includes("mia")
          );
        });

        // If no kid-specific voices, use higher-pitched female voices
        if (filteredVoices.length === 0) {
          const youngFemaleVoices = englishVoices.filter((voice) => {
            const name = voice.name.toLowerCase();
            return (
              name.includes("sara") ||
              name.includes("lily") ||
              name.includes("grace") ||
              name.includes("kate") ||
              name.includes("vicki") ||
              name.includes("anna") ||
              name.includes("mia") ||
              name.includes("chloe")
            );
          });

          if (youngFemaleVoices.length > 0) {
            filteredVoices = youngFemaleVoices;
          } else {
            // Fallback to first available female voice
            const femaleVoices = this.getVoicesByGender("female");
            if (femaleVoices.length > 0) {
              filteredVoices = [femaleVoices[0]];
            }
          }
        }
        break;
    }

    // Log the selection process
    console.log(`Found ${filteredVoices.length} voices for ${voiceType}:`);
    filteredVoices.forEach((voice, idx) => {
      console.log(
        `  ${idx + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService}`,
      );
    });

    // Return the best match
    if (filteredVoices.length > 0) {
      // Prefer local voices for better performance
      const localVoices = filteredVoices.filter((v) => v.localService);
      if (localVoices.length > 0) {
        console.log(`Selected local voice: ${localVoices[0].name}`);
        return localVoices[0];
      }

      console.log(`Selected voice: ${filteredVoices[0].name}`);
      return filteredVoices[0];
    }

    // Ultimate fallback
    const fallback = englishVoices.length > 0 ? englishVoices[0] : null;
    console.log(`Fallback voice: ${fallback?.name || "None"}`);
    return fallback;
  }

  private getVoicesByGender(gender: "male" | "female"): SpeechSynthesisVoice[] {
    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en"),
    );

    return englishVoices.filter((voice) => {
      const name = voice.name.toLowerCase();
      const uri = voice.voiceURI.toLowerCase();

      if (gender === "female") {
        return (
          name.includes("female") ||
          name.includes("woman") ||
          uri.includes("female") ||
          name.includes("karen") ||
          name.includes("samantha") ||
          name.includes("susan") ||
          name.includes("allison") ||
          name.includes("serena") ||
          name.includes("victoria") ||
          name.includes("nova") ||
          name.includes("aria") ||
          name.includes("jenny")
        );
      } else {
        return (
          name.includes("male") ||
          name.includes("man") ||
          uri.includes("male") ||
          name.includes("david") ||
          name.includes("alex") ||
          name.includes("daniel") ||
          name.includes("james") ||
          name.includes("michael") ||
          name.includes("nathan") ||
          name.includes("ryan")
        );
      }
    });
  }

  private getVoiceDefaults(voiceType: VoiceType): {
    rate: number;
    pitch: number;
  } {
    switch (voiceType) {
      case "kid":
        return { rate: 0.9, pitch: 1.4 };
      case "woman":
        return { rate: 0.85, pitch: 1.1 };
      case "man":
        return { rate: 0.8, pitch: 0.8 }; // Lower pitch for more masculine sound
      default:
        return { rate: 0.85, pitch: 1.0 };
    }
  }

  public pronounceWord(
    word: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceType?: VoiceType;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): void {
    if (!this.isEnabled) {
      console.log("Audio service is disabled");
      const disabledError = {
        type: "service_disabled",
        word: word,
        timestamp: new Date().toISOString(),
      };
      options.onError?.(disabledError);
      return;
    }

    // Check browser support
    if (!("speechSynthesis" in window) || !this.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      const supportError = {
        type: "unsupported_browser",
        word: word,
        userAgent: navigator.userAgent,
        hasWindow: typeof window !== "undefined",
        hasSpeechSynthesis: "speechSynthesis" in window,
        timestamp: new Date().toISOString(),
      };
      options.onError?.(supportError);
      return;
    }

    // Validate input
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      console.error("Invalid word provided for pronunciation:", word);
      const validationError = {
        type: "invalid_input",
        word: word,
        wordType: typeof word,
        wordLength: word ? word.length : 0,
        timestamp: new Date().toISOString(),
      };
      options.onError?.(validationError);
      return;
    }

    const voiceType = options.voiceType || this.selectedVoiceType;
    const voiceDefaults = this.getVoiceDefaults(voiceType);

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

    try {
      // Cancel any ongoing speech safely
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(word.trim());
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      const voice = this.getVoiceByType(voiceType);
      if (voice) {
        utterance.voice = voice;
        console.log(`Using voice: ${voice.name} for ${voiceType}`);
      } else {
        console.warn(`No voice found for type: ${voiceType}, using default`);
      }

      // Set up event handlers with error protection
      utterance.onstart = () => {
        console.log(`Starting pronunciation: ${word} with ${voiceType} voice`);
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

      utterance.onerror = (event) => {
        console.error("Speech synthesis error for word:", word, {
          error: event.error || "Unknown error",
          message: event.message || "No message",
          voiceType: voiceType,
          voice: voice?.name,
          rate: rate,
          pitch: pitch,
          volume: volume,
        });
        try {
          const errorDetails = {
            error: event.error,
            message: event.message,
            word: word,
            voiceType: voiceType,
            voice: voice?.name,
            timestamp: new Date().toISOString(),
          };
          // Record error for debugging
          speechSynthesisDebugger.recordError(errorDetails);
          onError?.(errorDetails);
        } catch (error) {
          console.error("Error in onError callback:", error);
        }
      };

      // Additional error handling for browser-specific issues
      utterance.onboundary = (event) => {
        console.log(`Speech boundary: ${event.name} at ${event.charIndex}`);
      };

      // Speak with additional try-catch
      this.speechSynthesis.speak(utterance);

      // Set a timeout as fallback in case the speech gets stuck
      const timeoutDuration = Math.max(5000, word.length * 200); // Minimum 5s, or 200ms per character
      setTimeout(() => {
        if (this.speechSynthesis.speaking || this.speechSynthesis.pending) {
          console.warn("Speech synthesis timeout, canceling...");
          this.speechSynthesis.cancel();
          try {
            const timeoutError = {
              type: "timeout",
              word: word,
              duration: timeoutDuration,
              speechState: {
                speaking: this.speechSynthesis.speaking,
                pending: this.speechSynthesis.pending,
                paused: this.speechSynthesis.paused,
              },
              timestamp: new Date().toISOString(),
            };
            onError?.(timeoutError);
          } catch (error) {
            console.error("Error in timeout onError callback:", error);
          }
        }
      }, timeoutDuration);
    } catch (error) {
      console.error("Error in pronounceWord:", error);
      try {
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
        onError?.(generalError);
      } catch (callbackError) {
        console.error("Error in error callback:", callbackError);
      }
    }
  }

  public previewVoice(
    voiceType: VoiceType,
    text: string = "Hello! This is how I sound when reading words.",
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isEnabled) {
        reject(new Error("Audio is disabled"));
        return;
      }

      const voice = this.getVoiceByType(voiceType);
      if (!voice) {
        console.warn(`No voice found for type: ${voiceType}`);
        reject(new Error(`No voice found for type: ${voiceType}`));
        return;
      }

      console.log(`Preview voice for ${voiceType}:`, voice.name, voice.lang);

      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;

      const voiceDefaults = this.getVoiceDefaults(voiceType);
      utterance.rate = voiceDefaults.rate;
      utterance.pitch = voiceDefaults.pitch;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log(`Preview finished for ${voiceType}`);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error(
          `Preview error for ${voiceType}:`,
          event.error || "Unknown error",
          event,
        );
        reject(new Error(`Preview error: ${event.error || "Unknown error"}`));
      };

      this.speechSynthesis.speak(utterance);
    });
  }

  public setVoiceType(voiceType: VoiceType): void {
    this.selectedVoiceType = voiceType;
    localStorage.setItem("preferred-voice-type", voiceType);
    console.log(`Voice type set to: ${voiceType}`);

    // Dispatch event for components to listen to voice changes
    window.dispatchEvent(
      new CustomEvent("voiceTypeChanged", {
        detail: { voiceType, voiceInfo: this.getVoiceInfo(voiceType) },
      }),
    );
  }

  public getVoiceType(): VoiceType {
    return this.selectedVoiceType;
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

  public stop(): void {
    this.speechSynthesis.cancel();
  }

  public getAvailableVoices(): {
    type: VoiceType;
    voice: SpeechSynthesisVoice | null;
    available: boolean;
    name: string;
    language: string;
  }[] {
    return [
      {
        type: "woman",
        voice: this.getVoiceByType("woman"),
        available: this.getVoiceByType("woman") !== null,
        name: this.getVoiceByType("woman")?.name || "Not available",
        language: this.getVoiceByType("woman")?.lang || "en-US",
      },
      {
        type: "man",
        voice: this.getVoiceByType("man"),
        available: this.getVoiceByType("man") !== null,
        name: this.getVoiceByType("man")?.name || "Not available",
        language: this.getVoiceByType("man")?.lang || "en-US",
      },
      {
        type: "kid",
        voice: this.getVoiceByType("kid"),
        available: this.getVoiceByType("kid") !== null,
        name: this.getVoiceByType("kid")?.name || "Not available",
        language: this.getVoiceByType("kid")?.lang || "en-US",
      },
    ];
  }

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

  public debugVoices(): void {
    console.log("=== Available Voices Debug ===");
    console.log("Total voices:", this.voices.length);

    const englishVoices = this.voices.filter(
      (voice) =>
        voice.lang.startsWith("en") ||
        voice.lang.includes("US") ||
        voice.lang.includes("GB"),
    );
    console.log("English voices:", englishVoices.length);

    englishVoices.forEach((voice, index) => {
      console.log(
        `${index + 1}. ${voice.name} (${voice.lang}) - Local: ${voice.localService} - URI: ${voice.voiceURI}`,
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

  // Inherit other methods from original service
  public pronounceDefinition(
    definition: string,
    options: {
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
    } = {},
  ): void {
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);
    const { rate = voiceDefaults.rate * 0.85, onStart, onEnd } = options;

    this.pronounceWord(definition, {
      rate,
      pitch: voiceDefaults.pitch * 0.95,
      onStart,
      onEnd,
    });
  }

  public playSuccessSound(): void {
    if (!this.isEnabled) return;

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
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);

    this.pronounceWord(phrase, {
      rate: Math.min(voiceDefaults.rate + 0.2, 1.2),
      pitch: Math.min(voiceDefaults.pitch + 0.1, 1.5),
      volume: 0.8,
    });
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

    this.pronounceWord(phrase, {
      volume: 0.7,
    });
  }

  // Alias method for compatibility
  public speakText(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      volume?: number;
      voiceType?: VoiceType;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (errorDetails?: any) => void;
    } = {},
  ): void {
    this.pronounceWord(text, options);
  }
}

// Export singleton instance
export const enhancedAudioService = EnhancedAudioService.getInstance();
