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

// 🦜 Enhanced jungle-themed icons with kid-friendly animations
const ParrotIcon = ({
  className,
  isClicked,
  onAnimalClick
}: {
  className?: string;
  isClicked?: boolean;
  onAnimalClick?: () => void;
}) => (
  <div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-sky to-sky-dark flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 relative overflow-hidden cursor-pointer",
      "jungle-animal-icon idle-parrot",
      isClicked && "clicked",
      className,
    )}
    onClick={onAnimalClick}
  >
    {/* Celebration particles for clicks */}
    {isClicked && (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-yellow-300 animate-ping">✨</div>
        <div className="absolute top-1 right-0 text-yellow-300 animate-bounce">⭐</div>
        <div className="absolute bottom-0 left-0 text-yellow-300 animate-pulse">💫</div>
      </div>
    )}
    <div className="text-white text-lg relative z-10">
      🦜
    </div>
  </div>
);

const MonkeyIcon = ({
  className,
  isClicked,
  onAnimalClick
}: {
  className?: string;
  isClicked?: boolean;
  onAnimalClick?: () => void;
}) => (
  <div
    className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br from-bright-orange to-orange-600 flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 relative overflow-hidden cursor-pointer",
      "jungle-animal-icon idle-monkey",
      isClicked && "clicked",
      className,
    )}
    onClick={onAnimalClick}
  >
    {/* Celebration particles for clicks */}
    {isClicked && (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-yellow-300 animate-ping">🎉</div>
        <div className="absolute top-1 right-0 text-yellow-300 animate-bounce">🌟</div>
        <div className="absolute bottom-0 left-0 text-yellow-300 animate-pulse">✨</div>
      </div>
    )}
    <div className="text-white text-lg relative z-10">
      🏆
    </div>
  </div>
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
      🎯
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
        rotate: [0, 10, -10, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
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
      scale: [1, 1.05, 1],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
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

const JungleLeaf = ({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={cn("absolute opacity-15", className)}
    animate={{
      y: [0, -10, 0],
      rotate: [0, 15, 0],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  >
    <div className="w-6 h-6 bg-gradient-to-br from-jungle to-jungle-dark rounded-full transform rotate-45" />
  </motion.div>
);

const FloatingButterfly = ({
  className,
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) => (
  <motion.div
    className={cn("absolute opacity-20", className)}
    animate={{
      x: [0, 10, 0],
      y: [0, -5, 0],
      rotate: [0, 10, -10, 0],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
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
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const userData = useUserProgress();

  // 🎯 Generate random animation delays for each animal (kid-friendly surprise timing)
  const [animalDelays] = useState(() => ({
    owl: Math.random() * 3, // 0-3s random delay
    parrot: Math.random() * 4 + 2, // 2-6s random delay
    monkey: Math.random() * 5 + 3, // 3-8s random delay
    elephant: Math.random() * 6 + 4, // 4-10s random delay
  }));

  // Set CSS custom properties for animation delays
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--owl-delay', `${animalDelays.owl}s`);
    root.style.setProperty('--parrot-delay', `${animalDelays.parrot}s`);
    root.style.setProperty('--monkey-delay', `${animalDelays.monkey}s`);
    root.style.setProperty('--elephant-delay', `${animalDelays.elephant}s`);
  }, [animalDelays]);

  // 🎉 Handle navigation clicks with celebration
  const handleNavClick = (path: string, cardType: string) => {
    // Trigger celebration animation
    setClickedCard(cardType);

    // Play kid-friendly sound
    if (typeof window !== 'undefined') {
      kidFriendlyEffects.playSound(SOUNDS.SUCCESS);
    }

    // Navigate after short celebration
    setTimeout(() => {
      navigate(path);
      setClickedCard(null);
    }, 300);
  };

  // Enhanced sidebar entrance animation with jungle-themed effects
  const sidebarVariants = {
    hidden: {
      x: -300,
      opacity: 0,
      scale: 0.95,
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
    },
    visible: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const cardHoverVariants = {
    initial: {
      y: 0,
      scale: 1,
    },
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut",
        type: "spring",
        stiffness: 300,
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
    <div className="w-full h-full">
      {/* DESKTOP SIDEBAR - Only visible on lg+ screens */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          // Desktop layout - completely hidden on mobile/tablet
          "hidden lg:flex w-[300px] xl:w-[320px] h-[calc(100vh-80px)] flex-col",
          "bg-gradient-to-b from-green-50/95 to-emerald-50/95 backdrop-blur-sm relative rounded-[28px] shadow-2xl border border-jungle/10",
          "p-5 overflow-hidden",
          "scrollbar-thin scrollbar-thumb-jungle/20 scrollbar-track-transparent",
          className,
        )}
        style={{
          backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 193, 7, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(33, 150, 243, 0.05) 0%, transparent 50%)
        `,
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
                opacity: [0.2, 0.5, 0.2],
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
          `,
          }}
        >
          {/* Animated background elements */}
          <div className="absolute top-2 right-2 w-8 h-8 bg-white/5 rounded-full animate-pulse" />
          <div
            className="absolute bottom-2 left-2 w-6 h-6 bg-white/5 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          />

          {/* Profile Avatar with enhanced styling and animation */}
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 rounded-full border-3 border-white/30 flex items-center justify-center bg-white/10 shadow-2xl backdrop-blur-sm relative"
              whileHover={{
                scale: 1.1,
                rotate: 5,
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
                <span className="text-white text-xs font-bold">
                  {userData.level}
                </span>
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

        {/* Scrollable Progress Section - Takes available space but allows scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-jungle/20 scrollbar-track-transparent pr-1 mt-3">
          <div className="space-y-3">
            {/* Learned Words Card - Compact version */}
            <motion.div
              variants={itemVariants}
              initial="initial"
              className="bg-white/90 backdrop-blur-sm rounded-[16px] p-3 shadow-md flex items-center group cursor-pointer border border-gray-100/50 hover:border-jungle/20 transition-all duration-300"
              whileHover={cardHoverVariants.hover}
              onMouseEnter={() => setHoveredCard("words")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <ParrotIcon
                className="w-10 h-10"
                isClicked={clickedCard === "words"}
                onAnimalClick={() => handleNavClick("/words", "words")}
              />
              <div className="flex-1 ml-3 min-w-0">
                <h3 className="text-navy font-['Baloo_2'] text-[14px] font-bold truncate mb-1">
                  Words Learned
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium">
                    {userData.stats.wordsLearned} words
                  </p>
                  <span className="text-jungle font-['Baloo_2'] text-[12px] font-bold">
                    {userData.stats.wordsLearned}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Learning Streak Card - Compact */}
            <motion.div
              variants={itemVariants}
              initial="initial"
              className="bg-white/90 backdrop-blur-sm rounded-[16px] p-3 shadow-md flex items-center group cursor-pointer border border-gray-100/50 hover:border-red-400/20 transition-all duration-300"
              whileHover={cardHoverVariants.hover}
              onMouseEnter={() => setHoveredCard("streak")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <StreakIcon className="w-10 h-10" />
              <div className="flex-1 ml-3 min-w-0">
                <h3 className="text-navy font-['Baloo_2'] text-[14px] font-bold truncate mb-1">
                  Learning Streak
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium">
                    {userData.streak} days
                  </p>
                  <span className="text-red-500 font-['Baloo_2'] text-[12px] font-bold">
                    {userData.streak}🔥
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Achievements Card - Compact */}
            <motion.div
              variants={itemVariants}
              initial="initial"
              className="bg-white/90 backdrop-blur-sm rounded-[16px] p-3 shadow-md flex items-center group cursor-pointer border border-gray-100/50 hover:border-yellow-400/20 transition-all duration-300"
              whileHover={cardHoverVariants.hover}
              onMouseEnter={() => setHoveredCard("achievements")}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <TrophyIcon className="w-10 h-10" />
              <div className="flex-1 ml-3 min-w-0">
                <h3 className="text-navy font-['Baloo_2'] text-[14px] font-bold truncate mb-1">
                  Achievements
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-navy/70 font-['Baloo_2'] text-[12px] font-medium">
                    {userData.stats.achievements || 5} badges
                  </p>
                  <span className="text-yellow-500 font-['Baloo_2'] text-[12px] font-bold">
                    {userData.stats.achievements || 5}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Registration Section - Inside scrollable area like other cards */}
            <motion.div
              variants={itemVariants}
              initial="initial"
              className="hidden lg:block bg-gradient-to-r from-sunshine/90 to-yellow-400/90 rounded-[16px] p-3 shadow-lg relative overflow-hidden border border-yellow-400/30"
            >
              <div className="relative z-10">
                {isGuest ? (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="text-navy font-['Baloo_2'] text-[14px] font-bold mb-1">
                        🌟 Join Adventure!
                      </h3>
                      <p className="text-navy/80 font-['Baloo_2'] text-[10px] mb-2">
                        💾 Save • 🏆 Badges • 🔥 Streaks
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleRegistration}
                        className="w-full bg-gradient-to-r from-jungle to-jungle-dark hover:from-jungle-dark hover:to-jungle text-white font-['Baloo_2'] text-[12px] font-bold px-4 py-2 rounded-[14px] shadow-md transition-all duration-200"
                      >
                        🚀 Sign Up
                      </Button>

                      <button
                        onClick={handleContinueAsGuest}
                        className="w-full text-center text-navy/70 font-['Baloo_2'] text-[10px] font-medium underline hover:no-underline transition-all duration-200"
                      >
                        Continue as Guest
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center mb-2">
                      <h3 className="text-navy font-['Baloo_2'] text-[14px] font-bold mb-1">
                        🎉 Welcome Back!
                      </h3>
                      <p className="text-navy/80 font-['Baloo_2'] text-[10px] mb-2">
                        Keep exploring and learning!
                      </p>
                    </div>

                    <Button
                      onClick={handleLogout}
                      className="w-full bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white font-['Baloo_2'] text-[12px] font-bold px-4 py-2 rounded-[14px] shadow-md transition-all duration-200"
                    >
                      👋 Logout
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* MOBILE LAYOUT - Only visible on small screens */}
        <div className="lg:hidden w-full max-w-full bg-gradient-to-r from-green-50/95 to-emerald-50/95 backdrop-blur-sm rounded-[12px] shadow-lg border border-jungle/10 p-2 overflow-hidden">
          {/* Mobile profile header - ultra compact */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full border border-profile-purple/30 flex items-center justify-center bg-profile-purple/10 flex-shrink-0">
                <span className="text-sm">
                  {userData.avatar?.emoji || "🎯"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-navy font-['Baloo_2'] text-[12px] font-bold truncate">
                  {userData.name}
                </h3>
                <p className="text-navy/70 font-['Baloo_2'] text-[9px] truncate">
                  Lv.{userData.level} • {userData.streak}🔥 •{" "}
                  {userData.stats.wordsLearned} words
                </p>
              </div>
            </div>

            {/* Mobile action button - always visible */}
            <div className="flex-shrink-0 ml-2">
              {isGuest ? (
                <Button
                  onClick={handleRegistration}
                  className="bg-jungle hover:bg-jungle-dark text-white font-['Baloo_2'] text-[10px] font-bold px-2 py-1 rounded-[10px] shadow-sm transition-all duration-200 whitespace-nowrap"
                >
                  Join
                </Button>
              ) : (
                <Button
                  onClick={handleLogout}
                  className="bg-slate-500 hover:bg-slate-600 text-white font-['Baloo_2'] text-[10px] font-bold px-2 py-1 rounded-[10px] shadow-sm transition-all duration-200"
                >
                  Exit
                </Button>
              )}
            </div>
          </div>

          {/* Mobile mini benefits - only for guests, ultra compact */}
          {isGuest && (
            <div className="bg-sunshine/20 rounded-[8px] p-1.5 mt-1">
              <div className="flex items-center justify-between">
                <p className="text-navy/80 font-['Baloo_2'] text-[8px] font-medium truncate flex-1">
                  💾 Save • 🏆 Badges • 🔥 Streaks
                </p>
                <button
                  onClick={handleContinueAsGuest}
                  className="text-navy/60 font-['Baloo_2'] text-[8px] ml-2 underline hover:no-underline transition-all duration-200 flex-shrink-0"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  );
};

export default JungleAdventureSidebar;
