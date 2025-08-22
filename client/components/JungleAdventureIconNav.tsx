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
import '@/styles/jungle-icon-nav.css";\nimport "@/styles/enhanced-jungle-parent-menu.css";\nimport "@/styles/jungle-parent-menu-buttons.css';

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

      {/* Enhanced Parent Menu Popup - Jungle Adventure Theme */}
      <AnimatePresence>
        {showParentMenu && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowParentMenu(false)}
            style={{
              background: `
                radial-gradient(circle at 30% 70%, rgba(34, 139, 34, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 70% 30%, rgba(76, 175, 80, 0.2) 0%, transparent 50%),
                linear-gradient(135deg,
                  rgba(0, 0, 0, 0.7) 0%,
                  rgba(20, 40, 20, 0.8) 50%,
                  rgba(0, 0, 0, 0.7) 100%
                )
              `,
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Floating Jungle Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Animated fireflies */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`firefly-${i}`}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full shadow-lg"
                  style={{
                    left: `${20 + i * 10}%`,
                    top: `${30 + (i % 3) * 20}%`,
                    boxShadow: "0 0 8px rgba(255, 255, 0, 0.8)",
                  }}
                  animate={{
                    x: [0, 20, -10, 0],
                    y: [0, -15, 10, 0],
                    opacity: [0.3, 1, 0.5, 0.8],
                  }}
                  transition={{
                    duration: 4 + i * 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* Floating leaves */}
              {["🍃", "🌿", "🍀", "🌱"].map((leaf, i) => (
                <motion.div
                  key={`leaf-${i}`}
                  className="absolute text-2xl opacity-20"
                  style={{
                    left: `${10 + i * 25}%`,
                    top: `${20 + i * 15}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, 15, -5, 0],
                    rotate: [0, 10, -5, 0],
                  }}
                  transition={{
                    duration: 6 + i * 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {leaf}
                </motion.div>
              ))}
            </div>

            <motion.div
              className="jungle-parent-menu-container jungle-wood-texture relative w-[95%] max-w-lg mx-auto text-center overflow-hidden"
              initial={{ scale: 0.7, opacity: 0, y: 50, rotateX: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 50, rotateX: 15 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                duration: 0.6,
              }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: `
                  linear-gradient(135deg,
                    rgba(255, 248, 220, 0.98) 0%,
                    rgba(250, 240, 200, 0.95) 25%,
                    rgba(245, 235, 190, 0.98) 50%,
                    rgba(240, 230, 180, 0.95) 75%,
                    rgba(235, 225, 170, 0.98) 100%
                  )
                `,
                borderRadius: "24px",
                border: "4px solid #8B4513",
                boxShadow: `
                  inset 0 4px 8px rgba(160, 82, 45, 0.2),
                  inset 0 -2px 4px rgba(139, 69, 19, 0.3),
                  0 20px 40px rgba(0, 0, 0, 0.4),
                  0 0 60px rgba(255, 193, 7, 0.3),
                  0 0 0 1px rgba(222, 184, 135, 0.5)
                `,
              }}
            >
              {/* Wood grain texture overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  borderRadius: "20px",
                  backgroundImage: `
                    repeating-linear-gradient(
                      90deg,
                      rgba(139, 69, 19, 0.1) 0px,
                      rgba(139, 69, 19, 0.1) 2px,
                      transparent 2px,
                      transparent 8px
                    ),
                    repeating-linear-gradient(
                      0deg,
                      rgba(160, 82, 45, 0.08) 0px,
                      rgba(160, 82, 45, 0.08) 1px,
                      transparent 1px,
                      transparent 12px
                    )
                  `,
                }}
              />

              {/* Enhanced jungle decorative elements */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ borderRadius: "20px" }}
              >
                {/* Corner vines */}
                <div className="absolute top-0 left-0 text-3xl opacity-25 transform -rotate-12">
                  🌿
                </div>
                <div className="absolute top-0 right-0 text-3xl opacity-25 transform rotate-12">
                  🌿
                </div>
                <div className="absolute bottom-2 left-2 text-2xl opacity-20">
                  🍃
                </div>
                <div className="absolute bottom-2 right-2 text-2xl opacity-20">
                  🍃
                </div>

                {/* Animated jungle creatures */}
                <motion.div
                  className="absolute top-4 left-1/4 text-xl"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🦋
                </motion.div>

                <motion.div
                  className="absolute top-6 right-1/4 text-lg"
                  animate={{
                    x: [0, 5, -5, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🐛
                </motion.div>

                <motion.div
                  className="absolute bottom-6 left-1/3 text-lg"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🌺
                </motion.div>
              </div>

              {/* Content container */}
              <div className="relative z-10 p-6 md:p-8">
                {/* Enhanced header */}
                <motion.div
                  className="mb-6"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <motion.span
                      className="text-4xl"
                      animate={{
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🪵
                    </motion.span>
                    <h2 className="text-2xl md:text-3xl font-bold text-green-900 font-serif">
                      Parent Jungle Portal
                    </h2>
                  </div>
                  <p className="text-sm md:text-base text-green-700 opacity-80 font-medium">
                    🌟 Welcome to the Guardian's Gateway 🌟
                  </p>
                </motion.div>

                {/* Enhanced action buttons */}
                <motion.div
                  className="flex flex-col gap-4 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  {/* Parent Dashboard Button */}
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      className="w-full px-6 py-4 rounded-2xl text-white font-semibold text-base md:text-lg relative overflow-hidden group transition-all duration-300"
                      onClick={() => handleParentAction("dashboard")}
                      style={{
                        background: `
                          linear-gradient(135deg,
                            #059669 0%,
                            #10b981 25%,
                            #34d399 50%,
                            #10b981 75%,
                            #059669 100%
                          )
                        `,
                        boxShadow: `
                          0 8px 16px rgba(5, 150, 105, 0.3),
                          inset 0 2px 4px rgba(255, 255, 255, 0.2),
                          inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                        `,
                      }}
                    >
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <span className="text-2xl">📊</span>
                        <span className="flex flex-col items-start">
                          <span className="font-bold">Parent Dashboard</span>
                          <span className="text-xs opacity-90">
                            Monitor progress & insights
                          </span>
                        </span>
                      </span>
                    </Button>
                  </motion.div>

                  {/* Jungle Settings Button */}
                  <motion.div
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      className="w-full px-6 py-4 rounded-2xl text-white font-semibold text-base md:text-lg relative overflow-hidden group transition-all duration-300"
                      onClick={() => handleParentAction("settings")}
                      style={{
                        background: `
                          linear-gradient(135deg,
                            #1e40af 0%,
                            #3b82f6 25%,
                            #60a5fa 50%,
                            #3b82f6 75%,
                            #1e40af 100%
                          )
                        `,
                        boxShadow: `
                          0 8px 16px rgba(30, 64, 175, 0.3),
                          inset 0 2px 4px rgba(255, 255, 255, 0.2),
                          inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                        `,
                      }}
                    >
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                      <span className="flex items-center justify-center gap-3 relative z-10">
                        <span className="text-2xl">⚙️</span>
                        <span className="flex flex-col items-start">
                          <span className="font-bold">Jungle Settings</span>
                          <span className="text-xs opacity-90">
                            Customize adventure experience
                          </span>
                        </span>
                      </span>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Enhanced close button */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <button
                    className="text-green-700 hover:text-green-900 font-medium text-sm md:text-base underline decoration-2 underline-offset-4 hover:decoration-green-900 transition-all duration-200 px-4 py-2 rounded-lg hover:bg-green-100/50"
                    onClick={() => setShowParentMenu(false)}
                  >
                    🌿 Return to Jungle Adventure
                  </button>
                </motion.div>
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
