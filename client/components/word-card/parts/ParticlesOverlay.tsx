import React, { useState, useEffect } from "react";
import { AccessibilitySettings, Particle } from "../types";
import { useWordCardState } from "../hooks/useWordCardState";

interface ParticlesOverlayProps {
  accessibilitySettings: AccessibilitySettings;
}

export function ParticlesOverlay({ accessibilitySettings }: ParticlesOverlayProps) {
  const { state } = useWordCardState();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (state.showParticles && !accessibilitySettings.reducedMotion) {
      const newParticles: Particle[] = [];
      for (let i = 0; i < 6; i++) {
        newParticles.push({
          id: Math.random(),
          emoji: ["✨", "⭐", "🌟", "💫", "🎉", "🎊"][Math.floor(Math.random() * 6)],
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 2,
        });
      }
      setParticles(newParticles);
      
      const timer = setTimeout(() => setParticles([]), 2000);
      return () => clearTimeout(timer);
    }
  }, [state.showParticles, accessibilitySettings.reducedMotion]);

  if (accessibilitySettings.reducedMotion) {
    return null;
  }

  return (
    <>
      {/* Enhanced Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-ping pointer-events-none z-10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}

      {/* Level Up Celebration */}
      {state.showLevelUp && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold text-lg animate-bounce shadow-2xl border-2 border-yellow-300">
            <span className="w-6 h-6 inline mr-2">👑</span>
            Level Up! 🎉
          </div>
        </div>
      )}

      {/* Very Light Jungle Adventure Particles Background */}
      {state.showParticles && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-xl">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className={`
                absolute text-xs opacity-10 animate-float-up
                animation-delay-${(i * 600) % 1000}
              `}
              style={{
                left: `${Math.random() * 80 + 10}%`,
                animationDuration: `${2 + Math.random() * 1}s`,
              }}
            >
              {["✨", "🌟"][i % 2]}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

