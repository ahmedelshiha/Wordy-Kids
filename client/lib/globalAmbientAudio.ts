/**
 * Global Ambient Audio Manager
 * Handles ambient jungle sounds throughout the app
 */

// Sound files mapping - must match the settings panel
const AMBIENT_SOUND_FILES = {
  birds: "/sounds/jungle-birds.mp3",
  rain: "/sounds/jungle-rain.mp3", 
  wind: "/sounds/jungle-wind.mp3",
  waterfall: "/sounds/jungle-waterfall.mp3",
  insects: "/sounds/jungle-insects.mp3",
};

export type AmbientSoundType = keyof typeof AMBIENT_SOUND_FILES | "off";

class GlobalAmbientAudioManager {
  private static instance: GlobalAmbientAudioManager;
  private audioElement: HTMLAudioElement | null = null;
  private currentSound: AmbientSoundType = "off";
  private currentVolume: number = 0.35;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GlobalAmbientAudioManager {
    if (!GlobalAmbientAudioManager.instance) {
      GlobalAmbientAudioManager.instance = new GlobalAmbientAudioManager();
    }
    return GlobalAmbientAudioManager.instance;
  }

  /**
   * Initialize the audio manager
   */
  public init(): void {
    if (this.isInitialized) return;

    // Create the global audio element
    this.audioElement = new Audio();
    this.audioElement.loop = true;
    this.audioElement.preload = "auto";

    // Load current settings and apply them
    this.loadSettingsAndApply();
    
    this.isInitialized = true;
    console.log("🌿 Global Ambient Audio Manager initialized");
  }

  /**
   * Load settings from localStorage and apply them
   */
  private loadSettingsAndApply(): void {
    try {
      const settingsStr = localStorage.getItem("jungleAdventureSettings");
      if (settingsStr) {
        const settings = JSON.parse(settingsStr);
        const ambient = settings.ambient || "off";
        const ambientVolume = settings.ambientVolume ?? 0.35;
        
        this.setAmbientSound(ambient, ambientVolume);
      }
    } catch (error) {
      console.warn("Could not load ambient settings:", error);
    }
  }

  /**
   * Set the ambient sound and volume
   */
  public setAmbientSound(sound: AmbientSoundType, volume: number = this.currentVolume): void {
    if (!this.audioElement) {
      console.warn("Audio manager not initialized");
      return;
    }

    this.currentSound = sound;
    this.currentVolume = Math.max(0, Math.min(1, volume));

    if (sound === "off") {
      this.stopAmbientSound();
      return;
    }

    const soundFile = AMBIENT_SOUND_FILES[sound];
    if (!soundFile) {
      console.warn("Unknown ambient sound:", sound);
      return;
    }

    // Set the source if it's different
    const fullPath = location.origin + soundFile;
    if (this.audioElement.src !== fullPath) {
      this.audioElement.src = soundFile;
    }

    // Set volume and play
    this.audioElement.volume = this.currentVolume;
    
    // Play the sound
    this.audioElement.play().catch((error) => {
      console.warn("Could not play ambient sound (this is normal if user hasn't interacted with page yet):", error);
    });

    console.log(`🎵 Playing ambient sound: ${sound} at volume ${Math.round(this.currentVolume * 100)}%`);
  }

  /**
   * Stop ambient sound
   */
  public stopAmbientSound(): void {
    if (!this.audioElement) return;

    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.currentSound = "off";
    
    console.log("🔇 Stopped ambient sound");
  }

  /**
   * Set volume for current ambient sound
   */
  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    
    if (this.audioElement && this.currentSound !== "off") {
      this.audioElement.volume = this.currentVolume;
      console.log(`🔊 Ambient volume set to ${Math.round(this.currentVolume * 100)}%`);
    }
  }

  /**
   * Get current ambient sound
   */
  public getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  /**
   * Get current volume
   */
  public getCurrentVolume(): number {
    return this.currentVolume;
  }

  /**
   * Check if ambient sound is playing
   */
  public isPlaying(): boolean {
    return this.audioElement ? !this.audioElement.paused : false;
  }

  /**
   * Update settings from the settings panel
   */
  public updateFromSettings(ambient: AmbientSoundType, ambientVolume: number): void {
    this.setAmbientSound(ambient, ambientVolume);
  }

  /**
   * Cleanup when needed
   */
  public cleanup(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
      this.audioElement = null;
    }
    this.isInitialized = false;
    console.log("🧹 Global Ambient Audio Manager cleaned up");
  }
}

// Export singleton instance
export const globalAmbientAudio = GlobalAmbientAudioManager.getInstance();

// Auto-initialize when module loads
if (typeof window !== "undefined") {
  // Initialize after a short delay to ensure DOM is ready
  setTimeout(() => {
    globalAmbientAudio.init();
  }, 100);
}
