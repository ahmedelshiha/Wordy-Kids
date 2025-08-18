/**
 * Jungle Adventure Sound Effects and Micro-interactions System
 * Provides immersive audio feedback for the jungle learning experience
 */

interface SoundEffect {
  name: string;
  url?: string;
  volume?: number;
  pitch?: number;
  duration?: number;
}

interface JungleSoundConfig {
  enabled: boolean;
  volume: number;
  enableHaptics: boolean;
  enableVisualFeedback: boolean;
}

class JungleSoundSystem {
  private config: JungleSoundConfig = {
    enabled: true,
    volume: 0.7,
    enableHaptics: true,
    enableVisualFeedback: true,
  };

  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.initAudioContext();
    this.loadSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  private async loadSounds() {
    const sounds = [
      'jungle_success',
      'jungle_error', 
      'jungle_click',
      'jungle_whoosh',
      'jungle_chime',
      'parrot_chirp',
      'monkey_chatter',
      'leaf_rustle',
      'water_drop',
      'magic_sparkle'
    ];

    // For demo purposes, we'll use Web Audio API to generate sounds
    sounds.forEach(sound => {
      this.generateSound(sound);
    });
  }

  private generateSound(soundName: string) {
    if (!this.audioContext) return;

    const sounds: Record<string, () => AudioBuffer> = {
      jungle_success: () => this.createSuccessSound(),
      jungle_error: () => this.createErrorSound(),
      jungle_click: () => this.createClickSound(),
      jungle_whoosh: () => this.createWhooshSound(),
      jungle_chime: () => this.createChimeSound(),
      parrot_chirp: () => this.createChirpSound(),
      monkey_chatter: () => this.createChatterSound(),
      leaf_rustle: () => this.createRustleSound(),
      water_drop: () => this.createWaterDropSound(),
      magic_sparkle: () => this.createSparkleSound(),
    };

    const generator = sounds[soundName];
    if (generator) {
      try {
        const buffer = generator();
        this.soundCache.set(soundName, buffer);
      } catch (error) {
        console.warn(`Failed to generate sound: ${soundName}`, error);
      }
    }
  }

  private createSuccessSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a pleasant ascending chime
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 523.25; // C5
      const frequency2 = 659.25; // E5
      const frequency3 = 783.99; // G5
      
      const envelope = Math.exp(-t * 3);
      const wave1 = Math.sin(2 * Math.PI * frequency1 * t) * envelope * 0.3;
      const wave2 = Math.sin(2 * Math.PI * frequency2 * t) * envelope * 0.3;
      const wave3 = Math.sin(2 * Math.PI * frequency3 * t) * envelope * 0.3;
      
      channelData[i] = wave1 + wave2 + wave3;
    }
    
    return buffer;
  }

  private createErrorSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a gentle "oops" sound
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 220 + Math.sin(t * 10) * 50; // Wobbling frequency
      const envelope = Math.exp(-t * 5);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  }

  private createClickSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a subtle click
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 1000;
      const envelope = Math.exp(-t * 30);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }
    
    return buffer;
  }

  private createWhooshSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a whoosh effect
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + (t / duration) * 800;
      const envelope = Math.sin(Math.PI * t / duration);
      const noise = (Math.random() - 0.5) * 0.1;
      channelData[i] = (Math.sin(2 * Math.PI * frequency * t) + noise) * envelope * 0.2;
    }
    
    return buffer;
  }

  private createChimeSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.8;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a magical chime
    const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C major chord
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      let sample = 0;
      
      frequencies.forEach((freq, index) => {
        const delay = index * 0.1;
        if (t > delay) {
          sample += Math.sin(2 * Math.PI * freq * (t - delay)) * envelope * 0.2;
        }
      });
      
      channelData[i] = sample;
    }
    
    return buffer;
  }

  private createChirpSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create a bird chirp
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 800 + Math.sin(t * 100) * 300;
      const envelope = Math.exp(-t * 8);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  }

  private createChatterSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create monkey chatter
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 300 + Math.random() * 200;
      const envelope = Math.exp(-t * 6) * (Math.random() * 0.5 + 0.5);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.25;
    }
    
    return buffer;
  }

  private createRustleSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create leaf rustle (noise-based)
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4);
      const noise = (Math.random() - 0.5) * 2;
      channelData[i] = noise * envelope * 0.1;
    }
    
    return buffer;
  }

  private createWaterDropSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create water drop
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 1200 * Math.exp(-t * 8);
      const envelope = Math.exp(-t * 12);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  }

  private createSparkleSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not available');
    
    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Create magical sparkle
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 1000 + Math.sin(t * 20) * 500;
      const frequency2 = 1500 + Math.cos(t * 30) * 300;
      const envelope = Math.exp(-t * 5);
      
      const wave1 = Math.sin(2 * Math.PI * frequency1 * t) * envelope * 0.15;
      const wave2 = Math.sin(2 * Math.PI * frequency2 * t) * envelope * 0.15;
      
      channelData[i] = wave1 + wave2;
    }
    
    return buffer;
  }

  /**
   * Play a jungle sound effect
   */
  public playSound(soundName: string, options: { volume?: number; pitch?: number } = {}) {
    if (!this.config.enabled || !this.audioContext) return;

    const buffer = this.soundCache.get(soundName);
    if (!buffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Apply volume
      const volume = (options.volume ?? 1) * this.config.volume;
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      // Apply pitch (playback rate)
      if (options.pitch) {
        source.playbackRate.setValueAtTime(options.pitch, this.audioContext.currentTime);
      }
      
      source.start();
    } catch (error) {
      console.warn(`Failed to play sound: ${soundName}`, error);
    }
  }

  /**
   * Add haptic feedback for supported devices
   */
  public hapticFeedback(pattern: 'light' | 'medium' | 'heavy' | number[]) {
    if (!this.config.enableHaptics || !navigator.vibrate) return;

    const patterns = {
      light: [10],
      medium: [30],
      heavy: [50, 10, 50],
    };

    const vibrationPattern = Array.isArray(pattern) ? pattern : patterns[pattern];
    navigator.vibrate(vibrationPattern);
  }

  /**
   * Create visual micro-interaction feedback
   */
  public visualFeedback(element: HTMLElement, type: 'bounce' | 'pulse' | 'shake' | 'glow') {
    if (!this.config.enableVisualFeedback) return;

    const animations = {
      bounce: 'jungle-bounce 0.6s ease-in-out',
      pulse: 'jungle-glow 0.8s ease-in-out',
      shake: 'gentle-shake 0.5s ease-in-out',
      glow: 'jungle-glow 1s ease-in-out'
    };

    const originalAnimation = element.style.animation;
    element.style.animation = animations[type];
    
    setTimeout(() => {
      element.style.animation = originalAnimation;
    }, 1000);
  }

  /**
   * Update configuration
   */
  public configure(config: Partial<JungleSoundConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): JungleSoundConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const jungleSounds = new JungleSoundSystem();

// Convenience functions for common interactions
export const jungleInteractions = {
  // Button interactions
  buttonClick: (element?: HTMLElement) => {
    jungleSounds.playSound('jungle_click');
    jungleSounds.hapticFeedback('light');
    if (element) jungleSounds.visualFeedback(element, 'bounce');
  },

  buttonHover: () => {
    jungleSounds.playSound('leaf_rustle', { volume: 0.3 });
  },

  // Success interactions
  success: (element?: HTMLElement) => {
    jungleSounds.playSound('jungle_success');
    jungleSounds.hapticFeedback('medium');
    if (element) jungleSounds.visualFeedback(element, 'glow');
  },

  // Error interactions
  error: (element?: HTMLElement) => {
    jungleSounds.playSound('jungle_error');
    jungleSounds.hapticFeedback('heavy');
    if (element) jungleSounds.visualFeedback(element, 'shake');
  },

  // Page transitions
  pageTransition: () => {
    jungleSounds.playSound('jungle_whoosh');
  },

  // Achievement unlocked
  achievement: () => {
    jungleSounds.playSound('jungle_chime');
    jungleSounds.hapticFeedback('heavy');
  },

  // Navigation
  navigation: (element?: HTMLElement) => {
    jungleSounds.playSound('parrot_chirp', { volume: 0.5 });
    jungleSounds.hapticFeedback('light');
    if (element) jungleSounds.visualFeedback(element, 'pulse');
  },

  // Collectible found
  collectible: () => {
    jungleSounds.playSound('magic_sparkle');
    jungleSounds.playSound('water_drop', { volume: 0.6 });
    jungleSounds.hapticFeedback('medium');
  },

  // Mascot interactions
  mascotHappy: () => {
    jungleSounds.playSound('monkey_chatter', { volume: 0.7, pitch: 1.2 });
  },

  mascotEncouraging: () => {
    jungleSounds.playSound('parrot_chirp', { volume: 0.8, pitch: 0.9 });
  }
};
