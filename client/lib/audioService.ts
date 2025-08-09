// Audio service for pronunciation and sound effects
export type VoiceType = 'man' | 'woman' | 'kid';

export class AudioService {
  private static instance: AudioService;
  private speechSynthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isEnabled: boolean = true;
  private selectedVoiceType: VoiceType = 'woman';

  private constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.loadVoices();

    // Load saved voice preference
    const savedVoiceType = localStorage.getItem('preferred-voice-type') as VoiceType;
    if (savedVoiceType && ['man', 'woman', 'kid'].includes(savedVoiceType)) {
      this.selectedVoiceType = savedVoiceType;
    }

    // Listen for voices changed event
    this.speechSynthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private loadVoices() {
    this.voices = this.speechSynthesis.getVoices();
  }

  private getVoiceByType(voiceType: VoiceType): SpeechSynthesisVoice | null {
    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en")
    );

    let filteredVoices: SpeechSynthesisVoice[] = [];

    switch (voiceType) {
      case 'woman':
        filteredVoices = englishVoices.filter((voice) =>
          voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("karen") ||
          voice.name.toLowerCase().includes("samantha") ||
          voice.name.toLowerCase().includes("susan") ||
          voice.name.toLowerCase().includes("allison") ||
          voice.name.toLowerCase().includes("zira") ||
          (voice.name.toLowerCase().includes("google") && voice.name.toLowerCase().includes("female"))
        );
        break;

      case 'man':
        filteredVoices = englishVoices.filter((voice) =>
          voice.name.toLowerCase().includes("male") ||
          voice.name.toLowerCase().includes("man") ||
          voice.name.toLowerCase().includes("david") ||
          voice.name.toLowerCase().includes("mark") ||
          voice.name.toLowerCase().includes("alex") ||
          voice.name.toLowerCase().includes("daniel") ||
          (voice.name.toLowerCase().includes("google") && voice.name.toLowerCase().includes("male"))
        );
        break;

      case 'kid':
        // Look for higher-pitched or child-specific voices
        filteredVoices = englishVoices.filter((voice) =>
          voice.name.toLowerCase().includes("child") ||
          voice.name.toLowerCase().includes("kid") ||
          voice.name.toLowerCase().includes("junior") ||
          voice.name.toLowerCase().includes("young") ||
          // Some voices that tend to sound younger
          voice.name.toLowerCase().includes("kate") ||
          voice.name.toLowerCase().includes("vicki")
        );

        // If no kid-specific voices, fall back to female voices (often sound more child-friendly)
        if (filteredVoices.length === 0) {
          filteredVoices = englishVoices.filter((voice) =>
            voice.name.toLowerCase().includes("female") ||
            voice.name.toLowerCase().includes("woman")
          );
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

  private getVoiceDefaults(voiceType: VoiceType): { rate: number; pitch: number } {
    switch (voiceType) {
      case 'kid':
        return { rate: 0.9, pitch: 1.4 };
      case 'woman':
        return { rate: 0.8, pitch: 1.2 };
      case 'man':
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
      onError?: () => void;
    } = {},
  ): void {
    if (!this.isEnabled) return;

    // Get voice-type specific defaults
    const voiceDefaults = this.getVoiceDefaults(this.selectedVoiceType);

    const {
      rate = voiceDefaults.rate,
      pitch = voiceDefaults.pitch,
      volume = 1.0,
      onStart,
      onEnd,
      onError,
    } = options;

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(word);

    // Set voice properties
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Use child-friendly voice if available
    const voice = this.getChildFriendlyVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Set event handlers
    utterance.onstart = () => {
      console.log(`Starting pronunciation: ${word}`);
      onStart?.();
    };

    utterance.onend = () => {
      console.log(`Finished pronunciation: ${word}`);
      onEnd?.();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      onError?.();
    };

    // Speak the word
    this.speechSynthesis.speak(utterance);
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
    utterance.rate = 0.9;
    utterance.pitch = 1.2;
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

  public stop(): void {
    this.speechSynthesis.cancel();
  }

  public setVoiceType(voiceType: VoiceType): void {
    this.selectedVoiceType = voiceType;
    // Save to localStorage for persistence
    localStorage.setItem('preferred-voice-type', voiceType);
  }

  public getVoiceType(): VoiceType {
    return this.selectedVoiceType;
  }

  public getAvailableVoices(): { type: VoiceType; voice: SpeechSynthesisVoice | null; available: boolean }[] {
    return [
      {
        type: 'woman',
        voice: this.getVoiceByType('woman'),
        available: this.getVoiceByType('woman') !== null
      },
      {
        type: 'man',
        voice: this.getVoiceByType('man'),
        available: this.getVoiceByType('man') !== null
      },
      {
        type: 'kid',
        voice: this.getVoiceByType('kid'),
        available: this.getVoiceByType('kid') !== null
      }
    ];
  }

  public previewVoice(voiceType: VoiceType, text: string = "Hello! This is how I sound."): void {
    if (!this.isEnabled) return;

    const voice = this.getVoiceByType(voiceType);
    if (!voice) return;

    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;

    // Adjust settings based on voice type
    switch (voiceType) {
      case 'kid':
        utterance.rate = 0.9;
        utterance.pitch = 1.4;
        break;
      case 'woman':
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        break;
      case 'man':
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
        break;
    }

    utterance.volume = 1.0;
    this.speechSynthesis.speak(utterance);
  }

  // Fun sound effects using Web Audio API for better child engagement
  public playCheerSound(): void {
    if (!this.isEnabled) return;

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
    if (!this.isEnabled) return;

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
}

// Export singleton instance
export const audioService = AudioService.getInstance();
