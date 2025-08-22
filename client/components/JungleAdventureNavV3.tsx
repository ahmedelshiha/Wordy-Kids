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
import { JungleAdventureSettingsPanel } from "@/components/JungleAdventureSettingsPanel";
import { JungleAdventureParentDashboard } from "@/components/JungleAdventureParentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import "@/styles/jungle-nav-v3-animations.css";

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
  { id: "dashboard", label: "Home Tree", emoji: "🦉", ariaLabel: "Dashboard" },
  { id: "learn", label: "Word Jungle", emoji: "🦜", ariaLabel: "Learning" },
  { id: "quiz", label: "Quiz Adventure", emoji: "🐵", ariaLabel: "Quiz Games" },
  {
    id: "achievements",
    label: "Trophy Grove",
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

// Utility function to get animal-specific CSS class
function getAnimalAnimationClass(emoji: string): string {
  switch (emoji) {
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

// Enhanced icon size calculation (20% larger than base size)
const ENHANCED_ICON_SIZE = {
  base: "3.6rem", // 20% larger than 3rem (text-3xl)
  active: "scale-110",
  hover: "scale-115",
  tap: "scale-95"
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
        className={`fixed bottom-0 left-0 w-full bg-gradient-to-t from-green-900 via-green-800 to-green-700 shadow-lg z-50 border-t-2 border-green-600 ${
          pauseAnimations ? "jng-nav-animations-paused" : ""
        }`}
        aria-label="Jungle Adventure Navigation"
      >
        {/* Navigation Bar */}
        <div className="flex justify-around items-end px-4 py-2">
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
                style={{ minHeight: "45px", minWidth: "45px" }}
              >
                <span
                  className={`${animalClass} ${
                    isActive ? "active" : ""
                  } drop-shadow-lg transform transition-transform duration-200`}
                  style={{
                    fontSize: ENHANCED_ICON_SIZE.base,
                    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
                    textShadow: isActive
                      ? "0 0 12px rgba(255,255,255,0.4), 0 0 20px rgba(255,193,7,0.3)"
                      : "0 0 8px rgba(255,255,255,0.3)",
                    marginBottom: "2px", // Totem-lift effect
                  }}
                >
                  {item.emoji}
                </span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </motion.button>
            );
          })}

          {/* Parent Menu Button */}
          <motion.button
            whileTap={shouldAnimate ? { scale: 0.9 } : {}}
            whileHover={shouldAnimate ? { scale: 1.05 } : {}}
            className="jng-nav-icon-container flex flex-col items-center text-yellow-300 transition-colors duration-200 hover:text-yellow-200"
            onClick={() => setShowParentMenu(true)}
            aria-label="Parent Menu - Access family controls and settings"
            aria-expanded={showParentMenu}
            aria-haspopup="dialog"
            style={{ minHeight: "45px", minWidth: "45px" }}
          >
            <span
              className="jng-nav-icon-totem drop-shadow-lg"
              style={{
                fontSize: ENHANCED_ICON_SIZE.base,
                filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
                textShadow: "0 0 15px rgba(255,193,7,0.5), 0 0 25px rgba(255,193,7,0.2)",
                marginBottom: "2px", // Totem-lift effect
              }}
            >
              🪵
            </span>
            <span className="text-xs mt-1 font-medium">Parents</span>
          </motion.button>
        </div>
      </nav>

      {/* Parent Menu Popup */}
      <AnimatePresence>
        {showParentMenu && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowParentMenu(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center border-4 border-amber-700 relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 248, 220, 0.95) 0%,
                    rgba(250, 240, 200, 0.98) 100%
                  )
                `,
                boxShadow: `
                  inset 0 2px 4px rgba(160, 82, 45, 0.15),
                  0 8px 25px rgba(139, 69, 19, 0.4),
                  0 0 30px rgba(255, 193, 7, 0.2)
                `,
              }}
            >
              {/* Jungle Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-2 left-2 text-lg opacity-20">
                  🌿
                </div>
                <div className="absolute top-4 right-4 text-sm opacity-25">
                  🍃
                </div>
                <div className="absolute bottom-2 left-4 text-sm opacity-20">
                  🌱
                </div>
                <div className="absolute top-1/2 right-2 text-sm opacity-15">
                  🦋
                </div>
              </div>

              <div className="relative z-10">
                <h2 className="text-xl font-bold text-green-900 mb-4 flex items-center justify-center gap-2">
                  🪵 <span>Parent Menu</span>
                </h2>

                <div className="flex flex-col gap-3">
                  {parentDialogSections.dashboard && (
                    <Button
                      className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => handleParentAction("dashboard")}
                    >
                      <span className="flex items-center gap-2">
                        📊 Parent Dashboard
                      </span>
                    </Button>
                  )}

                  {parentDialogSections.settings && (
                    <Button
                      className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                      onClick={() => handleParentAction("settings")}
                    >
                      <span className="flex items-center gap-2">
                        ⚙️ Jungle Settings
                      </span>
                    </Button>
                  )}

                  {parentDialogSections.signOut && (
                    <Button
                      className={`px-4 py-3 rounded-lg text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] ${
                        isGuest
                          ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      }`}
                      onClick={() => handleParentAction("logout")}
                    >
                      <span className="flex items-center gap-2">
                        {isGuest
                          ? "✨ Sign Up / Register"
                          : "🌿 Goodbye & Log Off"}
                      </span>
                    </Button>
                  )}
                </div>

                <button
                  className="mt-4 text-sm text-gray-600 underline hover:text-gray-800 transition-colors duration-200"
                  onClick={() => setShowParentMenu(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
          <JungleAdventureSettingsPanel
            isOpen={showSettingsPanel}
            onClose={() => setShowSettingsPanel(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
