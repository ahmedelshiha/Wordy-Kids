import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Settings,
  Users,
  Shield,
  Crown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface DesktopKidNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "child" | "parent";
  onRoleChange: (role: "child" | "parent") => void;
  onSettingsClick: () => void;
  onAdminClick: () => void;
  className?: string;
}

interface NavTab {
  id: string;
  emoji: string;
  label: string;
  color: string;
  hoverColor: string;
  shadowColor: string;
}

const kidNavTabs: NavTab[] = [
  {
    id: "dashboard",
    emoji: "🏡",
    label: "Home",
    color: "from-purple-400 via-pink-400 to-blue-400",
    hoverColor: "from-purple-500 via-pink-500 to-blue-500",
    shadowColor: "shadow-purple-300",
  },
  {
    id: "learn",
    emoji: "📚",
    label: "Library",
    color: "from-orange-400 via-yellow-400 to-red-400",
    hoverColor: "from-orange-500 via-yellow-500 to-red-500",
    shadowColor: "shadow-orange-300",
  },
  {
    id: "quiz",
    emoji: "🎮",
    label: "Play",
    color: "from-green-400 via-emerald-400 to-teal-400",
    hoverColor: "from-green-500 via-emerald-500 to-teal-500",
    shadowColor: "shadow-green-300",
  },
  {
    id: "progress",
    emoji: "🗺️",
    label: "Map",
    color: "from-indigo-400 via-purple-400 to-pink-400",
    hoverColor: "from-indigo-500 via-purple-500 to-pink-500",
    shadowColor: "shadow-indigo-300",
  },
];

export function DesktopKidNav({
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  onSettingsClick,
  onAdminClick,
  className,
}: DesktopKidNavProps) {
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentCode, setParentCode] = useState("");
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [kidModeEnabled, setKidModeEnabled] = useState(userRole === "child");
  const [parentCodeError, setParentCodeError] = useState(false);

  const correctParentCode = "PARENT2024"; // More secure parent code

  const handleParentGateSubmit = () => {
    if (parentCode === correctParentCode) {
      setShowParentGate(false);
      setShowParentOptions(true);
      setParentCode("");
      setParentCodeError(false);
    } else {
      // Show error feedback
      setParentCodeError(true);
      setParentCode("");
      setTimeout(() => setParentCodeError(false), 3000);
    }
  };

  const toggleKidMode = () => {
    const newKidMode = !kidModeEnabled;
    setKidModeEnabled(newKidMode);
    onRoleChange(newKidMode ? "child" : "parent");
  };

  return (
    <>
      {/* Kid Mode: Bottom Navigation - Optimized for Small Screens */}
      {kidModeEnabled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 hidden lg:block compact-kid-nav">
          <div className="bg-white/95 backdrop-blur-lg border-t-2 border-rainbow shadow-xl h-full max-h-16 lg:max-h-20 xl:max-h-24">
            <div className="max-w-4xl mx-auto px-3 lg:px-4 h-full">
              <div className="flex items-center justify-center gap-2 lg:gap-4 xl:gap-6 h-full">
                {kidNavTabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "flex flex-col items-center transition-all duration-300 transform relative group kid-nav-button-compact",
                      // Apply container-less design to all icons - same size for all icons
                      "min-w-[100px] lg:min-w-[120px] xl:min-w-[140px] scale-110 lg:scale-120 p-1 lg:p-2 xl:p-3 gap-0 lg:gap-0.5",
                      // All buttons now have transparent background - natural kid-friendly appearance
                      "bg-transparent hover:bg-transparent shadow-none hover:shadow-none"
                    )}
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Remove old glow effect for all icons - now using sparkles */}

                    {/* Emoji Icon - Larger kid-friendly icons for all, moved up */}
                    <div className="relative z-10 -mt-2 lg:-mt-3 xl:-mt-4 text-4xl lg:text-5xl xl:text-6xl">
                      <motion.div
                        animate={
                          activeTab === tab.id
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: tab.id === "dashboard" ? [0, 2, -2, 0] : [0, 5, -5, 0], // Gentler animation for home
                              }
                            : { scale: 1 }
                        }
                        transition={{
                          duration: tab.id === "dashboard" ? 3 : 2, // Slower animation for home
                          repeat: activeTab === tab.id ? Infinity : 0,
                          ease: "easeInOut",
                        }}
                        className={cn(
                          tab.id === "dashboard" && "filter drop-shadow-lg" // Extra shadow for home
                        )}
                      >
                        {/* Kid-friendly emoji design for all icons */}
                        <div className="relative">
                          <span className="relative z-10 filter drop-shadow-2xl">{tab.emoji}</span>
                          {/* Magical sparkles around any active icon */}
                          {activeTab === tab.id && (
                            <>
                              <motion.div
                                className="absolute -top-2 -right-2 text-yellow-400 text-xl"
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0.5, 1, 0.5],
                                  rotate: [0, 180, 360]
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: 0
                                }}
                              >
                                ✨
                              </motion.div>
                              <motion.div
                                className="absolute -bottom-2 -left-2 text-yellow-300 text-lg"
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0.5, 1, 0.5],
                                  rotate: [360, 180, 0]
                                }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  delay: 1.5
                                }}
                              >
                                🌟
                              </motion.div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Label - White text for all container-less icons, same size for all */}
                    <span className="font-bold text-center relative z-10 text-white drop-shadow-lg -mt-1 lg:-mt-2 text-sm lg:text-base xl:text-lg">
                      {tab.label}
                    </span>

                    {/* Active Indicator - Smaller */}
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 lg:w-3 lg:h-3 bg-yellow-300 rounded-full shadow-md"
                        animate={{
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            "0 0 0 0 rgba(251, 191, 36, 0.7)",
                            "0 0 0 6px rgba(251, 191, 36, 0)",
                            "0 0 0 0 rgba(251, 191, 36, 0)",
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}

                    {/* Sparkle Effects - Smaller and more subtle */}
                    <AnimatePresence>
                      {activeTab === tab.id && (
                        <>
                          <motion.div
                            className="absolute -top-0.5 -right-0.5 text-yellow-300 text-xs lg:text-sm"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 1,
                            }}
                          >
                            ✨
                          </motion.div>
                          <motion.div
                            className="absolute -bottom-0.5 -left-0.5 text-white text-xs"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: 2,
                              delay: 0.5,
                            }}
                          >
                            ⭐
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parent Gate Button - Top Right Corner */}
      <div className="fixed top-3 right-3 lg:top-4 lg:right-4 z-50 hidden lg:block">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => setShowParentGate(true)}
                className="bg-white/90 backdrop-blur-lg border-2 border-gray-300 rounded-full p-2 lg:p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 group-hover:text-yellow-700" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Family Zone & Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Parent Gate Dialog */}
      <Dialog open={showParentGate} onOpenChange={setShowParentGate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-yellow-600" />
              Parent Gate
            </DialogTitle>
            <DialogDescription>
              Enter the parent code to access family settings and controls.
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                Hint: The code is "PARENT2024"
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="parent-code"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Parent Code
              </label>
              <input
                id="parent-code"
                type="password"
                value={parentCode}
                onChange={(e) => {
                  setParentCode(e.target.value);
                  setParentCodeError(false);
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                  parentCodeError
                    ? "border-red-500 focus:ring-red-500 bg-red-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder="Enter code..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleParentGateSubmit();
                  }
                }}
              />
              {parentCodeError && (
                <p className="text-sm text-red-600 mt-1">
                  Incorrect code. Please try again.
                </p>
              )}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setShowParentGate(false);
                  setParentCode("");
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleParentGateSubmit}>Access</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Parent Options Dialog */}
      <Dialog open={showParentOptions} onOpenChange={setShowParentOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Family Zone
            </DialogTitle>
            <DialogDescription>
              Access parent controls and family settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Kid Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{kidModeEnabled ? "👶" : "👨‍👩‍👧‍👦"}</div>
                <div>
                  <div className="font-medium text-gray-900">
                    {kidModeEnabled ? "Kid-Safe Mode" : "Parent Mode"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {kidModeEnabled
                      ? "🔒 Protected navigation - sidebar hidden"
                      : "⚠️ Full navigation sidebar visible"}
                  </div>
                  {!kidModeEnabled && (
                    <div className="text-xs text-amber-600 mt-1 font-medium">
                      Note: Sidebar will be visible to children
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant={kidModeEnabled ? "outline" : "destructive"}
                size="sm"
                onClick={toggleKidMode}
                className="ml-4"
              >
                {kidModeEnabled ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {kidModeEnabled ? "Show Sidebar" : "Hide Sidebar"}
              </Button>
            </div>

            {/* Parent Controls */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  // Ensure kid mode stays enabled to prevent sidebar from showing
                  setKidModeEnabled(true);
                  onRoleChange("parent");
                  setShowParentOptions(false);
                }}
                className="flex items-center gap-3 p-4 h-auto justify-start"
              >
                <Users className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Parent Dashboard</div>
                  <div className="text-sm text-gray-500">
                    View progress and analytics (Kid-safe mode)
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  onSettingsClick();
                  setShowParentOptions(false);
                }}
                className="flex items-center gap-3 p-4 h-auto justify-start"
              >
                <Settings className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Settings</div>
                  <div className="text-sm text-gray-500">
                    App preferences and controls
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  onAdminClick();
                  setShowParentOptions(false);
                }}
                className="flex items-center gap-3 p-4 h-auto justify-start"
              >
                <Shield className="w-5 h-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Admin Panel</div>
                  <div className="text-sm text-gray-500">
                    Advanced configuration
                  </div>
                </div>
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowParentOptions(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
