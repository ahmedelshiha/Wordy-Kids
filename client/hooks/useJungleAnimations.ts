import { useState, useCallback, useRef, useEffect } from "react";

// Types and interfaces
interface AnimationSettings {
  enabled: boolean;
  intensity: "subtle" | "moderate" | "dramatic";
  respectReducedMotion: boolean;
  hardwareAcceleration: boolean;
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };
  easing: {
    gentle: string;
    bounce: string;
    dramatic: string;
  };
}

interface ParticleEffect {
  id: string;
  type:
    | "sparkle"
    | "celebration"
    | "mastery"
    | "discovery"
    | "favorite"
    | "achievement";
  emoji: string;
  startPosition: { x: number; y: number };
  endPosition: { x: number; y: number };
  duration: number;
  delay: number;
  intensity: number;
  color?: string;
  size?: number;
}

interface AnimationSequence {
  id: string;
  name: string;
  steps: AnimationStep[];
  duration: number;
  loop: boolean;
}

interface AnimationStep {
  element: string;
  properties: { [key: string]: any };
  duration: number;
  delay: number;
  easing: string;
}

interface CelebrationAnimation {
  type:
    | "word-mastered"
    | "achievement"
    | "level-up"
    | "category-complete"
    | "streak";
  intensity: "gentle" | "moderate" | "explosive";
  particles: ParticleEffect[];
  screenEffects: string[];
  duration: number;
}

const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  enabled: true,
  intensity: "moderate",
  respectReducedMotion: true,
  hardwareAcceleration: true,
  duration: {
    fast: 200,
    normal: 400,
    slow: 800,
  },
  easing: {
    gentle: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    dramatic: "cubic-bezier(0.17, 0.67, 0.83, 0.67)",
  },
};

// Particle configurations for different events
const PARTICLE_CONFIGS = {
  sparkle: {
    emojis: ["✨", "⭐", "🌟", "💫"],
    count: 5,
    spread: 80,
    velocity: 50,
    duration: 1500,
  },
  celebration: {
    emojis: ["��", "🎊", "✨", "⭐", "🌟", "💫", "🎈"],
    count: 12,
    spread: 120,
    velocity: 80,
    duration: 2500,
  },
  mastery: {
    emojis: ["👑", "🏆", "💎", "⚡", "🔥", "🌟"],
    count: 8,
    spread: 100,
    velocity: 60,
    duration: 2000,
  },
  discovery: {
    emojis: ["🦋", "🌿", "🌸", "🦜", "🐛", "✨"],
    count: 6,
    spread: 90,
    velocity: 40,
    duration: 1800,
  },
  favorite: {
    emojis: ["❤️", "💖", "💕", "🥰", "😍", "✨"],
    count: 4,
    spread: 60,
    velocity: 30,
    duration: 1200,
  },
  achievement: {
    emojis: ["🏆", "👑", "🎖️", "🥇", "⭐", "🌟", "💫", "✨"],
    count: 15,
    spread: 150,
    velocity: 100,
    duration: 3000,
  },
};

// Predefined animation sequences
const ANIMATION_SEQUENCES = {
  "word-entrance": {
    id: "word-entrance",
    name: "Word Card Entrance",
    steps: [
      {
        element: ".word-card",
        properties: { opacity: 0, scale: 0.8, y: 30 },
        duration: 0,
        delay: 0,
        easing: "linear",
      },
      {
        element: ".word-card",
        properties: { opacity: 1, scale: 1, y: 0 },
        duration: 600,
        delay: 100,
        easing: "bounce",
      },
    ],
    duration: 700,
    loop: false,
  },
  "category-transition": {
    id: "category-transition",
    name: "Category Switch Animation",
    steps: [
      {
        element: ".content-area",
        properties: { opacity: 0.7, scale: 0.95 },
        duration: 200,
        delay: 0,
        easing: "gentle",
      },
      {
        element: ".content-area",
        properties: { opacity: 1, scale: 1 },
        duration: 400,
        delay: 200,
        easing: "bounce",
      },
    ],
    duration: 600,
    loop: false,
  },
  "jungle-ambient": {
    id: "jungle-ambient",
    name: "Jungle Ambient Animation",
    steps: [
      {
        element: ".jungle-leaf",
        properties: { rotate: 5, scale: 1.02 },
        duration: 3000,
        delay: 0,
        easing: "gentle",
      },
      {
        element: ".jungle-leaf",
        properties: { rotate: -5, scale: 0.98 },
        duration: 3000,
        delay: 3000,
        easing: "gentle",
      },
    ],
    duration: 6000,
    loop: true,
  },
};

export const useJungleAnimations = () => {
  // State management
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    DEFAULT_ANIMATION_SETTINGS,
  );
  const [activeParticles, setActiveParticles] = useState<ParticleEffect[]>([]);
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(
    new Set(),
  );
  const [respectsReducedMotion, setRespectsReducedMotion] = useState(false);

  // Refs for cleanup
  const particleTimeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const animationRefs = useRef<{ [key: string]: Animation }>({});

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setRespectsReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setRespectsReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Computed animation state
  const animationsEnabled =
    animationSettings.enabled &&
    (!respectsReducedMotion || !animationSettings.respectReducedMotion);

  // Create particle effects
  const createParticles = useCallback(
    (
      type: keyof typeof PARTICLE_CONFIGS,
      options?: {
        position?: { x: number; y: number };
        count?: number;
        intensity?: number;
        customEmojis?: string[];
      },
    ) => {
      if (!animationsEnabled) return [];

      const config = PARTICLE_CONFIGS[type];
      const position = options?.position || { x: 50, y: 50 }; // Default to center
      const count = options?.count || config.count;
      const intensity = options?.intensity || 1;
      const emojis = options?.customEmojis || config.emojis;

      const newParticles: ParticleEffect[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance =
          (config.spread / 2) * (0.7 + Math.random() * 0.6) * intensity;

        const endX = position.x + Math.cos(angle) * distance;
        const endY = position.y + Math.sin(angle) * distance;

        const particle: ParticleEffect = {
          id: `${type}-${Date.now()}-${i}`,
          type,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          startPosition: position,
          endPosition: { x: endX, y: endY },
          duration: config.duration + (Math.random() - 0.5) * 500,
          delay: Math.random() * 300,
          intensity,
          size: 1 + Math.random() * 0.5,
        };

        newParticles.push(particle);
      }

      setActiveParticles((prev) => [...prev, ...newParticles]);

      // Clean up particles after animation
      const maxDuration = Math.max(
        ...newParticles.map((p) => p.duration + p.delay),
      );
      const timeoutId = setTimeout(() => {
        setActiveParticles((prev) =>
          prev.filter((p) => !newParticles.some((np) => np.id === p.id)),
        );
      }, maxDuration + 100);

      particleTimeoutRefs.current[type] = timeoutId;

      return newParticles;
    },
    [animationsEnabled],
  );

  // Trigger celebration animation
  const triggerCelebration = useCallback(
    (
      type: CelebrationAnimation["type"],
      options?: {
        position?: { x: number; y: number };
        intensity?: "gentle" | "moderate" | "explosive";
        customMessage?: string;
      },
    ) => {
      if (!animationsEnabled) return;

      const intensity = options?.intensity || "moderate";
      const position = options?.position || { x: 50, y: 50 };

      // Create appropriate particles based on celebration type
      switch (type) {
        case "word-mastered":
          createParticles("mastery", {
            position,
            intensity:
              intensity === "gentle"
                ? 0.7
                : intensity === "explosive"
                  ? 1.5
                  : 1,
          });
          break;
        case "achievement":
          createParticles("achievement", {
            position,
            intensity:
              intensity === "gentle"
                ? 0.8
                : intensity === "explosive"
                  ? 1.8
                  : 1.2,
          });
          break;
        case "level-up":
          createParticles("celebration", {
            position,
            intensity:
              intensity === "gentle"
                ? 0.9
                : intensity === "explosive"
                  ? 2
                  : 1.3,
          });
          break;
        case "category-complete":
          createParticles("discovery", {
            position,
            intensity:
              intensity === "gentle"
                ? 0.8
                : intensity === "explosive"
                  ? 1.6
                  : 1.1,
          });
          break;
        case "streak":
          createParticles("sparkle", {
            position,
            intensity:
              intensity === "gentle"
                ? 0.6
                : intensity === "explosive"
                  ? 1.4
                  : 1,
          });
          break;
      }

      // Add screen-wide effects for explosive celebrations
      if (intensity === "explosive") {
        // Add screen shake effect
        const body = document.body;
        body.style.animation = "jungle-screen-shake 0.5s ease-in-out";
        setTimeout(() => {
          body.style.animation = "";
        }, 500);
      }
    },
    [animationsEnabled, createParticles],
  );

  // Animate word card interactions
  const animateWordCard = useCallback(
    (
      action: "flip" | "bounce" | "glow" | "shake" | "float",
      element?: HTMLElement,
      options?: { duration?: number; intensity?: number },
    ) => {
      if (!animationsEnabled || !element) return;

      const duration = options?.duration || animationSettings.duration.normal;
      const intensity = options?.intensity || 1;

      let keyframes: Keyframe[] = [];
      let animationOptions: KeyframeAnimationOptions = {
        duration,
        easing: animationSettings.easing.gentle,
        fill: "forwards",
      };

      switch (action) {
        case "flip":
          keyframes = [
            { transform: "rotateY(0deg)" },
            { transform: "rotateY(180deg)" },
            { transform: "rotateY(0deg)" },
          ];
          animationOptions.easing = animationSettings.easing.bounce;
          break;
        case "bounce":
          keyframes = [
            { transform: "scale(1) translateY(0px)" },
            { transform: `scale(${1.1 * intensity}) translateY(-5px)` },
            { transform: "scale(1) translateY(0px)" },
          ];
          animationOptions.easing = animationSettings.easing.bounce;
          break;
        case "glow":
          keyframes = [
            { boxShadow: "0 0 0 rgba(34, 197, 94, 0)" },
            { boxShadow: `0 0 ${20 * intensity}px rgba(34, 197, 94, 0.5)` },
            { boxShadow: "0 0 0 rgba(34, 197, 94, 0)" },
          ];
          break;
        case "shake":
          keyframes = [
            { transform: "translateX(0)" },
            { transform: `translateX(-${5 * intensity}px)` },
            { transform: `translateX(${5 * intensity}px)` },
            { transform: "translateX(0)" },
          ];
          animationOptions.duration = duration / 2;
          break;
        case "float":
          keyframes = [
            { transform: "translateY(0px)" },
            { transform: `translateY(-${8 * intensity}px)` },
            { transform: "translateY(0px)" },
          ];
          animationOptions.duration = duration * 2;
          animationOptions.iterations = Infinity;
          animationOptions.direction = "alternate";
          break;
      }

      const animation = element.animate(keyframes, animationOptions);
      const animationId = `${action}-${Date.now()}`;
      animationRefs.current[animationId] = animation;

      animation.addEventListener("finish", () => {
        delete animationRefs.current[animationId];
        setActiveAnimations((prev) => {
          const newSet = new Set(prev);
          newSet.delete(animationId);
          return newSet;
        });
      });

      setActiveAnimations((prev) => new Set([...prev, animationId]));

      return animation;
    },
    [animationsEnabled, animationSettings],
  );

  // Animate transitions between views
  const animateTransition = useCallback(
    (
      type: "slide-left" | "slide-right" | "fade" | "scale" | "category-switch",
      element?: HTMLElement,
    ) => {
      if (!animationsEnabled) return;

      const targetElement =
        element || (document.querySelector(".main-content") as HTMLElement);
      if (!targetElement) return;

      let keyframes: Keyframe[] = [];
      const duration = animationSettings.duration.normal;

      switch (type) {
        case "slide-left":
          keyframes = [
            { transform: "translateX(100%)", opacity: 0 },
            { transform: "translateX(0%)", opacity: 1 },
          ];
          break;
        case "slide-right":
          keyframes = [
            { transform: "translateX(-100%)", opacity: 0 },
            { transform: "translateX(0%)", opacity: 1 },
          ];
          break;
        case "fade":
          keyframes = [{ opacity: 0 }, { opacity: 1 }];
          break;
        case "scale":
          keyframes = [
            { transform: "scale(0.8)", opacity: 0 },
            { transform: "scale(1)", opacity: 1 },
          ];
          break;
        case "category-switch":
          keyframes = [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(0.95)", opacity: 0.7 },
            { transform: "scale(1)", opacity: 1 },
          ];
          break;
      }

      const animation = targetElement.animate(keyframes, {
        duration,
        easing: animationSettings.easing.gentle,
        fill: "forwards",
      });

      return animation;
    },
    [animationsEnabled, animationSettings],
  );

  // Add CSS animation classes dynamically
  const addAnimationClass = useCallback(
    (element: HTMLElement, className: string, duration?: number) => {
      if (!animationsEnabled || !element) return;

      element.classList.add(className);

      const timeout = setTimeout(() => {
        element.classList.remove(className);
      }, duration || animationSettings.duration.normal);

      return () => clearTimeout(timeout);
    },
    [animationsEnabled, animationSettings.duration.normal],
  );

  // Create ambient jungle animations
  const createAmbientAnimations = useCallback(() => {
    if (!animationsEnabled) return;

    // Animate jungle leaves
    const leaves = document.querySelectorAll(".jungle-leaf");
    leaves.forEach((leaf, index) => {
      const element = leaf as HTMLElement;
      const delay = index * 200;

      setTimeout(() => {
        animateWordCard("float", element, {
          duration: 4000 + Math.random() * 2000,
          intensity: 0.5 + Math.random() * 0.5,
        });
      }, delay);
    });

    // Animate butterflies or birds
    const creatures = document.querySelectorAll(".jungle-creature");
    creatures.forEach((creature, index) => {
      const element = creature as HTMLElement;
      const delay = index * 500;

      setTimeout(() => {
        const animation = element.animate(
          [
            { transform: "translateX(0px) translateY(0px)" },
            {
              transform: `translateX(${20 + Math.random() * 40}px) translateY(${-10 - Math.random() * 20}px)`,
            },
            { transform: "translateX(0px) translateY(0px)" },
          ],
          {
            duration: 6000 + Math.random() * 4000,
            iterations: Infinity,
            easing: "ease-in-out",
          },
        );
      }, delay);
    });
  }, [animationsEnabled, animateWordCard]);

  // Update animation settings
  const updateAnimationSettings = useCallback(
    (updates: Partial<AnimationSettings>) => {
      setAnimationSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  // Clear all animations
  const clearAnimations = useCallback(() => {
    // Clear particles
    setActiveParticles([]);

    // Clear particle timeouts
    Object.values(particleTimeoutRefs.current).forEach((timeout) => {
      clearTimeout(timeout);
    });
    particleTimeoutRefs.current = {};

    // Cancel active animations
    Object.values(animationRefs.current).forEach((animation) => {
      animation.cancel();
    });
    animationRefs.current = {};

    setActiveAnimations(new Set());
  }, []);

  // Get animation styles for particles
  const getParticleStyles = useCallback((particle: ParticleEffect) => {
    return {
      position: "absolute" as const,
      left: `${particle.startPosition.x}%`,
      top: `${particle.startPosition.y}%`,
      fontSize: `${(particle.size || 1) * 1.5}rem`,
      pointerEvents: "none" as const,
      zIndex: 1000,
      animation: `jungle-particle-${particle.type} ${particle.duration}ms ease-out ${particle.delay}ms forwards`,
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimations();
    };
  }, [clearAnimations]);

  return {
    // State
    animationSettings,
    animationsEnabled,
    activeParticles,
    activeAnimations,
    respectsReducedMotion,

    // Particle effects
    createParticles,

    // Celebration animations
    triggerCelebration,

    // Element animations
    animateWordCard,
    animateTransition,
    addAnimationClass,

    // Ambient animations
    createAmbientAnimations,

    // Utilities
    updateAnimationSettings,
    clearAnimations,
    getParticleStyles,
  };
};

export default useJungleAnimations;
