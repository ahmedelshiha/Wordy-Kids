import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import {
  X,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
  Sparkles,
} from "lucide-react";

interface ParentDialogSections {
  dashboard: boolean;
  settings: boolean;
  signOut: boolean;
}

interface EnhancedJungleParentMenuDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parentDialogSections: ParentDialogSections;
  isGuest?: boolean;
  onParentAction: (action: "dashboard" | "settings" | "logout") => void;
  className?: string;
}

// Floating jungle particles configuration
const JUNGLE_PARTICLES = [
  { emoji: "🌿", id: "leaf1", delay: 0 },
  { emoji: "🦋", id: "butterfly1", delay: 2 },
  { emoji: "🌺", id: "flower1", delay: 4 },
  { emoji: "🐛", id: "bug1", delay: 6 },
  { emoji: "🍃", id: "leaf2", delay: 1 },
  { emoji: "✨", id: "sparkle1", delay: 3 },
  { emoji: "🌱", id: "sprout1", delay: 5 },
  { emoji: "🕷️", id: "spider1", delay: 7 },
];

// Background foliage elements
const BACKGROUND_FOLIAGE = [
  {
    emoji: "🌴",
    position: { top: "10%", left: "5%" },
    size: "text-3xl",
    opacity: 0.15,
  },
  {
    emoji: "🌿",
    position: { top: "20%", right: "8%" },
    size: "text-2xl",
    opacity: 0.2,
  },
  {
    emoji: "🍃",
    position: { bottom: "15%", left: "10%" },
    size: "text-xl",
    opacity: 0.18,
  },
  {
    emoji: "🌺",
    position: { top: "60%", right: "12%" },
    size: "text-2xl",
    opacity: 0.16,
  },
  {
    emoji: "🌱",
    position: { bottom: "25%", right: "6%" },
    size: "text-lg",
    opacity: 0.14,
  },
  {
    emoji: "🦋",
    position: { top: "35%", left: "8%" },
    size: "text-xl",
    opacity: 0.12,
  },
];

export function EnhancedJungleParentMenuDialog({
  isOpen,
  onClose,
  parentDialogSections,
  isGuest = false,
  onParentAction,
  className = "",
}: EnhancedJungleParentMenuDialogProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [particlesAnimating, setParticlesAnimating] = useState(false);

  // Start particle animation when dialog opens
  useEffect(() => {
    if (isOpen) {
      setParticlesAnimating(true);
      // Add subtle haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate([5, 50, 5]);
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setParticlesAnimating(false);
    }, 300);
  };

  const handleParentAction = (action: "dashboard" | "settings" | "logout") => {
    // Add haptic feedback for button actions
    if (navigator.vibrate) {
      navigator.vibrate([10, 20, 10]);
    }

    handleClose();
    setTimeout(() => {
      onParentAction(action);
    }, 150);
  };

  const buttonConfig = [
    {
      id: "dashboard",
      show: parentDialogSections.dashboard,
      icon: BarChart3,
      emoji: "📊",
      label: "Parent Dashboard",
      description: "View your child's learning progress",
      gradient: "from-emerald-600 via-green-600 to-emerald-700",
      hoverGradient: "from-emerald-700 via-green-700 to-emerald-800",
      glowColor: "rgba(16, 185, 129, 0.4)",
    },
    {
      id: "settings",
      show: parentDialogSections.settings,
      icon: Settings,
      emoji: "⚙️",
      label: "Jungle Settings",
      description: "Customize the adventure experience",
      gradient: "from-blue-600 via-cyan-600 to-blue-700",
      hoverGradient: "from-blue-700 via-cyan-700 to-blue-800",
      glowColor: "rgba(59, 130, 246, 0.4)",
    },
    {
      id: "logout",
      show: parentDialogSections.signOut,
      icon: isGuest ? UserPlus : LogOut,
      emoji: isGuest ? "✨" : "🌿",
      label: isGuest ? "Sign Up / Register" : "Goodbye & Log Off",
      description: isGuest
        ? "Join the jungle adventure family"
        : "Until next time, brave explorer",
      gradient: isGuest
        ? "from-purple-600 via-violet-600 to-purple-700"
        : "from-rose-600 via-pink-600 to-rose-700",
      hoverGradient: isGuest
        ? "from-purple-700 via-violet-700 to-purple-800"
        : "from-rose-700 via-pink-700 to-rose-800",
      glowColor: isGuest ? "rgba(147, 51, 234, 0.4)" : "rgba(244, 63, 94, 0.4)",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(34, 139, 34, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(46, 125, 50, 0.12) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%)
          `,
          backdropFilter: "blur(12px)",
        }}
      >
        <motion.div
          className={`relative w-[90%] max-w-md text-center ${className}`}
          initial={{ scale: 0.7, opacity: 0, y: 50, rotateX: -15 }}
          animate={{
            scale: isClosing ? 0.8 : 1,
            opacity: isClosing ? 0 : 1,
            y: isClosing ? 30 : 0,
            rotateX: 0,
          }}
          exit={{ scale: 0.7, opacity: 0, y: 50, rotateX: -15 }}
          onClick={(e) => e.stopPropagation()}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.4,
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: "1000px",
          }}
        >
          {/* Main Dialog Container */}
          <div
            className="relative overflow-hidden rounded-2xl border-4 border-amber-700/60 shadow-2xl"
            style={{
              background: `
                radial-gradient(circle at 30% 20%, rgba(255, 248, 220, 0.95) 0%, rgba(250, 240, 200, 0.98) 40%),
                radial-gradient(circle at 70% 80%, rgba(245, 235, 190, 0.92) 0%, rgba(240, 230, 180, 0.96) 40%),
                linear-gradient(135deg, 
                  rgba(255, 248, 220, 0.95) 0%,
                  rgba(250, 240, 200, 0.98) 25%,
                  rgba(245, 235, 190, 0.92) 50%,
                  rgba(240, 230, 180, 0.96) 75%,
                  rgba(235, 225, 170, 0.94) 100%
                )
              `,
              boxShadow: `
                inset 0 4px 8px rgba(160, 82, 45, 0.2),
                inset 0 0 40px rgba(139, 69, 19, 0.1),
                0 20px 60px rgba(139, 69, 19, 0.6),
                0 0 80px rgba(255, 193, 7, 0.3),
                0 0 120px rgba(76, 175, 80, 0.2)
              `,
            }}
          >
            {/* Animated Background Foliage */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {BACKGROUND_FOLIAGE.map((foliage, index) => (
                <motion.div
                  key={`foliage-${index}`}
                  className={`absolute ${foliage.size} select-none`}
                  style={{
                    ...foliage.position,
                    opacity: foliage.opacity,
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -8, 0],
                  }}
                  transition={{
                    scale: { delay: index * 0.1, duration: 0.6 },
                    rotate: { delay: index * 0.1, duration: 0.6 },
                    y: {
                      delay: index * 0.1 + 1,
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  {foliage.emoji}
                </motion.div>
              ))}
            </div>

            {/* Floating Jungle Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {JUNGLE_PARTICLES.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute text-lg select-none"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 300,
                    y: Math.random() * 400,
                  }}
                  animate={
                    particlesAnimating
                      ? {
                          opacity: [0, 0.8, 0.6, 0],
                          scale: [0, 1.2, 1, 0.8],
                          x: [
                            Math.random() * 300,
                            Math.random() * 300,
                            Math.random() * 300,
                            Math.random() * 300,
                          ],
                          y: [
                            Math.random() * 400,
                            Math.random() * 400,
                            Math.random() * 400,
                            Math.random() * 400,
                          ],
                          rotate: [0, 180, 360, 540],
                        }
                      : {}
                  }
                  transition={{
                    delay: particle.delay,
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {particle.emoji}
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <motion.button
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 shadow-lg transition-all duration-200"
              onClick={handleClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Close parent menu"
            >
              <X className="w-4 h-4 text-amber-800" />
            </motion.button>

            {/* Content Area */}
            <div className="relative z-10 p-8">
              {/* Title */}
              <motion.div
                className="mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.h2
                  className="text-2xl font-bold text-green-900 flex items-center justify-center gap-3"
                  animate={{
                    textShadow: [
                      "0 2px 4px rgba(0,0,0,0.2)",
                      "0 2px 8px rgba(139,69,19,0.3)",
                      "0 2px 4px rgba(0,0,0,0.2)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.span
                    className="text-3xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      type: "tween",
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    🪵
                  </motion.span>
                  <span>Parent Zone</span>
                </motion.h2>
                <motion.p
                  className="text-green-700 text-sm mt-2 opacity-80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  transition={{ delay: 0.4 }}
                >
                  Your family adventure command center
                </motion.p>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-4">
                {buttonConfig.map((button, index) => {
                  if (!button.show) return null;

                  const Icon = button.icon;

                  return (
                    <motion.div
                      key={button.id}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: 0.3 + index * 0.1,
                        duration: 0.6,
                        type: "spring",
                        stiffness: 100,
                      }}
                    >
                      <Button
                        className={`relative overflow-hidden w-full p-5 rounded-xl bg-gradient-to-r ${button.gradient} hover:${button.hoverGradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 group border-2 border-white/20 hover:border-white/40`}
                        onClick={() =>
                          handleParentAction(
                            button.id as "dashboard" | "settings" | "logout",
                          )
                        }
                        onMouseEnter={() => setHoveredButton(button.id)}
                        onMouseLeave={() => setHoveredButton(null)}
                        style={{
                          boxShadow: `
                            0 8px 20px rgba(0, 0, 0, 0.2),
                            0 0 20px ${button.glowColor},
                            inset 0 1px 0 rgba(255, 255, 255, 0.2)
                          `,
                        }}
                      >
                        {/* Animated Background Glow */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background: `radial-gradient(circle at center, ${button.glowColor} 0%, transparent 70%)`,
                          }}
                          animate={
                            hoveredButton === button.id
                              ? {
                                  scale: [1, 1.5, 1],
                                }
                              : {}
                          }
                          transition={{ duration: 2, repeat: Infinity }}
                        />

                        {/* Button Content */}
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <motion.span
                              className="text-2xl"
                              animate={
                                hoveredButton === button.id
                                  ? {
                                      scale: [1, 1.2, 1],
                                      rotate: [0, 10, -10, 0],
                                    }
                                  : {}
                              }
                              transition={{ duration: 0.6 }}
                            >
                              {button.emoji}
                            </motion.span>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 text-left">
                            <div className="font-semibold text-lg">
                              {button.label}
                            </div>
                            <div className="text-sm opacity-90 font-normal">
                              {button.description}
                            </div>
                          </div>
                        </div>

                        {/* Shine Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                          initial={{ x: "-100%" }}
                          animate={
                            hoveredButton === button.id
                              ? { x: "100%" }
                              : { x: "-100%" }
                          }
                          transition={{ duration: 0.8 }}
                        />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Decorative Elements */}
              <motion.div
                className="mt-6 flex justify-center items-center gap-2 text-amber-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.span
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                >
                  🌟
                </motion.span>
                <span className="text-xs font-medium">
                  Jungle Adventure Family Hub
                </span>
                <motion.span
                  animate={{
                    rotate: [360, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                >
                  🌟
                </motion.span>
              </motion.div>
            </div>

            {/* Bottom Breathing Glow Effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              animate={{
                boxShadow: [
                  "inset 0 0 0px rgba(251, 191, 36, 0)",
                  "inset 0 0 30px rgba(251, 191, 36, 0.15)",
                  "inset 0 0 0px rgba(251, 191, 36, 0)",
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EnhancedJungleParentMenuDialog;
