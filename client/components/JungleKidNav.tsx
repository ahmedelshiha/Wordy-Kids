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
import { junglePerformanceOptimizer } from "@/lib/jungleNavPerformance";
import { useJungleNavAnimations } from "@/hooks/use-jungle-nav-animations";
import { useAnimationControl } from "@/lib/animationControl";
import { animationControl } from "@/lib/animationControl";
import "@/styles/jungle-adventure-nav.css";

/**
 * 🎮 Builder.io Animation Style Configuration Guide
 *
 * Animation Style Options:
 *
 * 1. "calm-breathing" (DEFAULT) ⭐
 *    - Gentle scale animation like breathing
 *    - Safe for focus/typing tasks
 *    - Mobile-optimized, battery efficient
 *    - Kid-friendly and calming
 *
 * 2. "soft-glow" 🌟
 *    - Adds subtle firefly glow effects
 *    - No harsh flashing or blinking
 *    - Soft yellow/green jungle colors
 *    - Combines with breathing animation
 *
 * 3. "micro-movements" 🦉
 *    - Character-specific subtle movements
 *    - Owl: gentle blink every ~10s
 *    - Monkey: tiny tail wiggle
 *    - Parrot: slight head tilt
 *    - Elephant: small ear flap
 *    - Idle & slow, not distracting
 *
 * 4. "full-experience" 🌿
 *    - All effects combined
 *    - Maximum immersion
 *    - Best for exploration modes
 *
 * 5. "none" ♿
 *    - No animations (accessibility mode)
 *    - For motion-sensitive children
 *    - Fully accessible
 *
 * Usage in Builder.io:
 * Add as dropdown: animationStyle="calm-breathing"
 */

// Builder.io compatible props interface
export interface JungleKidNavProps {
  // Core navigation props
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  userRole?: "child" | "parent";
  onRoleChange?: (role: "child" | "parent") => void;
  onSettingsClick?: () => void;
  onAdminClick?: () => void;
  className?: string;

  // Builder.io configurable props
  menuItems?: Array<{
    label: string;
    link: string;
    icon: string;
    animal?: string;
  }>;
  theme?: "jungle" | "simple";
  enableSounds?: boolean;
  animations?: boolean;
  showParentGate?: boolean;

  // 🎯 Kid-Friendly Animation Presets
  // "calm-breathing" - Default gentle breathing animation (safest for focus/typing)
  // "soft-glow" - Adds subtle firefly glow effects
  // "micro-movements" - Animal character micro-movements (owl blinks, monkey wiggles, etc)
  // "full-experience" - All effects combined for maximum immersion
  // "none" - No animations (accessibility mode)
  animationStyle?:
    | "calm-breathing"
    | "soft-glow"
    | "micro-movements"
    | "full-experience"
    | "none";

  // Performance and accessibility
  reducedMotion?: boolean;
  enableParticles?: boolean;
  autoOptimize?: boolean;
}

export function JungleKidNav({
  activeTab = "dashboard",
  onTabChange = () => {},
  userRole = "child",
  onRoleChange = () => {},
  onSettingsClick = () => {},
  onAdminClick = () => {},
  className,

  // Builder.io props with defaults
  menuItems,
  theme = "jungle",
  enableSounds = true,
  animations = true,
  showParentGate = true,
  reducedMotion = false,
  enableParticles = true,
  autoOptimize = true,
  animationStyle = "calm-breathing",
}: JungleKidNavProps) {
  // State management
  const [navState, setNavState] = useState<JungleNavState>(() => ({
    activeTab,
    isCollapsed: false,
    showParentGate: false,
    deviceCapabilities: autoOptimize
      ? getOptimalSettings()
      : {
          animations: animations && !reducedMotion,
          sounds: enableSounds,
          particles: enableParticles && !reducedMotion,
          backgroundEffects: animations && !reducedMotion,
        },
  }));

  const [parentCode, setParentCode] = useState("");
  const [parentCodeError, setParentCodeError] = useState(false);
  const [showParentOptions, setShowParentOptions] = useState(false);
  const [screenSize, setScreenSize] = useState<"mobile" | "tablet" | "desktop">(
    "desktop",
  );
  const [isPerformanceOptimized, setIsPerformanceOptimized] = useState(false);

  // Parent gate code
  const correctParentCode = "PARENT2024";

  // Global animation control state
  const { isSuspended: animationsSuspended } = useAnimationControl();

  // Initialize animation controls
  const animationControls = useJungleNavAnimations({
    enableAnimations:
      navState.deviceCapabilities.animations && !animationsSuspended,
    enableSounds: navState.deviceCapabilities.sounds && !animationsSuspended,
    enableParticles:
      navState.deviceCapabilities.particles && !animationsSuspended,
  });

  // Use custom menu items if provided, otherwise use default jungle items
  const navigationItems = useMemo(() => {
    if (menuItems && menuItems.length > 0) {
      return menuItems.map((item, index) => ({
        id: item.link.replace("/", "") || `item-${index}`,
        label: item.label,
        animal: {
          name: item.animal || "Friendly Guide",
          emoji: item.icon || "🌟",
          sound: "default",
          description: `Navigate to ${item.label}`,
        },
        colors:
          jungleNavItems[index % jungleNavItems.length]?.colors ||
          jungleNavItems[0].colors,
        animations:
          jungleNavItems[index % jungleNavItems.length]?.animations ||
          jungleNavItems[0].animations,
        accessibility: {
          ariaLabel: `Navigate to ${item.label}`,
          description: `Go to ${item.label} section`,
        },
      }));
    }
    return jungleNavItems;
  }, [menuItems]);

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

      // Update device capabilities on resize if auto-optimize is enabled
      if (autoOptimize) {
        setNavState((prev) => ({
          ...prev,
          deviceCapabilities: getOptimalSettings(),
        }));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [autoOptimize]);

  // Performance optimization initialization
  useEffect(() => {
    if (!autoOptimize) {
      setIsPerformanceOptimized(true);
      return;
    }

    const initializePerformance = async () => {
      try {
        await junglePerformanceOptimizer.initialize();
        setIsPerformanceOptimized(true);
      } catch (error) {
        console.warn("Performance optimization failed:", error);
        setIsPerformanceOptimized(true); // Continue anyway
      }
    };

    initializePerformance();

    // Listen for optimization updates
    const handleOptimizationUpdate = (event: CustomEvent) => {
      const optimizations = event.detail;
      setNavState((prev) => ({
        ...prev,
        deviceCapabilities: {
          animations:
            animations && !optimizations.reduceAnimations && !reducedMotion,
          sounds: enableSounds && !optimizations.disableParticles,
          particles:
            enableParticles &&
            !optimizations.disableParticles &&
            !reducedMotion,
          backgroundEffects:
            animations && !optimizations.simplifyBackground && !reducedMotion,
        },
      }));
    };

    window.addEventListener(
      "jungle-nav-optimizations-updated",
      handleOptimizationUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "jungle-nav-optimizations-updated",
        handleOptimizationUpdate as EventListener,
      );
      if (autoOptimize) {
        junglePerformanceOptimizer.destroy();
      }
    };
  }, [autoOptimize, animations, enableSounds, enableParticles, reducedMotion]);

  // Auto-pause animations when parent gate dialog opens
  useEffect(() => {
    if (navState.showParentGate) {
      animationControl.suspend("Parent Gate Dialog opened");
    } else {
      animationControl.resume();
    }
  }, [navState.showParentGate]);

  // Parent gate handling
  const handleParentGateSubmit = useCallback(() => {
    if (parentCode === correctParentCode) {
      setNavState((prev) => ({ ...prev, showParentGate: false }));
      setShowParentOptions(true);
      setParentCode("");
      setParentCodeError(false);
      animationControls.playAnimalSound("elephant"); // Celebration sound
    } else {
      setParentCodeError(true);
      setParentCode("");
      setTimeout(() => setParentCodeError(false), 3000);
    }
  }, [parentCode, animationControls]);

  // Navigation item click handler
  const handleNavClick = useCallback(
    (itemId: string) => {
      const item = navigationItems.find((nav) => nav.id === itemId);
      if (item && navState.deviceCapabilities.sounds) {
        animationControls.playAnimalSound(
          item.animal.name.toLowerCase().replace(" ", ""),
        );
      }
      onTabChange(itemId);
      setNavState((prev) => ({ ...prev, activeTab: itemId }));
    },
    [
      navigationItems,
      navState.deviceCapabilities.sounds,
      onTabChange,
      animationControls,
    ],
  );

  // Hover handlers
  const handleNavHover = useCallback(
    (element: HTMLElement) => {
      if (navState.deviceCapabilities.animations) {
        animationControls.playHoverEffect(element);
      }
    },
    [navState.deviceCapabilities.animations, animationControls],
  );

  // Render individual navigation item
  const renderNavItem = useCallback(
    (item: (typeof navigationItems)[0], index: number) => {
      const isActive = activeTab === item.id;
      const isSimpleTheme = theme === "simple";

      return (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.id)}
          onMouseEnter={(e) => handleNavHover(e.currentTarget)}
          className={cn(
            "jungle-nav-item",
            isActive && "active",
            isSimpleTheme && "simple-theme",
          )}
          aria-label={item.accessibility.ariaLabel}
          title={item.accessibility.description}
        >
          {/* Decorative vines (desktop only, jungle theme) */}
          {screenSize === "desktop" &&
            theme === "jungle" &&
            navState.deviceCapabilities.backgroundEffects && (
              <div className="jungle-vines">����</div>
            )}

          {/* Animal/Icon */}
          <div
            className={cn(
              "jungle-animal-icon",
              isActive && "active",
              !isActive &&
                navState.deviceCapabilities.animations &&
                animationStyle !== "none" &&
                `idle-${item.animal.name.toLowerCase().replace(" ", "")}`,
              // No animations override
              animationStyle === "none" && "no-animations",
              // Apply animation style classes based on preset (only if animations enabled)
              navState.deviceCapabilities.animations &&
                animationStyle !== "none" && {
                  "with-glow": animationStyle === "soft-glow",
                  "micro-movements": animationStyle === "micro-movements",
                  "full-experience": animationStyle === "full-experience",
                  [item.animal.name.toLowerCase().replace(" ", "")]:
                    animationStyle === "micro-movements" ||
                    animationStyle === "full-experience",
                },
            )}
          >
            {item.animal.emoji}

            {/* Fireflies for active items */}
            {isActive &&
              navState.deviceCapabilities.particles &&
              theme === "jungle" && (
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
            <div
              className="jungle-active-indicator"
            />
          )}
        </button>
      );
    },
    [
      activeTab,
      theme,
      navState.deviceCapabilities,
      screenSize,
      handleNavClick,
      handleNavHover,
      animationsSuspended,
    ],
  );

  // Simple theme fallback for low-performance devices or Builder.io simple mode
  if (theme === "simple" || !isPerformanceOptimized) {
    return (
      <div className={cn("simple-nav-container", className)}>
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-colors",
                  activeTab === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <div className="text-2xl mb-1">
                  <span>{item.animal.emoji}</span>
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main jungle navigation container
  const NavigationContainer = () => (
    <div
      className={cn(
        "jungle-nav-container",
        `jungle-nav-${screenSize}`,
        className,
      )}
    >
      {/* Jungle canopy background effect */}
      {navState.deviceCapabilities.backgroundEffects && (
        <div className="jungle-canopy" />
      )}

      {/* Navigation items */}
      <div className="jungle-nav-items">
        {navigationItems.map((item, index) => renderNavItem(item, index))}
      </div>
    </div>
  );

  // Parent gate button
  const ParentGateButton = () =>
    showParentGate && (
      <div className="jungle-parent-gate">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() =>
                setNavState((prev) => ({ ...prev, showParentGate: true }))
              }
              className="jungle-parent-gate-button"
              aria-label="Access Family Zone and Settings"
            >
              <Crown className="w-6 h-6 text-yellow-600" />
            </button>
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

export default JungleKidNav;
