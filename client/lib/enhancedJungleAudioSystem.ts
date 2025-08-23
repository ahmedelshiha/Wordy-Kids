// =====================================================
// ENHANCED JUNGLE AUDIO SYSTEM - 3D SPATIAL AUDIO
// =====================================================

interface AudioNode3D {
  id: string;
  source: AudioBufferSourceNode | null;
  panner: PannerNode | null;
  gain: GainNode | null;
  position: { x: number; y: number; z: number };
  isPlaying: boolean;
  volume: number;
  loop: boolean;
  buffer: AudioBuffer | null;
}

interface SpatialAudioConfig {
  maxDistance: number;
  rolloffFactor: number;
  coneInnerAngle: number;
  coneOuterAngle: number;
  coneOuterGain: number;
  distanceModel: DistanceModelType;
  panningModel: PanningModelType;
}

interface DynamicMusicLayer {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  intensity: number; // 0-1
  category: "ambient" | "action" | "success" | "tension" | "exploration";
  fadeInDuration: number;
  fadeOutDuration: number;
  isActive: boolean;
  gainNode: GainNode | null;
  sourceNode: AudioBufferSourceNode | null;
}

interface JungleSoundscape {
  id: string;
  name: string;
  layers: string[]; // Layer IDs
  timeOfDay: "morning" | "midday" | "evening" | "night";
  weatherCondition: "sunny" | "rainy" | "misty" | "stormy";
  intensity: number;
}

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  enable3D: boolean;
  enableDynamicMusic: boolean;
  enableAmbientSounds: boolean;
  enableVoiceEffects: boolean;
  audioQuality: "low" | "medium" | "high";
}

export class EnhancedJungleAudioSystem {
  private audioContext: AudioContext | null = null;
  private listenerPosition = { x: 0, y: 0, z: 0 };
  private listenerOrientation = { x: 0, y: 0, z: -1 };

  // Audio nodes and systems
  private spatialNodes = new Map<string, AudioNode3D>();
  private musicLayers = new Map<string, DynamicMusicLayer>();
  private soundscapes = new Map<string, JungleSoundscape>();

  // Audio buffers cache
  private audioBuffers = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer>>();

  // Master audio nodes
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // State
  private currentSoundscape: string | null = null;
  private currentMusicIntensity = 0.5;
  private isInitialized = false;
  private settings: AudioSettings;

  // 3D Audio configuration
  private spatialConfig: SpatialAudioConfig = {
    maxDistance: 50,
    rolloffFactor: 2,
    coneInnerAngle: 360,
    coneOuterAngle: 0,
    coneOuterGain: 0,
    distanceModel: "exponential",
    panningModel: "HRTF",
  };

  // Voice synthesis for enhanced pronunciation
  private speechSynthesis: SpeechSynthesis | null = null;
  private voiceSettings = {
    rate: 0.8,
    pitch: 1.1,
    volume: 0.9,
    voice: null as SpeechSynthesisVoice | null,
  };

  constructor() {
    this.settings = {
      masterVolume: 0.7,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      voiceVolume: 0.9,
      ambientVolume: 0.4,
      enable3D: true,
      enableDynamicMusic: true,
      enableAmbientSounds: true,
      enableVoiceEffects: true,
      audioQuality: "high",
    };

    this.initializeSpeechSynthesis();
    this.initializeAudioAssets();
  }

  // =====================================================
  // INITIALIZATION
  // =====================================================

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Resume context if suspended (Chrome autoplay policy)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Create master audio nodes
      this.createMasterAudioNodes();

      // Load audio assets
      await this.loadAudioAssets();

      // Initialize music layers
      this.initializeMusicLayers();

      // Initialize soundscapes
      this.initializeSoundscapes();

      this.isInitialized = true;
      console.log("Enhanced Jungle Audio System initialized successfully");
    } catch (error) {
      console.error(
        "Failed to initialize Enhanced Jungle Audio System:",
        error,
      );
      // Fallback to basic audio
      this.initializeFallbackAudio();
    }
  }

  private createMasterAudioNodes(): void {
    if (!this.audioContext) return;

    // Create master gain nodes
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.voiceGain = this.audioContext.createGain();
    this.ambientGain = this.audioContext.createGain();

    // Connect to destination
    this.masterGain.connect(this.audioContext.destination);

    // Connect category gains to master
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.voiceGain.connect(this.masterGain);
    this.ambientGain.connect(this.masterGain);

    // Set initial volumes
    this.updateVolumes();
  }

  private initializeSpeechSynthesis(): void {
    if ("speechSynthesis" in window) {
      this.speechSynthesis = window.speechSynthesis;

      // Find the best voice for children's content
      const loadVoices = () => {
        const voices = this.speechSynthesis!.getVoices();

        // Prefer child-friendly voices
        const preferredVoices = voices.filter(
          (voice) =>
            voice.name.toLowerCase().includes("child") ||
            voice.name.toLowerCase().includes("kid") ||
            voice.name.toLowerCase().includes("young") ||
            (voice.gender === "female" && voice.lang.startsWith("en")),
        );

        if (preferredVoices.length > 0) {
          this.voiceSettings.voice = preferredVoices[0];
        } else if (voices.length > 0) {
          // Fallback to first available voice
          this.voiceSettings.voice =
            voices.find((v) => v.lang.startsWith("en")) || voices[0];
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Also listen for voice loading event
      this.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    }
  }

  // =====================================================
  // AUDIO ASSET MANAGEMENT
  // =====================================================

  private initializeAudioAssets(): void {
    // Define audio asset URLs (you would replace these with actual asset URLs)
    const audioAssets = {
      // Jungle ambient sounds
      "jungle-ambient-morning": "/audio/jungle/morning-ambient.mp3",
      "jungle-ambient-midday": "/audio/jungle/midday-ambient.mp3",
      "jungle-ambient-evening": "/audio/jungle/evening-ambient.mp3",
      "jungle-ambient-night": "/audio/jungle/night-ambient.mp3",

      // Jungle creature sounds (positioned in 3D space)
      "monkey-chatter": "/audio/creatures/monkey-chatter.mp3",
      "bird-calls": "/audio/creatures/tropical-birds.mp3",
      "insect-buzz": "/audio/creatures/jungle-insects.mp3",
      "water-flow": "/audio/nature/jungle-stream.mp3",
      "wind-rustle": "/audio/nature/leaf-rustle.mp3",

      // Music layers
      "music-exploration": "/audio/music/jungle-exploration.mp3",
      "music-discovery": "/audio/music/treasure-discovery.mp3",
      "music-success": "/audio/music/victory-celebration.mp3",
      "music-tension": "/audio/music/quiz-tension.mp3",
      "music-ambient": "/audio/music/peaceful-jungle.mp3",

      // Game sound effects
      "treasure-found": "/audio/sfx/treasure-chest-open.mp3",
      "correct-answer": "/audio/sfx/magical-chime.mp3",
      "wrong-answer": "/audio/sfx/gentle-error.mp3",
      "power-up-use": "/audio/sfx/power-up-activate.mp3",
      "level-up": "/audio/sfx/level-up-fanfare.mp3",
      "achievement-unlock": "/audio/sfx/achievement-bell.mp3",
      "card-flip": "/audio/sfx/leaf-rustle-card.mp3",
      "ui-click": "/audio/sfx/bamboo-click.mp3",
      "streak-bonus": "/audio/sfx/fire-whoosh.mp3",
      "gem-collect": "/audio/sfx/gem-pickup.mp3",

      // Voice pronunciation effects
      "voice-echo": "/audio/voice/jungle-echo.mp3",
      "voice-magic": "/audio/voice/magical-voice.mp3",
    };

    // Store asset definitions
    Object.entries(audioAssets).forEach(([id, url]) => {
      // We'll load these on-demand or preload based on priority
    });
  }

  private async loadAudioAssets(): Promise<void> {
    // Load high-priority assets immediately
    const highPriorityAssets = [
      "correct-answer",
      "wrong-answer",
      "ui-click",
      "card-flip",
      "treasure-found",
    ];

    const loadPromises = highPriorityAssets.map((assetId) =>
      this.loadAudioBuffer(assetId),
    );

    try {
      await Promise.all(loadPromises);
      console.log("High-priority audio assets loaded");
    } catch (error) {
      console.warn("Failed to load some audio assets:", error);
    }

    // Load ambient and music assets in background
    this.loadBackgroundAssets();
  }

  private async loadBackgroundAssets(): Promise<void> {
    const backgroundAssets = [
      "jungle-ambient-morning",
      "jungle-ambient-midday",
      "music-exploration",
      "music-ambient",
      "monkey-chatter",
      "bird-calls",
    ];

    // Load with lower priority
    for (const assetId of backgroundAssets) {
      try {
        await this.loadAudioBuffer(assetId);
        // Small delay to prevent blocking
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to load background asset ${assetId}:`, error);
      }
    }
  }

  private async loadAudioBuffer(assetId: string): Promise<AudioBuffer> {
    // Check if already loaded
    if (this.audioBuffers.has(assetId)) {
      return this.audioBuffers.get(assetId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(assetId)) {
      return this.loadingPromises.get(assetId)!;
    }

    // Create loading promise
    const loadPromise = this.fetchAndDecodeAudio(assetId);
    this.loadingPromises.set(assetId, loadPromise);

    try {
      const buffer = await loadPromise;
      this.audioBuffers.set(assetId, buffer);
      this.loadingPromises.delete(assetId);
      return buffer;
    } catch (error) {
      this.loadingPromises.delete(assetId);
      throw error;
    }
  }

  private async fetchAndDecodeAudio(assetId: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized");
    }

    // For demo purposes, create a synthetic audio buffer
    // In a real implementation, you would fetch the actual audio file
    const buffer = this.audioContext.createBuffer(
      2,
      this.audioContext.sampleRate * 0.5,
      this.audioContext.sampleRate,
    );

    // Generate some basic tones for different sound types
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);

      for (let i = 0; i < channelData.length; i++) {
        // Generate different tones based on asset type
        let frequency = 440; // Default A note

        if (assetId.includes("correct"))
          frequency = 523; // C note
        else if (assetId.includes("wrong"))
          frequency = 349; // F note
        else if (assetId.includes("treasure"))
          frequency = 659; // E note
        else if (assetId.includes("click"))
          frequency = 800; // Higher click
        else if (assetId.includes("ambient")) frequency = 220; // Lower ambient

        const time = i / this.audioContext.sampleRate;
        channelData[i] =
          Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 2) * 0.1; // Decay envelope
      }
    }

    return buffer;
  }

  // =====================================================
  // 3D SPATIAL AUDIO
  // =====================================================

  public create3DAudioNode(
    id: string,
    position: { x: number; y: number; z: number },
    config?: Partial<SpatialAudioConfig>,
  ): AudioNode3D | null {
    if (!this.audioContext || !this.settings.enable3D) return null;

    try {
      const panner = this.audioContext.createPanner();
      const gain = this.audioContext.createGain();

      // Apply 3D configuration
      const finalConfig = { ...this.spatialConfig, ...config };

      panner.distanceModel = finalConfig.distanceModel;
      panner.panningModel = finalConfig.panningModel;
      panner.maxDistance = finalConfig.maxDistance;
      panner.rolloffFactor = finalConfig.rolloffFactor;
      panner.coneInnerAngle = finalConfig.coneInnerAngle;
      panner.coneOuterAngle = finalConfig.coneOuterAngle;
      panner.coneOuterGain = finalConfig.coneOuterGain;

      // Set position
      panner.positionX.setValueAtTime(
        position.x,
        this.audioContext.currentTime,
      );
      panner.positionY.setValueAtTime(
        position.y,
        this.audioContext.currentTime,
      );
      panner.positionZ.setValueAtTime(
        position.z,
        this.audioContext.currentTime,
      );

      // Connect nodes
      panner.connect(gain);
      gain.connect(this.ambientGain!);

      const audioNode: AudioNode3D = {
        id,
        source: null,
        panner,
        gain,
        position,
        isPlaying: false,
        volume: 1,
        loop: false,
        buffer: null,
      };

      this.spatialNodes.set(id, audioNode);
      return audioNode;
    } catch (error) {
      console.error("Failed to create 3D audio node:", error);
      return null;
    }
  }

  public play3DSound(
    nodeId: string,
    audioBufferId: string,
    options?: {
      loop?: boolean;
      volume?: number;
      fadeIn?: number;
    },
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const node = this.spatialNodes.get(nodeId);
        if (!node || !this.audioContext) {
          reject(
            new Error("3D audio node not found or audio context not available"),
          );
          return;
        }

        // Load audio buffer if needed
        const buffer = await this.loadAudioBuffer(audioBufferId);

        // Stop current playback if any
        if (node.source) {
          node.source.stop();
        }

        // Create new source
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = options?.loop || false;

        // Connect to panner
        source.connect(node.panner!);

        // Set volume
        const volume = options?.volume || node.volume;
        node.gain!.gain.setValueAtTime(volume, this.audioContext.currentTime);

        // Fade in if requested
        if (options?.fadeIn) {
          node.gain!.gain.setValueAtTime(0, this.audioContext.currentTime);
          node.gain!.gain.linearRampToValueAtTime(
            volume,
            this.audioContext.currentTime + options.fadeIn,
          );
        }

        // Update node state
        node.source = source;
        node.buffer = buffer;
        node.isPlaying = true;
        node.loop = source.loop;
        node.volume = volume;

        // Handle playback end
        source.addEventListener("ended", () => {
          node.isPlaying = false;
          node.source = null;
          resolve();
        });

        // Start playback
        source.start();

        if (!options?.fadeIn) {
          resolve();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  public updateListenerPosition(position: {
    x: number;
    y: number;
    z: number;
  }): void {
    if (!this.audioContext || !this.settings.enable3D) return;

    this.listenerPosition = position;

    const listener = this.audioContext.listener;
    if (listener.positionX) {
      listener.positionX.setValueAtTime(
        position.x,
        this.audioContext.currentTime,
      );
      listener.positionY.setValueAtTime(
        position.y,
        this.audioContext.currentTime,
      );
      listener.positionZ.setValueAtTime(
        position.z,
        this.audioContext.currentTime,
      );
    }
  }

  public updateListenerOrientation(
    forward: { x: number; y: number; z: number },
    up: { x: number; y: number; z: number } = { x: 0, y: 1, z: 0 },
  ): void {
    if (!this.audioContext || !this.settings.enable3D) return;

    this.listenerOrientation = forward;

    const listener = this.audioContext.listener;
    if (listener.forwardX) {
      listener.forwardX.setValueAtTime(
        forward.x,
        this.audioContext.currentTime,
      );
      listener.forwardY.setValueAtTime(
        forward.y,
        this.audioContext.currentTime,
      );
      listener.forwardZ.setValueAtTime(
        forward.z,
        this.audioContext.currentTime,
      );
      listener.upX.setValueAtTime(up.x, this.audioContext.currentTime);
      listener.upY.setValueAtTime(up.y, this.audioContext.currentTime);
      listener.upZ.setValueAtTime(up.z, this.audioContext.currentTime);
    }
  }

  // =====================================================
  // DYNAMIC MUSIC SYSTEM
  // =====================================================

  private initializeMusicLayers(): void {
    const musicLayerConfigs = [
      {
        id: "ambient-base",
        name: "Jungle Ambient Base",
        category: "ambient" as const,
        intensity: 0.3,
        fadeInDuration: 2,
        fadeOutDuration: 3,
      },
      {
        id: "exploration-melody",
        name: "Exploration Melody",
        category: "exploration" as const,
        intensity: 0.6,
        fadeInDuration: 1.5,
        fadeOutDuration: 2,
      },
      {
        id: "discovery-excitement",
        name: "Discovery Excitement",
        category: "success" as const,
        intensity: 0.8,
        fadeInDuration: 0.5,
        fadeOutDuration: 1,
      },
      {
        id: "quiz-tension",
        name: "Quiz Tension",
        category: "tension" as const,
        intensity: 0.7,
        fadeInDuration: 1,
        fadeOutDuration: 1.5,
      },
      {
        id: "action-sequence",
        name: "Action Sequence",
        category: "action" as const,
        intensity: 0.9,
        fadeInDuration: 0.3,
        fadeOutDuration: 0.8,
      },
    ];

    musicLayerConfigs.forEach((config) => {
      const layer: DynamicMusicLayer = {
        ...config,
        audioBuffer: null,
        isActive: false,
        gainNode: null,
        sourceNode: null,
      };

      this.musicLayers.set(config.id, layer);
    });
  }

  public async setMusicIntensity(
    intensity: number,
    category?: "ambient" | "action" | "success" | "tension" | "exploration",
  ): Promise<void> {
    if (!this.settings.enableDynamicMusic) return;

    this.currentMusicIntensity = Math.max(0, Math.min(1, intensity));

    // Determine which layers should be active
    const targetLayers = Array.from(this.musicLayers.values()).filter(
      (layer) => {
        if (category && layer.category !== category) return false;
        return layer.intensity <= this.currentMusicIntensity;
      },
    );

    // Fade out inactive layers
    for (const [id, layer] of this.musicLayers) {
      if (!targetLayers.includes(layer) && layer.isActive) {
        await this.fadeOutMusicLayer(id);
      }
    }

    // Fade in active layers
    for (const layer of targetLayers) {
      if (!layer.isActive) {
        await this.fadeInMusicLayer(layer.id);
      }
    }
  }

  private async fadeInMusicLayer(layerId: string): Promise<void> {
    const layer = this.musicLayers.get(layerId);
    if (!layer || !this.audioContext) return;

    try {
      // Load audio buffer if needed
      if (!layer.audioBuffer) {
        layer.audioBuffer = await this.loadAudioBuffer(`music-${layerId}`);
      }

      // Create audio nodes
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();

      source.buffer = layer.audioBuffer;
      source.loop = true;

      // Connect nodes
      source.connect(gain);
      gain.connect(this.musicGain!);

      // Set up fade in
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(
        layer.intensity * this.settings.musicVolume,
        this.audioContext.currentTime + layer.fadeInDuration,
      );

      // Update layer state
      layer.sourceNode = source;
      layer.gainNode = gain;
      layer.isActive = true;

      // Start playback
      source.start();

      // Handle unexpected end
      source.addEventListener("ended", () => {
        layer.isActive = false;
        layer.sourceNode = null;
        layer.gainNode = null;
      });
    } catch (error) {
      console.error(`Failed to fade in music layer ${layerId}:`, error);
    }
  }

  private async fadeOutMusicLayer(layerId: string): Promise<void> {
    const layer = this.musicLayers.get(layerId);
    if (!layer || !layer.isActive || !this.audioContext) return;

    try {
      if (layer.gainNode) {
        // Fade out
        layer.gainNode.gain.linearRampToValueAtTime(
          0,
          this.audioContext.currentTime + layer.fadeOutDuration,
        );

        // Stop source after fade out
        setTimeout(() => {
          if (layer.sourceNode) {
            layer.sourceNode.stop();
          }
          layer.isActive = false;
          layer.sourceNode = null;
          layer.gainNode = null;
        }, layer.fadeOutDuration * 1000);
      }
    } catch (error) {
      console.error(`Failed to fade out music layer ${layerId}:`, error);
    }
  }

  // =====================================================
  // JUNGLE SOUNDSCAPES
  // =====================================================

  private initializeSoundscapes(): void {
    const soundscapeConfigs: JungleSoundscape[] = [
      {
        id: "morning-jungle",
        name: "Morning Jungle",
        layers: ["bird-calls", "gentle-breeze", "distant-water"],
        timeOfDay: "morning",
        weatherCondition: "sunny",
        intensity: 0.6,
      },
      {
        id: "midday-adventure",
        name: "Midday Adventure",
        layers: ["monkey-chatter", "insect-buzz", "leaf-rustle"],
        timeOfDay: "midday",
        weatherCondition: "sunny",
        intensity: 0.8,
      },
      {
        id: "evening-mystery",
        name: "Evening Mystery",
        layers: ["owl-hoots", "cricket-chorus", "wind-whispers"],
        timeOfDay: "evening",
        weatherCondition: "misty",
        intensity: 0.5,
      },
      {
        id: "night-magic",
        name: "Night Magic",
        layers: ["nocturnal-calls", "gentle-rain", "mystical-sounds"],
        timeOfDay: "night",
        weatherCondition: "rainy",
        intensity: 0.4,
      },
    ];

    soundscapeConfigs.forEach((config) => {
      this.soundscapes.set(config.id, config);
    });
  }

  public async activateSoundscape(soundscapeId: string): Promise<void> {
    if (!this.settings.enableAmbientSounds) return;

    const soundscape = this.soundscapes.get(soundscapeId);
    if (!soundscape) return;

    // Deactivate current soundscape
    if (this.currentSoundscape) {
      await this.deactivateSoundscape();
    }

    // Create 3D positioned ambient sounds
    const positions = [
      { x: -10, y: 0, z: 5 }, // Left side
      { x: 10, y: 0, z: 5 }, // Right side
      { x: 0, y: 5, z: -10 }, // Behind and above
      { x: 0, y: -2, z: 15 }, // In front and below
    ];

    for (let i = 0; i < soundscape.layers.length; i++) {
      const layerId = soundscape.layers[i];
      const position = positions[i % positions.length];

      // Create 3D audio node
      const nodeId = `soundscape-${soundscapeId}-${layerId}`;
      const node = this.create3DAudioNode(nodeId, position);

      if (node) {
        // Play the layer sound
        this.play3DSound(nodeId, layerId, {
          loop: true,
          volume: soundscape.intensity * 0.3,
          fadeIn: 2,
        });
      }
    }

    this.currentSoundscape = soundscapeId;
  }

  private async deactivateSoundscape(): Promise<void> {
    if (!this.currentSoundscape) return;

    // Stop all soundscape nodes
    for (const [nodeId, node] of this.spatialNodes) {
      if (nodeId.startsWith(`soundscape-${this.currentSoundscape}`)) {
        if (node.source && node.isPlaying) {
          // Fade out
          node.gain!.gain.linearRampToValueAtTime(
            0,
            this.audioContext!.currentTime + 1.5,
          );
          setTimeout(() => {
            node.source!.stop();
          }, 1500);
        }
      }
    }

    this.currentSoundscape = null;
  }

  // =====================================================
  // ENHANCED VOICE SYNTHESIS
  // =====================================================

  public async speakWordWithEffects(
    word: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
      useJungleEcho?: boolean;
      useMagicalEffect?: boolean;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis || !this.settings.enableVoiceEffects) {
        // Fallback to regular speech
        this.speakWord(word, options).then(resolve).catch(reject);
        return;
      }

      try {
        // Import sanitization helper inline to avoid circular dependencies
        const { sanitizeTTSInput, logSpeechError } = require("./speechUtils");

        // Sanitize input to prevent "[object Object]" errors
        const sanitizedWord = sanitizeTTSInput(word);
        if (!sanitizedWord) {
          logSpeechError(
            "enhancedJungleAudioSystem.speakWordWithEffects",
            word,
            "Empty word after sanitization",
          );
          reject(new Error("Empty word after sanitization"));
          return;
        }

        const utterance = new SpeechSynthesisUtterance(sanitizedWord);

        // Apply voice settings
        utterance.voice = this.voiceSettings.voice;
        utterance.rate = options?.rate || this.voiceSettings.rate;
        utterance.pitch = options?.pitch || this.voiceSettings.pitch;
        utterance.volume =
          (options?.volume || this.voiceSettings.volume) *
          this.settings.voiceVolume;

        // Add audio effects if available
        if (options?.useJungleEcho && this.audioContext) {
          // Create delay effect for jungle echo
          this.addEchoEffect();
        }

        if (options?.useMagicalEffect && this.audioContext) {
          // Create magical reverb effect
          this.addMagicalEffect();
        }

        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);

        this.speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  public async speakWord(
    word: string,
    options?: {
      rate?: number;
      pitch?: number;
      volume?: number;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error("Speech synthesis not available"));
        return;
      }

      // Import sanitization helper inline to avoid circular dependencies
      const { sanitizeTTSInput, logSpeechError } = require("./speechUtils");

      // Sanitize input to prevent "[object Object]" errors
      const sanitizedWord = sanitizeTTSInput(word);
      if (!sanitizedWord) {
        logSpeechError(
          "enhancedJungleAudioSystem.speakWord",
          word,
          "Empty word after sanitization",
        );
        reject(new Error("Empty word after sanitization"));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sanitizedWord);

      utterance.voice = this.voiceSettings.voice;
      utterance.rate = options?.rate || this.voiceSettings.rate;
      utterance.pitch = options?.pitch || this.voiceSettings.pitch;
      utterance.volume =
        (options?.volume || this.voiceSettings.volume) *
        this.settings.voiceVolume;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.speechSynthesis.speak(utterance);
    });
  }

  private addEchoEffect(): void {
    // Create delay node for echo effect
    if (!this.audioContext) return;

    try {
      const delay = this.audioContext.createDelay(0.5);
      const feedback = this.audioContext.createGain();
      const wetGain = this.audioContext.createGain();

      delay.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
      feedback.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      wetGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);

      // Connect echo effect (this is simplified - in reality you'd need to process the speech audio)
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);
      wetGain.connect(this.voiceGain!);
    } catch (error) {
      console.warn("Failed to add echo effect:", error);
    }
  }

  private addMagicalEffect(): void {
    // Create reverb effect for magical sound
    if (!this.audioContext) return;

    try {
      const convolver = this.audioContext.createConvolver();
      const wetGain = this.audioContext.createGain();

      // Create simple reverb impulse response
      const length = this.audioContext.sampleRate * 2; // 2 seconds
      const impulse = this.audioContext.createBuffer(
        2,
        length,
        this.audioContext.sampleRate,
      );

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] =
            (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }

      convolver.buffer = impulse;
      wetGain.gain.setValueAtTime(0.6, this.audioContext.currentTime);

      convolver.connect(wetGain);
      wetGain.connect(this.voiceGain!);
    } catch (error) {
      console.warn("Failed to add magical effect:", error);
    }
  }

  // =====================================================
  // GAME AUDIO EVENTS
  // =====================================================

  public async playGameSound(
    soundId: string,
    options?: {
      volume?: number;
      pitch?: number;
      position?: { x: number; y: number; z: number };
      fadeIn?: number;
    },
  ): Promise<void> {
    try {
      if (options?.position && this.settings.enable3D) {
        // Play as 3D positioned sound
        const nodeId = `game-sound-${Date.now()}`;
        const node = this.create3DAudioNode(nodeId, options.position);
        if (node) {
          await this.play3DSound(nodeId, soundId, {
            volume: options.volume,
            fadeIn: options.fadeIn,
          });
        }
      } else {
        // Play as regular 2D sound
        await this.play2DSound(soundId, options);
      }
    } catch (error) {
      console.warn(`Failed to play game sound ${soundId}:`, error);
    }
  }

  private async play2DSound(
    soundId: string,
    options?: {
      volume?: number;
      pitch?: number;
      fadeIn?: number;
    },
  ): Promise<void> {
    if (!this.audioContext) return;

    try {
      const buffer = await this.loadAudioBuffer(soundId);
      const source = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();

      source.buffer = buffer;

      // Apply pitch if specified
      if (options?.pitch) {
        source.playbackRate.setValueAtTime(
          options.pitch,
          this.audioContext.currentTime,
        );
      }

      // Connect nodes
      source.connect(gain);
      gain.connect(this.sfxGain!);

      // Set volume
      const volume = (options?.volume || 1) * this.settings.sfxVolume;
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);

      // Fade in if requested
      if (options?.fadeIn) {
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(
          volume,
          this.audioContext.currentTime + options.fadeIn,
        );
      }

      source.start();
    } catch (error) {
      console.warn(`Failed to play 2D sound ${soundId}:`, error);
    }
  }

  // =====================================================
  // SETTINGS AND CONTROLS
  // =====================================================

  public updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.updateVolumes();

    // Apply 3D audio setting
    if (!this.settings.enable3D) {
      // Stop all 3D audio nodes
      for (const [nodeId, node] of this.spatialNodes) {
        if (node.source && node.isPlaying) {
          node.source.stop();
        }
      }
    }

    // Apply dynamic music setting
    if (!this.settings.enableDynamicMusic) {
      for (const [layerId, layer] of this.musicLayers) {
        if (layer.isActive) {
          this.fadeOutMusicLayer(layerId);
        }
      }
    }

    // Apply ambient sounds setting
    if (!this.settings.enableAmbientSounds && this.currentSoundscape) {
      this.deactivateSoundscape();
    }
  }

  private updateVolumes(): void {
    if (!this.audioContext) return;

    try {
      this.masterGain!.gain.setValueAtTime(
        this.settings.masterVolume,
        this.audioContext.currentTime,
      );
      this.musicGain!.gain.setValueAtTime(
        this.settings.musicVolume,
        this.audioContext.currentTime,
      );
      this.sfxGain!.gain.setValueAtTime(
        this.settings.sfxVolume,
        this.audioContext.currentTime,
      );
      this.voiceGain!.gain.setValueAtTime(
        this.settings.voiceVolume,
        this.audioContext.currentTime,
      );
      this.ambientGain!.gain.setValueAtTime(
        this.settings.ambientVolume,
        this.audioContext.currentTime,
      );
    } catch (error) {
      console.warn("Failed to update volumes:", error);
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // =====================================================
  // FALLBACK AUDIO
  // =====================================================

  private initializeFallbackAudio(): void {
    console.log("Initializing fallback audio system");

    // Basic HTML5 audio fallback
    this.isInitialized = true;

    // Disable advanced features
    this.settings.enable3D = false;
    this.settings.enableDynamicMusic = false;
    this.settings.enableVoiceEffects = false;
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  public cleanup(): void {
    // Stop all audio
    for (const [nodeId, node] of this.spatialNodes) {
      if (node.source && node.isPlaying) {
        node.source.stop();
      }
    }

    for (const [layerId, layer] of this.musicLayers) {
      if (layer.sourceNode) {
        layer.sourceNode.stop();
      }
    }

    // Clear collections
    this.spatialNodes.clear();
    this.musicLayers.clear();
    this.audioBuffers.clear();
    this.loadingPromises.clear();

    // Close audio context
    if (this.audioContext && this.audioContext.state !== "closed") {
      this.audioContext.close();
    }

    this.isInitialized = false;
  }
}

// =====================================================
// SINGLETON INSTANCE
// =====================================================

export const enhancedJungleAudio = new EnhancedJungleAudioSystem();

// Auto-initialize on first interaction
document.addEventListener(
  "click",
  () => {
    if (!enhancedJungleAudio["isInitialized"]) {
      enhancedJungleAudio.initialize().catch(console.error);
    }
  },
  { once: true },
);

export default enhancedJungleAudio;
