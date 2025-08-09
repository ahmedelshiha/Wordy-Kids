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

  private getChildFriendlyVoice(): SpeechSynthesisVoice | null {
    // Prefer female voices as they tend to be more child-friendly
    const preferredVoices = this.voices.filter(
      (voice) =>
        voice.lang.startsWith("en") &&
        (voice.name.toLowerCase().includes("female") ||
          voice.name.toLowerCase().includes("woman") ||
          voice.name.toLowerCase().includes("karen") ||
          voice.name.toLowerCase().includes("alex") ||
          voice.name.toLowerCase().includes("samantha")),
    );

    if (preferredVoices.length > 0) {
      return preferredVoices[0];
    }

    // Fallback to any English voice
    const englishVoices = this.voices.filter((voice) =>
      voice.lang.startsWith("en"),
    );
    return englishVoices.length > 0 ? englishVoices[0] : null;
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

    const {
      rate = 0.8, // Slightly slower for children
      pitch = 1.2, // Slightly higher pitch for friendliness
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

    const {
      rate = 0.7, // Slower for definitions
      onStart,
      onEnd,
    } = options;

    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(definition);
    utterance.rate = rate;
    utterance.pitch = 1.1;
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
    utterance.rate = 1.0;
    utterance.pitch = 1.3;
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
