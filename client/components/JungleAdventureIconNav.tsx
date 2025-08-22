"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import JungleAdventureParentDashboard from "@/components/JungleAdventureParentDashboard";
import JungleAdventureSettingsPanelV2 from "@/components/JungleAdventureSettingsPanelV2";
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
    iconSrc: "/images/iconset/home.webp",
    labelColor: "#FFD700",
    ariaLabel: "Navigate to Home",
  },
  {
    id: "jungle",
    label: "Jungle",
    iconSrc: "/images/iconset/book.webp",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Jungle Learning",
  },
  {
    id: "quiz",
    label: "Quiz",
    iconSrc: "/images/iconset/quiz.webp",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Quiz Games",
  },
  {
    id: "trophy",
    label: "Trophy",
    iconSrc: "/images/iconset/trophy.webp",
    labelColor: "#FFFFFF",
    ariaLabel: "Navigate to Trophy Gallery",
  },
  {
    id: "parents",
    label: "Parents",
    iconSrc: "/images/iconset/parent.webp",
    labelColor: "#FFD700",
    ariaLabel: "Navigate to Parent Area",
  },
];

export default function JungleAdventureIconNav({
  activeId,
  items = DEFAULT_ITEMS,
  onNavigate,
  className = "",
}: JungleAdventureIconNavProps) {
  const [tappedItem, setTappedItem] = useState<string | null>(null);
  const [translateY, setTranslateY] = useState(-55);
  const [showParentMenu, setShowParentMenu] = useState(false);
  const [showParentDashboard, setShowParentDashboard] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  // Update translateY based on screen size - slightly lower positioning
  useEffect(() => {
    const updateTranslateY = () => {
      if (window.innerWidth <= 374) {
        setTranslateY(-75); // Very small screens - brought down 20px
      } else if (window.innerWidth <= 767) {
        setTranslateY(-45); // Mobile - brought down 15px
      } else {
        setTranslateY(-40); // Desktop - brought down 15px
      }
    };

    updateTranslateY();
    window.addEventListener("resize", updateTranslateY);
    return () => window.removeEventListener("resize", updateTranslateY);
  }, []);

  const handleParentAction = (action: string) => {
    setShowParentMenu(false);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    switch (action) {
      case "dashboard":
        setShowParentDashboard(true);
        break;
      case "settings":
        setShowSettingsPanel(true);
        break;
    }
  };

  const handleNavigation = (itemId: string) => {
    // Set tapped state for visual feedback
    setTappedItem(itemId);

    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Reset tapped state after animation
    setTimeout(() => setTappedItem(null), 300);

    // Special handling for parent icon - show parent menu dialog
    if (itemId === "parents") {
      setShowParentMenu(true);
      return;
    }

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
        height: "49px", // Reduced height by 30% for better icon visibility
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
                touchAction: "manipulation",
              }}
            >
              <motion.img
                src={item.iconSrc}
                alt={item.label}
                className="jungle-nav-icon"
                initial={{ y: translateY }}
                animate={{
                  scale: isTapped ? 1.1 : 1,
                  y: translateY, // Maintain elevated position during animations
                }}
                whileHover={{
                  scale: 1.05,
                  y: translateY - 20, // Float even higher on hover
                }}
                whileTap={{
                  scale: 1.1,
                  y: translateY - 10, // Slight additional lift on tap
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
                  color: item.labelColor,
                }}
                animate={{
                  color: isTapped
                    ? item.labelColor === "#FFD700"
                      ? "#FFED4A"
                      : "#F7FAFC"
                    : item.labelColor,
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
                  <Button
                    className="px-4 py-3 rounded-lg bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleParentAction("dashboard")}
                  >
                    <span className="flex items-center gap-2">
                      📊 Parent Dashboard
                    </span>
                  </Button>

                  <Button
                    className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => handleParentAction("settings")}
                  >
                    <span className="flex items-center gap-2">
                      ⚙️ Jungle Settings
                    </span>
                  </Button>
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
          <JungleAdventureSettingsPanelV2
            open={showSettingsPanel}
            onOpenChange={setShowSettingsPanel}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
