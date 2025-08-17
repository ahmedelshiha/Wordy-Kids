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
  LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface MobileKidNavProps {
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

// More menu items for mobile
const moreMenuItems = [
  {
    id: "parent",
    emoji: "👨‍👩‍👧‍👦",
    label: "Family Zone",
    icon: Crown,
    color: "from-yellow-400 to-orange-400",
  },
  {
    id: "settings",
    emoji: "⚙️",
    label: "Settings",
    icon: Settings,
    color: "from-gray-400 to-slate-400",
  },
  {
    id: "admin",
    emoji: "🛡️",
    label: "Admin",
    icon: Shield,
    color: "from-purple-400 to-violet-400",
  },
  {
    id: "auth",
    emoji: "👋",
    label: "Sign Out",
    icon: LogOut,
    color: "from-red-400 to-pink-400",
  },
];

export function MobileKidNav({
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  onSettingsClick,
  onAdminClick,
  className,
}: MobileKidNavProps) {
  const [showParentGate, setShowParentGate] = useState(false);
  const [parentCode, setParentCode] = useState("");
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [kidModeEnabled, setKidModeEnabled] = useState(userRole === "child");
  const [parentCodeError, setParentCodeError] = useState(false);
  const [showKidModeConfirm, setShowKidModeConfirm] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const correctParentCode = "PARENT2024";

  const handleParentGateSubmit = () => {
    if (parentCode === correctParentCode) {
      setShowParentGate(false);
      setShowParentOptions(true);
      setParentCode("");
      setParentCodeError(false);
    } else {
      setParentCodeError(true);
      setParentCode("");
      setTimeout(() => setParentCodeError(false), 3000);
    }
  };

  const toggleKidMode = () => {
    if (kidModeEnabled) {
      setShowKidModeConfirm(true);
    } else {
      setKidModeEnabled(true);
      onRoleChange("child");
    }
  };

  const confirmDisableKidMode = () => {
    setKidModeEnabled(false);
    onRoleChange("parent");
    setShowKidModeConfirm(false);
  };

  const handleMoreItemClick = (itemId: string) => {
    setShowMoreMenu(false);
    
    switch (itemId) {
      case "parent":
        setShowParentGate(true);
        break;
      case "settings":
        onSettingsClick();
        break;
      case "admin":
        onAdminClick();
        break;
      case "auth":
        if (isGuest) {
          navigate("/signup");
        } else {
          logout();
        }
        break;
    }
  };

  return (
    <>
      {/* More Menu Overlay */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/30"
            onClick={() => setShowMoreMenu(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="absolute bottom-20 left-3 right-3 bg-white rounded-3xl shadow-2xl p-4 border-4 border-rainbow max-h-[70vh] overflow-y-auto"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="text-center mb-4">
              <motion.div 
                className="text-3xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎪
              </motion.div>
              <h3 className="text-lg font-bold text-gray-800 kid-text-big">
                More Fun Stuff!
              </h3>
              <p className="text-sm text-gray-600">Tap what you want to do!</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreMenuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleMoreItemClick(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 transform active:scale-95 border-2 min-h-[90px] justify-center",
                    `bg-gradient-to-br ${item.color} text-white shadow-lg hover:shadow-xl`
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="text-2xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: item.id === "parent" ? [0, 5, -5, 0] : [0, 0, 0, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {item.emoji}
                  </motion.div>
                  <span className="text-sm font-bold text-white drop-shadow-sm">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => setShowMoreMenu(false)}
              className="w-full mt-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close Menu ❌
            </motion.button>
          </motion.div>
        </div>
      )}

      {/* Kid-Friendly Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden kid-nav-mobile">
        <div className="bg-white/95 backdrop-blur-lg border-t-4 border-rainbow shadow-2xl safe-area-padding-bottom mobile-optimized">
          <div className="flex items-center justify-center gap-1 px-2 py-1 max-w-full">
            {kidNavTabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center transition-all duration-300 transform relative group",
                  "flex-1 min-w-0 max-w-[80px] p-1.5 gap-0.5",
                  "bg-transparent hover:bg-transparent"
                )}
                whileHover={{ y: -2, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Emoji Icon with magical animations */}
                <div className="relative z-10 text-2xl">
                  <motion.div
                    animate={
                      activeTab === tab.id
                        ? {
                            scale: [1, 1.15, 1],
                            rotate: tab.id === "dashboard" ? [0, 5, -5, 0] : [0, 8, -8, 0],
                          }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: tab.id === "dashboard" ? 3 : 2.5,
                      repeat: activeTab === tab.id ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className="relative"
                  >
                    <span className="relative z-10 filter drop-shadow-lg">
                      {tab.emoji}
                    </span>
                    
                    {/* Magical sparkles for active tab */}
                    {activeTab === tab.id && (
                      <>
                        <motion.div
                          className="absolute -top-1 -right-1 text-yellow-400 text-sm"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                            rotate: [0, 180, 360],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 0,
                          }}
                        >
                          ✨
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-1 -left-1 text-yellow-300 text-xs"
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0.5, 1, 0.5],
                            rotate: [360, 180, 0],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            delay: 1.2,
                          }}
                        >
                          🌟
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                </div>

                {/* Kid-friendly label */}
                <span className="font-bold text-center relative z-10 text-white drop-shadow-lg text-xs leading-tight truncate max-w-full">
                  {tab.label}
                </span>

                {/* Active Indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-sm"
                    animate={{
                      scale: [1, 1.3, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(251, 191, 36, 0.7)",
                        "0 0 0 4px rgba(251, 191, 36, 0)",
                        "0 0 0 0 rgba(251, 191, 36, 0)",
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}

                {/* Additional sparkle effects */}
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <>
                      <motion.div
                        className="absolute -top-0.5 -right-0.5 text-yellow-300 text-xs"
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

            {/* More Menu Button */}
            <motion.button
              onClick={() => setShowMoreMenu(true)}
              className={cn(
                "flex flex-col items-center transition-all duration-300 transform relative",
                "flex-1 min-w-0 max-w-[80px] p-1.5 gap-0.5",
                showMoreMenu
                  ? "bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl"
                  : "bg-transparent"
              )}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className={cn(
                  "text-2xl transition-transform duration-200",
                  showMoreMenu ? "rotate-45 scale-110" : ""
                )}
                animate={showMoreMenu ? { rotate: [0, 360] } : {}}
                transition={{ duration: 0.5 }}
              >
                🎪
              </motion.div>
              <span className={cn(
                "font-bold text-center text-xs leading-tight",
                showMoreMenu ? "text-white drop-shadow-lg" : "text-gray-600"
              )}>
                More
              </span>

              {showMoreMenu && (
                <motion.div
                  className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-yellow-300 rounded-full shadow-sm"
                  animate={{
                    scale: [1, 1.3, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(251, 191, 36, 0.7)",
                      "0 0 0 4px rgba(251, 191, 36, 0)",
                      "0 0 0 0 rgba(251, 191, 36, 0)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.button>
          </div>
        </div>
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
                htmlFor="parent-code-mobile"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Parent Code
              </label>
              <input
                id="parent-code-mobile"
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
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                Family Zone
              </div>
              <div
                className={`text-sm px-2 py-1 rounded-full ${
                  kidModeEnabled
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                }`}
              >
                {kidModeEnabled ? "🔒 Safe Mode" : "⚠️ Sidebar Visible"}
              </div>
            </DialogTitle>
            <DialogDescription>
              Access parent controls and family settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Parent Controls */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => {
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
                    View progress and analytics
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
