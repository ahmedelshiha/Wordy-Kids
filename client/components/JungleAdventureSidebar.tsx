import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  kidFriendlyEffects,
  SOUNDS,
} from "@/lib/kidFriendlyEffects";

interface JungleAdventureSidebarProps {
  profile: any;
  stats?: any;
  className?: string;
}

// Custom jungle-themed icons as SVG components
const ParrotIcon = ({ className }: { className?: string }) => (
  <div className={cn("w-10 h-10 rounded-lg bg-sky flex items-center justify-center", className)}>
    <span className="text-white text-lg">🦜</span>
  </div>
);

const MonkeyIcon = ({ className }: { className?: string }) => (
  <div className={cn("w-10 h-10 rounded-lg bg-bright-orange flex items-center justify-center", className)}>
    <span className="text-white text-lg">🐵</span>
  </div>
);

const CompassIcon = ({ className }: { className?: string }) => (
  <div className={cn("w-10 h-10 rounded-lg bg-sunshine flex items-center justify-center", className)}>
    <span className="text-white text-lg">🧭</span>
  </div>
);

export const JungleAdventureSidebar: React.FC<JungleAdventureSidebarProps> = ({
  profile,
  stats,
  className,
}) => {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Sidebar entrance animation variants
  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" },
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

  if (!isVisible) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-[280px] h-[calc(100vh-80px)] flex flex-col",
        "bg-light-background/95 relative rounded-2xl shadow-xl",
        "p-5 space-y-5",
        className
      )}
    >
      {/* Decorative jungle elements */}
      <div className="absolute top-4 left-4 w-6 h-6 opacity-20">
        <div className="w-full h-full bg-jungle-green rounded-full animate-gentle-float" />
      </div>
      <div className="absolute bottom-6 right-6 w-4 h-4 opacity-20">
        <div className="w-full h-full bg-jungle-green rounded-full animate-gentle-float animation-delay-200" />
      </div>

      {/* User Profile Section */}
      <motion.div
        variants={itemVariants}
        className="bg-profile-purple rounded-[24px] p-6 shadow-lg relative overflow-hidden"
      >
        {/* Profile Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full border-3 border-white flex items-center justify-center bg-white/10">
            {profile?.avatar?.emoji ? (
              <span className="text-2xl">{profile.avatar.emoji}</span>
            ) : (
              <span className="text-2xl">🎯</span>
            )}
          </div>
        </div>

        {/* User Name */}
        <div className="text-center">
          <h2
            className="text-white font-['Baloo_2'] text-[22px] font-bold leading-tight mb-2"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {profile?.name || "Guest Explorer"}
          </h2>
          <p
            className="text-white/90 font-['Baloo_2'] text-[18px] font-semibold mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            Level {profile?.level || 1}
          </p>
          <p
            className="text-white/90 font-['Baloo_2'] text-[16px] font-medium"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            🔥 {profile?.streak || 0} days
          </p>
        </div>
      </motion.div>

      {/* Progress Tracking Section */}
      <div className="space-y-4 flex-1">
        {/* Learned Words Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-4 shadow-md flex items-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <ParrotIcon />
          <div className="flex-1 ml-3">
            <h3
              className="text-navy font-['Baloo_2'] text-[16px] font-semibold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Learned Words
            </h3>
            <p
              className="text-navy/70 font-['Baloo_2'] text-[14px] font-medium"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.wordsLearned || 15} words mastered
            </p>
          </div>
          <div className="w-8 h-8 bg-jungle-green rounded-full flex items-center justify-center">
            <span
              className="text-white font-['Baloo_2'] text-[14px] font-bold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.wordsLearned || 15}
            </span>
          </div>
        </motion.div>

        {/* Animals Category Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-4 shadow-md flex items-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <MonkeyIcon />
          <div className="flex-1 ml-3">
            <h3
              className="text-navy font-['Baloo_2'] text-[16px] font-semibold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Animals
            </h3>
            <p
              className="text-navy/70 font-['Baloo_2'] text-[14px] font-medium"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.animalsLearned || 8} animals discovered
            </p>
          </div>
          <div className="w-8 h-8 bg-playful-purple rounded-full flex items-center justify-center">
            <span
              className="text-white font-['Baloo_2'] text-[14px] font-bold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.animalsLearned || 8}
            </span>
          </div>
        </motion.div>

        {/* Adventure Time Card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl p-4 shadow-md flex items-center group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        >
          <CompassIcon />
          <div className="flex-1 ml-3">
            <h3
              className="text-navy font-['Baloo_2'] text-[16px] font-semibold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              Adventure Time
            </h3>
            <p
              className="text-navy/70 font-['Baloo_2'] text-[14px] font-medium"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.totalTime ? `${Math.round(stats.totalTime / 60)}h` : "2h"} exploring
            </p>
          </div>
          <div className="w-8 h-8 bg-coral-red rounded-full flex items-center justify-center">
            <span
              className="text-white font-['Baloo_2'] text-[14px] font-bold"
              style={{ fontFamily: "'Baloo 2', cursive" }}
            >
              {stats?.totalTime ? Math.round(stats.totalTime / 60) : 2}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Registration Call-to-Action Section */}
      <motion.div
        variants={itemVariants}
        className="bg-sunshine-yellow rounded-[20px] p-5 shadow-lg"
      >
        <div className="text-center mb-3">
          <h3
            className="text-navy font-['Baloo_2'] text-[18px] font-bold mb-3"
            style={{ fontFamily: "'Baloo 2', cursive" }}
          >
            {isGuest ? "Start Your Epic Journey!" : "Welcome Back, Explorer!"}
          </h3>
          
          {isGuest && (
            <div className="space-y-2 mb-4 text-left">
              <p
                className="text-navy font-['Baloo_2'] text-[14px] font-medium flex items-center"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                💾 Save your progress forever!
              </p>
              <p
                className="text-navy font-['Baloo_2'] text-[14px] font-medium flex items-center"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                🏆 Earn special badges and rewards!
              </p>
              <p
                className="text-navy font-['Baloo_2'] text-[14px] font-medium flex items-center"
                style={{ fontFamily: "'Baloo 2', cursive" }}
              >
                🔥 Track your learning streaks!
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={isGuest ? handleRegistration : handleLogout}
          className={cn(
            "w-full rounded-[25px] px-6 py-[14px] font-['Baloo_2'] text-[16px] font-bold text-white",
            "transition-all duration-300 hover:scale-105 shadow-lg",
            isGuest 
              ? "bg-jungle-green hover:bg-jungle-green-dark" 
              : "bg-slate-500 hover:bg-slate-600"
          )}
          style={{ fontFamily: "'Baloo 2', cursive" }}
        >
          {isGuest ? "Create My Account!" : "👋 See You Later!"}
        </Button>

        {isGuest && (
          <p
            className="text-center text-navy font-['Baloo_2'] text-[14px] font-medium mt-3 underline cursor-pointer hover:no-underline transition-all duration-200"
            style={{ fontFamily: "'Baloo 2', cursive" }}
            onClick={() => {
              // Continue as guest functionality
              kidFriendlyEffects.playSound(SOUNDS.button_click);
            }}
          >
            Continue as Guest
          </p>
        )}
      </motion.div>

      {/* Mobile responsive adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar-mobile {
            width: 100%;
            height: auto;
            position: relative;
            flex-direction: row;
            overflow-x: auto;
            padding: 16px;
            space-y: 0;
            gap: 16px;
          }
          
          .progress-cards-mobile {
            flex-direction: row;
            min-width: fit-content;
          }
          
          .progress-card-mobile {
            min-width: 200px;
            flex-shrink: 0;
          }
        }
      `}</style>
    </motion.aside>
  );
};

export default JungleAdventureSidebar;
