"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import JungleAdventureSettingsPanelV2 from "@/components/JungleAdventureSettingsPanelV2";
import { JungleAdventureParentDashboard } from "@/components/JungleAdventureParentDashboard";
import { EnhancedJungleParentMenuDialog } from "@/components/EnhancedJungleParentMenuDialog";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "@/styles/jungle-nav-v3-animations.css";
import "@/styles/jungle-theme.css";
import "@/styles/enhanced-jungle-parent-menu.css";

export type JungleNavItem = {
  id: string;
  label: string;
  emoji: string;
  ariaLabel?: string;
  onClick?: () => void;
};

interface JungleAdventureNavV3Props {
  /** Current route/active item id */
  activeId?: string;
  /** Items to render; default set provided */
  items?: JungleNavItem[];
  /** Called when user chooses a nav item */
  onNavigate?: (id: string) => void;
  /** Set to true to pause all animations globally */
  pauseAnimations?: boolean;
  /** Parent Dashboard handler */
  onParentDashboard?: () => void;
  /** Settings handler */
  onParentSettings?: () => void;
  /** Sign out handler */
  onParentSignOut?: () => void;
  /** Register handler */
  onParentRegister?: () => void;
  /** Additional parent dialog sections */
  parentDialogSections?: {
    dashboard?: boolean;
    settings?: boolean;
    signOut?: boolean;
  };
}

const DEFAULT_ITEMS: JungleNavItem[] = [
  { id: "dashboard", label: "Home", emoji: "🦉", ariaLabel: "Dashboard" },
  { id: "learn", label: "Words", emoji: "🦜", ariaLabel: "Learning" },
  { id: "quiz", label: "Quiz", emoji: "🐵", ariaLabel: "Quiz Games" },
  {
    id: "achievements",
    label: "Trophy",
    emoji: "🐘",
    ariaLabel: "Achievements",
  },
];

// Hook for reduced motion
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

// Utility function to get animal-specific CSS class for totem animations
function getAnimalAnimationClass(emoji: string): string {
  switch (emoji) {
    case "🦉":
      return "jng-nav-icon-owl";
    case "🦜":
      return "jng-nav-icon-parrot";
    case "🐵":
      return "jng-nav-icon-monkey";
    case "🐘":
      return "jng-nav-icon-elephant";
    default:
      return "jng-nav-v3-icon";
  }
}

// Enhanced totem icon sizes - Larger than bar, rising like jungle totems
const TOTEM_ICON_SIZE = {
  base: "3.28rem", // Increased by 40% from 2.34rem (2.34 * 1.4 = 3.276)
  mobileBase: "2.91rem", // Increased by 40% from 2.08rem (2.08 * 1.4 = 2.912)
  active: "scale-110",
  hover: "scale-115",
  tap: "scale-95",
};

export default function JungleAdventureNavV3({
  activeId,
  items = DEFAULT_ITEMS,
  onNavigate,
  pauseAnimations = false,
  onParentDashboard,
  onParentSettings,
  onParentSignOut,
  onParentRegister,
  parentDialogSections = {
    dashboard: true,
    settings: true,
    signOut: true,
  },
}: JungleAdventureNavV3Props) {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showParentMenu, setShowParentMenu] = useState(false);

  const shouldAnimate = !pauseAnimations && !reducedMotion;

  const handleParentAction = (action: string) => {
    setShowParentMenu(false);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    switch (action) {
      case "dashboard":
        if (onParentDashboard) {
          onParentDashboard();
        } else {
          setShowParentDashboard(true);
        }
        break;
      case "settings":
        if (onParentSettings) {
          onParentSettings();
        } else {
          setShowSettingsPanel(true);
        }
        break;
      case "logout":
        if (isGuest) {
          navigate("/signup");
          onParentRegister?.();
        } else {
          logout();
          onParentSignOut?.();
        }
        break;
    }
  };

  const handleNavigation = (itemId: string) => {
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    const item = items.find((i) => i.id === itemId);
    if (item?.onClick) {
      item.onClick();
    } else if (onNavigate) {
      onNavigate(itemId);
    }
  };

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-green-900 via-green-800 to-green-700 shadow-lg z-50 border-t-2 border-green-600 opacity-100 jng-nav-container-reduced ${
          pauseAnimations ? "jng-nav-animations-paused" : ""
        }`}
        aria-label="Jungle Adventure Navigation"
        style={{
          backgroundColor: "rgba(22, 101, 52, 0.95)", // Fallback solid background
          backdropFilter: "blur(8px)",
          overflow: "visible", // Allow icons to float above the bar
        }}
      >
        {/* Navigation Bar - Mobile reduced by 50%, Desktop unchanged */}
        <div
          className="flex items-end px-2 py-0 md:py-1.5 relative min-h-[0.5px] md:min-h-[42px]"
          style={{ overflow: "visible" }}
        >
          {" "}
          {/* Mobile: 1px -> 0.5px (-50%), Desktop: 42px (unchanged) */}
          {/* Desktop Layout: Centered main icons + right-positioned parent icon */}
          <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 bottom-1 gap-4">
            {items.map((item) => {
              const isActive = item.id === activeId;
              const animalClass = getAnimalAnimationClass(item.emoji);

              return (
                <motion.button
                  key={item.id}
                  whileTap={shouldAnimate ? { scale: 0.9 } : {}}
                  whileHover={shouldAnimate ? { scale: 1.05 } : {}}
                  className={`jng-nav-icon-container flex flex-col items-center text-white transition-colors duration-200 ${
                    isActive
                      ? "text-yellow-300"
                      : "text-white hover:text-yellow-200"
                  }`}
                  onClick={() => handleNavigation(item.id)}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`${animalClass} ${
                      isActive ? "active" : ""
                    } drop-shadow-lg`}
                    style={{
                      fontSize: TOTEM_ICON_SIZE.base, // Desktop: 3.28rem
                      textShadow: isActive
                        ? "0 0 12px rgba(255,255,255,0.4), 0 0 20px rgba(255,193,7,0.3)"
                        : "0 0 8px rgba(255,255,255,0.3)",
                    }}
                  >
                    {item.emoji}
                  </span>
                  <span className="text-xs mt-[-8px] font-medium leading-none">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          {/* Desktop Parent Menu Button - Right Side */}
          <div className="hidden md:block absolute right-2 bottom-1">
            <motion.button
              whileTap={shouldAnimate ? { scale: 0.9 } : {}}
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              className="jng-nav-icon-container flex flex-col items-center text-yellow-300 transition-colors duration-200 hover:text-yellow-200 relative"
              onClick={() => setShowParentMenu(true)}
              aria-label="Parent Menu - Access family controls and settings"
              aria-expanded={showParentMenu}
              aria-haspopup="dialog"
            >
              {/* Vine Wrap Animation */}
              <div
                className={`vine-wrap-container absolute inset-0 pointer-events-none ${showParentMenu ? "vine-active" : ""}`}
              >
                <span className="vine-wrap vine-wrap-1">🌿</span>
                <span className="vine-wrap vine-wrap-2">🌿</span>
                <span className="vine-wrap vine-wrap-3">🌿</span>
              </div>

              <span
                className={`jng-nav-icon-totem drop-shadow-lg relative z-10 ${
                  showParentMenu ? "active" : ""
                }`}
                style={{
                  fontSize: "4.91rem", // Desktop: 3.51rem * 1.4 = 4.914rem
                  textShadow:
                    "0 0 15px rgba(255,193,7,0.5), 0 0 25px rgba(255,193,7,0.2)",
                }}
              >
                🪵
              </span>
              <span className="text-xs mt-[-8px] font-medium leading-none relative z-10">
                Family
              </span>
            </motion.button>
          </div>
          {/* Mobile Layout: Distributed layout for smaller screens */}
          <div className="flex md:hidden justify-around w-full">
            {items.map((item) => {
              const isActive = item.id === activeId;
              const animalClass = getAnimalAnimationClass(item.emoji);

              return (
                <motion.button
                  key={item.id}
                  whileTap={shouldAnimate ? { scale: 0.9 } : {}}
                  whileHover={shouldAnimate ? { scale: 1.05 } : {}}
                  className={`jng-nav-icon-container flex flex-col items-center text-white transition-colors duration-200 ${
                    isActive
                      ? "text-yellow-300"
                      : "text-white hover:text-yellow-200"
                  }`}
                  onClick={() => handleNavigation(item.id)}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`${animalClass} ${
                      isActive ? "active" : ""
                    } drop-shadow-lg`}
                    style={{
                      fontSize: TOTEM_ICON_SIZE.mobileBase, // Mobile: 2.91rem
                      textShadow: isActive
                        ? "0 0 12px rgba(255,255,255,0.4), 0 0 20px rgba(255,193,7,0.3)"
                        : "0 0 8px rgba(255,255,255,0.3)",
                    }}
                  >
                    {item.emoji}
                  </span>
                  <span className="text-xs mt-[-8px] font-medium leading-none">
                    {item.label}
                  </span>
                </motion.button>
              );
            })}

            {/* Mobile Parent Menu Button */}
            <motion.button
              whileTap={shouldAnimate ? { scale: 0.9 } : {}}
              whileHover={shouldAnimate ? { scale: 1.05 } : {}}
              className="jng-nav-icon-container flex flex-col items-center text-yellow-300 transition-colors duration-200 hover:text-yellow-200 relative"
              onClick={() => setShowParentMenu(true)}
              aria-label="Parent Menu - Access family controls and settings"
              aria-expanded={showParentMenu}
              aria-haspopup="dialog"
            >
              {/* Vine Wrap Animation - Mobile */}
              <div
                className={`vine-wrap-container absolute inset-0 pointer-events-none ${showParentMenu ? "vine-active" : ""}`}
              >
                <span className="vine-wrap vine-wrap-1">🌿</span>
                <span className="vine-wrap vine-wrap-2">🌿</span>
                <span className="vine-wrap vine-wrap-3">🌿</span>
              </div>

              <span
                className={`jng-nav-icon-totem drop-shadow-lg relative z-10 ${
                  showParentMenu ? "active" : ""
                }`}
                style={{
                  fontSize: "4.37rem", // Mobile: 3.12rem * 1.4 = 4.368rem
                  textShadow:
                    "0 0 15px rgba(255,193,7,0.5), 0 0 25px rgba(255,193,7,0.2)",
                }}
              >
                🪵
              </span>
              <span className="text-xs mt-[-8px] font-medium leading-none relative z-10">
                Family
              </span>
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Enhanced Parent Menu Dialog */}
      <EnhancedJungleParentMenuDialog
        isOpen={showParentMenu}
        onClose={() => setShowParentMenu(false)}
        parentDialogSections={parentDialogSections}
        isGuest={isGuest}
        onParentAction={handleParentAction}
        className="enhanced-jungle-parent-menu"
      />

      {/* Parent Dashboard Popup */}
      <AnimatePresence>
        {showParentDashboard && (
          <Dialog
            open={showParentDashboard}
            onOpenChange={setShowParentDashboard}
          >
            <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto p-0">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-xl font-bold text-green-900">
                  📊 Parent Dashboard
                </DialogTitle>
              </DialogHeader>
              <div className="p-4 pt-0">
                <JungleAdventureParentDashboard />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Settings Panel Popup */}
      <AnimatePresence>
        {showSettingsPanel && (
          <JungleAdventureSettingsPanelV2
            open={showSettingsPanel}
            onOpenChange={setShowSettingsPanel}
          />
        )}
      </AnimatePresence>
    </>
  );
}
