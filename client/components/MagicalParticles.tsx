import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagicalParticlesProps {
  trigger?: boolean;
  type?: "stars" | "hearts" | "sparkles" | "rainbow" | "celebration";
  duration?: number;
  intensity?: "low" | "medium" | "high";
  className?: string;
}

const particleEmojis = {
  stars: ["⭐", "🌟", "✨", "💫"],
  hearts: ["💖", "💕", "💗", "💝", "💘"],
  sparkles: ["✨", "🌟", "💫", "⭐", "🔸", "🔹"],
  rainbow: ["🌈", "🦄", "🌺", "🌸", "🌼", "🌻"],
  celebration: ["🎉", "🎊", "🎈", "🎁", "🏆", "👑", "✨", "🌟"],
};

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
}

export function MagicalParticles({
  trigger = false,
  type = "sparkles",
  duration = 3000,
  intensity = "medium",
  className,
}: MagicalParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  const intensityConfig = {
    low: { count: 15, spawnRate: 3 },
    medium: { count: 25, spawnRate: 5 },
    high: { count: 40, spawnRate: 8 },
  };

  const config = intensityConfig[intensity];

  useEffect(() => {
    if (!trigger) return;

    setIsActive(true);

    // Create initial burst of particles
    createParticleBurst();

    // Continue spawning particles
    const spawnInterval = setInterval(() => {
      if (particles.length < config.count) {
        createParticles(config.spawnRate);
      }
    }, 200);

    // Stop after duration
    const stopTimer = setTimeout(() => {
      setIsActive(false);
      clearInterval(spawnInterval);
    }, duration);

    return () => {
      clearInterval(spawnInterval);
      clearTimeout(stopTimer);
    };
  }, [trigger, type, intensity]);

  useEffect(() => {
    if (!isActive) return;

    const animationFrame = setInterval(() => {
      setParticles((prevParticles) =>
        prevParticles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 1,
            rotation: particle.rotation + particle.rotationSpeed,
          }))
          .filter(
            (particle) =>
              particle.life > 0 && particle.y < window.innerHeight + 50,
          ),
      );
    }, 16); // ~60fps

    return () => clearInterval(animationFrame);
  }, [isActive]);

  const createParticleBurst = () => {
    const newParticles: Particle[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < config.count; i++) {
      newParticles.push(createParticle(centerX, centerY));
    }

    setParticles(newParticles);
  };

  const createParticles = (count: number) => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const x = Math.random() * window.innerWidth;
      const y = -50; // Start above screen
      newParticles.push(createParticle(x, y));
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  const createParticle = (x: number, y: number): Particle => {
    const emojis = particleEmojis[type];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    return {
      id: Math.random(),
      emoji,
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * -8 - 2,
      life: 180 + Math.random() * 120, // 3-5 seconds at 60fps
      maxLife: 300,
      size: 0.8 + Math.random() * 0.8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    };
  };

  if (!isActive && particles.length === 0) return null;

  return (
    <div className={cn("fixed inset-0 pointer-events-none z-40", className)}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl transition-opacity duration-300"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            transform: `scale(${particle.size}) rotate(${particle.rotation}deg)`,
            opacity: particle.life / particle.maxLife,
            fontSize: `${16 + particle.size * 8}px`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
}

// Preset particle effects for common scenarios
export function SuccessParticles({
  trigger,
  onComplete,
}: {
  trigger: boolean;
  onComplete?: () => void;
}) {
  useEffect(() => {
    if (trigger && onComplete) {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <MagicalParticles
      trigger={trigger}
      type="celebration"
      intensity="high"
      duration={3000}
    />
  );
}

export function LevelUpParticles({ trigger }: { trigger: boolean }) {
  return (
    <MagicalParticles
      trigger={trigger}
      type="stars"
      intensity="high"
      duration={4000}
    />
  );
}

export function WordLearnedParticles({ trigger }: { trigger: boolean }) {
  return (
    <MagicalParticles
      trigger={trigger}
      type="sparkles"
      intensity="low"
      duration={1200}
    />
  );
}

export function AchievementParticles({ trigger }: { trigger: boolean }) {
  return (
    <MagicalParticles
      trigger={trigger}
      type="rainbow"
      intensity="high"
      duration={5000}
    />
  );
}

// Floating ambient particles for background magic
export function AmbientMagicParticles({
  isActive = true,
  type = "sparkles",
}: {
  isActive?: boolean;
  type?: "stars" | "sparkles" | "hearts";
}) {
  return (
    <MagicalParticles
      trigger={isActive}
      type={type}
      intensity="low"
      duration={999999} // Continuous
      className="opacity-40"
    />
  );
}
