// Asset Management and Validation System
export class AssetManager {
  private static assetCache = new Map<string, boolean>();
  private static fallbackAudio = "/sounds/owl.mp3"; // Use existing owl sound as fallback

  // Complete asset mapping for your Wordy Kids app
  private static assetMappings: Record<string, string> = {
    // Audio file corrections - map expected names to actual files
    "/sounds/owl-hoot.mp3": "/sounds/owl.mp3",
    "/sounds/parrot-chirp.mp3": "/sounds/RedParot.mp3",
    "/sounds/parrot-sound.mp3": "/sounds/RedParot.mp3",
    "/sounds/monkey-chatter.mp3": "/sounds/Kapuzineraffe.mp3",
    "/sounds/monkey.mp3": "/sounds/Kapuzineraffe.mp3",
    "/sounds/elephant-trumpet.mp3": "/sounds/Elefant.mp3",
    "/sounds/elephant.mp3": "/sounds/Elefant.mp3",
    "/sounds/tiger-roar.mp3": "/sounds/Tiger.mp3",
    "/sounds/lion-roar.mp3": "/sounds/Löwe.mp3",
    "/sounds/bird-chirp.mp3": "/sounds/jungle-birds.mp3",
    "/sounds/gorilla.mp3": "/sounds/Gorilla.mp3",
    "/sounds/leopard.mp3": "/sounds/Leopard.mp3",
    "/sounds/puma.mp3": "/sounds/Puma.mp3",
    "/sounds/zebra.mp3": "/sounds/Zebra.mp3",

    // Add missing sounds with best-match fallbacks
    "/sounds/leaf-rustle.mp3": "/sounds/jungle-wind.mp3",
    "/sounds/water-splash.mp3": "/sounds/jungle-waterfall.mp3",
    "/sounds/wind-blow.mp3": "/sounds/jungle-wind.mp3",
    "/sounds/rain.mp3": "/sounds/jungle-rain.mp3",
    "/sounds/insects.mp3": "/sounds/jungle-insects.mp3",

    // UI sound mappings
    "/sounds/settings-open.mp3": "/sounds/ui/settings-saved.mp3",
    "/sounds/settings-close.mp3": "/sounds/ui/settings-reset.mp3",
    "/sounds/voice-preview.mp3": "/sounds/ui/voice-preview.mp3",

    // Image mappings
    "/images/screenshot-wide.png": "/images/Wordy Jungle Adventure Logo.png",
    "/images/missing-icon.png": "/images/Wordy Jungle Adventure Logo.png",
    "/images/app-preview.png": "/images/Wordy Jungle Adventure Logo.png",
    "/images/default-icon.png": "/favicon.svg",
  };

  // Animal character sound mappings for thematic consistency
  private static animalSounds: Record<string, string> = {
    owl: "/sounds/owl.mp3",
    parrot: "/sounds/RedParot.mp3",
    monkey: "/sounds/Kapuzineraffe.mp3",
    elephant: "/sounds/Elefant.mp3",
    tiger: "/sounds/Tiger.mp3",
    lion: "/sounds/Löwe.mp3",
    gorilla: "/sounds/Gorilla.mp3",
    leopard: "/sounds/Leopard.mp3",
    zebra: "/sounds/Zebra.mp3",
    cat: "/sounds/cat.mp3",
    dog: "/sounds/doq.mp3",
    horse: "/sounds/horse.mp3",
    cow: "/sounds/bull.mp3",
    pig: "/sounds/pig.mp3",
    duck: "/sounds/duck.mp3",
    rooster: "/sounds/rooster.mp3",
  };

  // Validate if asset exists
  static async validateAsset(assetPath: string): Promise<boolean> {
    if (this.assetCache.has(assetPath)) {
      return this.assetCache.get(assetPath)!;
    }

    try {
      // Use fetch with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(assetPath, {
        method: "HEAD",
        signal: controller.signal,
        cache: 'no-cache'
      });

      clearTimeout(timeoutId);
      const exists = response.ok;
      this.assetCache.set(assetPath, exists);
      return exists;
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`Asset validation timeout for ${assetPath}`);
        } else if (error.message.includes('Failed to fetch')) {
          console.warn(`Network error validating asset ${assetPath} - assuming exists for development`);
          // In development, assume assets exist to prevent blocking
          this.assetCache.set(assetPath, true);
          return true;
        } else {
          console.warn(`Asset validation failed for ${assetPath}:`, error.message);
        }
      }
      this.assetCache.set(assetPath, false);
      return false;
    }
  }

  // Get correct asset path with fallback
  static async getAssetPath(requestedPath: string): Promise<string> {
    // Normalize path (remove leading slash for consistent comparison)
    const normalizedPath = requestedPath.startsWith("/")
      ? requestedPath
      : "/" + requestedPath;

    // Check if we have a known mapping
    if (this.assetMappings[normalizedPath]) {
      const mappedPath = this.assetMappings[normalizedPath];
      const exists = await this.validateAsset(mappedPath);
      if (exists) {
        console.log(`✅ Asset mapped: ${normalizedPath} → ${mappedPath}`);
        return mappedPath;
      }
    }

    // Check if original path exists
    const originalExists = await this.validateAsset(normalizedPath);
    if (originalExists) {
      return normalizedPath;
    }

    // Return appropriate fallback
    const fallback = normalizedPath.includes("/sounds/")
      ? this.fallbackAudio
      : "/favicon.svg";

    console.warn(
      `⚠️ Asset missing: ${normalizedPath}, using fallback: ${fallback}`,
    );
    return fallback;
  }

  // Get animal sound by character name
  static getAnimalSound(animalName: string): string {
    const normalizedName = animalName.toLowerCase().trim();
    return this.animalSounds[normalizedName] || this.fallbackAudio;
  }

  // Batch validate all assets
  static async validateAllAssets(): Promise<{
    missing: string[];
    found: string[];
    mappings: Record<string, string>;
  }> {
    const allAssets = [
      // Core animal sounds
      "/sounds/owl.mp3",
      "/sounds/RedParot.mp3",
      "/sounds/Kapuzineraffe.mp3",
      "/sounds/Elefant.mp3",
      "/sounds/Tiger.mp3",
      "/sounds/Löwe.mp3",
      "/sounds/Gorilla.mp3",

      // UI sounds
      "/sounds/ui/settings-saved.mp3",
      "/sounds/ui/settings-reset.mp3",
      "/sounds/ui/voice-preview.mp3",

      // Ambient jungle sounds
      "/sounds/jungle-birds.mp3",
      "/sounds/jungle-insects.mp3",
      "/sounds/jungle-rain.mp3",
      "/sounds/jungle-waterfall.mp3",
      "/sounds/jungle-wind.mp3",

      // Common requested assets that might be missing
      "/sounds/owl-hoot.mp3",
      "/sounds/parrot-chirp.mp3",
      "/sounds/leaf-rustle.mp3",
      "/sounds/monkey-chatter.mp3",
      "/sounds/elephant-trumpet.mp3",

      // Image assets
      "/images/Wordy Jungle Adventure Logo.png",
      "/images/screenshot-wide.png",
      "/images/app-preview.png",
      "/favicon.svg",
    ];

    const missing: string[] = [];
    const found: string[] = [];
    const mappings: Record<string, string> = {};

    for (const asset of allAssets) {
      const correctedPath = await this.getAssetPath(asset);

      if (correctedPath !== asset) {
        mappings[asset] = correctedPath;
      }

      const exists = await this.validateAsset(correctedPath);
      if (exists) {
        found.push(asset);
      } else {
        missing.push(asset);
      }
    }

    return { missing, found, mappings };
  }

  // Preload critical assets
  static async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      "/sounds/owl.mp3",
      "/sounds/RedParot.mp3",
      "/sounds/ui/settings-saved.mp3",
      "/sounds/jungle-birds.mp3",
    ];

    const preloadPromises = criticalAssets.map(async (assetPath) => {
      try {
        const correctedPath = await this.getAssetPath(assetPath);

        // Add timeout for preloading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for preload

        const response = await fetch(correctedPath, {
          signal: controller.signal,
          cache: 'force-cache'
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log(`✅ Preloaded: ${assetPath}`);
        } else {
          console.warn(`⚠️ Failed to preload (${response.status}): ${assetPath}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`⏰ Preload timeout: ${assetPath}`);
        } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn(`🌐 Network error preloading: ${assetPath}`);
        } else {
          console.warn(`⚠️ Failed to preload: ${assetPath}`, error);
        }
      }
    });

    await Promise.all(preloadPromises);
    console.log("🎵 Critical assets preloaded");
  }
}

// Enhanced Audio Manager with fallback support
export class AudioManager {
  private static audioCache = new Map<string, HTMLAudioElement>();
  private static loadingPromises = new Map<string, Promise<HTMLAudioElement>>();
  private static isEnabled = true;

  // Audio settings
  static setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  static isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  static async loadAudio(audioPath: string): Promise<HTMLAudioElement> {
    if (!this.isEnabled) {
      throw new Error("Audio is disabled");
    }

    // Check cache first
    if (this.audioCache.has(audioPath)) {
      return this.audioCache.get(audioPath)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(audioPath)) {
      return this.loadingPromises.get(audioPath)!;
    }

    // Get correct asset path
    const correctedPath = await AssetManager.getAssetPath(audioPath);

    const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
      const audio = new Audio();

      audio.addEventListener(
        "canplaythrough",
        () => {
          this.audioCache.set(audioPath, audio);
          this.loadingPromises.delete(audioPath);
          resolve(audio);
        },
        { once: true },
      );

      audio.addEventListener(
        "error",
        (e) => {
          console.error(`Failed to load audio: ${correctedPath}`, e);
          this.loadingPromises.delete(audioPath);

          // Try fallback audio if not already using fallback
          if (correctedPath !== AssetManager["fallbackAudio"]) {
            const fallbackAudio = new Audio(AssetManager["fallbackAudio"]);
            fallbackAudio.addEventListener(
              "canplaythrough",
              () => {
                this.audioCache.set(audioPath, fallbackAudio);
                resolve(fallbackAudio);
              },
              { once: true },
            );
            fallbackAudio.addEventListener("error", () => reject(e), {
              once: true,
            });
            fallbackAudio.load();
          } else {
            reject(e);
          }
        },
        { once: true },
      );

      audio.src = correctedPath;
      audio.preload = "metadata";
      audio.load();
    });

    this.loadingPromises.set(audioPath, loadPromise);
    return loadPromise;
  }

  static async playAudio(
    audioPath: string,
    options: {
      volume?: number;
      loop?: boolean;
      fadeIn?: boolean;
    } = {},
  ): Promise<void> {
    if (!this.isEnabled) {
      console.log("Audio playback disabled");
      return;
    }

    try {
      const audio = await this.loadAudio(audioPath);

      // Set audio properties
      audio.volume = Math.max(0, Math.min(1, options.volume ?? 0.7));
      audio.loop = options.loop ?? false;

      // Reset to beginning
      audio.currentTime = 0;

      // Fade in effect
      if (options.fadeIn) {
        audio.volume = 0;
        const targetVolume = options.volume ?? 0.7;
        const fadeSteps = 20;
        const fadeInterval = 50;

        let currentStep = 0;
        const fadeTimer = setInterval(() => {
          currentStep++;
          audio.volume = (targetVolume * currentStep) / fadeSteps;

          if (currentStep >= fadeSteps) {
            clearInterval(fadeTimer);
          }
        }, fadeInterval);
      }

      await audio.play();
    } catch (error) {
      console.warn(`Could not play audio: ${audioPath}`, error);
    }
  }

  // Play animal sound by character name
  static async playAnimalSound(
    animalName: string,
    volume: number = 0.7,
  ): Promise<void> {
    const soundPath = AssetManager.getAnimalSound(animalName);
    await this.playAudio(soundPath, { volume });
  }

  // Preload commonly used sounds
  static async preloadCommonSounds(): Promise<void> {
    const commonSounds = [
      "/sounds/owl-hoot.mp3",
      "/sounds/parrot-chirp.mp3",
      "/sounds/monkey-chatter.mp3",
      "/sounds/ui/settings-saved.mp3",
      "/sounds/ui/settings-reset.mp3",
      "/sounds/jungle-birds.mp3",
    ];

    const loadPromises = commonSounds.map((sound) =>
      this.loadAudio(sound).catch((error) =>
        console.warn(`Failed to preload ${sound}:`, error),
      ),
    );

    await Promise.all(loadPromises);
    console.log("✅ Common sounds preloaded");
  }

  // Stop all playing audio
  static stopAllAudio(): void {
    this.audioCache.forEach((audio) => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  // Clean up audio resources
  static cleanup(): void {
    this.stopAllAudio();
    this.audioCache.clear();
    this.loadingPromises.clear();
  }
}

// Convenient audio helpers for educational features
export class EducationalAudioHelper {
  // Play success sound for correct answers
  static async playSuccess(): Promise<void> {
    await AudioManager.playAudio("/sounds/jungle-birds.mp3", { volume: 0.5 });
  }

  // Play encouragement sound for wrong answers
  static async playEncouragement(): Promise<void> {
    await AudioManager.playAnimalSound("owl", 0.6);
  }

  // Play UI interaction sound
  static async playUISound(
    soundType: "open" | "close" | "click" = "click",
  ): Promise<void> {
    const soundMap = {
      open: "/sounds/ui/settings-saved.mp3",
      close: "/sounds/ui/settings-reset.mp3",
      click: "/sounds/ui/voice-preview.mp3",
    };

    await AudioManager.playAudio(soundMap[soundType], { volume: 0.4 });
  }

  // Play ambient jungle sounds
  static async playAmbientSound(fadeIn: boolean = true): Promise<void> {
    await AudioManager.playAudio("/sounds/jungle-birds.mp3", {
      volume: 0.3,
      loop: true,
      fadeIn,
    });
  }

  // Stop ambient sounds
  static stopAmbientSounds(): void {
    AudioManager.stopAllAudio();
  }
}
