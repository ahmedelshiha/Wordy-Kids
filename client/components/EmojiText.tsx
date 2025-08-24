/**
 * PHASE 3: React Component for Safe Emoji Rendering
 * Ensures emojis are displayed correctly with proper font fallbacks
 */

import React from "react";
import { safeEmojiString } from "@/lib/emojiUtils";

interface EmojiTextProps {
  children: React.ReactNode;
  className?: string;
  normalize?: boolean;
  style?: React.CSSProperties;
  inline?: boolean;
}

/**
 * EmojiText Component - Safely renders text with emojis
 * Uses proper font stack and Unicode normalization
 */
export const EmojiText: React.FC<EmojiTextProps> = ({
  children,
  className = "",
  normalize = true,
  style = {},
  inline = true,
}) => {
  const content =
    typeof children === "string" && normalize
      ? safeEmojiString(children)
      : children;

  const emojiStyles: React.CSSProperties = {
    fontVariantEmoji: "unicode",
    fontFamily:
      "Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, Android Emoji, EmojiSymbols, system-ui, sans-serif",
    textRendering: "optimizeLegibility",
    ...style,
  };

  const Component = inline ? "span" : "div";

  return (
    <Component className={`emoji-text ${className}`.trim()} style={emojiStyles}>
      {content}
    </Component>
  );
};

/**
 * EmojiIcon Component - For standalone emoji display
 */
interface EmojiIconProps {
  emoji: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export const EmojiIcon: React.FC<EmojiIconProps> = ({
  emoji,
  size = "md",
  className = "",
  style = {},
  title,
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const normalizedEmoji = safeEmojiString(emoji);

  return (
    <EmojiText
      className={`emoji-icon ${sizeClasses[size]} ${className}`.trim()}
      style={{
        display: "inline-block",
        lineHeight: 1,
        ...style,
      }}
      title={title}
      normalize={false} // Already normalized
    >
      {normalizedEmoji}
    </EmojiText>
  );
};

/**
 * EmojiButton Component - Interactive emoji element
 */
interface EmojiButtonProps {
  emoji: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
}

export const EmojiButton: React.FC<EmojiButtonProps> = ({
  emoji,
  onClick,
  className = "",
  disabled = false,
  size = "md",
  title,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`emoji-button ${className}`.trim()}
      title={title}
      style={{
        background: "none",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: "4px",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <EmojiIcon
        emoji={emoji}
        size={size}
        style={{
          transform: "scale(1)",
          transition: "transform 0.1s ease",
        }}
      />
    </button>
  );
};

/**
 * EmojiWithFallback Component - Renders emoji with text fallback
 */
interface EmojiWithFallbackProps {
  emoji: string;
  fallback: string;
  showFallback?: boolean;
  className?: string;
}

export const EmojiWithFallback: React.FC<EmojiWithFallbackProps> = ({
  emoji,
  fallback,
  showFallback = false,
  className = "",
}) => {
  if (showFallback) {
    return <span className={className}>{fallback}</span>;
  }

  return <EmojiText className={className}>{emoji}</EmojiText>;
};

export default EmojiText;
