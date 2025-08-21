import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
// Safe lucide-react imports (no Map)
import {
  Compass,
  Trophy,
  Flame,
  Home,
  BookOpen,
  MoreHorizontal,
  Shield,
  Key,
  X,
  BarChart3,
  Settings,
  LogOut,
  UserPlus,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export type JungleNavItem = {
  id: string;
  label: string;
  emoji?: string; // 🦉 🦜 🐵 🐘 (preferred for animals)
  icon?: React.ReactNode; // fallback lucide icon
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

export type ParentMenuIconVariant = "totem" | "shield" | "key";
export type ParentMenuAnimationStyle = "breathing" | "glow" | "none";

export type JungleAdventureNavV2Props = {
  /** Current route/active item id */
  activeId?: string;
  /** Items to render; default set provided */
  items?: JungleNavItem[];
  /** Called when user chooses a nav item */
  onNavigate?: (id: string) => void;
  /** Set to true to pause all animations globally (e.g., Parent Gate dialog open) */
  pauseAnimations?: boolean;
  /** Compact bar height on mobile; icons float above slightly */
  mobileBarHeight?: number; // px
  /** Desktop bar height */
  desktopBarHeight?: number; // px
  /** Raise icons above the bar (px) */
  iconLift?: number; // px
  /** Enlarge icons (px) */
  iconSize?: number; // px
  /** Optional className passthrough */
  className?: string;
  /** Show Parent Menu icon (mobile only) - replaces old More ... */
  showParentMenuIcon?: boolean;
  /** Parent menu icon variant */
  parentMenuIconVariant?: ParentMenuIconVariant;
  /** Parent menu animation style */
  parentMenuAnimationStyle?: ParentMenuAnimationStyle;
  /** Toggle sections in parent dialog */
  parentDialogSections?: {
    dashboard?: boolean;
    settings?: boolean;
    signOut?: boolean;
  };
  /** Called when parent menu icon is clicked */
  onParentMenuClick?: () => void;
  /** Called when parent dashboard button is clicked */
  onParentDashboard?: () => void;
  /** Called when settings button is clicked */
  onParentSettings?: () => void;
  /** Called when sign out button is clicked */
  onParentSignOut?: () => void;
  /** Called when register button is clicked */
  onParentRegister?: () => void;
  /** Whether the user is a guest (for dynamic auth button) */
  isGuest?: boolean;
  /** @deprecated Use showParentMenuIcon instead */
  showMobileMoreIcon?: boolean;
  /** @deprecated Use onParentMenuClick instead */
  onMobileMoreClick?: () => void;
};

const DEFAULT_ITEMS: JungleNavItem[] = [
  { id: "home", label: "Home Tree", emoji: "🦉", ariaLabel: "Home Tree" },
  { id: "learn", label: "Book Jungle", emoji: "🦜", ariaLabel: "Learning" },
  { id: "play", label: "Adventure Games", emoji: "🐵", ariaLabel: "Play" },
  {
    id: "achievements",
    label: "Trophy Grove",
    emoji: "🐘",
    ariaLabel: "Achievements",
  },
  // Non-animal system icons (safe)
  {
    id: "map",
    label: "Explore",
    icon: <Compass aria-hidden="true" />,
    ariaLabel: "Explore",
  },
  {
    id: "streak",
    label: "Streak",
    icon: <Flame aria-hidden="true" />,
    ariaLabel: "Daily Streak",
  },
];

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(!!mq.matches);
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

/**
 * NEW jungle nav with NO infinite movement:
 * - Icons do a short, gentle "breath" only on hover/tap or when becoming active.
 * - No translateY animations, no bouncing, no dancing.
 * - Icons are larger and lifted above the bar for a playful, game-like look.
 */
export default function JungleAdventureNavV2({
  activeId,
  items = DEFAULT_ITEMS,
  onNavigate,
  pauseAnimations = false,
  mobileBarHeight = 64,
  desktopBarHeight = 72,
  iconLift = 14,
  iconSize = 44,
  className,
  showParentMenuIcon = true,
  parentMenuIconVariant = "totem",
  parentMenuAnimationStyle = "breathing",
  parentDialogSections = {
    dashboard: true,
    settings: true,
    signOut: true,
  },
  onParentMenuClick,
  onParentDashboard,
  onParentSettings,
  onParentSignOut,
  onParentRegister,
  showMobileMoreIcon = false,
  onMobileMoreClick,
}: JungleAdventureNavV2Props) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isParentDialogOpen, setIsParentDialogOpen] = useState(false);

  // Track which icon is doing a one-shot breath animation
  const [breathing, setBreathing] = useState<Record<string, boolean>>({});
  const breathTimers = useRef<Record<string, number>>({});

  // Get parent menu icon based on variant
  const getParentMenuIcon = () => {
    switch (parentMenuIconVariant) {
      case "shield":
        return "🛡️";
      case "key":
        return "🔑";
      case "totem":
      default:
        return "🪵";
    }
  };

  // Get accessible description for parent menu icon
  const getParentMenuAriaLabel = () => {
    const baseLabel = "Parent Menu";
    switch (parentMenuIconVariant) {
      case "shield":
        return `${baseLabel} - Tribal Shield`;
      case "key":
        return `${baseLabel} - Golden Key`;
      case "totem":
      default:
        return `${baseLabel} - Carved Totem`;
    }
  };

  // Handle parent menu click
  const handleParentMenuClick = () => {
    triggerBreath("parent-menu");
    if (onParentMenuClick) {
      onParentMenuClick();
    } else {
      setIsParentDialogOpen(true);
    }
  };

  // Helper: trigger one-shot breathing animation for an item
  const triggerBreath = (id: string, durationMs = 800) => {
    if (pauseAnimations || reducedMotion) return;
    setBreathing((b) => ({ ...b, [id]: true }));
    window.clearTimeout(breathTimers.current[id]);
    breathTimers.current[id] = window.setTimeout(() => {
      setBreathing((b) => ({ ...b, [id]: false }));
    }, durationMs);
  };

  // On mount: fade in only (handled via CSS). No vertical movement.
  useEffect(() => {
    setMounted(true);
    return () => {
      // cleanup timers
      Object.values(breathTimers.current).forEach((t) =>
        window.clearTimeout(t),
      );
    };
  }, []);

  // Whenever activeId changes, give that icon a soft single breath (no loop)
  useEffect(() => {
    if (!activeId) return;
    triggerBreath(activeId, 900);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  const styleVars = useMemo<React.CSSProperties>(
    () => ({
      // CSS custom props for layout
      ["--jng-mobile-bar-h" as any]: `${mobileBarHeight}px`,
      ["--jng-desktop-bar-h" as any]: `${desktopBarHeight}px`,
      ["--jng-icon-lift" as any]: `${iconLift}px`,
      ["--jng-icon-size" as any]: `${iconSize}px`,
    }),
    [mobileBarHeight, desktopBarHeight, iconLift, iconSize],
  );

  return (
    <nav
      className={clsx(
        "jng-nav-v2",
        mounted && "jng-mounted",
        pauseAnimations && "jng-anim-paused",
        reducedMotion && "jng-reduced-motion",
        className,
      )}
      style={styleVars}
      aria-label="Jungle Adventure Navigation"
    >
      <div className="jng-nav-bar">
        <ul className="jng-nav-list" role="menubar">
          {items.map((item) => {
            const isActive = item.id === activeId;
            const isBreathing = !!breathing[item.id];
            return (
              <li key={item.id} className="jng-nav-item" role="none">
                <button
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.ariaLabel || item.label}
                  className={clsx(
                    "jng-btn",
                    isActive && "is-active",
                    isBreathing && "breath-once",
                  )}
                  onMouseEnter={() => triggerBreath(item.id)}
                  onFocus={() => triggerBreath(item.id)}
                  onClick={() => {
                    triggerBreath(item.id);
                    if (item.onClick) item.onClick();
                    if (onNavigate) onNavigate(item.id);
                    if (item.href) window.location.assign(item.href);
                  }}
                >
                  <span
                    className={clsx(
                      "jng-icon-wrap",
                      // keep icons visually lifted above the bar
                      "jng-icon-lifted",
                    )}
                    aria-hidden="true"
                  >
                    {item.emoji ? (
                      <span
                        className="jng-emoji"
                        style={{ fontSize: `calc(var(--jng-icon-size) * 0.9)` }}
                      >
                        {item.emoji}
                      </span>
                    ) : (
                      <span className="jng-svg">{item.icon ?? <Home />}</span>
                    )}
                  </span>
                  <span className="jng-label">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Parent Menu Icon - Right Side (Mobile Only) */}
        {(showParentMenuIcon || showMobileMoreIcon) && (
          <button
            className={clsx(
              "jng-parent-menu-btn md:hidden",
              parentMenuAnimationStyle === "breathing" && "parent-breathing",
              parentMenuAnimationStyle === "glow" && "parent-glowing",
            )}
            onClick={() => {
              if (showParentMenuIcon) {
                handleParentMenuClick();
              } else {
                // Legacy support
                triggerBreath("more");
                if (onMobileMoreClick) onMobileMoreClick();
              }
            }}
            onMouseEnter={() =>
              triggerBreath(showParentMenuIcon ? "parent-menu" : "more")
            }
            onFocus={() =>
              triggerBreath(showParentMenuIcon ? "parent-menu" : "more")
            }
            aria-label={
              showParentMenuIcon ? getParentMenuAriaLabel() : "More options"
            }
            aria-expanded={showParentMenuIcon ? isParentDialogOpen : undefined}
            aria-haspopup={showParentMenuIcon ? "dialog" : undefined}
          >
            <span
              className={clsx(
                "jng-icon-wrap jng-icon-lifted",
                showParentMenuIcon && "parent-icon-totem",
                breathing[showParentMenuIcon ? "parent-menu" : "more"] &&
                  "breath-once",
              )}
              aria-hidden="true"
            >
              {showParentMenuIcon ? (
                <span
                  className="jng-emoji parent-menu-emoji"
                  style={{ fontSize: `calc(var(--jng-icon-size) * 1.1)` }}
                >
                  {getParentMenuIcon()}
                </span>
              ) : (
                <span className="jng-svg">
                  <MoreHorizontal size={iconSize * 0.7} />
                </span>
              )}
            </span>
            <span className="jng-label">
              {showParentMenuIcon ? "Parents" : "More"}
            </span>
          </button>
        )}
      </div>

      {/* Parent Menu Dialog */}
      {isParentDialogOpen && (
        <Dialog open={isParentDialogOpen} onOpenChange={setIsParentDialogOpen}>
          <DialogContent
            className="jungle-parent-dialog"
            aria-describedby="parent-menu-description"
          >
            <DialogTitle className="jungle-dialog-title">
              🏠 Family Zone
            </DialogTitle>
            <p id="parent-menu-description" className="sr-only">
              Family controls and settings for parents and guardians
            </p>
            <div className="jungle-dialog-backdrop">
              <div className="jungle-dialog-frame">
                <div className="jungle-dialog-sections">
                  {parentDialogSections.dashboard && (
                    <button
                      className="jungle-dialog-btn"
                      onClick={() => {
                        setIsParentDialogOpen(false);
                        onParentDashboard?.();
                      }}
                      aria-label="Open Parent Dashboard - View child's progress and reports"
                    >
                      <BarChart3
                        className="jungle-dialog-icon"
                        aria-hidden="true"
                      />
                      <span>📊 Parent Dashboard</span>
                      <div className="jungle-btn-glow" />
                    </button>
                  )}

                  {parentDialogSections.settings && (
                    <button
                      className="jungle-dialog-btn"
                      onClick={() => {
                        setIsParentDialogOpen(false);
                        onParentSettings?.();
                      }}
                      aria-label="Open Settings - Child-safe controls and preferences"
                    >
                      <Settings
                        className="jungle-dialog-icon"
                        aria-hidden="true"
                      />
                      <span>⚙️ Settings</span>
                      <div className="jungle-btn-glow" />
                    </button>
                  )}

                  {parentDialogSections.signOut && (
                    <>
                      <button
                        className="jungle-dialog-btn"
                        onClick={() => {
                          setIsParentDialogOpen(false);
                          onParentSignOut?.();
                        }}
                        aria-label="Sign Out - Log out of parent account"
                      >
                        <LogOut
                          className="jungle-dialog-icon"
                          aria-hidden="true"
                        />
                        <span>🔐 Sign Out</span>
                        <div className="jungle-btn-glow" />
                      </button>

                      <button
                        className="jungle-dialog-btn"
                        onClick={() => {
                          setIsParentDialogOpen(false);
                          onParentRegister?.();
                        }}
                        aria-label="Register - Create new parent account"
                      >
                        <UserPlus
                          className="jungle-dialog-icon"
                          aria-hidden="true"
                        />
                        <span>🔐 Register</span>
                        <div className="jungle-btn-glow" />
                      </button>
                    </>
                  )}
                </div>

                <button
                  className="jungle-dialog-close"
                  onClick={() => setIsParentDialogOpen(false)}
                  aria-label="Close Parent Menu"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </nav>
  );
}
