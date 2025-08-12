import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WordyOwlMascotProps {
  isDraggable?: boolean;
}

const WordyOwlMascot: React.FC<WordyOwlMascotProps> = ({ isDraggable = false }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFloating, setIsFloating] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });

  const messages = [
    "Hi there! I'm Wordy, and I'm here to make learning words super fun! Ready for an amazing adventure? 🚀",
    "Let's learn 5 new words today! 🏆",
    "Hoot hoot! Click me anytime for encouragement! 🦉✨",
    "You're doing amazing! Keep up the great work! 🌟",
    "Every word you learn makes you smarter! 💪",
  ];

  const handleClick = () => {
    if (!isDragging) {
      setIsClicked(true);
      const randomMessage = Math.floor(Math.random() * 3) + 2; // Messages 2, 3, or 4
      setCurrentMessage(randomMessage);

      setTimeout(() => {
        setIsClicked(false);
      }, 300);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isDraggable) return;

    e.preventDefault();
    setIsDragging(true);
    setIsFloating(true);

    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isDraggable) return;

    e.preventDefault();
    setIsDragging(true);
    setIsFloating(true);

    const touch = e.touches[0];
    const rect = dragRef.current?.getBoundingClientRect();
    if (rect) {
      offsetRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      startPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !isDraggable) return;

    const newX = e.clientX - offsetRef.current.x;
    const newY = e.clientY - offsetRef.current.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;

    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !isDraggable) return;

    e.preventDefault();
    const touch = e.touches[0];
    const newX = touch.clientX - offsetRef.current.x;
    const newY = touch.clientY - offsetRef.current.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;

    setPosition({
      x: Math.max(0, Math.min(maxX, newX)),
      y: Math.max(0, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      setIsDragging(false);

      // Check if it was just a click (not a drag)
      const distance = Math.sqrt(
        Math.pow(e.clientX - startPosRef.current.x, 2) +
        Math.pow(e.clientY - startPosRef.current.y, 2)
      );

      if (distance < 5) {
        handleClick();
      }

      // Reset floating state after a delay
      setTimeout(() => setIsFloating(false), 1000);
    }
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isDragging) {
      setIsDragging(false);

      // Check if it was just a tap (not a drag)
      const touch = e.changedTouches[0];
      const distance = Math.sqrt(
        Math.pow(touch.clientX - startPosRef.current.x, 2) +
        Math.pow(touch.clientY - startPosRef.current.y, 2)
      );

      if (distance < 5) {
        handleClick();
      }

      // Reset floating state after a delay
      setTimeout(() => setIsFloating(false), 1000);
    }
  };

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Change message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMessage(1);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(
      () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 200);
      },
      3000 + Math.random() * 2000,
    ); // Random blink between 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  const containerClasses = cn(
    "relative select-none",
    isDraggable && "cursor-move touch-none",
    isFloating && "z-50",
    isDragging && "pointer-events-none"
  );

  const containerStyle = isDraggable && isFloating ? {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    zIndex: 9999,
  } : {};

  return (
    <div
      ref={dragRef}
      className={containerClasses}
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Sparkle Effects */}
      {isClicked && (
        <>
          <div className="absolute -top-2 -left-2 text-yellow-400 animate-ping">
            ✨
          </div>
          <div className="absolute -top-1 -right-2 text-blue-400 animate-ping animation-delay-100">
            ⭐
          </div>
          <div className="absolute -bottom-1 -left-1 text-pink-400 animate-ping animation-delay-200">
            💫
          </div>
        </>
      )}

      {/* Speech Bubble */}
      <div className="absolute -top-16 md:-top-20 left-1/2 transform -translate-x-1/2 z-10 animate-fade-in">
        <div className="bg-white rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg border-2 md:border-3 border-educational-yellow max-w-[280px] md:max-w-xs relative">
          <p className="text-xs md:text-sm text-gray-800 font-medium text-center leading-tight">
            {messages[currentMessage]}
          </p>
          {/* Speech bubble arrow */}
          <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-0 h-0 border-l-6 border-r-6 border-t-6 md:border-l-8 md:border-r-8 md:border-t-8 border-transparent border-t-educational-yellow"></div>
            <div className="absolute -top-0.5 md:-top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 md:border-l-6 md:border-r-6 md:border-t-6 border-transparent border-t-white"></div>
          </div>
        </div>
      </div>

      {/* Wordy the Owl SVG */}
      <div
        className={cn(
          "animate-gentle-bounce hover:scale-110 transition-transform duration-300",
          !isDraggable && "cursor-pointer",
          isDraggable && "cursor-move",
          isClicked && "scale-95",
          isDragging && "scale-110 rotate-12",
          isFloating && "drop-shadow-2xl"
        )}
        onClick={!isDraggable ? handleClick : undefined}
      >
        <svg
          width="60"
          height="60"
          viewBox="0 0 120 120"
          className="w-12 h-12 md:w-16 md:h-16 drop-shadow-lg"
        >
          {/* Shadow */}
          <ellipse cx="60" cy="110" rx="25" ry="5" fill="rgba(0,0,0,0.1)" />

          {/* Body */}
          <ellipse cx="60" cy="75" rx="35" ry="30" fill="#F59E0B" />
          <ellipse cx="60" cy="80" rx="25" ry="20" fill="#FEF3C7" />

          {/* Wings */}
          <ellipse
            cx="35"
            cy="70"
            rx="12"
            ry="20"
            fill="#D97706"
            transform="rotate(-15 35 70)"
          />
          <ellipse
            cx="85"
            cy="70"
            rx="12"
            ry="20"
            fill="#D97706"
            transform="rotate(15 85 70)"
          />

          {/* Head */}
          <circle cx="60" cy="45" r="25" fill="#F59E0B" />

          {/* Graduation Cap */}
          <path d="M35 30 L85 30 L80 25 L40 25 Z" fill="#1D4ED8" />
          <rect x="35" y="25" width="50" height="8" fill="#1D4ED8" />
          <circle cx="85" cy="29" r="3" fill="#7C3AED" />

          {/* Eyes */}
          <circle cx="50" cy="40" r="8" fill="white" />
          <circle cx="70" cy="40" r="8" fill="white" />
          <circle
            cx="50"
            cy="40"
            r="5"
            fill="#1F2937"
            className={cn(
              "transition-all duration-200",
              isBlinking && "scale-y-10",
            )}
          />
          <circle
            cx="70"
            cy="40"
            r="5"
            fill="#1F2937"
            className={cn(
              "transition-all duration-200",
              isBlinking && "scale-y-10",
            )}
          />
          <circle cx="52" cy="37" r="2" fill="white" />
          <circle cx="72" cy="37" r="2" fill="white" />

          {/* Beak */}
          <path d="M60 48 L55 55 L65 55 Z" fill="#F97316" />

          {/* Feet */}
          <ellipse cx="50" cy="105" rx="8" ry="5" fill="#F97316" />
          <ellipse cx="70" cy="105" rx="8" ry="5" fill="#F97316" />

          {/* Book in wing */}
          <rect x="25" y="75" width="8" height="12" fill="#3B82F6" rx="1" />
          <rect x="26" y="76" width="6" height="10" fill="#DBEAFE" rx="0.5" />

          {/* Feather details */}
          <path d="M60 55 Q55 60 60 65 Q65 60 60 55" fill="#FCD34D" />
          <path d="M60 65 Q55 70 60 75 Q65 70 60 65" fill="#FCD34D" />
        </svg>
      </div>
    </div>
  );
};

export default WordyOwlMascot;
