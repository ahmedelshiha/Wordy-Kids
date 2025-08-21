import React from "react";
import { cn } from "@/lib/utils";

interface EmojiProps {
  children: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "inline" | "block" | "navigation" | "achievement" | "game";
  ariaLabel?: string;
  fallback?: string;
  onClick?: () => void;
}

/**
 * Emoji component for consistent, accessible emoji rendering
 * Uses emoji-safe font stack and provides fallback handling
 */
export function Emoji({
  children,
  className,
  size = "md",
  variant = "inline",
  ariaLabel,
  fallback = "🤔",
  onClick,
}: EmojiProps) {
  // Validate emoji content
  const isValidEmoji = (emoji: string): boolean => {
    if (!emoji || typeof emoji !== "string") return false;
    // Check for replacement characters (corrupted emojis)
    if (emoji.includes("�") || emoji.includes("\uFFFD")) return false;
    return emoji.length <= 4; // Prevent overly long strings
  };

  const emojiContent = isValidEmoji(children) ? children : fallback;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "emoji-large",
    xl: "emoji-xlarge",
  };

  const variantClasses = {
    inline: "emoji-inline",
    block: "emoji-block",
    navigation: "jungle-nav-emoji emoji-optimized",
    achievement: "achievement-emoji emoji-optimized",
    game: "game-emoji emoji-optimized",
  };

  const baseClasses = cn(
    "emoji",
    sizeClasses[size],
    variantClasses[variant],
    onClick && "cursor-pointer",
    className,
  );

  // Add accessibility attributes
  const accessibilityProps = {
    role: "img" as const,
    "aria-label": ariaLabel || `Emoji: ${emojiContent}`,
    ...(onClick && { tabIndex: 0, role: "button" as const }),
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <span
      className={baseClasses}
      {...accessibilityProps}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
    >
      {emojiContent}
    </span>
  );
}

/**
 * Specialized emoji components for common use cases
 */

export function JungleNavEmoji({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Emoji
      variant="navigation"
      ariaLabel={label}
      onClick={onClick}
      className="jungle-nav-emoji"
    >
      {emoji}
    </Emoji>
  );
}

export function AchievementEmoji({
  emoji,
  label,
}: {
  emoji: string;
  label: string;
}) {
  return (
    <Emoji
      variant="achievement"
      size="lg"
      ariaLabel={label}
      className="achievement-emoji"
    >
      {emoji}
    </Emoji>
  );
}

export function GameEmoji({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Emoji
      variant="game"
      ariaLabel={label}
      onClick={onClick}
      className="game-emoji"
    >
      {emoji}
    </Emoji>
  );
}

/**
 * Emoji list component for rendering multiple emojis safely
 */
export function EmojiList({
  emojis,
  className,
  variant = "inline",
  size = "md",
}: {
  emojis: string[];
  className?: string;
  variant?: EmojiProps["variant"];
  size?: EmojiProps["size"];
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {emojis.map((emoji, index) => (
        <Emoji
          key={`${emoji}-${index}`}
          variant={variant}
          size={size}
          ariaLabel={`Emoji ${index + 1}: ${emoji}`}
        >
          {emoji}
        </Emoji>
      ))}
    </div>
  );
}

/**
 * Emoji with text component for labeled emoji display
 */
export function EmojiWithText({
  emoji,
  text,
  emojiFirst = true,
  className,
  emojiProps,
}: {
  emoji: string;
  text: string;
  emojiFirst?: boolean;
  className?: string;
  emojiProps?: Partial<EmojiProps>;
}) {
  const emojiElement = (
    <Emoji {...emojiProps} ariaLabel={`${text} icon`}>
      {emoji}
    </Emoji>
  );

  const textElement = <span>{text}</span>;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {emojiFirst ? (
        <>
          {emojiElement}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {emojiElement}
        </>
      )}
    </div>
  );
}
