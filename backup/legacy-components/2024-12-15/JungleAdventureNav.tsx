import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Crown, Lock, Settings, Users, Shield } from "lucide-react";
import {
  jungleNavItems,
  jungleTheme,
  navBreakpoints,
  getOptimalSettings,
  type JungleNavState,
  type DeviceCapabilities,
} from "@/lib/jungleNavConfig";
import "@/styles/jungle-adventure-nav.css";

interface JungleAdventureNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: "child" | "parent";
  onRoleChange: (role: "child" | "parent") => void;
  onSettingsClick: () => void;
  onAdminClick: () => void;
  className?: string;
}

export function JungleAdventureNav({
  activeTab,
  onTabChange,
  userRole,
  onRoleChange,
  onSettingsClick,
  onAdminClick,
  className,
}: JungleAdventureNavProps) {
  // State management
  const [navState, setNavState] = useState<JungleNavState>(() => ({
    activeTab,
    isCollapsed: false,
    showParentGate: false,
    deviceCapabilities: getOptimalSettings(),
  }));

  const [parentCode, setParentCode] = useState("");
  const [parentCodeError, setParentCodeError] = useState(false);
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );

  // Parent gate code
  const correctParentCode = "PARENT2024";

  // Device detection and responsive handling
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < navBreakpoints.mobile) {
        setScreenSize("mobile");
      } else if (width < navBreakpoints.desktop) {
        setScreenSize("tablet");
      } else {
        setScreenSize("desktop");
      }

      // Update device capabilities on resize
      setNavState((prev) => ({
        ...prev,
        deviceCapabilities: getOptimalSettings(),
      }));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Audio system (optional)
  const playSound = useCallback(
    (soundType: string) => {
      if (!navState.deviceCapabilities.sounds) return;

      try {
        const audio = new Audio(jungleTheme.sounds.interactions[soundType]);
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Silently fail if audio can't play
        });
      } catch {
        // Ignore audio errors
      }
    },
    [navState.deviceCapabilities.sounds],
  );

  // Parent gate handling
  const handleParentGateSubmit = useCallback(() => {
    if (parentCode === correctParentCode) {
      setNavState((prev) => ({ ...prev, showParentGate: false }));
      setShowParentOptions(true);
      setParentCode("");
      setParentCodeError(false);
      playSound("success");
    } else {
      setParentCodeError(true);
      setParentCode("");
      setTimeout(() => setParentCodeError(false), 3000);
    }
  }, [parentCode, playSound]);

  // Navigation item click handler
  const handleNavClick = useCallback(
    (itemId: string) => {
      playSound("click");
      onTabChange(itemId);
      setNavState((prev) => ({ ...prev, activeTab: itemId }));
    },
    [onTabChange, playSound],
  );

  // Hover handlers
  const handleNavHover = useCallback(() => {
    playSound("hover");
  }, [playSound]);

  // Memoized navigation items with screen-specific optimizations
  const optimizedNavItems = useMemo(() => {
    return jungleNavItems.map((item) => ({
      ...item,
      // Reduce animation complexity on mobile
      animations:
        screenSize === "mobile"
          ? {
              ...item.animations,
              idle: "none",
              hover: "none",
            }
          : item.animations,
    }));
  }, [screenSize]);

  // Render individual navigation item
  const renderNavItem = useCallback(
    (item: (typeof jungleNavItems)[0], index: number) => {
      const isActive = activeTab === item.id;
      const isSimpleMode = !navState.deviceCapabilities.animations;

      return (
        <motion.button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          onMouseEnter={handleNavHover}
          className={cn(
            "jungle-nav-item",
            isActive && "active",
            isSimpleMode && "jungle-nav-simple",
          )}
          aria-label={item.accessibility.ariaLabel}
          title={item.accessibility.description}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.15,
            duration: navState.deviceCapabilities.animations ? 0.6 : 0,
            ease: "easeOut",
          }}
          whileHover={
            navState.deviceCapabilities.animations
              ? {
                  y: -0.5,
                  scale: 1.005,
                  transition: {
                    duration: 0.4,
                    ease: "easeOut",
                  },
                }
              : undefined
          }
          whileTap={
            navState.deviceCapabilities.animations
              ? {
                  scale: 0.995,
                  transition: {
                    duration: 0.2,
                    ease: "easeInOut",
                  },
                }
              : undefined
          }
        >
          {/* Decorative vines (desktop only) */}
          {screenSize === "desktop" &&
            navState.deviceCapabilities.backgroundEffects && (
              <div className="jungle-vines">🌿</div>
            )}

          {/* Animal icon */}
          <div
            className={cn(
              "jungle-animal-icon",
              isActive && "active",
              !isActive &&
                !isSimpleMode &&
                `idle-${item.animal.name.toLowerCase().replace(" ", "")}`,
            )}
          >
            {item.animal.emoji}

            {/* Fireflies for active items */}
            {isActive && navState.deviceCapabilities.particles && (
              <>
                <div className="jungle-fireflies">✨</div>
                <div className="jungle-fireflies">💫</div>
                <div className="jungle-fireflies">⭐</div>
              </>
            )}
          </div>

          {/* Label */}
          <span className={cn("jungle-nav-label", isActive && "active")}>
            {item.label}
          </span>

          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="jungle-active-indicator"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}
        </motion.button>
      );
    },
    [
      activeTab,
      navState.deviceCapabilities,
      screenSize,
      handleNavClick,
      handleNavHover,
    ],
  );

  // Main navigation container
  const NavigationContainer = () => (
    <div
      className={cn(
        "jungle-nav-container",
        `jungle-nav-${screenSize}`,
        !navState.deviceCapabilities.animations && "jungle-nav-simple",
        className,
      )}
    >
      {/* Jungle canopy background effect */}
      {navState.deviceCapabilities.backgroundEffects && (
        <div className="jungle-canopy" />
      )}

      {/* Navigation items */}
      <div className="jungle-nav-items">
        {optimizedNavItems.map((item, index) => renderNavItem(item, index))}
      </div>
    </div>
  );

  // Parent gate button
  const ParentGateButton = () => (
    <div className="jungle-parent-gate">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() =>
              setNavState((prev) => ({ ...prev, showParentGate: true }))
            }
            className="jungle-parent-gate-button"
            whileHover={
              navState.deviceCapabilities.animations
                ? { scale: 1.05 }
                : undefined
            }
            whileTap={
              navState.deviceCapabilities.animations
                ? { scale: 0.95 }
                : undefined
            }
            aria-label="Access Family Zone and Settings"
          >
            <Crown className="w-6 h-6 text-yellow-600" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Family Zone & Settings</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );

  // Parent gate dialog
  const ParentGateDialog = () => (
    <Dialog
      open={navState.showParentGate}
      onOpenChange={(open) =>
        setNavState((prev) => ({ ...prev, showParentGate: open }))
      }
    >
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
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent",
                parentCodeError
                  ? "border-red-500 focus:ring-red-500 bg-red-50"
                  : "border-gray-300 focus:ring-blue-500",
              )}
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
                setNavState((prev) => ({ ...prev, showParentGate: false }));
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
  );

  // Parent options dialog
  const ParentOptionsDialog = () => (
    <Dialog open={showParentOptions} onOpenChange={setShowParentOptions}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Family Zone
          </DialogTitle>
          <DialogDescription>
            Access parent dashboard, settings, and family controls.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={() => {
                onRoleChange("parent");
                setShowParentOptions(false);
              }}
              className="flex items-center gap-3 p-4 h-auto justify-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold text-lg">Parent Dashboard</div>
                <div className="text-sm text-blue-100">
                  View detailed progress, analytics, and manage learning goals
                </div>
              </div>
            </Button>

            <Button
              onClick={() => {
                onSettingsClick();
                setShowParentOptions(false);
              }}
              className="flex items-center gap-3 p-4 h-auto justify-start bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Settings className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold text-lg">Settings</div>
                <div className="text-sm text-green-100">
                  Configure app preferences, controls, and customizations
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onAdminClick();
                setShowParentOptions(false);
              }}
              className="flex items-center gap-3 p-4 h-auto justify-start border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
            >
              <Shield className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium text-purple-800">Admin Panel</div>
                <div className="text-sm text-purple-600">
                  Advanced configuration and system controls
                </div>
              </div>
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowParentOptions(false)}
            className="w-full mt-4 border-gray-300 hover:border-gray-400"
          >
            Close Family Zone
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <NavigationContainer />
      <ParentGateButton />
      <ParentGateDialog />
      <ParentOptionsDialog />
    </>
  );
}

export default JungleAdventureNav;
