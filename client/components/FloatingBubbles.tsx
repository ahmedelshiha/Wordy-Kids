import React from 'react';

interface Bubble {
  id: number;
  emoji: string;
  size: number;
  delay: number;
  duration: number;
  left: number;
}

export const FloatingBubbles: React.FC = () => {
  const bubbles: Bubble[] = [
    { id: 1, emoji: '📚', size: 40, delay: 0, duration: 8, left: 10 },
    { id: 2, emoji: '🌟', size: 30, delay: 2, duration: 10, left: 20 },
    { id: 3, emoji: '🎯', size: 35, delay: 4, duration: 9, left: 70 },
    { id: 4, emoji: '🚀', size: 45, delay: 1, duration: 7, left: 80 },
    { id: 5, emoji: '💡', size: 25, delay: 3, duration: 11, left: 50 },
    { id: 6, emoji: '🏆', size: 38, delay: 5, duration: 8, left: 30 },
    { id: 7, emoji: '✨', size: 28, delay: 6, duration: 12, left: 90 },
    { id: 8, emoji: '🦋', size: 32, delay: 1.5, duration: 9, left: 15 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute animate-float opacity-30"
          style={{
            left: `${bubble.left}%`,
            fontSize: `${bubble.size}px`,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
          }}
        >
          {bubble.emoji}
        </div>
      ))}
      
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};
