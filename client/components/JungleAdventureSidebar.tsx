import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useNavigate } from "react-router-dom";
import { kidFriendlyEffects, SOUNDS } from "@/lib/kidFriendlyEffects";

interface JungleAdventureSidebarProps {
  className?: string;
}

// Custom jungle-themed icons as solid colored containers with themed illustrations
const ParrotIcon = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-10 h-10 rounded-lg bg-sky flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0",
      className,
    )}
  >
    <div className="text-white text-sm transform hover:rotate-12 transition-transform duration-300">
      🦜
    </div>
  </div>
);

const MonkeyIcon = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-10 h-10 rounded-lg bg-bright-orange flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
      className,
    )}
  >
    <div className="text-white text-lg transform hover:rotate-12 transition-transform duration-300">
      🐵
    </div>
  </div>
);

const CompassIcon = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "w-10 h-10 rounded-lg bg-sunshine flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
      className,
    )}
  >
    <div className="text-white text-lg transform hover:rotate-180 transition-transform duration-700">
      🧭
    </div>
  </div>
);

// Decorative jungle elements
const JungleLeaf = ({ className }: { className?: string }) => (
  <div className={cn("w-6 h-6 opacity-20 animate-gentle-float", className)}>
    <div className="w-full h-full bg-jungle rounded-full" />
  </div>
);

export const JungleAdventureSidebar: React.FC<JungleAdventureSidebarProps> = ({
  className,
}) => {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const userData = useUserProgress();

  // Enhanced sidebar entrance animation variants
  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0, scale: 0.95 },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardHoverVariants = {
    initial: { y: 0, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" },
    hover: {
      y: -2,
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const handleRegistration = () => {
    kidFriendlyEffects.playSound(SOUNDS.button_click);
    navigate("/signup");
  };

  const handleLogout = () => {
    kidFriendlyEffects.playSound(SOUNDS.button_click);
    logout();
    navigate("/");
  };

  const handleContinueAsGuest = () => {
    kidFriendlyEffects.playSound(SOUNDS.button_click);
    // Add any guest continuation logic here
  };

  if (!isVisible) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-[280px] h-[calc(100vh-80px)] flex flex-col",
        "bg-light-background/95 backdrop-blur-sm relative rounded-[24px] shadow-xl",
        "p-4 space-y-3 overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
        className,
      )}
    >
      {/* Decorative jungle elements with improved positioning */}
      <div className="absolute top-4 left-4">
        <JungleLeaf className="animation-delay-0" />
      </div>
      <div className="absolute bottom-6 right-6">
        <JungleLeaf className="animation-delay-200" />
      </div>
      <div className="absolute top-1/3 right-4">
        <JungleLeaf className="w-4 h-4 animation-delay-400" />
      </div>

      {/* Enhanced User Profile Section */}
      <motion.div
        variants={itemVariants}
        className="bg-profile-purple rounded-[20px] p-4 shadow-lg relative overflow-hidden flex-shrink-0"
      >
        {/* Profile Avatar with enhanced styling */}
        <div className="flex justify-center mb-3">
          <motion.div
            className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-white/10 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xl">{userData.avatar?.emoji || "🎯"}</span>
          </motion.div>
        </div>

        {/* Enhanced User Info with proper typography */}
        <div className="text-center">
          <h2 className="text-white font-['Baloo_2'] text-[18px] font-bold leading-tight mb-1 truncate">
            {userData.name}
          </h2>
          <p className="text-white/90 font-['Baloo_2'] text-[14px] font-semibold mb-2">
            Level {userData.level}
          </p>
          <p className="text-white/90 font-['Baloo_2'] text-[13px] font-medium">
            🔥 {userData.streak} days
          </p>
        </div>
      </motion.div>

      {/* Enhanced Progress Tracking Section */}
      <div className="space-y-3 flex-1 min-h-0">
        {/* Learned Words Card with enhanced design */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          whileHover="hover"
          className="bg-white rounded-[14px] p-3 shadow-md flex items-center group cursor-pointer flex-shrink-0"
          style={cardHoverVariants.initial}
          whileHover={cardHoverVariants.hover}
        >
          <ParrotIcon className="w-8 h-8" />
          <div className="flex-1 ml-3 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[14px] font-semibold truncate">
              Learned Words
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium truncate">
              {userData.stats.wordsLearned} words mastered
            </p>
          </div>
          <motion.div
            className="w-7 h-7 bg-jungle rounded-full flex items-center justify-center shadow-md flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[11px] font-bold">
              {userData.stats.wordsLearned}
            </span>
          </motion.div>
        </motion.div>

        {/* Animals Category Card with enhanced design */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          whileHover="hover"
          className="bg-white rounded-[14px] p-3 shadow-md flex items-center group cursor-pointer flex-shrink-0"
          style={cardHoverVariants.initial}
          whileHover={cardHoverVariants.hover}
        >
          <MonkeyIcon className="w-8 h-8" />
          <div className="flex-1 ml-3 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[14px] font-semibold truncate">
              Animals
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium truncate">
              {userData.stats.animalsLearned} animals discovered
            </p>
          </div>
          <motion.div
            className="w-7 h-7 bg-playful-purple rounded-full flex items-center justify-center shadow-md flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[11px] font-bold">
              {userData.stats.animalsLearned}
            </span>
          </motion.div>
        </motion.div>

        {/* Adventure Time Card with enhanced design */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          whileHover="hover"
          className="bg-white rounded-[14px] p-3 shadow-md flex items-center group cursor-pointer flex-shrink-0"
          style={cardHoverVariants.initial}
          whileHover={cardHoverVariants.hover}
        >
          <CompassIcon className="w-8 h-8" />
          <div className="flex-1 ml-3 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[14px] font-semibold truncate">
              Adventure Time
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium truncate">
              {userData.stats.totalTime}min exploring
            </p>
          </div>
          <motion.div
            className="w-7 h-7 bg-coral-red rounded-full flex items-center justify-center shadow-md flex-shrink-0"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[11px] font-bold">
              {userData.stats.totalTime}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Registration Call-to-Action Section */}
      <motion.div
        variants={itemVariants}
        className="bg-sunshine rounded-[16px] p-4 shadow-lg relative overflow-hidden flex-shrink-0"
      >
        {/* Subtle background decoration */}
        <div className="absolute top-2 right-2 w-6 h-6 bg-white/10 rounded-full" />
        <div className="absolute bottom-2 left-2 w-4 h-4 bg-white/10 rounded-full" />

        <div className="text-center mb-3 relative z-10">
          <h3 className="text-navy font-['Baloo_2'] text-[15px] font-bold mb-2">
            {isGuest ? "Start Your Epic Journey!" : "Welcome Back, Explorer!"}
          </h3>

          {isGuest && (
            <div className="space-y-1 mb-3 text-left">
              <motion.p
                className="text-navy font-['Baloo_2'] text-[11px] font-medium flex items-center"
                whileHover={{ x: 1 }}
                transition={{ duration: 0.2 }}
              >
                💾 Save your progress forever!
              </motion.p>
              <motion.p
                className="text-navy font-['Baloo_2'] text-[11px] font-medium flex items-center"
                whileHover={{ x: 1 }}
                transition={{ duration: 0.2 }}
              >
                🏆 Earn special badges and rewards!
              </motion.p>
              <motion.p
                className="text-navy font-['Baloo_2'] text-[11px] font-medium flex items-center"
                whileHover={{ x: 1 }}
                transition={{ duration: 0.2 }}
              >
                🔥 Track your learning streaks!
              </motion.p>
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={isGuest ? handleRegistration : handleLogout}
            className={cn(
              "w-full rounded-[20px] px-4 py-2 font-['Baloo_2'] text-[13px] font-bold text-white",
              "transition-all duration-300 shadow-lg hover:shadow-xl",
              isGuest
                ? "bg-jungle hover:bg-jungle-dark"
                : "bg-slate-500 hover:bg-slate-600",
            )}
          >
            {isGuest ? "Create My Account!" : "👋 See You Later!"}
          </Button>
        </motion.div>

        {isGuest && (
          <motion.p
            className="text-center text-navy font-['Baloo_2'] text-[11px] font-medium mt-2 underline cursor-pointer hover:no-underline transition-all duration-200"
            onClick={handleContinueAsGuest}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue as Guest
          </motion.p>
        )}
      </motion.div>

      {/* Enhanced responsive styles */}
      <style>{`
        .animation-delay-0 {
          animation-delay: 0s;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        @media (max-width: 768px) {
          .sidebar-mobile {
            width: 100%;
            height: auto;
            position: relative;
            flex-direction: row;
            overflow-x: auto;
            padding: 16px;
            gap: 16px;
            border-radius: 16px;
          }

          .progress-cards-mobile {
            flex-direction: row;
            min-width: fit-content;
            gap: 12px;
          }

          .progress-card-mobile {
            min-width: 200px;
            flex-shrink: 0;
          }

          .profile-card-mobile {
            min-width: 240px;
            flex-shrink: 0;
          }

          .registration-card-mobile {
            min-width: 260px;
            flex-shrink: 0;
          }
        }

        @media (max-width: 480px) {
          .sidebar-mobile {
            padding: 12px;
            gap: 12px;
          }
          
          .progress-card-mobile {
            min-width: 180px;
          }
          
          .profile-card-mobile {
            min-width: 200px;
          }
          
          .registration-card-mobile {
            min-width: 220px;
          }
        }
      `}</style>
    </motion.aside>
  );
};

export default JungleAdventureSidebar;
