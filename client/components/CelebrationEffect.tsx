import React, { useEffect, useState, useRef } from 'react';

interface CelebrationEffectProps {
  trigger: boolean;
  onComplete?: () => void;
  type?: 'confetti' | 'stars' | 'fireworks';
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emoji?: string;
  life: number;
  maxLife: number;
}

export const CelebrationEffect: React.FC<CelebrationEffectProps> = ({
  trigger,
  onComplete,
  type = 'confetti'
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#FFB347', '#87CEEB', '#F0E68C'
  ];

  const emojis = ['🎉', '🌟', '✨', '🎊', '🏆', '🎯', '💎', '🚀'];

  const createParticles = () => {
    const newParticles: Particle[] = [];
    const particleCount = type === 'fireworks' ? 50 : 30;

    for (let i = 0; i < particleCount; i++) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      newParticles.push({
        id: i,
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10 - 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: type === 'stars' ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
        life: 0,
        maxLife: 60 + Math.random() * 40
      });
    }

    setParticles(newParticles);
  };

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      createParticles();

      const animateParticles = () => {
        setParticles(prevParticles => {
          const updatedParticles = prevParticles
            .map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vx: particle.vx * 0.98,
              vy: particle.vy + 0.3, // gravity
              life: particle.life + 1
            }))
            .filter(particle => particle.life < particle.maxLife);

          if (updatedParticles.length === 0) {
            setIsActive(false);
            onComplete?.();
          }

          return updatedParticles;
        });
      };

      const interval = setInterval(animateParticles, 16); // ~60 FPS

      return () => {
        clearInterval(interval);
        setIsActive(false);
      };
    }
  }, [trigger, isActive]);

  if (!isActive || particles.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute transition-opacity duration-300"
          style={{
            left: particle.x,
            top: particle.y,
            color: particle.color,
            opacity: 1 - (particle.life / particle.maxLife),
            fontSize: type === 'stars' ? '24px' : '12px',
            transform: `rotate(${particle.life * 10}deg)`,
          }}
        >
          {particle.emoji || (type === 'confetti' ? '■' : '●')}
        </div>
      ))}
    </div>
  );
};
