import React, { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
// Safe lucide-react imports (no Map)
import { Compass, Trophy, Flame, Home, BookOpen, MoreHorizontal } from "lucide-react";

export type JungleNavItem = {
  id: string;
  label: string;
  emoji?: string; // 🦉 🦜 🐵 🐘 (preferred for animals)
  icon?: React.ReactNode; // fallback lucide icon
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

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
}: JungleAdventureNavV2Props) {
  const reducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Track which icon is doing a one-shot breath animation
  const [breathing, setBreathing] = useState<Record<string, boolean>>({});
  const breathTimers = useRef<Record<string, number>>({});

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
      </div>
    </nav>
  );
}
