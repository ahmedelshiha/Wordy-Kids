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

// Enhanced jungle-themed icons with animated backgrounds
const ParrotIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-sky to-sky-dark flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 relative overflow-hidden",
      className,
    )}
    whileHover={{ scale: 1.1, rotate: 3 }}
    whileTap={{ scale: 0.95 }}
  >
    {/* Animated background elements */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
    <div className="text-white text-lg transform hover:rotate-12 transition-transform duration-300 relative z-10">
      🦜
    </div>
  </motion.div>
);

const MonkeyIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-bright-orange to-orange-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 relative overflow-hidden",
      className,
    )}
    whileHover={{ scale: 1.1, rotate: -3 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-400 rounded-full animate-bounce" />
    <div className="text-white text-lg transform hover:rotate-12 transition-transform duration-300 relative z-10">
      🐵
    </div>
  </motion.div>
);

const CompassIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-sunshine to-yellow-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 relative overflow-hidden",
      className,
    )}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />
    <motion.div
      className="text-white text-lg relative z-10"
      whileHover={{ rotate: 180 }}
      transition={{ duration: 0.7 }}
    >
      🧭
    </motion.div>
  </motion.div>
);

const TrophyIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 relative overflow-hidden",
      className,
    )}
    whileHover={{ scale: 1.1, rotate: 5 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
    <div className="text-white text-lg transform hover:rotate-12 transition-transform duration-300 relative z-10">
      🏆
    </div>
  </motion.div>
);

const StreakIcon = ({ className }: { className?: string }) => (
  <motion.div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0 relative overflow-hidden",
      className,
    )}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <motion.div
      className="text-white text-lg relative z-10"
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      🔥
    </motion.div>
  </motion.div>
);

// Enhanced decorative jungle elements
const JungleVine = ({ className }: { className?: string }) => (
  <motion.div 
    className={cn("absolute opacity-10", className)}
    animate={{ 
      rotate: [0, 5, -5, 0],
      scale: [1, 1.05, 1]
    }}
    transition={{ 
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <svg width="24" height="48" viewBox="0 0 24 48" fill="none">
      <path
        d="M12 0C16 8 8 16 12 24C16 32 8 40 12 48"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-jungle"
      />
    </svg>
  </motion.div>
);

const JungleLeaf = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div 
    className={cn("absolute opacity-15", className)}
    animate={{ 
      y: [0, -10, 0],
      rotate: [0, 15, 0],
      scale: [1, 1.1, 1]
    }}
    transition={{ 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  >
    <div className="w-6 h-6 bg-gradient-to-br from-jungle to-jungle-dark rounded-full transform rotate-45" />
  </motion.div>
);

const FloatingButterfly = ({ className, delay = 0 }: { className?: string; delay?: number }) => (
  <motion.div 
    className={cn("absolute opacity-20", className)}
    animate={{ 
      x: [0, 10, 0],
      y: [0, -5, 0],
      rotate: [0, 10, -10, 0]
    }}
    transition={{ 
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay
    }}
  >
    🦋
  </motion.div>
);

export const JungleAdventureSidebar: React.FC<JungleAdventureSidebarProps> = ({
  className,
}) => {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const userData = useUserProgress();

  // Enhanced sidebar entrance animation with jungle-themed effects
  const sidebarVariants = {
    hidden: { 
      x: -300, 
      opacity: 0,
      scale: 0.95
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { 
      x: -60, 
      opacity: 0, 
      scale: 0.9,
      rotateY: -15
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardHoverVariants = {
    initial: {
      y: 0,
      scale: 1
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 300
      },
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
  };

  if (!isVisible) return null;

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "w-[320px] h-[calc(100vh-80px)] flex flex-col",
        "bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-sm relative rounded-[28px] shadow-2xl border border-jungle/10",
        "p-5 space-y-4 overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-jungle/20 scrollbar-track-transparent",
        // Desktop optimizations
        "hidden lg:flex",
        className,
      )}
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)
        `
      }}
    >
      {/* Enhanced decorative jungle elements */}
      <JungleVine className="top-6 left-4" />
      <JungleVine className="bottom-20 right-4 transform rotate-180" />
      
      <JungleLeaf className="top-8 right-6" delay={0} />
      <JungleLeaf className="top-32 left-4" delay={1} />
      <JungleLeaf className="bottom-32 right-8" delay={2} />
      
      <FloatingButterfly className="top-16 right-12 text-sm" delay={0.5} />
      <FloatingButterfly className="bottom-40 left-8 text-xs" delay={2.5} />

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-jungle/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + i * 12}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>

      {/* Enhanced User Profile Section with Adventure Theme */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-profile-purple to-purple-600 rounded-[24px] p-5 shadow-xl relative overflow-hidden flex-shrink-0 border border-white/10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `
        }}
      >
        {/* Animated background elements */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-white/5 rounded-full animate-pulse" />
        <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Profile Avatar with enhanced styling and animation */}
        <div className="flex justify-center mb-4">
          <motion.div
            className="w-16 h-16 rounded-full border-3 border-white/30 flex items-center justify-center bg-white/10 shadow-2xl backdrop-blur-sm relative"
            whileHover={{
              scale: 1.1,
              rotate: 5
            }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <span className="text-2xl">{userData.avatar?.emoji || "🎯"}</span>
            {/* Level indicator ring */}
            <motion.div 
              className="absolute -top-1 -right-1 w-6 h-6 bg-sunshine rounded-full flex items-center justify-center shadow-lg"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <span className="text-white text-xs font-bold">{userData.level}</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced User Info with better typography and spacing */}
        <div className="text-center relative z-10">
          <h2 className="text-white font-['Baloo_2'] text-[20px] font-bold leading-tight mb-2 truncate drop-shadow-sm">
            {userData.name}
          </h2>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Badge className="bg-white/20 text-white border-white/30 font-['Baloo_2'] text-xs px-3 py-1">
              🌟 Level {userData.level}
            </Badge>
            <Badge className="bg-orange-500/80 text-white border-orange-400/50 font-['Baloo_2'] text-xs px-3 py-1">
              🔥 {userData.streak} days
            </Badge>
          </div>
          <p className="text-white/90 font-['Baloo_2'] text-[14px] font-medium">
            Adventure Explorer 🗺️
          </p>
        </div>
      </motion.div>

      {/* Enhanced Progress Tracking Section with improved visual hierarchy */}
      <div className="space-y-3 flex-1 min-h-0">
        {/* Learned Words Card with enhanced design and animations */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          className="bg-white/90 backdrop-blur-sm rounded-[18px] p-4 shadow-lg flex items-center group cursor-pointer flex-shrink-0 border border-gray-100/50 hover:border-jungle/20 transition-all duration-300"
          whileHover={cardHoverVariants.hover}
          onMouseEnter={() => setHoveredCard('words')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <ParrotIcon />
          <div className="flex-1 ml-4 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[16px] font-bold truncate mb-1">
              Learned Words
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[13px] font-medium truncate">
              {userData.stats.wordsLearned} words mastered
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-gradient-to-r from-jungle to-jungle-dark h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userData.stats.wordsLearned / 50) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-jungle to-jungle-dark rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[13px] font-bold">
              {userData.stats.wordsLearned}
            </span>
          </motion.div>
        </motion.div>

        {/* Animals Category Card with enhanced design */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          className="bg-white/90 backdrop-blur-sm rounded-[18px] p-4 shadow-lg flex items-center group cursor-pointer flex-shrink-0 border border-gray-100/50 hover:border-bright-orange/20 transition-all duration-300"
          whileHover={cardHoverVariants.hover}
          onMouseEnter={() => setHoveredCard('animals')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <MonkeyIcon />
          <div className="flex-1 ml-4 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[16px] font-bold truncate mb-1">
              Animals
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[13px] font-medium truncate">
              {userData.stats.animalsLearned} animals discovered
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-gradient-to-r from-bright-orange to-orange-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userData.stats.animalsLearned / 20) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </div>
          </div>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-playful-purple to-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
            whileHover={{ scale: 1.15, rotate: -10 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[13px] font-bold">
              {userData.stats.animalsLearned}
            </span>
          </motion.div>
        </motion.div>

        {/* Adventure Time Card with enhanced design */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          className="bg-white/90 backdrop-blur-sm rounded-[18px] p-4 shadow-lg flex items-center group cursor-pointer flex-shrink-0 border border-gray-100/50 hover:border-sunshine/20 transition-all duration-300"
          whileHover={cardHoverVariants.hover}
          onMouseEnter={() => setHoveredCard('time')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CompassIcon />
          <div className="flex-1 ml-4 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[16px] font-bold truncate mb-1">
              Adventure Time
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[13px] font-medium truncate">
              {userData.stats.totalTime}min exploring
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-gradient-to-r from-sunshine to-yellow-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userData.stats.totalTime / 100) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 0.9 }}
              />
            </div>
          </div>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-coral-red to-red-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[13px] font-bold">
              {userData.stats.totalTime}
            </span>
          </motion.div>
        </motion.div>

        {/* New Achievement Card */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          className="bg-white/90 backdrop-blur-sm rounded-[18px] p-4 shadow-lg flex items-center group cursor-pointer flex-shrink-0 border border-gray-100/50 hover:border-yellow-400/20 transition-all duration-300"
          whileHover={cardHoverVariants.hover}
          onMouseEnter={() => setHoveredCard('achievements')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <TrophyIcon />
          <div className="flex-1 ml-4 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[16px] font-bold truncate mb-1">
              Achievements
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[13px] font-medium truncate">
              {userData.stats.achievements || 5} badges earned
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((userData.stats.achievements || 5) / 15) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 1.1 }}
              />
            </div>
          </div>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
            whileHover={{ scale: 1.15, rotate: 15 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[13px] font-bold">
              {userData.stats.achievements || 5}
            </span>
          </motion.div>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          variants={itemVariants}
          initial="initial"
          className="bg-white/90 backdrop-blur-sm rounded-[18px] p-4 shadow-lg flex items-center group cursor-pointer flex-shrink-0 border border-gray-100/50 hover:border-red-400/20 transition-all duration-300"
          whileHover={cardHoverVariants.hover}
          onMouseEnter={() => setHoveredCard('streak')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <StreakIcon />
          <div className="flex-1 ml-4 min-w-0">
            <h3 className="text-navy font-['Baloo_2'] text-[16px] font-bold truncate mb-1">
              Learning Streak
            </h3>
            <p className="text-navy/70 font-['Baloo_2'] text-[13px] font-medium truncate">
              {userData.streak} days in a row!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <motion.div 
                className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((userData.streak / 30) * 100, 100)}%` }}
                transition={{ duration: 1, delay: 1.3 }}
              />
            </div>
          </div>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
            whileHover={{ scale: 1.15 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-white font-['Baloo_2'] text-[13px] font-bold">
              {userData.streak}
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Registration Call-to-Action Section */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-sunshine to-yellow-500 rounded-[20px] p-5 shadow-xl relative overflow-hidden flex-shrink-0 border border-yellow-400/20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `
        }}
      >
        {/* Enhanced background decoration with animations */}
        <motion.div 
          className="absolute top-3 right-3 w-8 h-8 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-3 left-3 w-6 h-6 bg-white/10 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/5 rounded-full"
          animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
        />

        <div className="text-center mb-4 relative z-10">
          <motion.h3 
            className="text-navy font-['Baloo_2'] text-[18px] font-bold mb-3"
            animate={hoveredCard ? { scale: 1.05 } : { scale: 1 }}
          >
            {isGuest ? "🌟 Start Your Epic Journey!" : "🎉 Welcome Back, Explorer!"}
          </motion.h3>

          {isGuest && (
            <div className="space-y-2 mb-4 text-left">
              {[
                { icon: "💾", text: "Save your progress forever!" },
                { icon: "🏆", text: "Earn special badges and rewards!" },
                { icon: "🔥", text: "Track your learning streaks!" },
                { icon: "📊", text: "Advanced analytics for parents!" },
              ].map((item, index) => (
                <motion.p
                  key={index}
                  className="text-navy font-['Baloo_2'] text-[12px] font-medium flex items-center gap-2"
                  whileHover={{ x: 2, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-sm">{item.icon}</span>
                  {item.text}
                </motion.p>
              ))}
            </div>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
        >
          <Button
            onClick={isGuest ? handleRegistration : handleLogout}
            className={cn(
              "w-full rounded-[24px] px-6 py-3 font-['Baloo_2'] text-[14px] font-bold text-white",
              "transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/20",
              "transform hover:-translate-y-0.5 active:translate-y-0",
              isGuest
                ? "bg-gradient-to-r from-jungle to-jungle-dark hover:from-jungle-dark hover:to-jungle"
                : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700",
            )}
          >
            {isGuest ? "🚀 Create My Account!" : "👋 See You Later!"}
          </Button>
        </motion.div>

        {isGuest && (
          <motion.p
            className="text-center text-navy font-['Baloo_2'] text-[12px] font-medium mt-3 underline cursor-pointer hover:no-underline transition-all duration-200"
            onClick={handleContinueAsGuest}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue as Guest
          </motion.p>
        )}
      </motion.div>

      {/* Mobile responsive layout for smaller screens */}
      <div className="lg:hidden flex flex-row w-full h-auto p-4 space-x-4 overflow-x-auto bg-gradient-to-r from-green-50/95 to-emerald-50/95 backdrop-blur-sm rounded-[20px] shadow-xl border border-jungle/10">
        {/* Mobile version - horizontal layout */}
        <div className="flex-shrink-0 w-60">
          {/* Simplified mobile profile card */}
          <div className="bg-gradient-to-br from-profile-purple to-purple-600 rounded-[16px] p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center bg-white/10">
                <span className="text-xl">{userData.avatar?.emoji || "🎯"}</span>
              </div>
              <div>
                <h3 className="text-white font-['Baloo_2'] text-[14px] font-bold truncate">
                  {userData.name}
                </h3>
                <p className="text-white/90 font-['Baloo_2'] text-[12px]">
                  Level {userData.level} • {userData.streak} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile progress cards */}
        <div className="flex space-x-3">
          {[
            { icon: <ParrotIcon className="w-8 h-8" />, title: "Words", value: userData.stats.wordsLearned },
            { icon: <MonkeyIcon className="w-8 h-8" />, title: "Animals", value: userData.stats.animalsLearned },
            { icon: <CompassIcon className="w-8 h-8" />, title: "Time", value: `${userData.stats.totalTime}m` },
          ].map((item, index) => (
            <div key={index} className="flex-shrink-0 w-28 bg-white/90 rounded-[12px] p-3 shadow-md text-center">
              <div className="flex justify-center mb-2">{item.icon}</div>
              <p className="text-navy font-['Baloo_2'] text-[11px] font-semibold">{item.title}</p>
              <p className="text-navy/70 font-['Baloo_2'] text-[10px]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
};

export default JungleAdventureSidebar;
