import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
  duration: number;
}

interface MagicalPortalEffectProps {
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  particleEmojis?: string[];
}

export const MagicalPortalEffect: React.FC<MagicalPortalEffectProps> = ({
  isActive = true,
  intensity = 'medium',
  particleEmojis = ['✨', '🌟', '⭐', '💫', '🔮', '🌈', '🦄', '🎉', '🎊', '💎']
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const particleCount = {
    low: 5,
    medium: 10,
    high: 15
  }[intensity];

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const generateParticles = () => {
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: Math.random(),
          x: Math.random() * 100, // Random position across screen
          y: 100, // Start from bottom
          emoji: particleEmojis[Math.floor(Math.random() * particleEmojis.length)],
          delay: Math.random() * 2000, // Random delay up to 2 seconds
          duration: 4000 + Math.random() * 2000, // 4-6 seconds duration
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
    
    // Regenerate particles periodically
    const interval = setInterval(generateParticles, 3000);
    
    return () => clearInterval(interval);
  }, [isActive, intensity, particleCount, particleEmojis]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-particle-float"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
};

export default MagicalPortalEffect;
