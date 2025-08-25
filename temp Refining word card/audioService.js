// Audio service for Jungle Word Adventure
// Handles word pronunciation, sound effects, and background music

class AudioService {
  constructor() {
    this.soundEnabled = true;
    this.musicEnabled = true;
    this.currentMusic = null;
    this.soundEffects = new Map();
    this.speechRate = 0.8;
    this.speechPitch = 1.2;
    this.speechVolume = 1.0;
  }

  // Enable/disable sound
  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    if (!enabled && this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  // Enable/disable background music
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled && this.currentMusic) {
      this.currentMusic.pause();
    } else if (enabled && this.currentMusic) {
      this.currentMusic.play();
    }
  }

  // Pronounce a word using speech synthesis
  pronounceWord(word, options = {}) {
    if (!this.soundEnabled) return;

    const {
      rate = this.speechRate,
      pitch = this.speechPitch,
      volume = this.speechVolume,
      customText = null
    } = options;

    // Use custom text if provided (for fun sounds), otherwise use the word
    const textToSpeak = customText || word;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Try to use a child-friendly voice if available
    const voices = speechSynthesis.getVoices();
    const childFriendlyVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Microsoft') ||
      voice.lang.startsWith('en')
    );
    
    if (childFriendlyVoice) {
      utterance.voice = childFriendlyVoice;
    }

    speechSynthesis.speak(utterance);
    return utterance;
  }

  // Play sound effects
  playSound(soundType) {
    if (!this.soundEnabled) return;

    // Create audio context for better control
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    switch (soundType) {
      case 'correct':
        this.playTone(audioContext, 523.25, 0.2, 'sine'); // C5 note
        break;
      case 'incorrect':
        this.playTone(audioContext, 220, 0.3, 'sawtooth'); // A3 note
        break;
      case 'click':
        this.playTone(audioContext, 800, 0.1, 'square');
        break;
      case 'whoosh':
        this.playWhoosh(audioContext);
        break;
      case 'sparkle':
        this.playSparkle(audioContext);
        break;
      case 'celebration':
        this.playCelebration(audioContext);
        break;
      case 'gem_collect':
        this.playGemCollect(audioContext);
        break;
      default:
        this.playTone(audioContext, 440, 0.1, 'sine');
    }
  }

  // Play a simple tone
  playTone(audioContext, frequency, duration, waveType = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }

  // Play whoosh sound for navigation
  playWhoosh(audioContext) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  // Play sparkle sound for rewards
  playSparkle(audioContext) {
    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(audioContext, freq, 0.2, 'sine');
      }, index * 100);
    });
  }

  // Play celebration sound
  playCelebration(audioContext) {
    const melody = [
      { freq: 523.25, duration: 0.2 }, // C5
      { freq: 659.25, duration: 0.2 }, // E5
      { freq: 783.99, duration: 0.2 }, // G5
      { freq: 1046.50, duration: 0.4 } // C6
    ];

    let currentTime = 0;
    melody.forEach(note => {
      setTimeout(() => {
        this.playTone(audioContext, note.freq, note.duration, 'sine');
      }, currentTime * 1000);
      currentTime += note.duration;
    });
  }

  // Play gem collection sound
  playGemCollect(audioContext) {
    // Play ascending notes quickly
    const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(audioContext, freq, 0.15, 'triangle');
      }, index * 50);
    });
  }

  // Play background jungle sounds (ambient)
  playBackgroundMusic() {
    if (!this.musicEnabled || !this.soundEnabled) return;

    // This would typically load an actual audio file
    // For now, we'll create a simple ambient tone
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a very subtle, low-frequency ambient sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(110, audioContext.currentTime); // A2
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Very quiet

    oscillator.start();
    
    // Store reference to stop later
    this.currentMusic = {
      oscillator,
      gainNode,
      pause: () => {
        try {
          oscillator.stop();
        } catch (e) {
          // Already stopped
        }
      },
      play: () => {
        // Would restart the music
        this.playBackgroundMusic();
      }
    };
  }

  // Stop background music
  stopBackgroundMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  // Haptic feedback (if supported)
  vibrate(pattern = [100]) {
    if ('vibrate' in navigator && this.soundEnabled) {
      navigator.vibrate(pattern);
    }
  }

  // Play word sound effect (from word data)
  playWordSound(wordData) {
    if (!this.soundEnabled || !wordData.sound) return;

    this.pronounceWord(wordData.sound, {
      rate: 0.9,
      pitch: 1.3,
      customText: wordData.sound
    });
  }

  // Cleanup
  destroy() {
    this.stopBackgroundMusic();
    speechSynthesis.cancel();
  }
}

// Create and export a singleton instance
export const audioService = new AudioService();

// Initialize voices when they're loaded
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    // Voices are now loaded
  };
}

export default audioService;

