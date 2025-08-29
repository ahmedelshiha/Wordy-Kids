import React, { ReactNode, useRef } from "react";
import { Card } from "../../ui/card";
import { useWordCardState } from "../hooks/useWordCardState";
import { AccessibilitySettings } from "../types";

interface WordCardShellProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  accessibilitySettings: AccessibilitySettings;
  className?: string;
  onFlip: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  ariaLabel: string;
}

export function WordCardShell({
  frontContent,
  backContent,
  accessibilitySettings,
  className = "",
  onFlip,
  onTouchStart,
  onTouchEnd,
  ariaLabel,
}: WordCardShellProps) {
  const { state } = useWordCardState();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={`relative w-full mx-auto max-w-[380px] sm:max-w-[340px] md:max-w-[360px] lg:max-w-[380px] xl:max-w-[400px] px-2 sm:px-0 jungle-adventure-card-container ${className}`}
    >
      <div
        ref={cardRef}
        className={`
          relative w-full transition-all duration-700 transform-gpu
          h-[360px] xs:h-[380px] sm:h-[360px] md:h-[380px] lg:h-[390px] xl:h-[400px]
          jungle-adventure-touch-target
          hover:scale-[1.02] transition-transform
          jungle-adventure-card-flip
          ${state.isFlipped ? "jungle-flipped" : ""}
          ${state.isPressed ? "jungle-pressed" : ""}
          ${accessibilitySettings.reducedMotion ? "" : "transform hover:scale-105"}
        `}
        style={{ willChange: "transform" }}
        onClick={onFlip}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
      >
        {/* Front Card */}
        <Card
          className={`
            absolute inset-0 w-full h-full backface-hidden
            shadow-2xl hover:shadow-3xl rounded-xl overflow-hidden
            cursor-pointer transition-all duration-300
            jungle-adventure-front
            ${!state.isFlipped ? "z-10" : ""}
            border-4 border-yellow-400/30
            ${state.currentAnimation === "bounce" && !accessibilitySettings.reducedMotion ? "animate-bounce" : ""}
            ${accessibilitySettings.highContrast ? "bg-black text-white border-white" : ""}
          `}
        >
          {frontContent}
        </Card>

        {/* Back Card */}
        <Card
          className={`
            absolute inset-0 w-full h-full backface-hidden
            bg-gradient-to-br from-jungle-dark via-jungle to-emerald-700
            shadow-2xl hover:shadow-3xl rounded-xl overflow-hidden
            cursor-pointer transition-all duration-300
            jungle-adventure-back
            ${state.isFlipped ? "z-10" : ""}
            border-4 border-green-400/50
            ${accessibilitySettings.highContrast ? "bg-black text-white border-white" : ""}
          `}
          style={{ transform: "rotateY(180deg)" }}
        >
          {backContent}
        </Card>
      </div>
    </div>
  );
}

