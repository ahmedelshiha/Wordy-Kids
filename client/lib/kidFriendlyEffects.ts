// Kid-friendly sound effects and celebrations

export interface CelebrationOptions {
  type: "achievement" | "level_up" | "streak" | "general";
  intensity?: "low" | "medium" | "high";
  duration?: number;
}

export interface SoundEffect {
  name: string;
  frequency: number;
  duration: number;
  type: "beep" | "chime" | "celebration";
}

class KidFriendlyEffects {
  private audioContext: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // Initialize audio context when user interacts
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log("Audio context not supported");
      this.isEnabled = false;
    }
  }

  // Play fun sound effects
  playSound(effect: SoundEffect) {
    if (!this.isEnabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(effect.frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + effect.duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + effect.duration / 1000);
  }

  // Play celebration melody
  playCelebration(options: CelebrationOptions) {
    if (!this.isEnabled) return;

    const melodies = {
      achievement: [
        { frequency: 523, duration: 200 }, // C
        { frequency: 659, duration: 200 }, // E
        { frequency: 784, duration: 300 }, // G
      ],
      level_up: [
        { frequency: 523, duration: 150 }, // C
        { frequency: 659, duration: 150 }, // E
        { frequency: 784, duration: 150 }, // G
        { frequency: 1047, duration: 400 }, // C (higher)
      ],
      streak: [
        { frequency: 659, duration: 100 }, // E
        { frequency: 659, duration: 100 }, // E
        { frequency: 784, duration: 200 }, // G
      ],
      general: [
        { frequency: 523, duration: 200 }, // C
        { frequency: 659, duration: 200 }, // E
      ],
    };

    const melody = melodies[options.type];
    let delay = 0;

    melody.forEach((note, index) => {
      setTimeout(() => {
        this.playSound({
          name: `${options.type}_${index}`,
          frequency: note.frequency,
          duration: note.duration,
          type: "chime",
        });
      }, delay);
      delay += note.duration + 50;
    });
  }

  // Create visual celebration effects
  createCelebration(element: HTMLElement, options: CelebrationOptions) {
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 pointer-events-none z-50';
    
    const confetti = this.createConfetti(options.intensity || "medium");
    celebration.appendChild(confetti);
    
    document.body.appendChild(celebration);

    // Remove after animation
    setTimeout(() => {
      document.body.removeChild(celebration);
    }, options.duration || 2000);
  }

  private createConfetti(intensity: "low" | "medium" | "high") {
    const container = document.createElement('div');
    container.className = 'absolute inset-0';

    const confettiCount = {
      low: 15,
      medium: 30,
      high: 50,
    }[intensity];

    const emojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🏆', '🎯'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      confetti.className = 'absolute text-2xl animate-bounce';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 2 + 's';
      confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
      
      container.appendChild(confetti);
    }

    return container;
  }

  // Enable/disable effects
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Check if effects are supported
  isSupported() {
    return this.isEnabled && !!this.audioContext;
  }
}

// Create singleton instance
export const kidFriendlyEffects = new KidFriendlyEffects();

// Predefined sound effects
export const SOUNDS = {
  button_click: {
    name: "button_click",
    frequency: 800,
    duration: 100,
    type: "beep" as const,
  },
  success: {
    name: "success",
    frequency: 1000,
    duration: 200,
    type: "chime" as const,
  },
  achievement: {
    name: "achievement",
    frequency: 1200,
    duration: 300,
    type: "celebration" as const,
  },
  level_up: {
    name: "level_up",
    frequency: 1500,
    duration: 400,
    type: "celebration" as const,
  },
} as const;

// Easy-to-use celebration functions
export const celebrate = {
  achievement: (element?: HTMLElement) => {
    kidFriendlyEffects.playCelebration({ type: "achievement", intensity: "medium" });
    if (element) {
      kidFriendlyEffects.createCelebration(element, { type: "achievement", intensity: "medium" });
    }
  },
  levelUp: (element?: HTMLElement) => {
    kidFriendlyEffects.playCelebration({ type: "level_up", intensity: "high" });
    if (element) {
      kidFriendlyEffects.createCelebration(element, { type: "level_up", intensity: "high" });
    }
  },
  streak: (element?: HTMLElement) => {
    kidFriendlyEffects.playCelebration({ type: "streak", intensity: "medium" });
    if (element) {
      kidFriendlyEffects.createCelebration(element, { type: "streak", intensity: "low" });
    }
  },
  general: (element?: HTMLElement) => {
    kidFriendlyEffects.playCelebration({ type: "general", intensity: "low" });
    if (element) {
      kidFriendlyEffects.createCelebration(element, { type: "general", intensity: "low" });
    }
  },
};
