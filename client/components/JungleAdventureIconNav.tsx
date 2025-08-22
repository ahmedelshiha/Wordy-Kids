"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import "@/styles/jungle-icon-nav.css";

export type IconNavItem = {
  id: string;
  label: string;
  iconSrc: string;
  labelColor: string;
  ariaLabel?: string;
  onClick?: () => void;
};

interface JungleAdventureIconNavProps {
  /** Current route/active item id */
  activeId?: string;
  /** Items to render; default set provided */
  items?: IconNavItem[];
  /** Called when user chooses a nav item */
  onNavigate?: (id: string) => void;
  /** Additional className for styling */
  className?: string;
}

const DEFAULT_ITEMS: IconNavItem[] = [
  { 
    id: "home", 
    label: "Home", 
    iconSrc: "/images/iconset/home.png",
    labelColor: "#FFD700",
    ariaLabel: "Navigate to Home" 
  },
  { 
    id: "jungle", 
    label: "Jungle", 
    iconSrc: "/images/iconset/book.png",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Jungle Learning" 
  },
  { 
    id: "quiz", 
    label: "Quiz", 
    iconSrc: "/images/iconset/quiz.png",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Quiz Games" 
  },
  { 
    id: "trophy", 
    label: "Trophy", 
    iconSrc: "/images/iconset/trophy.png",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Trophy Gallery" 
  },
  { 
    id: "parents", 
    label: "Parents", 
    iconSrc: "/images/iconset/parent.png",
    labelColor: "#FFD700",
    ariaLabel: "Navigate to Parent Area" 
  },
];

export default function JungleAdventureIconNav({
  activeId,
  items = DEFAULT_ITEMS,
  onNavigate,
  className = "",
}: JungleAdventureIconNavProps) {
  const [tappedItem, setTappedItem] = useState<string | null>(null);

  const handleNavigation = (itemId: string) => {
    // Set tapped state for visual feedback
    setTappedItem(itemId);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Reset tapped state after animation
    setTimeout(() => setTappedItem(null), 300);

    const item = items.find((i) => i.id === itemId);
    if (item?.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 w-full z-50 jungle-icon-nav ${className}`}
      aria-label="Jungle Adventure Navigation"
      style={{
        backgroundColor: "#0b6623", // Dark jungle green
        height: "64px",
        overflow: "visible", // Allow icons to float above
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div 
        className="flex justify-around items-end h-full px-2"
        style={{ overflow: "visible" }}
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          const isTapped = tappedItem === item.id;

          return (
            <motion.button
              key={item.id}
              className="jungle-icon-nav-item flex flex-col items-center"
              onClick={() => handleNavigation(item.id)}
              aria-label={item.ariaLabel || item.label}
              aria-current={isActive ? "page" : undefined}
              animate={{
                scale: isTapped ? 1.2 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
                duration: 0.2,
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "0",
                minWidth: "48px",
                minHeight: "48px",
                // Ensure touch area is adequate
                touchAction: "manipulation",
              }}
            >
              <motion.img
                src={item.iconSrc}
                alt={item.label}
                className="jungle-nav-icon"
                style={{
                  width: "12vw",
                  maxWidth: "48px",
                  height: "auto",
                  // Float above the bar
                  transform: "translateY(-20px)", // Desktop default
                  filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.25))",
                }}
                animate={{
                  scale: isTapped ? 1.1 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                  duration: 0.2,
                }}
              />
              <motion.span
                className="jungle-nav-label"
                style={{
                  fontSize: "3vw",
                  maxFontSize: "14px",
                  lineHeight: "1.1em",
                  color: item.labelColor,
                  fontWeight: "500",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  marginTop: "-16px", // Bring label closer to icon
                }}
                animate={{
                  color: isTapped ? (item.labelColor === "#FFD700" ? "#FFED4A" : "#F7FAFC") : item.labelColor,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
