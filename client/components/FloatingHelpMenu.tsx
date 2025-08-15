import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  HelpCircle,
  BookOpen,
  Settings,
  Gamepad2,
  MessageCircle,
  Trophy,
  Volume2,
  Smartphone,
  X,
  ChevronRight,
} from "lucide-react";
import { useContextualHelp, type ContextualPage } from "@/hooks/use-contextual-help";

interface HelpOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface FloatingHelpMenuProps {
  onTutorial?: () => void;
  onGameHelp?: () => void;
  onSettings?: () => void;
  onContact?: () => void;
  onAccessibility?: () => void;
  onAchievements?: () => void;
  currentPage?: ContextualPage;
  onHelpAction?: (helpContent: { title: string; message: string }) => void;
}

export function FloatingHelpMenu({
  onTutorial,
  onGameHelp,
  onSettings,
  onContact,
  onAccessibility,
  onAchievements,
  onHelpAction,
  currentPage = "home",
}: FloatingHelpMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const helpContent = useContextualHelp(currentPage);

  const getContextualHelpOptions = (): HelpOption[] => {
    const baseOptions: HelpOption[] = [
      {
        id: "tutorial",
        title: "How to Play",
        description: "Learn how to use all the features and games",
        icon: <BookOpen className="w-5 h-5" />,
        action: () => {
          onTutorial?.();
          onHelpAction?.(helpContent.tutorial);
          setIsOpen(false);
        },
        color: "from-educational-blue to-educational-blue/80",
      },
      {
        id: "games",
        title: "Game Tips",
        description: "Get help with specific games and activities",
        icon: <Gamepad2 className="w-5 h-5" />,
        action: () => {
          onGameHelp?.();
          onHelpAction?.(helpContent.gameHelp);
          setIsOpen(false);
        },
        color: "from-educational-purple to-educational-purple/80",
      },
      {
        id: "settings",
        title: "Settings & Controls",
        description: "Customize sounds, difficulty, and preferences",
        icon: <Settings className="w-5 h-5" />,
        action: () => {
          onSettings?.();
          setIsOpen(false);
        },
        color: "from-educational-green to-educational-green/80",
      },
      {
        id: "achievements",
        title: "Track Progress",
        description: "View your achievements and learning progress",
        icon: <Trophy className="w-5 h-5" />,
        action: () => {
          onAchievements?.();
          setIsOpen(false);
        },
        color: "from-educational-orange to-educational-orange/80",
      },
      {
        id: "accessibility",
        title: "Accessibility",
        description: "Audio controls, text size, and visual settings",
        icon: <Volume2 className="w-5 h-5" />,
        action: () => {
          onAccessibility?.();
          setIsOpen(false);
        },
        color: "from-educational-pink to-educational-pink/80",
      },
      {
        id: "contact",
        title: "Get Support",
        description: "Contact support or report an issue",
        icon: <MessageCircle className="w-5 h-5" />,
        action: () => {
          onContact?.();
          setIsOpen(false);
        },
        color: "from-slate-500 to-slate-600",
      },
    ];

    // Add contextual options based on current page
    if (currentPage === "games") {
      baseOptions.unshift({
        id: "game-controls",
        title: "Game Controls",
        description: "Learn tap, swipe, and voice controls for this game",
        icon: <Smartphone className="w-5 h-5" />,
        action: () => {
          // Show game-specific help overlay
          setIsOpen(false);
        },
        color: "from-blue-500 to-blue-600",
      });
    }

    return baseOptions;
  };

  const helpOptions = getContextualHelpOptions();

  const handleEncouragement = () => {
    setShowEncouragement(true);
    setTimeout(() => setShowEncouragement(false), 3000);
  };

  return (
    <>
      {/* Floating Heart Button */}
      <div className="fixed bottom-24 sm:bottom-20 lg:bottom-6 right-3 sm:right-4 md:right-6 z-40">
        <motion.div
          className="bg-gradient-to-r from-educational-purple to-educational-pink p-3 md:p-4 rounded-full shadow-2xl cursor-pointer transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Heart className="w-5 md:w-6 h-5 md:h-6 text-white fill-current animate-pulse" />
        </motion.div>

        {/* Quick Encouragement Button */}
        <motion.div
          className="absolute -top-2 -left-2 bg-educational-yellow p-2 rounded-full shadow-lg cursor-pointer"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEncouragement}
          title="Need encouragement? Click me! 🌟"
        >
          <span className="text-lg animate-bounce">🌟</span>
        </motion.div>
      </div>

      {/* Help Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-educational-purple to-educational-pink p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-6 h-6 fill-current" />
                        <h2 className="text-xl font-bold">Need Help? 🤗</h2>
                      </div>
                      <Button
                        onClick={() => setIsOpen(false)}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm opacity-90 mt-1">
                      Choose what you'd like help with:
                    </p>
                  </div>

                  {/* Help Options */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {helpOptions.map((option, index) => (
                      <motion.div
                        key={option.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <Button
                          onClick={option.action}
                          variant="ghost"
                          className="w-full p-4 h-auto justify-start hover:bg-gray-50 rounded-none"
                        >
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center text-white mr-3 shrink-0`}
                          >
                            {option.icon}
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-semibold text-gray-900">
                              {option.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {option.description}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="p-4 bg-gray-50 text-center">
                    <p className="text-sm text-gray-600">
                      You're doing great! Keep learning! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Encouragement Popup */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-32 sm:bottom-28 lg:bottom-20 right-3 sm:right-4 md:right-6 z-50"
          >
            <Card className="bg-educational-yellow border-2 border-educational-orange/30 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🌟</span>
                  <div>
                    <div className="font-bold text-educational-orange text-sm">
                      You're Amazing!
                    </div>
                    <div className="text-xs text-gray-700">
                      Keep up the great work! 🎉
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
