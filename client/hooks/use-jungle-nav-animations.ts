import { useEffect, useRef, useCallback, useState } from "react";
import { jungleTheme } from "@/lib/jungleNavConfig";

/**
 * 🌿 Jungle Navigation Animations Hook
 * Manages immersive animations and sound effects for the jungle navigation
 */

interface UseJungleNavAnimationsOptions {
  enableAnimations?: boolean;
  enableSounds?: boolean;
  enableParticles?: boolean;
}

interface JungleAnimationControls {
  playAnimalSound: (animal: string) => Promise<void>;
  triggerCelebration: (element: HTMLElement) => void;
  startIdleAnimation: (element: HTMLElement, animalType: string) => void;
  stopIdleAnimation: (element: HTMLElement) => void;
  createFireflies: (container: HTMLElement) => void;
  removeFireflies: (container: HTMLElement) => void;
  playHoverEffect: (element: HTMLElement) => void;
  createVineDecoration: (element: HTMLElement) => void;
}

export function useJungleNavAnimations(
  options: UseJungleNavAnimationsOptions = {},
): JungleAnimationControls {
  const {
    enableAnimations = true,
    enableSounds = true,
    enableParticles = true,
  } = options;

  // Audio context for sound effects
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  // Animation timers and cleanup
  const animationRefs = useRef<Map<HTMLElement, number>>(new Map());

  // Initialize audio system using AssetManager
  useEffect(() => {
    if (!enableSounds) return;

    const initializeAudio = async () => {
      try {
        // Import AssetManager for smart audio loading
        const { AudioManager } = await import('@/lib/assetManager');

        // Preload animal sounds with automatic fallbacks
        const animalSounds = {
          owl: "/sounds/owl-hoot.mp3",
          parrot: "/sounds/parrot-chirp.mp3",
          monkey: "/sounds/monkey-chatter.mp3",
          elephant: "/sounds/elephant-trumpet.mp3",
        };

        // Load audio files using AssetManager for automatic path correction
        const loadPromises = Object.entries(animalSounds).map(async ([animal, soundPath]) => {
          try {
            const audio = await AudioManager.loadAudio(soundPath);
            audio.volume = 0.3;
            audioRef.current[animal] = audio;
          } catch (error) {
            console.warn(`Failed to load ${animal} sound:`, error);
            // AssetManager will have already tried fallbacks, so we can skip this animal sound
          }
        });

        await Promise.all(loadPromises);
        setIsAudioInitialized(true);
        console.log('✅ Jungle navigation audio initialized with AssetManager');
      } catch (error) {
        console.warn("Audio initialization failed:", error);
        setIsAudioInitialized(false);
      }
    };

    // Initialize on first user interaction
    const handleFirstInteraction = () => {
      initializeAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);

      // Cleanup audio
      Object.values(audioRef.current).forEach((audio) => {
        audio.pause();
        audio.src = "";
      });
    };
  }, [enableSounds]);

  // Cleanup animations on unmount
  useEffect(() => {
    return () => {
      animationRefs.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      animationRefs.current.clear();
    };
  }, []);

  // Play animal sound with AssetManager fallback
  const playAnimalSound = useCallback(
    async (animal: string): Promise<void> => {
      if (!enableSounds) return;

      try {
        // First try pre-loaded audio
        const audio = audioRef.current[animal];
        if (audio && isAudioInitialized) {
          audio.currentTime = 0;
          await audio.play();
          return;
        }

        // Fallback: Use AssetManager for on-demand loading
        const { AudioManager } = await import('@/lib/assetManager');
        await AudioManager.playAnimalSound(animal, 0.3);
      } catch (error) {
        console.warn(`Failed to play ${animal} sound:`, error);
        // Final fallback: Try with synthesized sound if available
        try {
          const { playSoundIfEnabled } = await import('@/lib/soundEffects');
          playSoundIfEnabled.success();
        } catch (fallbackError) {
          console.debug('All audio fallbacks failed, continuing silently');
        }
      }
    },
    [enableSounds, isAudioInitialized],
  );

  // Trigger celebration animation
  const triggerCelebration = useCallback(
    (element: HTMLElement): void => {
      if (!enableAnimations) return;

      element.style.animation = "none";
      element.offsetHeight; // Force reflow
      element.style.animation = "animal-celebration 2s ease-in-out";

      // Create burst of particles
      if (enableParticles) {
        const particles = ["🌟", "✨", "💫", "⭐"];

        for (let i = 0; i < 6; i++) {
          const particle = document.createElement("div");
          particle.textContent =
            particles[Math.floor(Math.random() * particles.length)];
          particle.style.cssText = `
          position: absolute;
          font-size: 1.5rem;
          pointer-events: none;
          z-index: 1000;
          animation: particle-burst 1.5s ease-out forwards;
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100}%;
          --burst-x: ${(Math.random() - 0.5) * 200}px;
          --burst-y: ${(Math.random() - 0.5) * 200}px;
        `;

          element.style.position = "relative";
          element.appendChild(particle);

          // Cleanup particle
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }, 1500);
        }
      }
    },
    [enableAnimations, enableParticles],
  );

  // Start idle animation
  const startIdleAnimation = useCallback(
    (element: HTMLElement, animalType: string): void => {
      if (!enableAnimations) return;

      // Stop any existing animation
      stopIdleAnimation(element);

      const animalAnimations = {
        owl: "gentle-sway 4s ease-in-out infinite",
        parrot: "gentle-float 3s ease-in-out infinite",
        monkey: "gentle-bounce 2.5s ease-in-out infinite",
        elephant: "gentle-glow 3.5s ease-in-out infinite",
      };

      const animation =
        animalAnimations[animalType as keyof typeof animalAnimations];
      if (animation) {
        element.style.animation = animation;
      }
    },
    [enableAnimations],
  );

  // Stop idle animation
  const stopIdleAnimation = useCallback((element: HTMLElement): void => {
    element.style.animation = "none";
    animationRefs.current.delete(element);
  }, []);

  // Create fireflies around active elements
  const createFireflies = useCallback(
    (container: HTMLElement): void => {
      if (!enableParticles) return;

      const fireflies = ["✨", "💫", "⭐"];
      const positions = [
        { top: "-5px", right: "-5px", delay: 0 },
        { bottom: "-5px", left: "-5px", delay: 1000 },
        { top: "50%", right: "-10px", delay: 2000 },
      ];

      positions.forEach(({ top, right, bottom, left, delay }, index) => {
        setTimeout(() => {
          const firefly = document.createElement("div");
          firefly.className = "jungle-fireflies";
          firefly.textContent = fireflies[index % fireflies.length];
          firefly.style.cssText = `
          position: absolute;
          font-size: 0.8rem;
          opacity: 0;
          animation: firefly-dance 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 3;
          ${top ? `top: ${top};` : ""}
          ${right ? `right: ${right};` : ""}
          ${bottom ? `bottom: ${bottom};` : ""}
          ${left ? `left: ${left};` : ""}
        `;

          container.style.position = "relative";
          container.appendChild(firefly);

          // Store for cleanup
          const dataset = container.dataset.fireflies || "";
          container.dataset.fireflies = dataset + firefly.outerHTML + ";";
        }, delay);
      });
    },
    [enableParticles],
  );

  // Remove fireflies
  const removeFireflies = useCallback((container: HTMLElement): void => {
    const fireflies = container.querySelectorAll(".jungle-fireflies");
    fireflies.forEach((firefly) => {
      firefly.remove();
    });
    delete container.dataset.fireflies;
  }, []);

  // Play hover effect
  const playHoverEffect = useCallback(
    (element: HTMLElement): void => {
      if (!enableAnimations) return;

      const originalTransform = element.style.transform;
      element.style.transition = "transform 0.2s ease-out";
      element.style.transform = "translateY(-2px) scale(1.02)";

      const timerId = setTimeout(() => {
        element.style.transform = originalTransform;
      }, 200);

      animationRefs.current.set(element, timerId);
    },
    [enableAnimations],
  );

  // Create vine decoration
  const createVineDecoration = useCallback(
    (element: HTMLElement): void => {
      if (!enableParticles) return;

      const vine = document.createElement("div");
      vine.className = "jungle-vines";
      vine.textContent = "🌿";
      vine.style.cssText = `
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.5rem;
      opacity: 0.6;
      z-index: 2;
      animation: vine-sway 4s ease-in-out infinite;
    `;

      element.style.position = "relative";
      element.appendChild(vine);
    },
    [enableParticles],
  );

  return {
    playAnimalSound,
    triggerCelebration,
    startIdleAnimation,
    stopIdleAnimation,
    createFireflies,
    removeFireflies,
    playHoverEffect,
    createVineDecoration,
  };
}

// CSS keyframes for particle effects (to be added to the main CSS file)
export const particleEffectStyles = `
@keyframes particle-burst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--burst-x), var(--burst-y)) scale(0.5);
  }
}

@keyframes firefly-dance {
  0%, 100% { 
    opacity: 0; 
    transform: translateY(0px) scale(0.5); 
  }
  25% { 
    opacity: 0.8; 
    transform: translateY(-10px) scale(1); 
  }
  50% { 
    opacity: 1; 
    transform: translateY(-15px) scale(1.1); 
  }
  75% { 
    opacity: 0.8; 
    transform: translateY(-8px) scale(1); 
  }
}

@keyframes vine-sway {
  0%, 100% { 
    transform: translateX(-50%) rotate(0deg); 
  }
  50% { 
    transform: translateX(-50%) rotate(2deg); 
  }
}
`;
